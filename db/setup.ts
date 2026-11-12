import fs from "node:fs"
import path from "node:path"
import type { RowDataPacket } from "mysql2"
import { createPool } from "./index"
import {
  SEED_CATEGORIES,
  SEED_CITIES,
  SEED_COUNTRIES,
  SEED_PLACES,
  SEED_USER,
} from "./seed-data"

try {
  process.loadEnvFile(".env.local")
} catch {}

async function main() {
  const pool = createPool(true)
  try {
    const schemaSql = fs.readFileSync(
      path.join(process.cwd(), "db", "schema.sql"),
      "utf8"
    )
    await pool.query(schemaSql)

    await pool.execute(
      `INSERT INTO users (id, display_name, handle, avatar_url, avatar_blurhash)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         display_name = VALUES(display_name),
         avatar_url = VALUES(avatar_url),
         avatar_blurhash = VALUES(avatar_blurhash)`,
      [
        SEED_USER.id,
        SEED_USER.displayName,
        SEED_USER.handle,
        SEED_USER.avatarUrl,
        SEED_USER.avatarBlurhash,
      ]
    )

    for (const country of SEED_COUNTRIES) {
      await pool.execute(
        `INSERT INTO countries (code, name)
         VALUES (?, ?)
         ON DUPLICATE KEY UPDATE name = VALUES(name)`,
        [country.code, country.name]
      )
    }

    for (const city of SEED_CITIES) {
      await pool.execute(
        `INSERT INTO cities (country_code, name, lat, lng)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE lat = VALUES(lat), lng = VALUES(lng)`,
        [city.countryCode, city.name, city.lat, city.lng]
      )
    }

    for (const cat of SEED_CATEGORIES) {
      await pool.execute(
        `INSERT INTO categories (slug, label, icon_name)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE label = VALUES(label), icon_name = VALUES(icon_name)`,
        [cat.slug, cat.label, cat.iconName]
      )
    }

    const [cityRows] = await pool.query<RowDataPacket[]>(
      "SELECT id, name FROM cities"
    )
    const cityMap = new Map<string, number>()
    for (const row of cityRows) {
      cityMap.set(String(row.name), Number(row.id))
    }

    const [catRows] = await pool.query<RowDataPacket[]>(
      "SELECT id, slug FROM categories"
    )
    const catMap = new Map<string, number>()
    for (const row of catRows) {
      catMap.set(String(row.slug), Number(row.id))
    }

    const validSlugs = SEED_PLACES.map((p) => p.slug)
    if (validSlugs.length > 0) {
      const placeholders = validSlugs.map(() => "?").join(",")
      await pool.execute(
        `DELETE FROM places WHERE slug NOT IN (${placeholders})`,
        validSlugs
      )
    } else {
      await pool.execute("DELETE FROM places")
    }

    for (const place of SEED_PLACES) {
      if (place.countryCode && place.country) {
        await pool.execute(
          `INSERT INTO countries (code, name)
           VALUES (?, ?)
           ON DUPLICATE KEY UPDATE name = VALUES(name)`,
          [place.countryCode, place.country]
        )
      }

      let cityId = cityMap.get(place.city)
      if (!cityId) {
        const countryCode = place.countryCode ?? "XX"
        await pool.execute(
          `INSERT INTO cities (country_code, name, lat, lng)
           VALUES (?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE lat = VALUES(lat), lng = VALUES(lng)`,
          [countryCode, place.city, place.lat, place.lng]
        )
        const [createdCity] = await pool.execute<RowDataPacket[]>(
          "SELECT id FROM cities WHERE name = ? LIMIT 1",
          [place.city]
        )
        if (createdCity.length > 0) {
          cityId = Number(createdCity[0].id)
          cityMap.set(place.city, cityId)
        }
      }

      const categoryId = catMap.get(place.category)
      if (!cityId || !categoryId) {
        continue
      }

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
          place.name,
          place.slug,
          place.description,
          place.lat,
          place.lng,
          place.geohash,
          place.mapsUrl,
          place.featuredDate,
        ]
      )

      const [placeRows] = await pool.execute<RowDataPacket[]>(
        "SELECT id FROM places WHERE slug = ? LIMIT 1",
        [place.slug]
      )
      const placeId = Number(placeRows[0].id)

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
            photo.sortOrder,
          ]
        )
      }
    }

    console.log(`Seeded ${SEED_PLACES.length} places cleanly.`)
  } finally {
    await pool.end()
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
