import type { ResultSetHeader, RowDataPacket } from "mysql2"
import { getPool } from "./index"
import {
  checkInMemory,
  getMemoryCatalogData,
  getUserVisitsMemory,
  resetUserMemoryData,
  searchMemoryPlaces,
  undoCheckInMemory,
} from "./memory"
import type {
  CatalogPayload,
  LocationOfTheDay,
  PlacePhoto,
  PlaceSummary,
  User,
  UserVisitItem,
  VisitSource,
} from "@/lib/types"

function hasDatabase(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim())
}

function mapPlace(row: RowDataPacket): PlaceSummary {
  return {
    id: Number(row.id),
    slug: String(row.slug),
    name: String(row.name),
    description: String(row.description),
    lat: Number(row.lat),
    lng: Number(row.lng),
    geohash: String(row.geohash),
    mapsUrl: String(row.maps_url),
    cityId: Number(row.city_id),
    cityName: String(row.city_name),
    countryCode: String(row.country_code),
    countryName: String(row.country_name),
    categoryId: Number(row.category_id),
    categorySlug: String(row.category_slug),
    categoryLabel: String(row.category_label),
    categoryIcon: String(row.category_icon),
  }
}

function groupPhotosByPlaceId(
  photoRows: RowDataPacket[]
): Map<number, PlacePhoto[]> {
  const map = new Map<number, PlacePhoto[]>()
  for (const p of photoRows) {
    const placeId = Number(p.place_id)
    const list = map.get(placeId) ?? []
    list.push({
      id: Number(p.id),
      imageUrl: String(p.image_url),
      blurhash: String(p.blurhash),
      width: Number(p.width),
      height: Number(p.height),
      sortOrder: Number(p.sort_order),
    })
    map.set(placeId, list)
  }
  return map
}

export async function getCatalogData(
  currentUser?: User | null
): Promise<CatalogPayload> {
  if (!hasDatabase()) {
    return getMemoryCatalogData(currentUser)
  }
  const pool = getPool()

  const [[placeRows], [photoRows], [lotdRows]] = await Promise.all([
    pool.query<RowDataPacket[]>(
      `SELECT * FROM v_place_details ORDER BY name ASC`
    ),
    pool.query<RowDataPacket[]>(
      `SELECT id, place_id, image_url, blurhash, width, height, sort_order
       FROM place_photos
       ORDER BY place_id ASC, sort_order ASC, id ASC`
    ),
    pool.query<RowDataPacket[]>(
      `SELECT * FROM v_place_details
       WHERE featured_date IS NOT NULL AND featured_date <= CURDATE()
       ORDER BY featured_date DESC, id ASC
       LIMIT 1`
    ),
  ])

  let visitedIds: number[] = []
  if (currentUser?.id) {
    const [visitRows] = await pool.execute<RowDataPacket[]>(
      `SELECT place_id FROM visits WHERE user_id = ?`,
      [currentUser.id]
    )
    visitedIds = visitRows.map((v) => Number(v.place_id))
  }

  const photosByPlaceId = groupPhotosByPlaceId(photoRows)

  const places: PlaceSummary[] = placeRows.map((row) => {
    const summary = mapPlace(row)
    const photos = photosByPlaceId.get(summary.id) ?? []
    return {
      ...summary,
      primaryPhoto: photos[0],
      photos,
    }
  })

  const lotdRow = lotdRows[0] ?? placeRows[0]
  let lotd: LocationOfTheDay | null = null
  if (lotdRow) {
    const lotdPlace = mapPlace(lotdRow)
    const photos = photosByPlaceId.get(lotdPlace.id) ?? []
    lotd = {
      ...lotdPlace,
      primaryPhoto: photos[0],
      photos,
      visited: visitedIds.includes(lotdPlace.id),
    }
  }

  return {
    mode: "tidb",
    user: currentUser ?? null,
    lotd,
    places,
    visitedIds,
  }
}

