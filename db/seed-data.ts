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
    displayName: "@dev",
    handle: "dev",
    avatarUrl: "/images/avatar.png",
    avatarBlurhash: "L~N+^As.V?j[~VayaefQIqWCozaz",
    isDeveloper: true,
  },
]

export const SEED_USER = SEED_USERS[0]

export const SEED_COUNTRIES = [
  {
    code: "JP",
    name: "Japan",
  },
  {
    code: "IN",
    name: "India",
  },
  {
    code: "FR",
    name: "France",
  },
  {
    code: "CH",
    name: "Switzerland",
  },
  {
    code: "US",
    name: "United States",
  },
  {
    code: "IT",
    name: "Italy",
  },
  {
    code: "ES",
    name: "Spain",
  },
  {
    code: "GB",
    name: "United Kingdom",
  },
]

export const SEED_CITIES = [
  {
    countryCode: "JP",
    name: "Kyoto",
    lat: 35.0116,
    lng: 135.7681,
  },
  {
    countryCode: "JP",
    name: "Tokyo",
    lat: 35.6762,
    lng: 139.6503,
  },
  {
    countryCode: "IN",
    name: "Jaipur",
    lat: 26.9124,
    lng: 75.7873,
  },
  {
    countryCode: "IN",
    name: "Mumbai",
    lat: 19.076,
    lng: 72.8777,
  },
  {
    countryCode: "FR",
    name: "Paris",
    lat: 48.8566,
    lng: 2.3522,
  },
  {
    countryCode: "CH",
    name: "Zermatt",
    lat: 46.0207,
    lng: 7.7491,
  },
]

