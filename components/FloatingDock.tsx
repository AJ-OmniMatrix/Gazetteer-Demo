"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { AnimatePresence, motion } from "motion/react"
import {
  RiAddLine,
  RiCloseLine,
  RiCompass3Line,
  RiCrosshair2Line,
  RiListCheck2,
  RiLoader4Line,
  RiMapPin2Line,
  RiSearchLine,
} from "@remixicon/react"
import { searchPlacesAction } from "@/app/actions"
import { VisitStatusButton } from "@/components/VisitStatusButton"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Input } from "@/components/ui/input"
import { GeoKDTree } from "@/lib/ads/kd-tree"
import { PrefixTrie } from "@/lib/ads/trie"
import {
  DURATION_ENTER,
  DURATION_EXIT,
  EASE_IN,
  EASE_IN_OUT,
  EASE_OUT,
  MAX_ROW_STAGGER,
  ROW_STAGGER,
} from "@/lib/motion"
import type { PlaceSummary, VisitSource } from "@/lib/types"

interface FloatingDockProps {
  places: PlaceSummary[]
  visitedSet: Set<number>
  gpsOpen: boolean
  onGpsOpenChange: (open: boolean) => void
  searchOpen: boolean
  onSearchOpenChange: (open: boolean) => void
  onCheckIn: (place: PlaceSummary, source: VisitSource) => void
}

const DEMO_COORDS = [
  { label: "Kyoto", lat: 35.0116, lng: 135.7681 },
  { label: "Jaipur", lat: 26.9124, lng: 75.7873 },
  { label: "Paris", lat: 48.8566, lng: 2.3522 },
]

