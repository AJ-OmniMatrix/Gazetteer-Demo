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

export const SEED_USERS = [
  {
    id: 1,
    displayName: "Aarav Sen",
    handle: "aarav",
    avatarUrl: "/images/avatar.png",
    avatarBlurhash: "L~N+^As.V?j[~VayaefQIqWCozaz",
    isDeveloper: true,
  },
  {
    id: 2,
    displayName: "Maya Lin",
    handle: "maya",
    avatarUrl: "/images/avatar.png",
    avatarBlurhash: "L~N+^As.V?j[~VayaefQIqWCozaz",
    isDeveloper: true,
  },
]

export const SEED_USER = SEED_USERS[0]

export const SEED_COUNTRIES = [
  { code: "JP", name: "Japan" },
  { code: "IN", name: "India" },
  { code: "FR", name: "France" },
  { code: "CH", name: "Switzerland" },
  { code: "US", name: "United States" },
  { code: "IT", name: "Italy" },
  { code: "ES", name: "Spain" },
  { code: "GB", name: "United Kingdom" },
]

export const SEED_CITIES = [
  { countryCode: "JP", name: "Kyoto", lat: 35.0116, lng: 135.7681 },
  { countryCode: "JP", name: "Tokyo", lat: 35.6762, lng: 139.6503 },
  { countryCode: "IN", name: "Jaipur", lat: 26.9124, lng: 75.7873 },
  { countryCode: "IN", name: "Mumbai", lat: 19.076, lng: 72.8777 },
  { countryCode: "FR", name: "Paris", lat: 48.8566, lng: 2.3522 },
  { countryCode: "CH", name: "Zermatt", lat: 46.0207, lng: 7.7491 },
]

export const SEED_CATEGORIES = [
  { slug: "landmark", label: "Landmark", iconName: "RiCompass3Line" },
  { slug: "national_park", label: "National Park", iconName: "RiTreesLine" },
  { slug: "museum", label: "Museum", iconName: "RiBankLine" },
  { slug: "cafe", label: "Cafe", iconName: "RiCupLine" },
  { slug: "mall", label: "Mall", iconName: "RiShoppingBag3Line" },
]

const PHOTO_POOL: SeedPhoto[] = [
  {
    imageUrl: "/images/places/inari-1.png",
    blurhash: "L~MPUJoJWBkC~Vf6aej[S#WVkCf6",
    width: 640,
    height: 480,
  },
  {
    imageUrl: "/images/places/inari-2.png",
    blurhash: "L|LV{*s:V[af~Vj[aeaykqR+j[j[",
    width: 480,
    height: 600,
  },
  {
    imageUrl: "/images/places/inari-3.png",
    blurhash: "L,H{J]s:j[Rk~poLayWBogWBWBof",
    width: 640,
    height: 440,
  },
  {
    imageUrl: "/images/places/inari-4.png",
    blurhash: "L~M5{|WCi{f*~AjZWBj[ShoLbbjZ",
    width: 560,
    height: 560,
  },
  {
    imageUrl: "/images/places/inari-5.png",
    blurhash: "L[KdYpWBj@kC~payayj[bcoeayjt",
    width: 640,
    height: 480,
  },
  {
    imageUrl: "/images/places/inari-6.png",
    blurhash: "L[K]x^oeV@WC~UfjWBjtOYWVkCoe",
    width: 500,
    height: 620,
  },
  {
    imageUrl: "/images/places/inari-7.png",
    blurhash: "L|MGInogoeWB~VkCf6aySiaeWCof",
    width: 640,
    height: 460,
  },
]

