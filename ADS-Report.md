# Gazetteer — ADS Implementation Report

## 1. Project overview

Gazetteer is a travel-catalogue application. Users can browse a curated collection of places, search for destinations, find catalogue entries near their current location, and maintain a personal list of visited places.

This report explains the data structures and algorithms implemented in the project, where they are used, and what they contribute to the application. The descriptions below refer to the current source code.

## 2. Data structures and algorithms at a glance

| Concept | Implementation | Where it is used |
|---|---|---|
| Prefix Trie | `lib/ads/trie.ts` | Fast prefix matching in the floating search dock and command palette |
| 3D KD-Tree | `lib/ads/kd-tree.ts` | Finding the nearest catalogue places to the user's GPS coordinates |
| Haversine formula | `lib/ads/kd-tree.ts` | Converting geographic coordinates into an approximate surface distance in kilometres |
| Segment Tree | `lib/ads/segment-tree.ts` | Aggregating visit counts for the travel-list statistics |
| Geohash encoding | `lib/geohash.ts` | Generating a compact spatial identifier for each place |

## 3. Prefix Trie — place search

**Source:** `lib/ads/trie.ts`

A Trie is a tree in which each edge represents a character. Words or phrases that share a prefix also share the corresponding path in the tree. This makes it useful for prefix-based search.

### How Gazetteer uses it

The floating search dock and command palette create a `PrefixTrie` from the available places. For each place, the indexed text combines its:

- Place name
- City name
- Country name
- Category label

The implementation converts the text to lowercase and inserts both the complete combined text and its individual word tokens. Each character leads to a child node, and nodes keep references to the matching place entries.

When a user types a search prefix:

1. The input is trimmed and converted to lowercase.
2. The Trie follows the child node for each character.
3. If a character path does not exist, there are no local matches.
4. Otherwise, the matching place entries are returned, up to the requested limit.

For example, a prefix such as `fush` can match **Fushimi Inari Taisha**, while `kyo` can match entries whose indexed city token is **Kyoto**.

The floating dock also requests server-side results and merges them with local Trie matches, avoiding duplicate place IDs. The database search in `db/queries.ts` first attempts MySQL full-text search on place names and then falls back to case-insensitive partial matching against place name, city, and category.

### Complexity

Let (m) be the number of characters in the search prefix.

- **Search traversal:** (O(m)), plus the cost of copying the limited result slice.
- **Storage:** Depends on the total number of indexed characters and the place references stored at Trie nodes.

The current implementation stores matching item references at each prefix node. This makes result retrieval direct, at the cost of additional memory.

## 4. KD-Tree — nearby places

**Source:** `lib/ads/kd-tree.ts`

A KD-Tree (k-dimensional tree) organizes points by recursively splitting a coordinate space. It helps narrow down which points need to be examined for a nearest-neighbour query.

### How Gazetteer uses it

When a user chooses the GPS option, the browser requests their location after permission is granted. The floating dock passes the returned latitude and longitude to:

```ts
kdTree.nearest(coords, 5)
```

The application builds a `GeoKDTree` from the catalogue's place coordinates and requests the five nearest entries.

Latitude and longitude are first converted into three-dimensional unit-sphere coordinates:

```text
x = cos(latitude) × cos(longitude)
y = cos(latitude) × sin(longitude)
z = sin(latitude)
```

The tree cycles through the three coordinate axes. At each node, it visits the side nearer to the target first. It visits the other side only when that side could still contain a point closer than the current worst candidate.

The algorithm keeps the best (k) candidates found so far. The returned candidates are then given distances in kilometres using the Haversine formula.

### Why use three-dimensional coordinates?

Latitude and longitude are angular values on a sphere. Treating them as ordinary flat x/y coordinates can produce misleading comparisons, particularly around the international date line. Mapping each location to a unit sphere gives the KD-Tree a three-dimensional representation of geographic positions.

### Complexity

- **Tree construction:** (O(n \log^2 n)) in this implementation, because each recursive level sorts its current entries.
- **Nearest-neighbour query:** Often examines fewer than all (n) points, but the worst case is (O(n)). Maintaining the candidate list also incurs sorting work for up to (k) entries at each visited node.
- **Tree storage:** (O(n)).

The tree is rebuilt when the catalogue's place list changes, using React's `useMemo` in the floating dock.

## 5. Haversine formula — geographic distance

**Source:** `lib/ads/kd-tree.ts`

The Haversine formula calculates the great-circle distance between two points on a sphere using their latitudes and longitudes.

Gazetteer uses it after the KD-Tree identifies the nearest candidates. This converts the final result into a readable distance in kilometres.

