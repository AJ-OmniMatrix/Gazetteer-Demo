"use server"

import path from "node:path"
import type { RowDataPacket } from "mysql2"
import { revalidatePath } from "next/cache"
import { getPool } from "@/db"
import { addPlaceMemory } from "@/db/memory"
import {
  checkInPlace,
  getUserVisits,
  searchPlacesSql,
  undoCheckIn,
} from "@/db/queries"
import type { SeedPhoto } from "@/db/seed-data"
import {
  destroySession,
  developerLogin,
  getSessionUser,
  loginOrRegister,
  loginUser,
  registerUser,
} from "@/lib/auth"
import { encodeGeohash } from "@/lib/geohash"
import {
  downloadAndProcessImage,
  searchPlaceImages,
} from "@/lib/image-search"
import type {
  PlacePhoto,
  PlaceSummary,
  User,
  UserVisitItem,
  VisitSource,
} from "@/lib/types"

export async function getCurrentUserAction(): Promise<User | null> {
  return getSessionUser()
}

export async function developerLoginAction(
  handle: string
): Promise<{ ok: boolean; user?: User; error?: string }> {
  try {
    const user = await developerLogin(handle)
    revalidatePath("/", "layout")
    return { ok: true, user }
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Developer login failed",
    }
  }
}

export async function loginAction(
  handle: string
): Promise<{ ok: boolean; user?: User; error?: string }> {
  try {
    const user = await loginUser(handle)
    revalidatePath("/", "layout")
    return { ok: true, user }
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Sign-in failed",
    }
  }
}

export async function registerAction(
  handle: string,
  displayName?: string
): Promise<{ ok: boolean; user?: User; error?: string }> {
  try {
    const user = await registerUser(handle, displayName)
    revalidatePath("/", "layout")
    return { ok: true, user }
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Sign-up failed",
    }
  }
}

export async function loginOrRegisterAction(
  handle: string,
  displayName?: string
): Promise<{ ok: boolean; user?: User; error?: string }> {
  try {
    const user = await loginOrRegister(handle, displayName)
    revalidatePath("/", "layout")
    return { ok: true, user }
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Sign-in failed",
    }
  }
}

export async function logoutAction(): Promise<{ ok: boolean }> {
  await destroySession()
  revalidatePath("/", "layout")
  revalidatePath("/list")
  revalidatePath("/explore")
  return { ok: true }
}

export async function checkInAction(
  placeId: number,
  source: VisitSource,
  idempotencyKey: string
): Promise<{ ok: boolean; alreadyVisited?: boolean; error?: string }> {
  try {
    const user = await getSessionUser()
    if (!user) {
      return {
        ok: false,
        error: "Authentication required. Please sign in to check in.",
      }
    }
    const result = await checkInPlace(user.id, placeId, source, idempotencyKey)
    revalidatePath("/list")
    revalidatePath("/explore")
    revalidatePath("/")
    return { ok: true, alreadyVisited: result.alreadyVisited }
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to save visit",
    }
  }
}

export async function undoCheckInAction(
  placeId: number
): Promise<{ ok: boolean; error?: string }> {
  try {
    const user = await getSessionUser()
    if (!user) {
      return {
        ok: false,
        error: "Authentication required.",
      }
    }
    await undoCheckIn(user.id, placeId)
    revalidatePath("/list")
    revalidatePath("/explore")
    revalidatePath("/")
    return { ok: true }
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to undo visit",
    }
  }
}

export async function getUserVisitsAction(): Promise<UserVisitItem[]> {
  const user = await getSessionUser()
  if (!user) {
    return []
  }
  return getUserVisits(user.id)
}

export async function searchPlacesAction(
  query: string
): Promise<PlaceSummary[]> {
  return searchPlacesSql(query, 8)
}

