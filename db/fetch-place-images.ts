import fs from "node:fs"
import path from "node:path"
import type { RowDataPacket } from "mysql2"
import { downloadAndProcessImage, searchPlaceImages } from "../lib/image-search"
import { createPool } from "./index"
import {
  RAW_PLACES,
  SEED_CATEGORIES,
  SEED_CITIES,
  SEED_COUNTRIES,
  SEED_USERS,
  type RawPlaceInput,
  type SeedPhoto,
} from "./seed-data"

try {
  process.loadEnvFile(".env.local")
} catch {}

function parseCliArgs(): Record<string, string> {
  const args = process.argv.slice(2)
  const result: Record<string, string> = {}
  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    if (arg.startsWith("--")) {
      const key = arg.slice(2)
      const next = args[i + 1]
      if (next && !next.startsWith("--")) {
        result[key] = next
        i++
      } else {
        result[key] = "true"
      }
    }
  }
  return result
}

async function updateSeedDataFile(places: RawPlaceInput[]) {
  const fileContent = `import { encodeGeohash } from "../lib/geohash"

export interface SeedPhoto {
  imageUrl: string
  blurhash: string
  width: number
  height: number
  sortOrder?: number
}

export interface RawPlaceInput {
  city: string
  country?: string
  countryCode?: string
  category: string
  name: string
  slug: string
  description: string
  lat: number
  lng: number
  featuredOffsetDays?: number | null
  photos: SeedPhoto[]
}

export const SEED_USERS = ${JSON.stringify(SEED_USERS, null, 2)}

export const SEED_USER = SEED_USERS[0]

export const SEED_COUNTRIES = ${JSON.stringify(SEED_COUNTRIES, null, 2)}

export const SEED_CITIES = ${JSON.stringify(SEED_CITIES, null, 2)}

export const SEED_CATEGORIES = ${JSON.stringify(SEED_CATEGORIES, null, 2)}

export const RAW_PLACES: RawPlaceInput[] = ${JSON.stringify(places, null, 2)}

export const SEED_PLACES = RAW_PLACES.map((p) => {
  const featuredDate =
    p.featuredOffsetDays === null || p.featuredOffsetDays === undefined
      ? null
      : new Date(Date.now() + p.featuredOffsetDays * 86400000)
          .toISOString()
          .slice(0, 10)
  return {
    ...p,
    geohash: encodeGeohash(p.lat, p.lng, 7),
    mapsUrl: \`https://www.google.com/maps/search/?api=1&query=\${p.lat},\${p.lng}\`,
    featuredDate,
    photos: p.photos.map((photo, sortOrder) => ({
      ...photo,
      sortOrder: photo.sortOrder ?? sortOrder,
    })),
  }
})
`
  fs.writeFileSync(path.join(process.cwd(), "db", "seed-data.ts"), fileContent)
}

async function main() {
  const flags = parseCliArgs()
  const targetSlug = flags.slug
  const forceAll = flags.all === "true" || flags.force === "true"
  const maxPhotosPerPlace = flags.count ? Number(flags.count) : 3

  const targetPlaces = RAW_PLACES.filter((p) => {
    if (targetSlug) return p.slug === targetSlug
    if (forceAll) return true
    return (
      p.photos.length === 0 ||
      p.photos.some((ph) => ph.imageUrl.includes("/images/places/inari-"))
    )
  })

  if (targetPlaces.length === 0) {
    console.log("No places require image fetching.")
    return
  }

  console.log(`Starting image fetch for ${targetPlaces.length} location(s)...`)

  const updatedPlaces = [...RAW_PLACES]

  for (let i = 0; i < targetPlaces.length; i++) {
    const place = targetPlaces[i]
    console.log(
      `[${i + 1}/${targetPlaces.length}] Fetching for "${place.name}" (${place.city})...`
    )

    const queries = [
      `${place.name} ${place.city}`,
      place.name,
      `${place.name.split(" ").slice(0, 2).join(" ")} ${place.city}`,
    ]
    let candidates = await searchPlaceImages(queries[0], maxPhotosPerPlace + 2)
    if (candidates.length === 0 && queries[1]) {
      candidates = await searchPlaceImages(queries[1], maxPhotosPerPlace + 2)
    }
    if (candidates.length === 0 && queries[2]) {
      candidates = await searchPlaceImages(queries[2], maxPhotosPerPlace + 2)
    }
    const placeDir = path.join(
      process.cwd(),
      "public",
      "images",
      "places",
      place.slug
    )

    const newPhotos: SeedPhoto[] = []
    for (const candidate of candidates) {
      if (newPhotos.length >= maxPhotosPerPlace) break
      const filename = `photo-${newPhotos.length + 1}.jpg`
      const photo = await downloadAndProcessImage(
        candidate.url,
        placeDir,
        filename
      )
      if (photo) {
        newPhotos.push({
          ...photo,
          sortOrder: newPhotos.length,
        })
      }
    }

    if (newPhotos.length > 0) {
      const idx = updatedPlaces.findIndex((p) => p.slug === place.slug)
      if (idx !== -1) {
        updatedPlaces[idx] = {
          ...updatedPlaces[idx],
          photos: newPhotos,
        }
      }
      console.log(`  ✓ Successfully processed ${newPhotos.length} photo(s)`)
    } else {
      console.log(
        `  ⚠ Could not process images for "${place.name}", retaining existing.`
      )
    }
  }

  await updateSeedDataFile(updatedPlaces)
  console.log("\n✓ Updated db/seed-data.ts with new place photos.")

  if (process.env.DATABASE_URL?.trim()) {
    try {
      const pool = createPool(false)
      console.log("Updating database records...")
      for (const place of updatedPlaces) {
        const [rows] = await pool.execute<RowDataPacket[]>(
          "SELECT id FROM places WHERE slug = ? LIMIT 1",
          [place.slug]
        )
        if (rows.length > 0) {
          const placeId = Number(rows[0].id)
          await pool.execute("DELETE FROM place_photos WHERE place_id = ?", [
            placeId,
          ])
          for (const photo of place.photos) {
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
      await pool.end()
      console.log("✓ TiDB place_photos updated successfully.")
    } catch (dbErr) {
      console.warn(
        "Database update skipped or failed:",
        (dbErr as Error).message
      )
    }
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