export const SEED_CATEGORIES = [
  {
    slug: "landmark",
    label: "Landmark",
    iconName: "RiCompass3Line",
  },
  {
    slug: "national_park",
    label: "National Park",
    iconName: "RiTreesLine",
  },
  {
    slug: "museum",
    label: "Museum",
    iconName: "RiBankLine",
  },
  {
    slug: "cafe",
    label: "Cafe",
    iconName: "RiCupLine",
  },
  {
    slug: "mall",
    label: "Mall",
    iconName: "RiShoppingBag3Line",
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
      {
        imageUrl: "/images/places/fushimi-inari-taisha/photo-1.jpg",
        blurhash: "LEJa[%~S?cIw0058R5xYN2enxuxt",
        width: 848,
        height: 1200,
        sortOrder: 0,
      },
      {
        imageUrl: "/images/places/fushimi-inari-taisha/photo-2.jpg",
        blurhash: "LGEUY}t7SK%003ofS5NH~Us,odof",
        width: 1600,
        height: 796,
        sortOrder: 1,
      },
      {
        imageUrl: "/images/places/fushimi-inari-taisha/photo-3.jpg",
        blurhash: "LlIe^XNwwIsm}Yj@Shj[xus.NaWV",
        width: 1600,
        height: 1066,
        sortOrder: 2,
      },
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
      {
        imageUrl: "/images/places/arashiyama-bamboo-grove/photo-1.jpg",
        blurhash: "L8DJX#~A00Mx3]9tRYbb~B$$4:Rk",
        width: 801,
        height: 534,
        sortOrder: 0,
      },
      {
        imageUrl: "/images/places/arashiyama-bamboo-grove/photo-2.jpg",
        blurhash: "LDD+*3D,WA--*7%2xsoutOWUX5xs",
        width: 1080,
        height: 720,
        sortOrder: 1,
      },
      {
        imageUrl: "/images/places/arashiyama-bamboo-grove/photo-3.jpg",
        blurhash: "LCC66|ngEkNL~PobN|IqSck9R-V_",
        width: 1300,
        height: 956,
        sortOrder: 2,
      },
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
    photos: [
      {
        imageUrl: "/images/places/weekenders-coffee-tominokoji/photo-1.jpg",
        blurhash: "L7FF4#_vTmvi*{-4x]Vt7#K7WT56",
        width: 900,
        height: 1200,
        sortOrder: 0,
      },
      {
        imageUrl: "/images/places/weekenders-coffee-tominokoji/photo-2.jpg",
        blurhash: "L8BM9}sp01fi5sbcs8WA04X8}@r=",
        width: 1500,
        height: 1000,
        sortOrder: 1,
      },
      {
        imageUrl: "/images/places/weekenders-coffee-tominokoji/photo-3.jpg",
        blurhash: "LAD]bn-M%en2KGJAM{Ws?]o5D+tS",
        width: 1480,
        height: 987,
        sortOrder: 2,
      },
    ],
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
    photos: [
      {
        imageUrl: "/images/places/kyoto-national-museum/photo-1.jpg",
        blurhash: "LsL#2*s:xvt7_NofozkC.9j[WBj]",
        width: 1600,
        height: 1067,
        sortOrder: 0,
      },
      {
        imageUrl: "/images/places/kyoto-national-museum/photo-2.jpg",
        blurhash: "LjGll4o#o#kCKBWEbca#E;oJadj[",
        width: 1365,
        height: 1024,
        sortOrder: 1,
      },
      {
        imageUrl: "/images/places/kyoto-national-museum/photo-3.jpg",
        blurhash: "L$K^]Rozofxb~qj?t7t7?cj[WBbH",
        width: 832,
        height: 468,
        sortOrder: 2,
      },
    ],
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
      {
        imageUrl: "/images/places/shibuya-sky/photo-1.jpg",
        blurhash: "LdEf.[t7X9fkyZR.t8j]OtR*aeay",
        width: 1280,
        height: 853,
        sortOrder: 0,
      },
      {
        imageUrl: "/images/places/shibuya-sky/photo-2.jpg",
        blurhash: "Lt8%9mystljEogj]fkayIUNHRkae",
        width: 1280,
        height: 632,
        sortOrder: 1,
      },
      {
        imageUrl: "/images/places/shibuya-sky/photo-3.jpg",
        blurhash: "LHP$|2_IPUyVHZt0X4XQT:RSivsl",
        width: 1280,
        height: 976,
        sortOrder: 2,
      },
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
    photos: [
      {
        imageUrl: "/images/places/mori-art-museum/photo-1.jpg",
        blurhash: "LHC~J2wfTxNb}@%LKOXSXTxtShSe",
        width: 964,
        height: 720,
        sortOrder: 0,
      },
      {
        imageUrl: "/images/places/mori-art-museum/photo-2.jpg",
        blurhash: "LdFPpdxu-;NG_Nt6%Mj[tRaet7j[",
        width: 904,
        height: 1200,
        sortOrder: 1,
      },
      {
        imageUrl: "/images/places/mori-art-museum/photo-3.jpg",
        blurhash: "L00000fQfQfQfQfQfQfQfQfQfQfQ",
        width: 1280,
        height: 700,
        sortOrder: 2,
      },
    ],
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
    photos: [
      {
        imageUrl: "/images/places/ginza-six/photo-1.jpg",
        blurhash: "LsEgB#ofjuj[yZoLj[j[krRja|j]",
        width: 1280,
        height: 682,
        sortOrder: 0,
      },
      {
        imageUrl: "/images/places/ginza-six/photo-2.jpg",
        blurhash: "L6GktZ8w5ZDg004,?wE100tR=_Sg",
        width: 1280,
        height: 960,
        sortOrder: 1,
      },
      {
        imageUrl: "/images/places/ginza-six/photo-3.jpg",
        blurhash: "LFFiDCayXBxqFknM-.N1OwE7octQ",
        width: 1280,
        height: 855,
        sortOrder: 2,
      },
    ],
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
    photos: [
      {
        imageUrl: "/images/places/koffee-mameya/photo-1.jpg",
        blurhash: "L9A+{Q-U029]0gM|%1t60fNb}?-U",
        width: 800,
        height: 1200,
        sortOrder: 0,
      },
    ],
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
      {
        imageUrl: "/images/places/amer-fort/photo-1.jpg",
        blurhash: "LAFW^9};}-%0o$^J=v$%0:WB12NI",
        width: 1600,
        height: 900,
        sortOrder: 0,
      },
      {
        imageUrl: "/images/places/amer-fort/photo-2.jpg",
        blurhash: "LSINjrtLtRxt6E={xbog9*OZxsbI",
        width: 1080,
        height: 720,
        sortOrder: 1,
      },
      {
        imageUrl: "/images/places/amer-fort/photo-3.jpg",
        blurhash: "L@IEbFNGs.j[yZNHfjoLTLR*j?bH",
        width: 1200,
        height: 630,
        sortOrder: 2,
      },
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
    photos: [
      {
        imageUrl: "/images/places/albert-hall-museum/photo-1.jpg",
        blurhash: "LJCiK-NG9Zxa~VayIVafs:t7RkNG",
        width: 394,
        height: 553,
        sortOrder: 0,
      },
      {
        imageUrl: "/images/places/albert-hall-museum/photo-2.jpg",
        blurhash: "LKL:ln4UNG~W-pRjM|t7M{-;M|WB",
        width: 467,
        height: 495,
        sortOrder: 1,
      },
      {
        imageUrl: "/images/places/albert-hall-museum/photo-3.jpg",
        blurhash: "LMHnaH]|bJ$%5xrVafWX1Tt8ngSi",
        width: 1280,
        height: 1142,
        sortOrder: 2,
      },
    ],
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
    photos: [
      {
        imageUrl: "/images/places/tapri-central/photo-1.jpg",
        blurhash: "LZGSy3oz~qt7x^aet7fP_3fR$#of",
        width: 235,
        height: 251,
        sortOrder: 0,
      },
      {
        imageUrl: "/images/places/tapri-central/photo-2.jpg",
        blurhash: "LeGlS4oykVoz?wozjFae_Nt7kCof",
        width: 1280,
        height: 960,
        sortOrder: 1,
      },
      {
        imageUrl: "/images/places/tapri-central/photo-3.jpg",
        blurhash: "L00000fQfQfQfQfQfQfQfQfQfQfQ",
        width: 1280,
        height: 629,
        sortOrder: 2,
      },
    ],
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
    photos: [
      {
        imageUrl: "/images/places/kala-ghoda-cafe/photo-1.jpg",
        blurhash: "LtDJ@[a$o#a$TOWFbdj]T3j]WBbI",
        width: 1200,
        height: 1200,
        sortOrder: 0,
      },
      {
        imageUrl: "/images/places/kala-ghoda-cafe/photo-2.jpg",
        blurhash: "LHP72%4-?J?d_2tRtA%2M{awxZ-o",
        width: 892,
        height: 1200,
        sortOrder: 1,
      },
      {
        imageUrl: "/images/places/kala-ghoda-cafe/photo-3.jpg",
        blurhash: "L+JHs~t7R*of_Nofaej[.8j[jsj[",
        width: 1280,
        height: 921,
        sortOrder: 2,
      },
    ],
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
    photos: [
      {
        imageUrl: "/images/places/sanjay-gandhi-national-park/photo-1.jpg",
        blurhash: "LaG8.pt8aet7%%kCjsfkOaWBj[ay",
        width: 1280,
        height: 941,
        sortOrder: 0,
      },
      {
        imageUrl: "/images/places/sanjay-gandhi-national-park/photo-2.jpg",
        blurhash: "LhH{DkIUIToJ_3oIR%Wp~XR%M{ae",
        width: 500,
        height: 377,
        sortOrder: 1,
      },
      {
        imageUrl: "/images/places/sanjay-gandhi-national-park/photo-3.jpg",
        blurhash: "LmKd}K~qD%WBD%RjRjRjIURj%Mof",
        width: 961,
        height: 1200,
        sortOrder: 2,
      },
    ],
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
    photos: [
      {
        imageUrl: "/images/places/phoenix-palladium/photo-1.jpg",
        blurhash: "LGEM2m%0oIt7yZR.M{WY0Lbdnhs:",
        width: 1280,
        height: 721,
        sortOrder: 0,
      },
      {
        imageUrl: "/images/places/phoenix-palladium/photo-2.jpg",
        blurhash: "LaFhSb=~xZWB^n%5oIj[kZS%WAs:",
        width: 1280,
        height: 935,
        sortOrder: 1,
      },
      {
        imageUrl: "/images/places/phoenix-palladium/photo-3.jpg",
        blurhash: "LZD+@~?ajtog~W%MWCkC-;t7NGWC",
        width: 1280,
        height: 554,
        sortOrder: 2,
      },
    ],
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
      {
        imageUrl: "/images/places/musee-d-orsay/photo-1.jpg",
        blurhash: "LuKx6pRj~q%M-;WBWBt7WBj[ofj[",
        width: 1000,
        height: 1138,
        sortOrder: 0,
      },
      {
        imageUrl: "/images/places/musee-d-orsay/photo-2.jpg",
        blurhash: "LWJ8hG%g-:xZ?^-:t6V[%fRQV@f6",
        width: 1280,
        height: 811,
        sortOrder: 1,
      },
      {
        imageUrl: "/images/places/musee-d-orsay/photo-3.jpg",
        blurhash: "L2A0?vs~k=^itp9F9HM|00?a^OXm",
        width: 1280,
        height: 679,
        sortOrder: 2,
      },
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
    photos: [
      {
        imageUrl: "/images/places/cafe-de-flore/photo-1.jpg",
        blurhash: "L*HVrLofRjfl_4ofWBa}xuj[WVaz",
        width: 1600,
        height: 1000,
        sortOrder: 0,
      },
      {
        imageUrl: "/images/places/cafe-de-flore/photo-2.jpg",
        blurhash: "LbH2o^%MM|oy_NxaWBRj_3t7j[Mx",
        width: 1600,
        height: 1060,
        sortOrder: 1,
      },
      {
        imageUrl: "/images/places/cafe-de-flore/photo-3.jpg",
        blurhash: "LSLNGE_4%~RikqNa-;aKx]niRPM{",
        width: 440,
        height: 586,
        sortOrder: 2,
      },
    ],
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
      {
        imageUrl: "/images/places/gornergrat-ridge/photo-1.jpg",
        blurhash: "Lm9*~LoeXAbdt:flo$kDSjWBofof",
        width: 1600,
        height: 1066,
        sortOrder: 0,
      },
      {
        imageUrl: "/images/places/gornergrat-ridge/photo-2.jpg",
        blurhash: "LfDv{AR*M{og%%ayR*WBE4t7t7a}",
        width: 1600,
        height: 1067,
        sortOrder: 1,
      },
      {
        imageUrl: "/images/places/gornergrat-ridge/photo-3.jpg",
        blurhash: "LAEpE2_N00IV00%NxvRj004U.8%L",
        width: 1264,
        height: 1200,
        sortOrder: 2,
      },
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
    photos: [
      {
        imageUrl: "/images/places/riffelsee-alpine-mirror/photo-1.jpg",
        blurhash: "L-GST1xutRt7_4oft7of%Nf5oJj@",
        width: 1600,
        height: 1200,
        sortOrder: 0,
      },
      {
        imageUrl: "/images/places/riffelsee-alpine-mirror/photo-2.jpg",
        blurhash: "LcF5%8VrMxt7PEV=ngozS7WUj=j[",
        width: 960,
        height: 1200,
        sortOrder: 1,
      },
    ],
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
