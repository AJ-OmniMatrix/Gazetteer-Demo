export type VisitSource =
  "lotd_quick_add" | "gps" | "search" | "explore" | "list"

export interface User {
  id: number
  displayName: string
  handle: string
  avatarUrl: string
  avatarBlurhash: string
  isDeveloper?: boolean
}

export type DemoUser = User

export interface PlacePhoto {
  id: number
  imageUrl: string
  blurhash: string
  width: number
  height: number
  sortOrder: number
}

export interface PlaceSummary {
  id: number
  slug: string
  name: string
  description: string
  lat: number
  lng: number
  geohash: string
  mapsUrl: string
  cityId: number
  cityName: string
  countryCode: string
  countryName: string
  categoryId: number
  categorySlug: string
  categoryLabel: string
  categoryIcon: string
  primaryPhoto?: PlacePhoto
  photos?: PlacePhoto[]
}

export interface LocationOfTheDay extends PlaceSummary {
  photos: PlacePhoto[]
  visited: boolean
}

export interface CatalogPayload {
  mode: "tidb" | "memory"
  user: User | null
  lotd: LocationOfTheDay | null
  places: PlaceSummary[]
  visitedIds: number[]
}

export interface UserVisitItem {
  id: number
  placeId: number
  visitedAt: string
  source: VisitSource
  place: PlaceSummary
}

export interface ListStats {
  totalVisited: number
  uniqueCities: number
  uniqueCountries: number
  categoriesCount: Record<string, number>
}
