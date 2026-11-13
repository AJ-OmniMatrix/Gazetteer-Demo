export interface GeoPoint {
  lat: number
  lng: number
}

interface Vec3Point<T extends GeoPoint> {
  item: T
  coords: [number, number, number]
}

interface KDNode<T extends GeoPoint> {
  entry: Vec3Point<T>
  axis: 0 | 1 | 2
  left: KDNode<T> | null
  right: KDNode<T> | null
}

const EARTH_RADIUS_KM = 6371

function toUnitVec(p: GeoPoint): [number, number, number] {
  const lat = (p.lat * Math.PI) / 180
  const lng = (p.lng * Math.PI) / 180
  const cosLat = Math.cos(lat)
  return [cosLat * Math.cos(lng), cosLat * Math.sin(lng), Math.sin(lat)]
}

function sqDist(
  a: [number, number, number],
  b: [number, number, number]
): number {
  const dx = a[0] - b[0]
  const dy = a[1] - b[1]
  const dz = a[2] - b[2]
  return dx * dx + dy * dy + dz * dz
}

export function haversineKm(a: GeoPoint, b: GeoPoint): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h))
}

function buildTree<T extends GeoPoint>(
  entries: Vec3Point<T>[],
  depth: number
): KDNode<T> | null {
  if (entries.length === 0) {
    return null
  }
  const axis = (depth % 3) as 0 | 1 | 2
  const sorted = [...entries].sort((a, b) => a.coords[axis] - b.coords[axis])
  const mid = Math.floor(sorted.length / 2)
  return {
    entry: sorted[mid],
    axis,
    left: buildTree(sorted.slice(0, mid), depth + 1),
    right: buildTree(sorted.slice(mid + 1), depth + 1),
  }
}

export class GeoKDTree<T extends GeoPoint> {
  private root: KDNode<T> | null

  constructor(items: T[]) {
    this.root = buildTree(
      items.map((item) => ({ item, coords: toUnitVec(item) })),
      0
    )
  }

  nearest(target: GeoPoint, k = 5): Array<{ item: T; distanceKm: number }> {
    const targetVec = toUnitVec(target)
    const best: Array<{ item: T; sq: number }> = []

    const consider = (entry: Vec3Point<T>) => {
      const sq = sqDist(targetVec, entry.coords)
      best.push({ item: entry.item, sq })
      best.sort((a, b) => a.sq - b.sq)
      if (best.length > k) {
        best.pop()
      }
    }

    const visit = (node: KDNode<T> | null) => {
      if (!node) {
        return
      }
      consider(node.entry)
      const diff = targetVec[node.axis] - node.entry.coords[node.axis]
      const near = diff < 0 ? node.left : node.right
      const far = diff < 0 ? node.right : node.left
      visit(near)
      const worstSq = best.length < k ? Infinity : best[best.length - 1].sq
      if (diff * diff <= worstSq) {
        visit(far)
      }
    }

    visit(this.root)
    return best.map(({ item }) => ({
      item,
      distanceKm: haversineKm(target, item),
    }))
  }
}
