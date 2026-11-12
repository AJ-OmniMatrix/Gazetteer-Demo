import { encodeGeohash } from "../lib/geohash"

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
  displayName: "Aarav Sen",
  handle: "aarav",
  avatarUrl: "/images/avatar.png",
  avatarBlurhash: "L~N+^As.V?j[~VayaefQIqWCozaz",
}

export const SEED_COUNTRIES = [
  {
    "code": "JP",
    "name": "Japan"
  },
  {
    "code": "IN",
    "name": "India"
  },
  {
    "code": "FR",
    "name": "France"
  },
  {
    "code": "CH",
    "name": "Switzerland"
  },
  {
    "code": "US",
    "name": "United States"
  },
  {
    "code": "IT",
    "name": "Italy"
  },
  {
    "code": "ES",
    "name": "Spain"
  },
  {
    "code": "GB",
    "name": "United Kingdom"
  }
]

export const SEED_CITIES = [
  {
    "countryCode": "JP",
    "name": "Kyoto",
    "lat": 35.0116,
    "lng": 135.7681
  },
  {
    "countryCode": "JP",
    "name": "Tokyo",
    "lat": 35.6762,
    "lng": 139.6503
  },
  {
    "countryCode": "IN",
    "name": "Jaipur",
    "lat": 26.9124,
    "lng": 75.7873
  },
  {
    "countryCode": "IN",
    "name": "Mumbai",
    "lat": 19.076,
    "lng": 72.8777
  },
  {
    "countryCode": "FR",
    "name": "Paris",
    "lat": 48.8566,
    "lng": 2.3522
  },
  {
    "countryCode": "CH",
    "name": "Zermatt",
    "lat": 46.0207,
    "lng": 7.7491
  }
]

export const SEED_CATEGORIES = [
  {
    "slug": "landmark",
    "label": "Landmark",
    "iconName": "RiCompass3Line"
  },
  {
    "slug": "national_park",
    "label": "National Park",
    "iconName": "RiTreesLine"
  },
  {
    "slug": "museum",
    "label": "Museum",
    "iconName": "RiBankLine"
  },
  {
    "slug": "cafe",
    "label": "Cafe",
    "iconName": "RiCupLine"
  },
  {
    "slug": "mall",
    "label": "Mall",
    "iconName": "RiShoppingBag3Line"
  }
]

export const RAW_PLACES: RawPlaceInput[] = []

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
    mapsUrl: `https://www.google.com/maps/search/?api=1&query=${p.lat},${p.lng}`,
    featuredDate,
    photos: p.photos.map((photo, sortOrder) => ({
      ...photo,
      sortOrder: photo.sortOrder ?? sortOrder,
    })),
  }
})
