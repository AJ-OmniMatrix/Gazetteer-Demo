const BASE32 = "0123456789bcdefghjkmnpqrstuvwxyz"

export function encodeGeohash(lat: number, lng: number, precision = 7): string {
  let latMin = -90
  let latMax = 90
  let lngMin = -180
  let lngMax = 180
  let isLng = true
  let bit = 0
  let ch = 0
  let hash = ""

  while (hash.length < precision) {
    if (isLng) {
      const mid = (lngMin + lngMax) / 2
      if (lng >= mid) {
        ch |= 1 << (4 - bit)
        lngMin = mid
      } else {
        lngMax = mid
      }
    } else {
      const mid = (latMin + latMax) / 2
      if (lat >= mid) {
        ch |= 1 << (4 - bit)
        latMin = mid
      } else {
        latMax = mid
      }
    }
    isLng = !isLng
    if (bit < 4) {
      bit++
    } else {
      hash += BASE32[ch]
      bit = 0
      ch = 0
    }
  }

  return hash
}