export async function searchPlacesSql(
  query: string,
  limit = 8
): Promise<PlaceSummary[]> {
  if (!hasDatabase()) {
    return searchMemoryPlaces(query, limit)
  }
  const clean = query.trim()
  if (!clean) {
    return []
  }
  const pool = getPool()
  const safeLimit = Math.max(1, Math.min(50, Math.trunc(limit) || 8))
  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT v.*
       FROM v_place_details v
       JOIN places p ON p.id = v.id
       WHERE MATCH(p.name) AGAINST(? IN NATURAL LANGUAGE MODE)
       LIMIT ${safeLimit}`,
      [clean]
    )
    if (rows.length > 0) {
      return rows.map(mapPlace)
    }
  } catch {}

  const like = `%${clean.toLowerCase()}%`
  const [fallbackRows] = await pool.execute<RowDataPacket[]>(
    `SELECT * FROM v_place_details
     WHERE LOWER(name) LIKE ? OR LOWER(city_name) LIKE ? OR LOWER(category_label) LIKE ?
     ORDER BY name ASC
     LIMIT ${safeLimit}`,
    [like, like, like]
  )
  return fallbackRows.map(mapPlace)
}

export async function checkInPlace(
  userId: number,
  placeId: number,
  source: VisitSource,
  idempotencyKey: string
): Promise<{ alreadyVisited: boolean }> {
  if (!hasDatabase()) {
    return checkInMemory(userId, placeId, source, idempotencyKey)
  }
  const pool = getPool()
  const [result] = await pool.execute<ResultSetHeader>(
    `INSERT IGNORE INTO visits (user_id, place_id, source, idempotency_key)
     VALUES (?, ?, ?, ?)`,
    [userId, placeId, source, idempotencyKey]
  )
  return { alreadyVisited: result.affectedRows === 0 }
}

export async function resetUserVisits(userId: number): Promise<void> {
  if (!hasDatabase()) {
    resetUserMemoryData(userId)
    return
  }
  const pool = getPool()
  await pool.execute(`DELETE FROM visits WHERE user_id = ?`, [userId])
}

export async function undoCheckIn(
  userId: number,
  placeId: number
): Promise<void> {
  if (!hasDatabase()) {
    undoCheckInMemory(userId, placeId)
    return
  }
  const pool = getPool()
  await pool.execute(`DELETE FROM visits WHERE user_id = ? AND place_id = ?`, [
    userId,
    placeId,
  ])
}

export async function getUserVisits(userId: number): Promise<UserVisitItem[]> {
  if (!hasDatabase()) {
    return getUserVisitsMemory(userId)
  }

  const pool = getPool()
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT
       v.id AS visit_id,
       v.place_id,
       v.source,
       v.visited_at,
       p.*
     FROM visits v
     JOIN v_place_details p ON p.id = v.place_id
     WHERE v.user_id = ?
     ORDER BY v.visited_at DESC, v.id DESC`,
    [userId]
  )

  if (rows.length === 0) {
    return []
  }

  const placeIds = Array.from(new Set(rows.map((r) => Number(r.place_id))))
  const [photoRows] = await pool.query<RowDataPacket[]>(
    `SELECT id, place_id, image_url, blurhash, width, height, sort_order
     FROM place_photos
     WHERE place_id IN (${placeIds.join(",")})
     ORDER BY place_id ASC, sort_order ASC, id ASC`
  )

  const photosByPlaceId = groupPhotosByPlaceId(photoRows)

  return rows.map((row) => {
    const summary = mapPlace(row)
    const photos = photosByPlaceId.get(summary.id) ?? []
    return {
      id: Number(row.visit_id),
      placeId: summary.id,
      visitedAt: new Date(row.visited_at).toISOString(),
      source: row.source as VisitSource,
      place: {
        ...summary,
        primaryPhoto: photos[0],
        photos,
      },
    }
  })
}
