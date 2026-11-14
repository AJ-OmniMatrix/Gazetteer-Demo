import {
  SEED_CATEGORIES,
  SEED_CITIES,
  SEED_COUNTRIES,
  SEED_PLACES,
} from "./seed-data"
import type {
  CatalogPayload,
  LocationOfTheDay,
  PlacePhoto,
  PlaceSummary,
  User,
  UserVisitItem,
  VisitSource,
} from "@/lib/types"

declare global {
  var __gazetteerMemoryVisitsByUser: Map<number, Set<number>> | undefined
  var __gazetteerMemoryVisitsLog:
    | Array<{
        id: number
        userId: number
        placeId: number
        source: VisitSource
        visitedAt: string
      }>
    | undefined
  var __gazetteerMemoryKeys: Set<string> | undefined
}

function getVisitsByUser(): Map<number, Set<number>> {
  if (!globalThis.__gazetteerMemoryVisitsByUser) {
    globalThis.__gazetteerMemoryVisitsByUser = new Map<number, Set<number>>()
  }
  return globalThis.__gazetteerMemoryVisitsByUser
}

function getVisitsLog(): Array<{
  id: number
  userId: number
  placeId: number
  source: VisitSource
  visitedAt: string
}> {
  if (!globalThis.__gazetteerMemoryVisitsLog) {
    globalThis.__gazetteerMemoryVisitsLog = []
  }
  return globalThis.__gazetteerMemoryVisitsLog
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
  const city = cityByName.get(p.city) ?? {
    id: idx + 1,
    name: p.city,
    countryCode: p.countryCode ?? "XX",
    lat: p.lat,
    lng: p.lng,
  }
  const category = categoryBySlug.get(p.category) ?? {
    id: 1,
    slug: p.category,
    label: p.category,
    iconName: "RiCompass3Line",
  }
  const photos: PlacePhoto[] = p.photos.map((photo, pIdx) => ({
    id: pIdx + 1,
    imageUrl: photo.imageUrl,
    blurhash: photo.blurhash,
    width: photo.width,
    height: photo.height,
    sortOrder: photo.sortOrder,
  }))
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
    countryName:
      countryByCode.get(city.countryCode) ?? p.country ?? city.countryCode,
    categoryId: category.id,
    categorySlug: category.slug,
    categoryLabel: category.label,
    categoryIcon: category.iconName,
    primaryPhoto: photos[0],
    photos,
  }
})

export function getMemoryCatalogData(user?: User | null): CatalogPayload {
  const userVisits = user ? getVisitsByUser().get(user.id) : undefined
  const visitedSet = userVisits ?? new Set<number>()

  if (MEMORY_PLACES.length === 0) {
    return {
      mode: "memory",
      user: user ?? null,
      lotd: null,
      places: [],
      visitedIds: [],
    }
  }

  const lotdIndex = SEED_PLACES.findIndex((p) => p.featuredOffsetDays === 0)
  const idx = lotdIndex >= 0 ? lotdIndex : 0
  const seedLotd = SEED_PLACES[idx]
  const lotdSummary = MEMORY_PLACES[idx]

  const lotdPhotos: PlacePhoto[] = seedLotd.photos.map((photo, pIdx) => ({
    id: pIdx + 1,
    imageUrl: photo.imageUrl,
    blurhash: photo.blurhash,
    width: photo.width,
    height: photo.height,
    sortOrder: photo.sortOrder,
  }))

  const lotd: LocationOfTheDay = {
    ...lotdSummary,
    primaryPhoto: lotdPhotos[0],
    photos: lotdPhotos,
    visited: visitedSet.has(lotdSummary.id),
  }

  return {
    mode: "memory",
    user: user ?? null,
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
  userId: number,
  placeId: number,
  source: VisitSource,
  idempotencyKey: string
): { alreadyVisited: boolean } {
  const keys = getKeysSet()
  const userMap = getVisitsByUser()
  let userVisits = userMap.get(userId)
  if (!userVisits) {
    userVisits = new Set<number>()
    userMap.set(userId, userVisits)
  }

  if (keys.has(`${userId}:${idempotencyKey}`) || userVisits.has(placeId)) {
    return { alreadyVisited: true }
  }

  keys.add(`${userId}:${idempotencyKey}`)
  userVisits.add(placeId)

  const log = getVisitsLog()
  log.push({
    id: log.length + 1,
    userId,
    placeId,
    source,
    visitedAt: new Date().toISOString(),
  })

  return { alreadyVisited: false }
}

export function resetUserMemoryData(userId: number): void {
  const userMap = getVisitsByUser()
  userMap.delete(userId)

  const log = getVisitsLog()
  for (let i = log.length - 1; i >= 0; i--) {
    if (log[i].userId === userId) {
      log.splice(i, 1)
    }
  }

  const keys = getKeysSet()
  keys.clear()
}

export function undoCheckInMemory(userId: number, placeId: number): void {
  const userMap = getVisitsByUser()
  const userVisits = userMap.get(userId)
  if (userVisits) {
    userVisits.delete(placeId)
  }

  const log = getVisitsLog()
  const idx = log.findIndex((v) => v.userId === userId && v.placeId === placeId)
  if (idx >= 0) {
    log.splice(idx, 1)
  }
}

export function getUserVisitsMemory(userId: number): UserVisitItem[] {
  const log = getVisitsLog().filter((v) => v.userId === userId)
  const placeMap = new Map(MEMORY_PLACES.map((p) => [p.id, p]))

  return log
    .slice()
    .reverse()
    .map((v) => {
      const place = placeMap.get(v.placeId)
      if (!place) {
        return null
      }
      return {
        id: v.id,
        placeId: v.placeId,
        visitedAt: v.visitedAt,
        source: v.source,
        place,
      }
    })
    .filter((item): item is UserVisitItem => item !== null)
}

export function addPlaceMemory(place: PlaceSummary): void {
  const existingIdx = MEMORY_PLACES.findIndex((p) => p.slug === place.slug)
  if (existingIdx >= 0) {
    MEMORY_PLACES[existingIdx] = place
  } else {
    MEMORY_PLACES.push(place)
  }
}
