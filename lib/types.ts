export type VisitSource = "lotd_quick_add" | "gps" | "search"

export interface DemoUser {
  id: number
  displayName: string
  handle: string
  avatarUrl: string
  avatarBlurhash: string
}

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
  user: DemoUser
  lotd: LocationOfTheDay | null
  places: PlaceSummary[]
  visitedIds: number[]
}
