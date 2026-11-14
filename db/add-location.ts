import fs from "node:fs"
import path from "node:path"
import readline from "node:readline/promises"
import { encode } from "blurhash"
import type { RowDataPacket } from "mysql2"
import sharp from "sharp"
import { encodeGeohash } from "../lib/geohash"
import { createPool } from "./index"
import {
  RAW_PLACES,
  SEED_CATEGORIES,
  SEED_CITIES,
  SEED_COUNTRIES,
  type RawPlaceInput,
  type SeedPhoto,
} from "./seed-data"

try {
  process.loadEnvFile(".env.local")
} catch {}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

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

async function processImageFile(
  sourcePath: string,
  destFolder: string,
  destName: string
): Promise<SeedPhoto> {
  const fullDest = path.join(destFolder, destName)
  if (path.resolve(sourcePath) !== path.resolve(fullDest)) {
    fs.copyFileSync(sourcePath, fullDest)
  }

  const image = sharp(fullDest)
  const metadata = await image.metadata()
  const width = metadata.width ?? 800
  const height = metadata.height ?? 600

  const { data, info } = await image
    .raw()
    .ensureAlpha()
    .resize(32, 32, { fit: "cover" })
    .toBuffer({ resolveWithObject: true })

  const blurhash = encode(
    new Uint8ClampedArray(data),
    info.width,
    info.height,
    4,
    3
  )

  const relPosix = path
    .relative(path.join(process.cwd(), "public"), fullDest)
    .split(path.sep)
    .join("/")

  return {
    imageUrl: `/${relPosix}`,
    blurhash,
    width,
    height,
  }
}

async function main() {
  const flags = parseCliArgs()
  let name = flags.name
  let city = flags.city
  let country = flags.country
  let countryCode = flags.code || flags.countryCode
  let category = flags.category
  let description = flags.desc || flags.description
  let lat = flags.lat ? Number(flags.lat) : NaN
  let lng = flags.lng ? Number(flags.lng) : NaN
  let imagesArg = flags.images || flags.image

  if (!name || !city || !category || isNaN(lat) || isNaN(lng)) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    })
    try {
      if (!name) name = await rl.question("Location name: ")
      if (!city) city = await rl.question("City name: ")
      if (!country) country = await rl.question("Country name: ")
      if (!countryCode)
        countryCode = await rl.question(
          "Country code (2 letters, e.g. JP, US): "
        )
      if (!category) {
        console.log("Categories: landmark, national_park, museum, cafe, mall")
        category = await rl.question("Category (default: landmark): ")
      }
      if (isNaN(lat)) {
        const val = await rl.question("Latitude (e.g. 35.0116): ")
        lat = Number(val)
      }
      if (isNaN(lng)) {
        const val = await rl.question("Longitude (e.g. 135.7681): ")
        lng = Number(val)
      }
      if (!description) description = await rl.question("Short description: ")
      if (!imagesArg) {
        imagesArg = await rl.question(
          "Image file path(s) comma-separated (or press enter if already in public/images/places/<slug>/): "
        )
      }
    } finally {
      rl.close()
    }
  }

  name = name.trim()
  city = city.trim()
  country = (country || "Unknown").trim()
  countryCode = (countryCode || "XX").trim().toUpperCase().slice(0, 2)
  category = (category || "landmark").trim().toLowerCase()
  description = (description || `A catalogued spot in ${city}.`).trim()

  const placeSlug = slugify(name)
  const placeDir = path.join(
    process.cwd(),
    "public",
    "images",
    "places",
    placeSlug
  )
  fs.mkdirSync(placeDir, { recursive: true })

  const candidateFiles: string[] = []
  if (imagesArg && imagesArg.trim()) {
    const parts = imagesArg
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean)
    for (const part of parts) {
      if (fs.existsSync(part)) {
        const stat = fs.statSync(part)
        if (stat.isDirectory()) {
          for (const file of fs.readdirSync(part)) {
            const ext = path.extname(file).toLowerCase()
            if ([".png", ".jpg", ".jpeg", ".webp", ".avif"].includes(ext)) {
              candidateFiles.push(path.join(part, file))
            }
          }
        } else if (stat.isFile()) {
          candidateFiles.push(part)
        }
      }
    }
  } else {
    for (const file of fs.readdirSync(placeDir)) {
      const ext = path.extname(file).toLowerCase()
      if ([".png", ".jpg", ".jpeg", ".webp", ".avif"].includes(ext)) {
        candidateFiles.push(path.join(placeDir, file))
      }
    }
  }

  const photos: SeedPhoto[] = []
  for (let idx = 0; idx < candidateFiles.length; idx++) {
    const source = candidateFiles[idx]
    const ext = path.extname(source).toLowerCase()
    const targetName = `photo-${idx + 1}${ext}`
    const photo = await processImageFile(source, placeDir, targetName)
    photos.push({ ...photo, sortOrder: idx })
  }

  const newPlace: RawPlaceInput = {
    city,
    country,
    countryCode,
    category,
    name,
    slug: placeSlug,
    description,
    lat,
    lng,
    featuredOffsetDays: 0,
    photos,
  }

  const existingPlaces = RAW_PLACES.filter((p) => p.slug !== placeSlug)
  const updatedPlaces = [...existingPlaces, newPlace]

  const seedCountries = [...SEED_COUNTRIES]
  if (!seedCountries.some((c) => c.code === countryCode)) {
    seedCountries.push({ code: countryCode, name: country })
  }

  const seedCities = [...SEED_CITIES]
  if (!seedCities.some((c) => c.name === city)) {
    seedCities.push({ countryCode, name: city, lat, lng })
  }

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