export interface AddPlaceInput {
  name: string
  cityName: string
  countryCode?: string
  categorySlug: string
  lat: number
  lng: number
  description?: string
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export async function addPlaceAction(
  input: AddPlaceInput
): Promise<{ ok: boolean; slug?: string; error?: string; photoCount?: number }> {
  try {
    const name = input.name?.trim()
    const city = input.cityName?.trim()
    const categorySlug = (input.categorySlug || "landmark").trim().toLowerCase()
    const lat = Number(input.lat)
    const lng = Number(input.lng)
    const countryCode = (input.countryCode || "IN")
      .trim()
      .toUpperCase()
      .slice(0, 2)
    const countryName = countryCode === "JP" ? "Japan" : "India"
    const description = (
      input.description || `A catalogued spot in ${city}.`
    ).trim()

    if (!name || !city || isNaN(lat) || isNaN(lng)) {
      return {
        ok: false,
        error: "Please provide a valid name, city, and coordinates.",
      }
    }

    const slug = slugify(name)
    const geohash = encodeGeohash(lat, lng, 7)
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
    const placeDir = path.join(
      process.cwd(),
      "public",
      "images",
      "places",
      slug
    )

    const candidates = await searchPlaceImages(`${name} ${city}`, 3)
    const photos: SeedPhoto[] = []
    for (let idx = 0; idx < candidates.length; idx++) {
      const candidate = candidates[idx]
      const filename = `photo-${idx + 1}.jpg`
      const photo = await downloadAndProcessImage(
        candidate.url,
        placeDir,
        filename
      )
      if (photo) {
        photos.push({ ...photo, sortOrder: photos.length })
      }
    }

    if (Boolean(process.env.DATABASE_URL?.trim())) {
      const pool = getPool()
      await pool.execute(
        `INSERT INTO countries (code, name) VALUES (?, ?) ON DUPLICATE KEY UPDATE name = VALUES(name)`,
        [countryCode, countryName]
      )
      await pool.execute(
        `INSERT INTO cities (country_code, name, lat, lng) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE lat = VALUES(lat), lng = VALUES(lng)`,
        [countryCode, city, lat, lng]
      )
      const [cityRows] = await pool.execute<RowDataPacket[]>(
        "SELECT id FROM cities WHERE name = ? LIMIT 1",
        [city]
      )
      const cityId = Number(cityRows[0]?.id)
      const [catRows] = await pool.execute<RowDataPacket[]>(
        "SELECT id FROM categories WHERE slug = ? LIMIT 1",
        [categorySlug]
      )
      const categoryId = catRows.length > 0 ? Number(catRows[0].id) : 1

      await pool.execute(
        `INSERT INTO places
           (city_id, category_id, name, slug, description, lat, lng, geohash, maps_url)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           city_id = VALUES(city_id),
           category_id = VALUES(category_id),
           name = VALUES(name),
           description = VALUES(description),
           lat = VALUES(lat),
           lng = VALUES(lng),
           geohash = VALUES(geohash),
           maps_url = VALUES(maps_url)`,
        [
          cityId,
          categoryId,
          name,
          slug,
          description,
          lat,
          lng,
          geohash,
          mapsUrl,
        ]
      )

      const [placeRows] = await pool.execute<RowDataPacket[]>(
        "SELECT id FROM places WHERE slug = ? LIMIT 1",
        [slug]
      )
      const placeId = Number(placeRows[0]?.id)

      if (placeId && photos.length > 0) {
        await pool.execute("DELETE FROM place_photos WHERE place_id = ?", [
          placeId,
        ])
        for (const photo of photos) {
          await pool.execute(
            `INSERT INTO place_photos (place_id, image_url, blurhash, width, height, sort_order)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
              placeId,
              photo.imageUrl,
              photo.blurhash,
              photo.width,
              photo.height,
              photo.sortOrder ?? 0,
            ]
          )
        }
      }
    }

    const placePhotos: PlacePhoto[] = photos.map((p, idx) => ({
      ...p,
      id: idx + 1,
      sortOrder: p.sortOrder ?? idx,
    }))

    addPlaceMemory({
      id: Math.floor(Date.now() / 1000),
      slug,
      name,
      description,
      lat,
      lng,
      geohash,
      mapsUrl,
      cityId: 1,
      cityName: city,
      countryCode,
      countryName,
      categoryId: 1,
      categorySlug,
      categoryLabel: categorySlug.replace("_", " "),
      categoryIcon: "RiCompass3Line",
      primaryPhoto: placePhotos[0],
      photos: placePhotos,
    })

    revalidatePath("/")
    revalidatePath("/explore")
    revalidatePath("/list")
    revalidatePath("/lotd")

    return { ok: true, slug, photoCount: photos.length }
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to add location",
    }
  }
}
