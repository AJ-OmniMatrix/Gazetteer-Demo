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
    "id": 1,
    "displayName": "@dev",
    "handle": "dev",
    "avatarUrl": "/images/avatar.png",
    "avatarBlurhash": "L~N+^As.V?j[~VayaefQIqWCozaz",
    "isDeveloper": true
  }
]

export const SEED_USER = SEED_USERS[0]

export const SEED_COUNTRIES = [
  {
    "code": "IN",
    "name": "India"
  },
  {
    "code": "JP",
    "name": "Japan"
  }
]

export const SEED_CITIES = [
  {
    "countryCode": "IN",
    "name": "Jaipur",
    "lat": 26.9124,
    "lng": 75.7873
  },
  {
    "countryCode": "IN",
    "name": "Delhi",
    "lat": 28.6139,
    "lng": 77.209
  },
  {
    "countryCode": "IN",
    "name": "Mumbai",
    "lat": 19.076,
    "lng": 72.8777
  },
  {
    "countryCode": "IN",
    "name": "Agra",
    "lat": 27.1767,
    "lng": 78.0081
  },
  {
    "countryCode": "IN",
    "name": "Bengaluru",
    "lat": 12.9716,
    "lng": 77.5946
  },
  {
    "countryCode": "IN",
    "name": "Varanasi",
    "lat": 25.3176,
    "lng": 82.9739
  },
  {
    "countryCode": "IN",
    "name": "Udaipur",
    "lat": 24.5854,
    "lng": 73.7125
  },
  {
    "countryCode": "IN",
    "name": "Goa",
    "lat": 15.2993,
    "lng": 74.124
  },
  {
    "countryCode": "IN",
    "name": "Kolkata",
    "lat": 22.5726,
    "lng": 88.3639
  },
  {
    "countryCode": "JP",
    "name": "Kyoto",
    "lat": 35.0116,
    "lng": 135.7681
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

export const RAW_PLACES: RawPlaceInput[] = [
  {
    "city": "Kyoto",
    "country": "Japan",
    "countryCode": "JP",
    "category": "landmark",
    "name": "Fushimi Inari Taisha",
    "slug": "fushimi-inari-taisha",
    "description": "Vermilion torii gates winding through Mount Inari forest trails.",
    "lat": 34.96714,
    "lng": 135.772672,
    "featuredOffsetDays": 0,
    "photos": [
      {
        "imageUrl": "/images/places/fushimi-inari-taisha/photo-1.jpg",
        "blurhash": "LEJa[%~S?cIw0058R5xYN2enxuxt",
        "width": 848,
        "height": 1200,
        "sortOrder": 0
      },
      {
        "imageUrl": "/images/places/fushimi-inari-taisha/photo-2.jpg",
        "blurhash": "LGEUY}t7SK%003ofS5NH~Us,odof",
        "width": 1600,
        "height": 796,
        "sortOrder": 1
      },
      {
        "imageUrl": "/images/places/fushimi-inari-taisha/photo-3.jpg",
        "blurhash": "LlIe^XNwwIsm}Yj@Shj[xus.NaWV",
        "width": 1600,
        "height": 1066,
        "sortOrder": 2
      }
    ]
  },
  {
    "city": "Jaipur",
    "country": "India",
    "countryCode": "IN",
    "category": "landmark",
    "name": "Amer Fort",
    "slug": "amer-fort",
    "description": "Sandstone hilltop citadel overlooking Maota Lake in Jaipur.",
    "lat": 26.9855,
    "lng": 75.8513,
    "featuredOffsetDays": -1,
    "photos": [
      {
        "imageUrl": "/images/places/amer-fort/photo-1.jpg",
        "blurhash": "LAFW^9};}-%0o$^J=v$%0:WB12NI",
        "width": 1600,
        "height": 900,
        "sortOrder": 0
      },
      {
        "imageUrl": "/images/places/amer-fort/photo-2.jpg",
        "blurhash": "LSINjrtLtRxt6E={xbog9*OZxsbI",
        "width": 1080,
        "height": 720,
        "sortOrder": 1
      },
      {
        "imageUrl": "/images/places/amer-fort/photo-3.jpg",
        "blurhash": "L@IEbFNGs.j[yZNHfjoLTLR*j?bH",
        "width": 1200,
        "height": 630,
        "sortOrder": 2
      }
    ]
  },
  {
    "city": "Jaipur",
    "country": "India",
    "countryCode": "IN",
    "category": "landmark",
    "name": "Hawa Mahal",
    "slug": "hawa-mahal",
    "description": "Five-story pink sandstone palace with 953 ornate lattice windows.",
    "lat": 26.9239,
    "lng": 75.8267,
    "featuredOffsetDays": -2,
    "photos": [
      {
        "imageUrl": "/images/places/hawa-mahal/photo-1.jpg",
        "blurhash": "LYJsR~f,NzozG1kDS%bIAgbISiaz",
        "width": 1600,
        "height": 1124,
        "sortOrder": 0
      },
      {
        "imageUrl": "/images/places/hawa-mahal/photo-2.jpg",
        "blurhash": "LQI;I+S$S%xZT#ozOZa#7iS5S$bH",
        "width": 1600,
        "height": 1078,
        "sortOrder": 1
      },
      {
        "imageUrl": "/images/places/hawa-mahal/photo-3.jpg",
        "blurhash": "LPF;]REl,:s;^nNexHs:F~NIWUjb",
        "width": 1600,
        "height": 1067,
        "sortOrder": 2
      }
    ]
  },
  {
    "city": "Jaipur",
    "country": "India",
    "countryCode": "IN",
    "category": "museum",
    "name": "City Palace Jaipur",
    "slug": "city-palace-jaipur",
    "description": "Historic royal residence blending Rajput and Mughal architectural heritage.",
    "lat": 26.9258,
    "lng": 75.8237,
    "featuredOffsetDays": null,
    "photos": [
      {
        "imageUrl": "/images/places/city-palace-jaipur/photo-1.jpg",
        "blurhash": "LnI4@oxZXAogO_k9W@WZOwbHa~WY",
        "width": 755,
        "height": 435,
        "sortOrder": 0
      },
      {
        "imageUrl": "/images/places/city-palace-jaipur/photo-2.jpg",
        "blurhash": "LOHw}aS5RkxZ~9WCa$j[PCxZWrWX",
        "width": 1440,
        "height": 960,
        "sortOrder": 1
      },
      {
        "imageUrl": "/images/places/city-palace-jaipur/photo-3.jpg",
        "blurhash": "LNIEU;t7xZ%L~WagRjR-ysNIWUkC",
        "width": 1300,
        "height": 956,
        "sortOrder": 2
      }
    ]
  },
  {
    "city": "Jaipur",
    "country": "India",
    "countryCode": "IN",
    "category": "museum",
    "name": "Albert Hall Museum",
    "slug": "albert-hall-museum",
    "description": "Indo-Saracenic state museum in Ram Niwas Garden.",
    "lat": 26.9116,
    "lng": 75.8195,
    "featuredOffsetDays": null,
    "photos": [
      {
        "imageUrl": "/images/places/albert-hall-museum/photo-1.jpg",
        "blurhash": "LJCiK-NG9Zxa~VayIVafs:t7RkNG",
        "width": 394,
        "height": 553,
        "sortOrder": 0
      },
      {
        "imageUrl": "/images/places/albert-hall-museum/photo-2.jpg",
        "blurhash": "LKL:ln4UNG~W-pRjM|t7M{-;M|WB",
        "width": 467,
        "height": 495,
        "sortOrder": 1
      },
      {
        "imageUrl": "/images/places/albert-hall-museum/photo-3.jpg",
        "blurhash": "LMHnaH]|bJ$%5xrVafWX1Tt8ngSi",
        "width": 1280,
        "height": 1142,
        "sortOrder": 2
      }
    ]
  },
  {
    "city": "Jaipur",
    "country": "India",
    "countryCode": "IN",
    "category": "cafe",
    "name": "Tapri Central",
    "slug": "tapri-central",
    "description": "Rooftop chai house overlooking Central Park.",
    "lat": 26.9056,
    "lng": 75.8054,
    "featuredOffsetDays": null,
    "photos": [
      {
        "imageUrl": "/images/places/tapri-central/photo-1.jpg",
        "blurhash": "LZGSy3oz~qt7x^aet7fP_3fR$#of",
        "width": 235,
        "height": 251,
        "sortOrder": 0
      },
      {
        "imageUrl": "/images/places/tapri-central/photo-2.jpg",
        "blurhash": "LeGlS4oykVoz?wozjFae_Nt7kCof",
        "width": 1280,
        "height": 960,
        "sortOrder": 1
      },
      {
        "imageUrl": "/images/places/tapri-central/photo-3.jpg",
        "blurhash": "L00000fQfQfQfQfQfQfQfQfQfQfQ",
        "width": 1280,
        "height": 629,
        "sortOrder": 2
      }
    ]
  },
  {
    "city": "Jaipur",
    "country": "India",
    "countryCode": "IN",
    "category": "mall",
    "name": "World Trade Park",
    "slug": "world-trade-park",
    "description": "Landmark shopping destination in Malviya Nagar with twin bridge towers.",
    "lat": 26.8532,
    "lng": 75.8051,
    "featuredOffsetDays": null,
    "photos": [
      {
        "imageUrl": "/images/places/world-trade-park/photo-1.jpg",
        "blurhash": "LXA_;lsVtmS5Y8XAflslr=S4ROn$",
        "width": 1200,
        "height": 766,
        "sortOrder": 0
      },
      {
        "imageUrl": "/images/places/world-trade-park/photo-2.jpg",
        "blurhash": "LeDT6bxuWBt8?wj]ofog-oayogax",
        "width": 800,
        "height": 510,
        "sortOrder": 1
      },
      {
        "imageUrl": "/images/places/world-trade-park/photo-3.jpg",
        "blurhash": "L^I6KTWZWDkC-@WYWEj[V?axWCf9",
        "width": 956,
        "height": 535,
        "sortOrder": 2
      }
    ]
  },
  {
    "city": "Delhi",
    "country": "India",
    "countryCode": "IN",
    "category": "landmark",
    "name": "Qutub Minar",
    "slug": "qutub-minar",
    "description": "73-meter victory tower of fluted red sandstone and marble in Mehrauli.",
    "lat": 28.5245,
    "lng": 77.1855,
    "featuredOffsetDays": -3,
    "photos": [
      {
        "imageUrl": "/images/places/qutub-minar/photo-1.jpg",
        "blurhash": "L]JbX3jFbwkX.Toyt8t7WFkCaejb",
        "width": 900,
        "height": 1200,
        "sortOrder": 0
      },
      {
        "imageUrl": "/images/places/qutub-minar/photo-2.jpg",
        "blurhash": "LxJ940j=k@t8T#xaS5oJMxf6aJWB",
        "width": 800,
        "height": 1200,
        "sortOrder": 1
      },
      {
        "imageUrl": "/images/places/qutub-minar/photo-3.jpg",
        "blurhash": "L~KK{6t8o}ay_4t6t8j]ogWAjba#",
        "width": 800,
        "height": 1200,
        "sortOrder": 2
      }
    ]
  },
  {
    "city": "Delhi",
    "country": "India",
    "countryCode": "IN",
    "category": "national_park",
    "name": "Sunder Nursery",
    "slug": "sunder-nursery",
    "description": "Restored 16th-century Mughal garden estate and heritage biodiversity park.",
    "lat": 28.5947,
    "lng": 77.2435,
    "featuredOffsetDays": null,
    "photos": [
      {
        "imageUrl": "/images/places/sunder-nursery/photo-1.jpg",
        "blurhash": "LlH.QEM_RjWUx]j[M{WB_4M{NGWB",
        "width": 900,
        "height": 506,
        "sortOrder": 0
      },
      {
        "imageUrl": "/images/places/sunder-nursery/photo-2.jpg",
        "blurhash": "LjEW8-xujXj[yGWFWYWC%jWBoLog",
        "width": 1600,
        "height": 1068,
        "sortOrder": 1
      },
      {
        "imageUrl": "/images/places/sunder-nursery/photo-3.jpg",
        "blurhash": "LSGbL:V@oMWU?cRjMxe:.TR%M{bF",
        "width": 1080,
        "height": 1080,
        "sortOrder": 2
      }
    ]
  },
  {
    "city": "Delhi",
    "country": "India",
    "countryCode": "IN",
    "category": "museum",
    "name": "National Museum Delhi",
    "slug": "national-museum-delhi",
    "description": "Premier gallery of ancient Indian bronzes, miniature paintings, and manuscripts.",
    "lat": 28.6119,
    "lng": 77.2193,
    "featuredOffsetDays": null,
    "photos": [
      {
        "imageUrl": "/images/places/national-museum-delhi/photo-1.jpg",
        "blurhash": "LgHx1=X8R,bI.8xZo2a#yGxaR+WX",
        "width": 1600,
        "height": 1157,
        "sortOrder": 0
      },
      {
        "imageUrl": "/images/places/national-museum-delhi/photo-2.jpg",
        "blurhash": "LQECg|tQoeof_4t7ogof%hayRjoe",
        "width": 1300,
        "height": 956,
        "sortOrder": 1
      },
      {
        "imageUrl": "/images/places/national-museum-delhi/photo-3.jpg",
        "blurhash": "LLH-.10LV@9a~q$xE2R,02%JxFSP",
        "width": 600,
        "height": 338,
        "sortOrder": 2
      }
    ]
  },
  {
    "city": "Delhi",
    "country": "India",
    "countryCode": "IN",
    "category": "cafe",
    "name": "Blue Tokai Khan Market",
    "slug": "blue-tokai-khan-market",
    "description": "Specialty Indian coffee roastery and brew bar in Khan Market.",
    "lat": 28.6003,
    "lng": 77.2274,
    "featuredOffsetDays": null,
    "photos": [
      {
        "imageUrl": "/images/places/blue-tokai-khan-market/photo-1.jpg",
        "blurhash": "LFGR6b?b%$t7^i?bbw%Mys%g?GaK",
        "width": 1598,
        "height": 1200,
        "sortOrder": 0
      },
      {
        "imageUrl": "/images/places/blue-tokai-khan-market/photo-2.jpg",
        "blurhash": "LNCffQsV2BSL{_o2A;WqBWWp$6o0",
        "width": 496,
        "height": 332,
        "sortOrder": 1
      },
      {
        "imageUrl": "/images/places/blue-tokai-khan-market/photo-3.jpg",
        "blurhash": "LlPj#;t8XVxZ}+WXRja#xsnhr:fk",
        "width": 1157,
        "height": 1200,
        "sortOrder": 2
      }
    ]
  },
  {
    "city": "Delhi",
    "country": "India",
    "countryCode": "IN",
    "category": "mall",
    "name": "Select Citywalk",
    "slug": "select-citywalk",
    "description": "Open-air pedestrian lifestyle mall in Saket with gardens and international flagships.",
    "lat": 28.5286,
    "lng": 77.219,
    "featuredOffsetDays": null,
    "photos": [
      {
        "imageUrl": "/images/places/select-citywalk/photo-1.jpg",
        "blurhash": "LKDJItocIUWB_MxtadoLS$xuazt7",
        "width": 1600,
        "height": 900,
        "sortOrder": 0
      },
      {
        "imageUrl": "/images/places/select-citywalk/photo-2.jpg",
        "blurhash": "LtF~?P.8Wroe_Nx^Rjj=x]WYM{aw",
        "width": 988,
        "height": 1200,
        "sortOrder": 1
      },
      {
        "imageUrl": "/images/places/select-citywalk/photo-3.jpg",
        "blurhash": "LyF$z$%LxtRi_NtQt7RipdS4fQRj",
        "width": 1600,
        "height": 1200,
        "sortOrder": 2
      }
    ]
  },
  {
    "city": "Mumbai",
    "country": "India",
    "countryCode": "IN",
    "category": "landmark",
    "name": "Gateway of India",
    "slug": "gateway-of-india",
    "description": "Waterfront basalt arch facing the Arabian Sea at Apollo Bunder.",
    "lat": 18.922,
    "lng": 72.8347,
    "featuredOffsetDays": -4,
    "photos": [
      {
        "imageUrl": "/images/places/gateway-of-india/photo-1.jpg",
        "blurhash": "LlH-[DR.Rkof~pR-WBkCEmWBoKaz",
        "width": 1600,
        "height": 1199,
        "sortOrder": 0
      },
      {
        "imageUrl": "/images/places/gateway-of-india/photo-2.jpg",
        "blurhash": "LtDJ@@a$o#a$TOWFbdj]T3j]WBbI",
        "width": 1200,
        "height": 1200,
        "sortOrder": 1
      },
      {
        "imageUrl": "/images/places/gateway-of-india/photo-3.jpg",
        "blurhash": "LqHoXjofWBof%%j[jsj]x]ofj[fR",
        "width": 600,
        "height": 450,
        "sortOrder": 2
      }
    ]
  },
  {
    "city": "Mumbai",
    "country": "India",
    "countryCode": "IN",
    "category": "museum",
    "name": "CSMVS Museum Mumbai",
    "slug": "csmvs-museum-mumbai",
    "description": "Grand Indo-Saracenic museum housing sculpture, natural history, and maritime arts.",
    "lat": 18.9269,
    "lng": 72.8327,
    "featuredOffsetDays": null,
    "photos": [
      {
        "imageUrl": "/images/places/csmvs-museum-mumbai/photo-1.jpg",
        "blurhash": "L;C%w2VrR*oeyGV?WBfPT2axWAWB",
        "width": 1600,
        "height": 1067,
        "sortOrder": 0
      },
      {
        "imageUrl": "/images/places/csmvs-museum-mumbai/photo-2.jpg",
        "blurhash": "LiGS7HskM|V[~pM_M{WB?cRQWAoI",
        "width": 572,
        "height": 428,
        "sortOrder": 1
      },
      {
        "imageUrl": "/images/places/csmvs-museum-mumbai/photo-3.jpg",
        "blurhash": "LEK-qP~q004n00RjD%WBD%Rj_3t7",
        "width": 620,
        "height": 833,
        "sortOrder": 2
      }
    ]
  },
  {
    "city": "Mumbai",
    "country": "India",
    "countryCode": "IN",
    "category": "national_park",
    "name": "Sanjay Gandhi National Park",
    "slug": "sanjay-gandhi-national-park",
    "description": "Protected urban forest reserve and Kanheri rock-cut caves.",
    "lat": 19.2147,
    "lng": 72.9106,
    "featuredOffsetDays": null,
    "photos": [
      {
        "imageUrl": "/images/places/sanjay-gandhi-national-park/photo-1.jpg",
        "blurhash": "LaG8.pt8aet7%%kCjsfkOaWBj[ay",
        "width": 1280,
        "height": 941,
        "sortOrder": 0
      },
      {
        "imageUrl": "/images/places/sanjay-gandhi-national-park/photo-2.jpg",
        "blurhash": "LhH{DkIUIToJ_3oIR%Wp~XR%M{ae",
        "width": 500,
        "height": 377,
        "sortOrder": 1
      },
      {
        "imageUrl": "/images/places/sanjay-gandhi-national-park/photo-3.jpg",
        "blurhash": "LmKd}K~qD%WBD%RjRjRjIURj%Mof",
        "width": 961,
        "height": 1200,
        "sortOrder": 2
      }
    ]
  },
  {
    "city": "Mumbai",
    "country": "India",
    "countryCode": "IN",
    "category": "cafe",
    "name": "Kala Ghoda Cafe",
    "slug": "kala-ghoda-cafe",
    "description": "Neighborhood specialty coffee bar inside Mumbai's art precinct.",
    "lat": 18.9277,
    "lng": 72.8322,
    "featuredOffsetDays": null,
    "photos": [
      {
        "imageUrl": "/images/places/kala-ghoda-cafe/photo-1.jpg",
        "blurhash": "LtDJ@[a$o#a$TOWFbdj]T3j]WBbI",
        "width": 1200,
        "height": 1200,
        "sortOrder": 0
      },
      {
        "imageUrl": "/images/places/kala-ghoda-cafe/photo-2.jpg",
        "blurhash": "LHP72%4-?J?d_2tRtA%2M{awxZ-o",
        "width": 892,
        "height": 1200,
        "sortOrder": 1
      },
      {
        "imageUrl": "/images/places/kala-ghoda-cafe/photo-3.jpg",
        "blurhash": "L+JHs~t7R*of_Nofaej[.8j[jsj[",
        "width": 1280,
        "height": 921,
        "sortOrder": 2
      }
    ]
  },
  {
    "city": "Mumbai",
    "country": "India",
    "countryCode": "IN",
    "category": "cafe",
    "name": "Leopold Cafe",
    "slug": "leopold-cafe",
    "description": "Historic 1871 Colaba cafe and bustling cultural meeting spot on Colaba Causeway.",
    "lat": 18.9228,
    "lng": 72.8317,
    "featuredOffsetDays": null,
    "photos": [
      {
        "imageUrl": "/images/places/leopold-cafe/photo-1.jpg",
        "blurhash": "LHPGjU4-?J?d_2tRtA%2M{awxZ-o",
        "width": 892,
        "height": 1200,
        "sortOrder": 0
      },
      {
        "imageUrl": "/images/places/leopold-cafe/photo-2.jpg",
        "blurhash": "LIGIs0#5EmKQk]xut6o~9}JCninh",
        "width": 900,
        "height": 1200,
        "sortOrder": 1
      },
      {
        "imageUrl": "/images/places/leopold-cafe/photo-3.jpg",
        "blurhash": "LMHKY6-CL1bG}vM{cYf+GZNaxZtR",
        "width": 1600,
        "height": 1200,
        "sortOrder": 2
      }
    ]
  },
  {
    "city": "Mumbai",
    "country": "India",
    "countryCode": "IN",
    "category": "mall",
    "name": "Phoenix Palladium",
    "slug": "phoenix-palladium",
    "description": "Lower Parel lifestyle courtyard and retail district.",
    "lat": 18.995,
    "lng": 72.8245,
    "featuredOffsetDays": null,
    "photos": [
      {
        "imageUrl": "/images/places/phoenix-palladium/photo-1.jpg",
        "blurhash": "LGEM2m%0oIt7yZR.M{WY0Lbdnhs:",
        "width": 1280,
        "height": 721,
        "sortOrder": 0
      },
      {
        "imageUrl": "/images/places/phoenix-palladium/photo-2.jpg",
        "blurhash": "LaFhSb=~xZWB^n%5oIj[kZS%WAs:",
        "width": 1280,
        "height": 935,
        "sortOrder": 1
      },
      {
        "imageUrl": "/images/places/phoenix-palladium/photo-3.jpg",
        "blurhash": "LZD+@~?ajtog~W%MWCkC-;t7NGWC",
        "width": 1280,
        "height": 554,
        "sortOrder": 2
      }
    ]
  },
  {
    "city": "Agra",
    "country": "India",
    "countryCode": "IN",
    "category": "landmark",
    "name": "Taj Mahal",
    "slug": "taj-mahal",
    "description": "Ivory-white marble mausoleum on the Yamuna riverbank, a world heritage masterpiece.",
    "lat": 27.1751,
    "lng": 78.0421,
    "featuredOffsetDays": -5,
    "photos": [
      {
        "imageUrl": "/images/places/taj-mahal/photo-1.jpg",
        "blurhash": "LjHL_6-.ogt7%jxts.a#M|ofV@Rk",
        "width": 1600,
        "height": 1052,
        "sortOrder": 0
      },
      {
        "imageUrl": "/images/places/taj-mahal/photo-2.jpg",
        "blurhash": "LUE:MU-:ogt7%jxts:ayM|ofWARj",
        "width": 1600,
        "height": 1052,
        "sortOrder": 1
      },
      {
        "imageUrl": "/images/places/taj-mahal/photo-3.jpg",
        "blurhash": "LIG[s7-o~qx]%fkDIqWB^*bb?bWC",
        "width": 870,
        "height": 1200,
        "sortOrder": 2
      }
    ]
  },
  {
    "city": "Agra",
    "country": "India",
    "countryCode": "IN",
    "category": "landmark",
    "name": "Agra Fort",
    "slug": "agra-fort",
    "description": "Red sandstone fortified royal city of Mughal emperors with palatial courtyards.",
    "lat": 27.1795,
    "lng": 78.0211,
    "featuredOffsetDays": null,
    "photos": [
      {
        "imageUrl": "/images/places/agra-fort/photo-1.jpg",
        "blurhash": "LUE:MU-:ogt7%jxts:ayM|ofWARj",
        "width": 1600,
        "height": 1052,
        "sortOrder": 0
      },
      {
        "imageUrl": "/images/places/agra-fort/photo-2.jpg",
        "blurhash": "LSC61j^QxYIV}@={s9NGaKxaRjoK",
        "width": 1200,
        "height": 600,
        "sortOrder": 1
      },
      {
        "imageUrl": "/images/places/agra-fort/photo-3.jpg",
        "blurhash": "LVK]oz?]EMr?LNTLs8oy%#t8nNo2",
        "width": 1600,
        "height": 1066,
        "sortOrder": 2
      }
    ]
  },
  {
    "city": "Bengaluru",
    "country": "India",
    "countryCode": "IN",
    "category": "national_park",
    "name": "Lalbagh Botanical Garden",
    "slug": "lalbagh-botanical-garden",
    "description": "Centuries-old botanical gardens centered around a Victorian glasshouse.",
    "lat": 12.9507,
    "lng": 77.5848,
    "featuredOffsetDays": null,
    "photos": [
      {
        "imageUrl": "/images/places/lalbagh-botanical-garden/photo-1.jpg",
        "blurhash": "LhD,p7RNROs.pfRORiaeE7oIjXWA",
        "width": 640,
        "height": 567,
        "sortOrder": 0
      },
      {
        "imageUrl": "/images/places/lalbagh-botanical-garden/photo-2.jpg",
        "blurhash": "LVCsmsxu8_t5?wo#D$oI%hkDROs:",
        "width": 1600,
        "height": 1200,
        "sortOrder": 1
      },
      {
        "imageUrl": "/images/places/lalbagh-botanical-garden/photo-3.jpg",
        "blurhash": "LqJkTBxtbdW=yZt6ogWX?cs.R+WX",
        "width": 1600,
        "height": 1004,
        "sortOrder": 2
      }
    ]
  },
  {
    "city": "Bengaluru",
    "country": "India",
    "countryCode": "IN",
    "category": "museum",
    "name": "Visvesvaraya Museum",
    "slug": "visvesvaraya-museum",
    "description": "Interactive industrial science and engineering galleries on Kasturba Road.",
    "lat": 12.9754,
    "lng": 77.5966,
    "featuredOffsetDays": null,
    "photos": [
      {
        "imageUrl": "/images/places/visvesvaraya-museum/photo-1.jpg",
        "blurhash": "L=EpENkDaxofO_ogj?bIV|WXfijt",
        "width": 1600,
        "height": 873,
        "sortOrder": 0
      },
      {
        "imageUrl": "/images/places/visvesvaraya-museum/photo-2.jpg",
        "blurhash": "LdF$bFtQj[%3_4t7WUof?aoeoft6",
        "width": 1594,
        "height": 1200,
        "sortOrder": 1
      },
      {
        "imageUrl": "/images/places/visvesvaraya-museum/photo-3.jpg",
        "blurhash": "LUE:6}xtaw%N?dM_IUt8DiWYRPa$",
        "width": 1024,
        "height": 768,
        "sortOrder": 2
      }
    ]
  },
  {
    "city": "Bengaluru",
    "country": "India",
    "countryCode": "IN",
    "category": "cafe",
    "name": "Third Wave Coffee Koramangala",
    "slug": "third-wave-coffee-koramangala",
    "description": "Popular specialty cafe with custom pour-over brews in Koramangala.",
    "lat": 12.9344,
    "lng": 77.6186,
    "featuredOffsetDays": null,
    "photos": [
      {
        "imageUrl": "/images/places/third-wave-coffee-koramangala/photo-1.jpg",
        "blurhash": "LPK^]R~ou5xH4oIAf-of9t9Fnkt6",
        "width": 800,
        "height": 1200,
        "sortOrder": 0
      }
    ]
  },
  {
    "city": "Bengaluru",
    "country": "India",
    "countryCode": "IN",
    "category": "mall",
    "name": "Phoenix Marketcity Bengaluru",
    "slug": "phoenix-marketcity-bengaluru",
    "description": "Sprawling shopping, dining, and open-air event destination in Whitefield.",
    "lat": 12.9959,
    "lng": 77.6963,
    "featuredOffsetDays": null,
    "photos": [
      {
        "imageUrl": "/images/places/phoenix-marketcity-bengaluru/photo-1.jpg",
        "blurhash": "LqE{^RxtoJt8%%WYWAkCx_ofofay",
        "width": 1263,
        "height": 720,
        "sortOrder": 0
      },
      {
        "imageUrl": "/images/places/phoenix-marketcity-bengaluru/photo-2.jpg",
        "blurhash": "LoIEqiDioet7_4D%aebH%MRjRjWC",
        "width": 1600,
        "height": 1200,
        "sortOrder": 1
      },
      {
        "imageUrl": "/images/places/phoenix-marketcity-bengaluru/photo-3.jpg",
        "blurhash": "LaFhSb=~xZWB^n%5oJj@kZS%WAxG",
        "width": 1600,
        "height": 1169,
        "sortOrder": 2
      }
    ]
  },
  {
    "city": "Varanasi",
    "country": "India",
    "countryCode": "IN",
    "category": "landmark",
    "name": "Dashashwamedh Ghat",
    "slug": "dashashwamedh-ghat",
    "description": "Historic spiritual steps on the Ganges riverfront renowned for evening Aarti.",
    "lat": 25.3074,
    "lng": 83.0104,
    "featuredOffsetDays": null,
    "photos": [
      {
        "imageUrl": "/images/places/dashashwamedh-ghat/photo-1.jpg",
        "blurhash": "L$IhQ*o~ofof*0ozayWqTLn$aeoe",
        "width": 1600,
        "height": 1116,
        "sortOrder": 0
      },
      {
        "imageUrl": "/images/places/dashashwamedh-ghat/photo-2.jpg",
        "blurhash": "LkG98Ms:j?of_4Wqayj[x^WXaej[",
        "width": 1600,
        "height": 1196,
        "sortOrder": 1
      },
      {
        "imageUrl": "/images/places/dashashwamedh-ghat/photo-3.jpg",
        "blurhash": "LiOgvkxrSjXo}:WXoJxXo$WEn~xZ",
        "width": 400,
        "height": 447,
        "sortOrder": 2
      }
    ]
  },
  {
    "city": "Udaipur",
    "country": "India",
    "countryCode": "IN",
    "category": "museum",
    "name": "City Palace Udaipur",
    "slug": "city-palace-udaipur",
    "description": "Magnificent lakeside palace complex with mirrored courtyards on Lake Pichola.",
    "lat": 24.5764,
    "lng": 73.6835,
    "featuredOffsetDays": null,
    "photos": [
      {
        "imageUrl": "/images/places/city-palace-udaipur/photo-1.jpg",
        "blurhash": "LF97t@x]SNt8yZWVaeWX58MynhV@",
        "width": 1600,
        "height": 1067,
        "sortOrder": 0
      },
      {
        "imageUrl": "/images/places/city-palace-udaipur/photo-2.jpg",
        "blurhash": "LgF~puxaNfaz%%t6bcofI]fPocof",
        "width": 708,
        "height": 745,
        "sortOrder": 1
      },
      {
        "imageUrl": "/images/places/city-palace-udaipur/photo-3.jpg",
        "blurhash": "LeFPmvx]bcozt:Wqa}j[XUe-aday",
        "width": 776,
        "height": 1200,
        "sortOrder": 2
      }
    ]
  },
  {
    "city": "Goa",
    "country": "India",
    "countryCode": "IN",
    "category": "national_park",
    "name": "Dudhsagar Falls",
    "slug": "dudhsagar-falls",
    "description": "Tiered 310-meter mountain waterfall surrounded by tropical Western Ghats forest.",
    "lat": 15.3144,
    "lng": 74.3143,
    "featuredOffsetDays": null,
    "photos": [
      {
        "imageUrl": "/images/places/dudhsagar-falls/photo-1.jpg",
        "blurhash": "LmE:J4ayR%of_4WCWBof_3f6afj[",
        "width": 1169,
        "height": 1200,
        "sortOrder": 0
      },
      {
        "imageUrl": "/images/places/dudhsagar-falls/photo-2.jpg",
        "blurhash": "L9AmSP?H00D%~W%3RjD%-pRjkBxu",
        "width": 800,
        "height": 1200,
        "sortOrder": 1
      },
      {
        "imageUrl": "/images/places/dudhsagar-falls/photo-3.jpg",
        "blurhash": "L6Hn:0=y=N%e~CRjt7bYkqofVts;",
        "width": 889,
        "height": 1200,
        "sortOrder": 2
      }
    ]
  },
  {
    "city": "Kolkata",
    "country": "India",
    "countryCode": "IN",
    "category": "museum",
    "name": "Victoria Memorial Kolkata",
    "slug": "victoria-memorial-kolkata",
    "description": "White Makrana marble palace and expansive gardens honoring heritage art.",
    "lat": 22.5448,
    "lng": 88.3426,
    "featuredOffsetDays": null,
    "photos": [
      {
        "imageUrl": "/images/places/victoria-memorial-kolkata/photo-1.jpg",
        "blurhash": "L_Hf6ht7t7t7_Noft7oftRofofay",
        "width": 1600,
        "height": 914,
        "sortOrder": 0
      },
      {
        "imageUrl": "/images/places/victoria-memorial-kolkata/photo-2.jpg",
        "blurhash": "LuFF?Q%2t6j]_4xuj[a#xut7Rkay",
        "width": 1600,
        "height": 1200,
        "sortOrder": 1
      },
      {
        "imageUrl": "/images/places/victoria-memorial-kolkata/photo-3.jpg",
        "blurhash": "LQE|6wxt-.-;_NkXt7n$ROR:RlRP",
        "width": 564,
        "height": 873,
        "sortOrder": 2
      }
    ]
  },
  {
    "city": "Kolkata",
    "country": "India",
    "countryCode": "IN",
    "category": "cafe",
    "name": "Flurys Park Street",
    "slug": "flurys-park-street",
    "description": "Legendary heritage tearoom founded in 1927 serving classic European pastries.",
    "lat": 22.5532,
    "lng": 88.3524,
    "featuredOffsetDays": null,
    "photos": [
      {
        "imageUrl": "/images/places/flurys-park-street/photo-1.jpg",
        "blurhash": "LcHoE{_3-;%M~qxu%Mxu%fofs:oz",
        "width": 1600,
        "height": 1200,
        "sortOrder": 0
      }
    ]
  }
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