export const SEED_USER = {
  id: 1,
  displayName: "@dev",
  handle: "dev",
  avatarUrl: "/images/avatar.png",
  avatarBlurhash: "L~N+^As.V?j[~VayaefQIqWCozaz",
}

export const SEED_COUNTRIES = ${JSON.stringify(seedCountries, null, 2)}

export const SEED_CITIES = ${JSON.stringify(seedCities, null, 2)}

export const SEED_CATEGORIES = ${JSON.stringify(SEED_CATEGORIES, null, 2)}

export const RAW_PLACES: RawPlaceInput[] = ${JSON.stringify(updatedPlaces, null, 2)}

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

  if (process.env.DATABASE_URL?.trim()) {
    const pool = createPool(false)
    try {
      await pool.execute(
        `INSERT INTO countries (code, name) VALUES (?, ?) ON DUPLICATE KEY UPDATE name = VALUES(name)`,
        [countryCode, country]
      )
      await pool.execute(
        `INSERT INTO cities (country_code, name, lat, lng) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE lat = VALUES(lat), lng = VALUES(lng)`,
        [countryCode, city, lat, lng]
      )

      const [cityRows] = await pool.execute<RowDataPacket[]>(
        "SELECT id FROM cities WHERE name = ? LIMIT 1",
        [city]
      )
      const cityId = Number(cityRows[0].id)

      const [catRows] = await pool.execute<RowDataPacket[]>(
        "SELECT id FROM categories WHERE slug = ? LIMIT 1",
        [category]
      )
      const categoryId = catRows.length > 0 ? Number(catRows[0].id) : 1

      const geohash = encodeGeohash(lat, lng, 7)
      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
      const featuredDate = new Date().toISOString().slice(0, 10)

      await pool.execute(
        `INSERT INTO places
           (city_id, category_id, name, slug, description, lat, lng, geohash, maps_url, featured_date)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           city_id = VALUES(city_id),
           category_id = VALUES(category_id),
           name = VALUES(name),
           description = VALUES(description),
           lat = VALUES(lat),
           lng = VALUES(lng),
           geohash = VALUES(geohash),
           maps_url = VALUES(maps_url),
           featured_date = VALUES(featured_date)`,
        [
          cityId,
          categoryId,
          name,
          placeSlug,
          description,
          lat,
          lng,
          geohash,
          mapsUrl,
          featuredDate,
        ]
      )

      const [placeRows] = await pool.execute<RowDataPacket[]>(
        "SELECT id FROM places WHERE slug = ? LIMIT 1",
        [placeSlug]
      )
      const placeId = Number(placeRows[0].id)

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
    } finally {
      await pool.end()
    }
  }

  console.log(`\n✓ Added "${name}" (${city}, ${country})`)
  console.log(`✓ Processed ${photos.length} photo(s) with BlurHash`)
  console.log(`✓ Saved into db/seed-data.ts (and TiDB if configured)`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