For two points with latitudes (phi_1,phi_2) and longitude difference (Deltalambda):

```text
a = sin²(Δφ / 2) + cos(φ₁) × cos(φ₂) × sin²(Δλ / 2)
distance = 2R × atan2(√a, √(1 − a))
```

Here, (R) is the Earth's mean radius, set to **6,371 km** in the code. The implementation converts degrees to radians before applying the formula.

The Haversine calculation is used for the displayed distance; the KD-Tree uses squared Euclidean distance between the unit-sphere vectors to compare candidates and prune branches.

## 6. Segment Tree — visit statistics

**Source:** `lib/ads/segment-tree.ts`

A Segment Tree stores information about intervals of an array. Each internal node represents a range and stores the sum of the values in that range. It supports range-sum queries and point updates efficiently.

### How Gazetteer uses it

In `components/ListView.tsx`, the application calculates travel statistics from the signed-in user's visit records.

1. It creates an array of 30 daily counters.
2. Each visit in the selected 30-day window increments the corresponding day's counter.
3. `SegmentTree.fromArray(dailyCounts)` builds a sum Segment Tree.
4. `segTree.query(0, 29)` returns the total count across the 30 entries.

The current statistics window is anchored to the timestamp of the most recent visit in the returned visit list. It is therefore not independently anchored to the computer's current date.

The Segment Tree class also provides an `update(index, delta)` method, which changes one array position and recalculates the sums along the path to the root. The current List View builds the tree and queries it; it does not currently call the update method.

### Complexity

For an array of (n) values:

- **Build:** (O(n))
- **Range-sum query:** (O(\log n))
- **Point update:** (O(\log n))
- **Storage:** (O(n))

## 7. Geohash — compact location encoding

**Source:** `lib/geohash.ts`

A geohash converts a latitude/longitude pair into a compact string. It repeatedly divides the longitude and latitude ranges into halves, alternating between the two coordinates. The resulting bits are grouped into five-bit values and represented using a Base32 character set.

Gazetteer generates a seven-character geohash for each seeded place. The location-addition tool also generates a geohash when a new place is added. The value is stored with the place record, and the database schema defines an index on the `geohash` column.

In the current application, geohashes are generated and stored, but the nearby-place feature uses the KD-Tree rather than querying the geohash index. The index is available for future spatial filtering work.

For a requested precision of (p) characters, encoding takes (O(p)) time and produces a string of length (p).

## 8. How the concepts work together

A typical nearby-place flow is:

1. The user opens the GPS action.
2. The browser obtains the user's coordinates after permission is granted.
3. The KD-Tree searches the catalogue for nearby entries.
4. The Haversine formula calculates distances in kilometres for the returned candidates.
5. Gazetteer displays the nearest catalogue places so the user can choose one to add to their list.

A typical text-search flow is:

1. The user types a place, city, country, or category prefix.
2. The Prefix Trie returns matching local catalogue entries.
3. A server-side search request supplies additional database matches.
4. Results are combined without duplicate place IDs and limited for display.

The Segment Tree is used separately on the personal list page to calculate the visit-count statistic for its 30-entry daily array. Geohash values are generated when catalogue entries are prepared, but are not part of the current GPS lookup path.

## 9. Testing

Run the tests with:

```bash
npm test
```

The current test suite in `lib/ads/ads.test.ts` checks:

- Trie prefix matching for full phrases and individual word tokens.
- KD-Tree nearest-neighbour results against a brute-force Haversine comparison, including points near the international date line.
- Deterministic geohash output at precision seven.
- Segment Tree construction, range sums, and point updates.

## 10. Source files

| File | Responsibility |
|---|---|
| `lib/ads/trie.ts` | Prefix Trie implementation |
| `lib/ads/kd-tree.ts` | Geographic KD-Tree and Haversine distance |
| `lib/ads/segment-tree.ts` | Range-sum Segment Tree |
| `lib/geohash.ts` | Geohash encoder |
| `components/FloatingDock.tsx` | Search and GPS-nearby integration |
| `components/CommandMenu.tsx` | Command-palette Trie search |
| `components/ListView.tsx` | Visit statistics and Segment Tree integration |
| `db/seed-data.ts` | Curated place catalogue and generated geohashes |
| `db/add-location.ts` | Location and image processing workflow |
| `db/schema.sql` | Database tables and geohash index |
| `lib/ads/ads.test.ts` | Automated tests for the implemented structures |

---

This report describes the current implementation. It distinguishes structures that are actively used by the interface from data, such as the stored geohash, that is prepared for possible future features.
