import type { RowDataPacket } from "mysql2"
import { getPool, withTransaction } from "./index"
import {
  checkInMemory,
  getMemoryCatalogData,
  searchMemoryPlaces,
  undoCheckInMemory,
} from "./memory"
import type {
  CatalogPayload,
  DemoUser,
  LocationOfTheDay,
  PlacePhoto,
  PlaceSummary,
  VisitSource,
} from "@/lib/types"

export const DEMO_USER_ID = 1

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

export async function getCatalogData(): Promise<CatalogPayload> {
  if (!hasDatabase()) {
    return getMemoryCatalogData()
  }
  const pool = getPool()

  const [userRows] = await pool.execute<RowDataPacket[]>(
    `SELECT id, display_name, handle, avatar_url, avatar_blurhash
     FROM users WHERE id = ? LIMIT 1`,
    [DEMO_USER_ID]
  )
  if (userRows.length === 0) {
    throw new Error("Demo user missing. Run npm run db:setup first.")
  }
  const u = userRows[0]
  const user: DemoUser = {
    id: Number(u.id),
    displayName: String(u.display_name),
    handle: String(u.handle),
    avatarUrl: String(u.avatar_url),
    avatarBlurhash: String(u.avatar_blurhash),
  }

  const [placeRows] = await pool.query<RowDataPacket[]>(
    `SELECT * FROM v_place_details ORDER BY name ASC`
  )
  const places = placeRows.map(mapPlace)

  const [lotdRows] = await pool.query<RowDataPacket[]>(
    `SELECT * FROM v_place_details
     WHERE featured_date IS NOT NULL AND featured_date <= CURDATE()
     ORDER BY featured_date DESC, id ASC
     LIMIT 1`
  )
  const lotdRow = lotdRows[0] ?? placeRows[0]
  if (!lotdRow) {
    throw new Error("No places seeded. Run npm run db:setup first.")
  }

  const lotdPlace = mapPlace(lotdRow)
  const [photoRows] = await pool.execute<RowDataPacket[]>(
    `SELECT id, image_url, blurhash, width, height, sort_order
     FROM place_photos
     WHERE place_id = ?
     ORDER BY sort_order ASC, id ASC`,
    [lotdPlace.id]
  )
  const photos: PlacePhoto[] = photoRows.map((p) => ({
    id: Number(p.id),
    imageUrl: String(p.image_url),
    blurhash: String(p.blurhash),
    width: Number(p.width),
    height: Number(p.height),
    sortOrder: Number(p.sort_order),
  }))

  const [visitRows] = await pool.execute<RowDataPacket[]>(
    `SELECT place_id FROM visits WHERE user_id = ?`,
    [DEMO_USER_ID]
  )
  const visitedIds = visitRows.map((v) => Number(v.place_id))

  const lotd: LocationOfTheDay = {
    ...lotdPlace,
    photos,
    visited: visitedIds.includes(lotdPlace.id),
  }

  return { mode: "tidb", user, lotd, places, visitedIds }
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
  placeId: number,
  source: VisitSource,
  idempotencyKey: string
): Promise<{ alreadyVisited: boolean }> {
  if (!hasDatabase()) {
    return checkInMemory(placeId, idempotencyKey)
  }
  return withTransaction(async (conn) => {
    const [byKey] = await conn.execute<RowDataPacket[]>(
      `SELECT id FROM visits WHERE user_id = ? AND idempotency_key = ? LIMIT 1`,
      [DEMO_USER_ID, idempotencyKey]
    )
    if (byKey.length > 0) {
      return { alreadyVisited: true }
    }

    const [byPlace] = await conn.execute<RowDataPacket[]>(
      `SELECT id FROM visits WHERE user_id = ? AND place_id = ? LIMIT 1`,
      [DEMO_USER_ID, placeId]
    )
    if (byPlace.length > 0) {
      return { alreadyVisited: true }
    }

    await conn.execute(
      `INSERT INTO visits (user_id, place_id, source, idempotency_key)
       VALUES (?, ?, ?, ?)`,
      [DEMO_USER_ID, placeId, source, idempotencyKey]
    )
    return { alreadyVisited: false }
  })
}

export async function undoCheckIn(placeId: number): Promise<void> {
  if (!hasDatabase()) {
    undoCheckInMemory(placeId)
    return
  }
  await withTransaction(async (conn) => {
    await conn.execute(
      `DELETE FROM visits WHERE user_id = ? AND place_id = ?`,
      [DEMO_USER_ID, placeId]
    )
  })
}
