import {
  SEED_CATEGORIES,
  SEED_CITIES,
  SEED_COUNTRIES,
  SEED_PLACES,
  SEED_USER,
} from "./seed-data"
import type {
  CatalogPayload,
  LocationOfTheDay,
  PlaceSummary,
} from "@/lib/types"

declare global {
  var __gazetteerMemoryVisits: Set<number> | undefined
  var __gazetteerMemoryKeys: Set<string> | undefined
}

function getVisitsSet(): Set<number> {
  if (!globalThis.__gazetteerMemoryVisits) {
    globalThis.__gazetteerMemoryVisits = new Set<number>()
  }
  return globalThis.__gazetteerMemoryVisits
}

function getKeysSet(): Set<string> {
  if (!globalThis.__gazetteerMemoryKeys) {
    globalThis.__gazetteerMemoryKeys = new Set<string>()
  }
  return globalThis.__gazetteerMemoryKeys
}

const countryByCode = new Map(SEED_COUNTRIES.map((c) => [c.code, c.name]))
const cityByName = new Map(
  SEED_CITIES.map((c, idx) => [c.name, { ...c, id: idx + 1 }])
)
const categoryBySlug = new Map(
  SEED_CATEGORIES.map((c, idx) => [c.slug, { ...c, id: idx + 1 }])
)

const MEMORY_PLACES: PlaceSummary[] = SEED_PLACES.map((p, idx) => {
  const city = cityByName.get(p.city)!
  const category = categoryBySlug.get(p.category)!
  return {
    id: idx + 1,
    slug: p.slug,
    name: p.name,
    description: p.description,
    lat: p.lat,
    lng: p.lng,
    geohash: p.geohash,
    mapsUrl: p.mapsUrl,
    cityId: city.id,
    cityName: city.name,
    countryCode: city.countryCode,
    countryName: countryByCode.get(city.countryCode) ?? city.countryCode,
    categoryId: category.id,
    categorySlug: category.slug,
    categoryLabel: category.label,
    categoryIcon: category.iconName,
  }
})

export function getMemoryCatalogData(): CatalogPayload {
  const visitedSet = getVisitsSet()
  const lotdIndex = SEED_PLACES.findIndex((p) => p.featuredOffsetDays === 0)
  const idx = lotdIndex >= 0 ? lotdIndex : 0
  const seedLotd = SEED_PLACES[idx]
  const lotdSummary = MEMORY_PLACES[idx]

  const lotd: LocationOfTheDay = {
    ...lotdSummary,
    photos: seedLotd.photos.map((photo, pIdx) => ({
      id: pIdx + 1,
      imageUrl: photo.imageUrl,
      blurhash: photo.blurhash,
      width: photo.width,
      height: photo.height,
      sortOrder: photo.sortOrder,
    })),
    visited: visitedSet.has(lotdSummary.id),
  }

  return {
    mode: "memory",
    user: SEED_USER,
    lotd,
    places: [...MEMORY_PLACES].sort((a, b) => a.name.localeCompare(b.name)),
    visitedIds: Array.from(visitedSet),
  }
}

export function searchMemoryPlaces(query: string, limit = 8): PlaceSummary[] {
  const needle = query.trim().toLowerCase()
  if (!needle) {
    return []
  }
  return MEMORY_PLACES.filter(
    (p) =>
      p.name.toLowerCase().includes(needle) ||
      p.cityName.toLowerCase().includes(needle) ||
      p.categoryLabel.toLowerCase().includes(needle)
  ).slice(0, limit)
}

export function checkInMemory(
  placeId: number,
  idempotencyKey: string
): { alreadyVisited: boolean } {
  const keys = getKeysSet()
  const visits = getVisitsSet()
  if (keys.has(idempotencyKey) || visits.has(placeId)) {
    return { alreadyVisited: true }
  }
  keys.add(idempotencyKey)
  visits.add(placeId)
  return { alreadyVisited: false }
}

export function undoCheckInMemory(placeId: number): void {
  getVisitsSet().delete(placeId)
}