export function FloatingDock({
  places,
  visitedSet,
  gpsOpen,
  onGpsOpenChange,
  searchOpen,
  onSearchOpenChange,
  onCheckIn,
}: FloatingDockProps) {
  const [expanded, setExpanded] = useState(false)
  const [hasToggled, setHasToggled] = useState(false)
  const dockRef = useRef<HTMLDivElement>(null)

  const toggleExpanded = (next: boolean) => {
    setHasToggled(true)
    setExpanded(next)
  }

  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null
  )
  const [locating, setLocating] = useState(false)
  const [geoError, setGeoError] = useState<string | null>(null)

  const [searchTerm, setSearchTerm] = useState("")
  const [serverHits, setServerHits] = useState<PlaceSummary[]>([])
  const [searching, setSearching] = useState(false)

  const kdTree = useMemo(() => new GeoKDTree(places), [places])
  const trie = useMemo(
    () =>
      new PrefixTrie(
        places,
        (p) => `${p.name} ${p.cityName} ${p.countryName} ${p.categoryLabel}`
      ),
    [places]
  )

  useEffect(() => {
    if (!expanded) {
      return
    }
    const onPointerDown = (event: PointerEvent) => {
      if (dockRef.current && !dockRef.current.contains(event.target as Node)) {
        setExpanded(false)
      }
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setExpanded(false)
      }
    }
    window.addEventListener("pointerdown", onPointerDown)
    window.addEventListener("keydown", onKeyDown)
    return () => {
      window.removeEventListener("pointerdown", onPointerDown)
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [expanded])

  const detectLocation = () => {
    if (!("geolocation" in navigator)) {
      setGeoError(
        "Geolocation is unavailable in this browser. Pick a demo city below."
      )
      return
    }
    setLocating(true)
    setGeoError(null)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setLocating(false)
      },
      () => {
        setGeoError(
          "Location permission denied or unavailable. Try a sample city below."
        )
        setLocating(false)
      },
      { enableHighAccuracy: true, timeout: 8000 }
    )
  }

  useEffect(() => {
    const clean = searchTerm.trim()
    if (!clean) {
      return
    }
    const timer = window.setTimeout(async () => {
      setSearching(true)
      try {
        const res = await searchPlacesAction(clean)
        setServerHits(res)
      } finally {
        setSearching(false)
      }
    }, 180)
    return () => window.clearTimeout(timer)
  }, [searchTerm])

  const nearestPlaces = useMemo(
    () => (coords ? kdTree.nearest(coords, 5) : []),
    [coords, kdTree]
  )

  const searchResults = useMemo(() => {
    const clean = searchTerm.trim()
    if (!clean) {
      return places.slice(0, 8)
    }
    const localHits = trie.search(clean, 8)
    const seen = new Set(localHits.map((p) => p.id))
    const merged = [...localHits]
    for (const hit of serverHits) {
      if (!seen.has(hit.id)) {
        seen.add(hit.id)
        merged.push(hit)
      }
    }
    return merged.slice(0, 8)
  }, [searchTerm, places, trie, serverHits])

  return (
    <>
      <div
        ref={dockRef}
        style={{ viewTransitionName: "floating-dock" }}
        className="fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] left-1/2 z-40 -translate-x-1/2"
      >
        <motion.nav
          layout
          aria-label="Primary actions"
          transition={{
            layout: { duration: DURATION_ENTER, ease: EASE_IN_OUT },
          }}
          className="flex items-center gap-1 rounded-full border border-border/80 bg-background/95 p-1.5 shadow-lg backdrop-blur-md"
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {!expanded ? (
              <motion.div
                key="collapsed"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{
                  opacity: 0,
                  scale: 0.95,
                  transition: { duration: DURATION_EXIT, ease: EASE_IN },
                }}
                transition={{ duration: DURATION_ENTER, ease: EASE_OUT }}
                className="flex items-center gap-1"
              >
                <Button
                  variant="ghost"
                  className="h-11 rounded-full px-4 text-sm font-medium"
                  nativeButton={false}
                  render={<Link href="/list" />}
                >
                  <RiListCheck2 />
                  <span>List</span>
                </Button>

                <motion.div
                  animate={hasToggled ? { scaleX: [1, 1.12, 1] } : undefined}
                  transition={{ duration: DURATION_ENTER, ease: EASE_OUT }}
                >
                  <Button
                    size="icon-lg"
                    className="size-11 rounded-full shadow-sm"
                    aria-label="Expand add location options"
                    aria-expanded={expanded}
                    onClick={() => toggleExpanded(true)}
                  >
                    <RiAddLine className="size-5" />
                  </Button>
                </motion.div>

                <Button
                  variant="ghost"
                  className="h-11 rounded-full px-4 text-sm font-medium"
                  nativeButton={false}
                  render={<Link href="/explore" />}
                >
                  <RiCompass3Line />
                  <span>Explore</span>
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="expanded"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{
                  opacity: 0,
                  scale: 0.95,
                  transition: { duration: DURATION_EXIT, ease: EASE_IN },
                }}
                transition={{ duration: DURATION_ENTER, ease: EASE_OUT }}
                className="flex items-center gap-1"
              >
                <Button
                  variant="secondary"
                  className="h-11 rounded-full px-4 text-sm font-medium"
                  onClick={() => {
                    setExpanded(false)
                    onGpsOpenChange(true)
                    if (!coords && !locating) {
                      detectLocation()
                    }
                  }}
                >
                  <RiMapPin2Line />
                  <span>GPS</span>
                </Button>

                <Button
                  variant="secondary"
                  className="h-11 rounded-full px-4 text-sm font-medium"
                  onClick={() => {
                    setExpanded(false)
                    onSearchOpenChange(true)
                  }}
                >
                  <RiSearchLine />
                  <span>Search</span>
                </Button>

                <motion.div
                  animate={hasToggled ? { scaleX: [1, 1.12, 1] } : undefined}
                  transition={{ duration: DURATION_ENTER, ease: EASE_OUT }}
                >
                  <Button
                    variant="ghost"
                    size="icon-lg"
                    className="size-11 rounded-full"
                    aria-label="Close add menu"
                    onClick={() => toggleExpanded(false)}
                  >
                    <RiCloseLine className="size-5" />
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.nav>
      </div>

      <Drawer
        open={gpsOpen}
        onOpenChange={onGpsOpenChange}
        showSwipeHandle
        swipeDirection="down"
      >
        <DrawerContent className="mx-auto max-w-lg pb-[max(1rem,env(safe-area-inset-bottom))]">
          <DrawerHeader>
            <DrawerTitle className="font-heading text-2xl">
              Check In Nearby
            </DrawerTitle>
            <DrawerDescription>
              Uses your GPS coordinates to surface the closest catalogued spots.
            </DrawerDescription>
          </DrawerHeader>
          <div className="space-y-4 px-4 pb-4">
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-9 rounded-full"
                onClick={detectLocation}
                disabled={locating}
              >
                {locating ? (
                  <RiLoader4Line className="animate-spin" />
                ) : (
                  <RiCrosshair2Line />
                )}
                <span>{locating ? "Locating..." : "Use My GPS"}</span>
              </Button>
              {DEMO_COORDS.map((preset) => (
                <Button
                  key={preset.label}
                  variant="ghost"
                  size="sm"
                  className="h-9 rounded-full text-xs"
                  onClick={() => {
                    setGeoError(null)
                    setCoords({ lat: preset.lat, lng: preset.lng })
                  }}
                >
                  Try {preset.label}
                </Button>
              ))}
            </div>

            {coords && (
              <p className="font-mono text-xs text-muted-foreground tabular-nums">
                {coords.lat.toFixed(4)}°, {coords.lng.toFixed(4)}°
              </p>
            )}

            {geoError && (
              <p className="rounded-2xl border bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                {geoError}
              </p>
            )}

            <div className="max-h-72 space-y-2 overflow-y-auto overscroll-y-contain">
              <AnimatePresence initial={false}>
                {nearestPlaces.map(({ item, distanceKm }, index) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{
                      opacity: 0,
                      y: -4,
                      transition: { duration: DURATION_EXIT, ease: EASE_IN },
                    }}
                    transition={{
                      duration: DURATION_ENTER,
                      ease: EASE_OUT,
                      delay: Math.min(index * ROW_STAGGER, MAX_ROW_STAGGER),
                    }}
                    className="flex items-center justify-between gap-3 rounded-2xl border bg-card p-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium">{item.name}</p>
                      <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                        <span>
                          {item.cityName}, {item.countryCode}
                        </span>
                        <span className="font-mono tabular-nums">
                          {distanceKm < 1
                            ? `${Math.round(distanceKm * 1000)} m`
                            : `${distanceKm.toFixed(1)} km`}
                        </span>
                      </div>
                    </div>
                    <VisitStatusButton
                      visited={visitedSet.has(item.id)}
                      activeLabel="Visited"
                      idleLabel="Add"
                      size="sm"
                      disabled={visitedSet.has(item.id)}
                      className="min-h-10 shrink-0 px-4"
                      onClick={() => onCheckIn(item, "gps")}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      <Drawer
        open={searchOpen}
        onOpenChange={onSearchOpenChange}
        showSwipeHandle
        swipeDirection="down"
      >
        <DrawerContent className="mx-auto max-w-lg pb-[max(1rem,env(safe-area-inset-bottom))]">
          <DrawerHeader>
            <DrawerTitle className="font-heading text-2xl">
              Search Location
            </DrawerTitle>
            <DrawerDescription>
              Find any spot by name, city, or category and mark it visited.
            </DrawerDescription>
          </DrawerHeader>
          <div className="space-y-3 px-4 pb-4">
            <div className="relative">
              <RiSearchLine className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={(e) => {
                  const next = e.target.value
                  setSearchTerm(next)
                  if (!next.trim()) {
                    setServerHits([])
                  }
                }}
                placeholder="Search museums, parks, cafes..."
                className="h-11 rounded-full pl-10"
                autoFocus
              />
            </div>

            <div className="max-h-72 space-y-2 overflow-y-auto overscroll-y-contain">
              {searchResults.length === 0 && (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  {searching ? "Searching..." : "No matching places found."}
                </p>
              )}
              <AnimatePresence initial={false}>
                {searchResults.map((place, index) => (
                  <motion.div
                    key={place.id}
                    layout
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{
                      opacity: 0,
                      y: -4,
                      transition: { duration: DURATION_EXIT, ease: EASE_IN },
                    }}
                    transition={{
                      duration: DURATION_ENTER,
                      ease: EASE_OUT,
                      delay: Math.min(index * ROW_STAGGER, MAX_ROW_STAGGER),
                    }}
                    className="flex items-center justify-between gap-3 rounded-2xl border bg-card p-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium">{place.name}</p>
                      <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                        <span>
                          {place.cityName}, {place.countryCode}
                        </span>
                        <Badge variant="secondary" className="text-[11px]">
                          {place.categoryLabel}
                        </Badge>
                      </div>
                    </div>
                    <VisitStatusButton
                      visited={visitedSet.has(place.id)}
                      activeLabel="Visited"
                      idleLabel="Add"
                      size="sm"
                      disabled={visitedSet.has(place.id)}
                      className="min-h-10 shrink-0 px-4"
                      onClick={() => onCheckIn(place, "search")}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  )
}
