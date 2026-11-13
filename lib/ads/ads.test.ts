import test from "node:test"
import assert from "node:assert/strict"
import { PrefixTrie } from "./trie"
import { GeoKDTree, haversineKm } from "./kd-tree"
import { SegmentTree } from "./segment-tree"
import { encodeGeohash } from "../geohash"

test("PrefixTrie matches full phrases and word tokens", () => {
  const places = [
    { id: 1, label: "Fushimi Inari Taisha Kyoto" },
    { id: 2, label: "Kiyomizu-dera Temple Kyoto" },
    { id: 3, label: "Blue Bottle Cafe Tokyo" },
  ]
  const trie = new PrefixTrie(places, (p) => p.label)

  assert.deepEqual(
    trie.search("kyo").map((p) => p.id),
    [1, 2]
  )
  assert.deepEqual(
    trie.search("fush").map((p) => p.id),
    [1]
  )
  assert.deepEqual(trie.search("paris"), [])
  assert.deepEqual(trie.search(""), [])
})

test("GeoKDTree nearest matches brute force Haversine", () => {
  const points = [
    { id: 1, lat: 34.9671, lng: 135.7727 },
    { id: 2, lat: 35.6762, lng: 139.6503 },
    { id: 3, lat: 26.9124, lng: 75.7873 },
    { id: 4, lat: 48.8566, lng: 2.3522 },
    { id: 5, lat: 46.0207, lng: 7.7491 },
    { id: 6, lat: 19.076, lng: 72.8777 },
    { id: 7, lat: 35.0394, lng: 135.7292 },
    { id: 8, lat: 64.1466, lng: -179.5 },
    { id: 9, lat: 64.2, lng: 179.4 },
  ]
  const tree = new GeoKDTree(points)
  for (const target of [
    { lat: 35.01, lng: 135.76 },
    { lat: 64.15, lng: 179.9 },
  ]) {
    const got = tree.nearest(target, 3).map((r) => r.item.id)
    const expected = [...points]
      .sort((a, b) => haversineKm(target, a) - haversineKm(target, b))
      .slice(0, 3)
      .map((p) => p.id)

    assert.deepEqual(got, expected)
  }
})

test("encodeGeohash returns deterministic precision-7 prefix", () => {
  const fushimi = encodeGeohash(34.96714, 135.772672, 7)
  const kyotoStation = encodeGeohash(34.9858, 135.7588, 7)
  assert.equal(fushimi, "xn0wctd")
  assert.equal(kyotoStation.slice(0, 3), fushimi.slice(0, 3))
})

test("SegmentTree builds, queries ranges, and updates values", () => {
  const data = [1, 3, 5, 7, 9, 11]
  const tree = SegmentTree.fromArray(data)

  assert.equal(tree.query(0, 2), 9)
  assert.equal(tree.query(1, 4), 24)
  assert.equal(tree.query(0, 5), 36)

  tree.update(2, 3)
  assert.equal(tree.query(0, 2), 12)
  assert.equal(tree.query(0, 5), 39)
})