export const RAW_PLACES: RawPlaceInput[] = [
  {
    city: "Kyoto",
    category: "landmark",
    name: "Fushimi Inari Taisha",
    slug: "fushimi-inari-taisha",
    description:
      "Vermilion torii gates winding through Mount Inari forest trails.",
    lat: 34.96714,
    lng: 135.772672,
    featuredOffsetDays: 0,
    photos: [
      { ...PHOTO_POOL[0], sortOrder: 0 },
      { ...PHOTO_POOL[1], sortOrder: 1 },
      { ...PHOTO_POOL[2], sortOrder: 2 },
      { ...PHOTO_POOL[3], sortOrder: 3 },
      { ...PHOTO_POOL[4], sortOrder: 4 },
      { ...PHOTO_POOL[5], sortOrder: 5 },
    ],
  },
  {
    city: "Kyoto",
    category: "national_park",
    name: "Arashiyama Bamboo Grove",
    slug: "arashiyama-bamboo-grove",
    description:
      "Soaring emerald bamboo stalks along a tranquil Kyoto footpath.",
    lat: 35.0168,
    lng: 135.6713,
    featuredOffsetDays: -1,
    photos: [
      { ...PHOTO_POOL[2], sortOrder: 0 },
      { ...PHOTO_POOL[0], sortOrder: 1 },
      { ...PHOTO_POOL[4], sortOrder: 2 },
      { ...PHOTO_POOL[6], sortOrder: 3 },
    ],
  },
  {
    city: "Kyoto",
    category: "cafe",
    name: "Weekenders Coffee Tominokoji",
    slug: "weekenders-coffee-tominokoji",
    description:
      "Minimalist courtyard espresso stand tucked inside central Kyoto.",
    lat: 35.0046,
    lng: 135.7641,
    featuredOffsetDays: null,
    photos: [{ ...PHOTO_POOL[4], sortOrder: 0 }],
  },
  {
    city: "Kyoto",
    category: "museum",
    name: "Kyoto National Museum",
    slug: "kyoto-national-museum",
    description:
      "Heisei Chishinkan wing housing classical Japanese ceramics and scrolls.",
    lat: 34.9899,
    lng: 135.7731,
    featuredOffsetDays: null,
    photos: [{ ...PHOTO_POOL[5], sortOrder: 0 }],
  },
  {
    city: "Tokyo",
    category: "landmark",
    name: "Shibuya Sky",
    slug: "shibuya-sky",
    description: "Open-air 360-degree rooftop deck above Shibuya Crossing.",
    lat: 35.6584,
    lng: 139.7022,
    featuredOffsetDays: -2,
    photos: [
      { ...PHOTO_POOL[0], sortOrder: 0 },
      { ...PHOTO_POOL[3], sortOrder: 1 },
      { ...PHOTO_POOL[4], sortOrder: 2 },
      { ...PHOTO_POOL[5], sortOrder: 3 },
      { ...PHOTO_POOL[6], sortOrder: 4 },
    ],
  },
  {
    city: "Tokyo",
    category: "museum",
    name: "Mori Art Museum",
    slug: "mori-art-museum",
    description: "Contemporary art museum atop Roppongi Hills Mori Tower.",
    lat: 35.6605,
    lng: 139.7292,
    featuredOffsetDays: null,
    photos: [{ ...PHOTO_POOL[1], sortOrder: 0 }],
  },
  {
    city: "Tokyo",
    category: "mall",
    name: "Ginza Six",
    slug: "ginza-six",
    description:
      "Flagship architectural retail complex with a rooftop garden in Ginza.",
    lat: 35.6697,
    lng: 139.7641,
    featuredOffsetDays: null,
    photos: [{ ...PHOTO_POOL[3], sortOrder: 0 }],
  },
  {
    city: "Tokyo",
    category: "cafe",
    name: "Koffee Mameya",
    slug: "koffee-mameya",
    description: "Precision single-origin tasting bar in Omotesando.",
    lat: 35.6669,
    lng: 139.7107,
    featuredOffsetDays: null,
    photos: [{ ...PHOTO_POOL[4], sortOrder: 0 }],
  },
  {
    city: "Jaipur",
    category: "landmark",
    name: "Amer Fort",
    slug: "amer-fort",
    description: "Sandstone hilltop citadel overlooking Maota Lake in Jaipur.",
    lat: 26.9855,
    lng: 75.8513,
    featuredOffsetDays: -3,
    photos: [
      { ...PHOTO_POOL[0], sortOrder: 0 },
      { ...PHOTO_POOL[1], sortOrder: 1 },
      { ...PHOTO_POOL[3], sortOrder: 2 },
      { ...PHOTO_POOL[4], sortOrder: 3 },
      { ...PHOTO_POOL[6], sortOrder: 4 },
    ],
  },
  {
    city: "Jaipur",
    category: "museum",
    name: "Albert Hall Museum",
    slug: "albert-hall-museum",
    description: "Indo-Saracenic state museum in Ram Niwas Garden.",
    lat: 26.9116,
    lng: 75.8195,
    featuredOffsetDays: null,
    photos: [{ ...PHOTO_POOL[5], sortOrder: 0 }],
  },
  {
    city: "Jaipur",
    category: "cafe",
    name: "Tapri Central",
    slug: "tapri-central",
    description: "Rooftop chai house overlooking Central Park.",
    lat: 26.9056,
    lng: 75.8054,
    featuredOffsetDays: null,
    photos: [{ ...PHOTO_POOL[6], sortOrder: 0 }],
  },
  {
    city: "Mumbai",
    category: "cafe",
    name: "Kala Ghoda Cafe",
    slug: "kala-ghoda-cafe",
    description:
      "Neighborhood specialty coffee bar inside Mumbai's art precinct.",
    lat: 18.9277,
    lng: 72.8322,
    featuredOffsetDays: null,
    photos: [{ ...PHOTO_POOL[4], sortOrder: 0 }],
  },
  {
    city: "Mumbai",
    category: "national_park",
    name: "Sanjay Gandhi National Park",
    slug: "sanjay-gandhi-national-park",
    description: "Protected urban forest reserve and Kanheri rock-cut caves.",
    lat: 19.2147,
    lng: 72.9106,
    featuredOffsetDays: null,
    photos: [{ ...PHOTO_POOL[2], sortOrder: 0 }],
  },
  {
    city: "Mumbai",
    category: "mall",
    name: "Phoenix Palladium",
    slug: "phoenix-palladium",
    description: "Lower Parel lifestyle courtyard and retail district.",
    lat: 18.995,
    lng: 72.8245,
    featuredOffsetDays: null,
    photos: [{ ...PHOTO_POOL[3], sortOrder: 0 }],
  },
  {
    city: "Paris",
    category: "museum",
    name: "Musee d'Orsay",
    slug: "musee-d-orsay",
    description:
      "Beaux-Arts railway station housing Impressionist masterpieces.",
    lat: 48.86,
    lng: 2.3266,
    featuredOffsetDays: -4,
    photos: [
      { ...PHOTO_POOL[0], sortOrder: 0 },
      { ...PHOTO_POOL[1], sortOrder: 1 },
      { ...PHOTO_POOL[2], sortOrder: 2 },
      { ...PHOTO_POOL[3], sortOrder: 3 },
      { ...PHOTO_POOL[4], sortOrder: 4 },
      { ...PHOTO_POOL[5], sortOrder: 5 },
      { ...PHOTO_POOL[6], sortOrder: 6 },
    ],
  },
  {
    city: "Paris",
    category: "cafe",
    name: "Cafe de Flore",
    slug: "cafe-de-flore",
    description: "Historic Saint-Germain-des-Pres corner cafe.",
    lat: 48.854,
    lng: 2.3326,
    featuredOffsetDays: null,
    photos: [{ ...PHOTO_POOL[4], sortOrder: 0 }],
  },
  {
    city: "Zermatt",
    category: "national_park",
    name: "Gornergrat Ridge",
    slug: "gornergrat-ridge",
    description: "High-altitude alpine panorama facing the Matterhorn massif.",
    lat: 45.9836,
    lng: 7.7852,
    featuredOffsetDays: -5,
    photos: [
      { ...PHOTO_POOL[0], sortOrder: 0 },
      { ...PHOTO_POOL[2], sortOrder: 1 },
      { ...PHOTO_POOL[4], sortOrder: 2 },
      { ...PHOTO_POOL[6], sortOrder: 3 },
    ],
  },
  {
    city: "Zermatt",
    category: "landmark",
    name: "Riffelsee Alpine Mirror",
    slug: "riffelsee-alpine-mirror",
    description: "Glacial mountain lake reflecting dawn light above Zermatt.",
    lat: 45.9825,
    lng: 7.7611,
    featuredOffsetDays: null,
    photos: [{ ...PHOTO_POOL[1], sortOrder: 0 }],
  },
]

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
