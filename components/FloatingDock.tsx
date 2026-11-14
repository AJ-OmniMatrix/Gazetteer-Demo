"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { AnimatePresence, motion } from "motion/react"
import {
  Compass,
  Crosshair,
  Home,
  ListCheck,
  Loader2,
  MapPin,
  Plus,
  Search,
} from "lucide-react"
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
import type { PlaceSummary, User, VisitSource } from "@/lib/types"
import { cn } from "@/lib/utils"

function formatDistanceKm(distanceKm: number): string {
  if (distanceKm < 0.1) {
    return "< 0.1 km"
  }
  if (distanceKm < 100) {
    return `${distanceKm.toFixed(1)} km`
  }
  return `${Math.round(distanceKm).toLocaleString()} km`
}

function inferDefaultCoordinates(places: PlaceSummary[]): {
  lat: number
  lng: number
} {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone.toLowerCase()
    const match = places.find(
      (p) =>
        ((tz.includes("india") || tz.includes("kolkata")) &&
          p.countryCode === "IN") ||
        ((tz.includes("tokyo") || tz.includes("japan")) &&
          p.countryCode === "JP") ||
        ((tz.includes("paris") || tz.includes("france")) &&
          p.countryCode === "FR") ||
        ((tz.includes("zurich") || tz.includes("swiss")) &&
          p.countryCode === "CH")
    )
    if (match) return { lat: match.lat, lng: match.lng }
  } catch {}
  return places[0]
    ? { lat: places[0].lat, lng: places[0].lng }
    : { lat: 26.9124, lng: 75.7873 }
}

async function resolveCityName(
  lat: number,
  lng: number
): Promise<string | null> {
  try {
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
    )
    if (!res.ok) {
      return null
    }
    const data = await res.json()
    return data.city || data.locality || data.principalSubdivision || null
  } catch {
    return null
  }
}

interface FloatingDockProps {
  user?: User | null
  places: PlaceSummary[]
  visitedSet: Set<number>
  gpsOpen: boolean
  onGpsOpenChange: (open: boolean) => void
  searchOpen: boolean
  onSearchOpenChange: (open: boolean) => void
  onCheckIn: (place: PlaceSummary, source: VisitSource) => void
}

export function FloatingDock({
  user,
  places,
  visitedSet,
  gpsOpen,
  onGpsOpenChange,
  searchOpen,
  onSearchOpenChange,
  onCheckIn,
}: FloatingDockProps) {
  const pathname = usePathname()
  const [expanded, setExpanded] = useState(false)
  const [hasToggled, setHasToggled] = useState(false)
  const [hoveredNav, setHoveredNav] = useState<"list" | "explore" | null>(null)
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const dockRef = useRef<HTMLDivElement>(null)

  const isListPage = pathname === "/list" || pathname?.startsWith("/list/")
  const isExplorePage =
    pathname === "/explore" || pathname?.startsWith("/explore/")

  const isLeftHome = isListPage
  const leftHref = isLeftHome ? "/" : user ? "/list" : "/signin"
  const leftLabel = isLeftHome ? "Home" : "List"
  const leftAriaLabel = isLeftHome ? "Home" : "Personal catalogue"

  const isRightHome = isExplorePage
  const rightHref = isRightHome ? "/" : "/explore"
  const rightLabel = isRightHome ? "Home" : "Explore"
  const rightAriaLabel = isRightHome ? "Home" : "Explore places"

  const handleNavMouseEnter = (nav: "list" | "explore") => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current)
    }
    hoverTimerRef.current = setTimeout(() => {
      setHoveredNav(nav)
    }, 1200)
  }

  const handleNavMouseLeave = () => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current)
      hoverTimerRef.current = null
    }
    setHoveredNav(null)
  }

  const toggleExpanded = (next: boolean) => {
    handleNavMouseLeave()
    setHasToggled(true)
    setExpanded(next)
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setHoveredNav(null)
    }, 0)
    return () => {
      clearTimeout(timer)
      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current)
      }
    }
  }, [pathname])

  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    () => inferDefaultCoordinates(places)
  )
  const [scannedCity, setScannedCity] = useState<string | null>(() => {
    const defaultCoords = inferDefaultCoordinates(places)
    const match = places.find(
      (p) =>
        Math.abs(p.lat - defaultCoords.lat) < 0.01 &&
        Math.abs(p.lng - defaultCoords.lng) < 0.01
    )
    return match?.cityName ?? null
  })
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
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      setGeoError(
        "Geolocation is unavailable in this browser. Showing nearest catalogued spots."
      )
      setCoords((prev) => prev ?? inferDefaultCoordinates(places))
      return
    }
    setLocating(true)
    setGeoError(null)

    const onSuccess = async (pos: GeolocationPosition) => {
      const lat = pos.coords.latitude
      const lng = pos.coords.longitude
      setCoords({ lat, lng })
      setLocating(false)
      setGeoError(null)
      const city = await resolveCityName(lat, lng)
      if (city) {
        setScannedCity(city)
      } else {
        const nearest = kdTree.nearest({ lat, lng }, 1)
        if (nearest.length > 0) {
          setScannedCity(nearest[0].item.cityName)
        }
      }
    }

    const onFallback = () => {
      navigator.geolocation.getCurrentPosition(
        onSuccess,
        () => {
          setLocating(false)
          setCoords((prev) => {
            const next = prev ?? inferDefaultCoordinates(places)
            const nearest = kdTree.nearest(next, 1)
            if (nearest.length > 0) {
              setScannedCity(nearest[0].item.cityName)
            }
            return next
          })
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 60000 }
      )
    }

    navigator.geolocation.getCurrentPosition(onSuccess, onFallback, {
      enableHighAccuracy: false,
      timeout: 5000,
      maximumAge: 300000,
    })
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
    () => (coords ? kdTree.nearest(coords, 8) : []),
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
          aria-label="Primary actions"
          className="flex items-center gap-1 rounded-full border border-border/80 bg-background/95 p-1.5 shadow-lg backdrop-blur-md"
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {!expanded ? (
              <motion.div
                key="list"
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{
                  opacity: 0,
                  scale: 0.92,
                  transition: { duration: DURATION_EXIT, ease: EASE_IN },
                }}
                transition={{
                  duration: DURATION_ENTER,
                  ease: EASE_OUT,
                }}
                onMouseEnter={() => handleNavMouseEnter("list")}
                onMouseLeave={handleNavMouseLeave}
              >
                <Button
                  variant="ghost"
                  className="h-11 rounded-full px-3 transition-colors"
                  onFocus={() => handleNavMouseEnter("list")}
                  onBlur={handleNavMouseLeave}
                  aria-label={leftAriaLabel}
                  nativeButton={false}
                  render={<Link href={leftHref} prefetch={true} />}
                >
                  <div className="relative size-5 shrink-0">
                    <AnimatePresence initial={false}>
                      {isLeftHome ? (
                        <motion.div
                          key="home"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{
                            duration: DURATION_ENTER,
                            ease: EASE_OUT,
                          }}
                          className="absolute inset-0 flex items-center justify-center"
                        >
                          <Home className="size-5" />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="list"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{
                            duration: DURATION_ENTER,
                            ease: EASE_OUT,
                          }}
                          className="absolute inset-0 flex items-center justify-center"
                        >
                          <ListCheck className="size-5" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <AnimatePresence>
                    {hoveredNav === "list" && (
                      <motion.span
                        initial={{ opacity: 0, width: 0, marginLeft: 0 }}
                        animate={{ opacity: 1, width: "auto", marginLeft: 6 }}
                        exit={{
                          opacity: 0,
                          width: 0,
                          marginLeft: 0,
                          transition: {
                            duration: DURATION_EXIT,
                            ease: EASE_IN_OUT,
                          },
                        }}
                        transition={{
                          duration: DURATION_ENTER,
                          ease: EASE_OUT,
                        }}
                        className="overflow-hidden text-xs font-medium whitespace-nowrap"
                      >
                        {leftLabel}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="gps"
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{
                  opacity: 0,
                  scale: 0.92,
                  transition: { duration: DURATION_EXIT, ease: EASE_IN },
                }}
                transition={{ duration: DURATION_ENTER, ease: EASE_OUT }}
              >
                <Button
                  variant="secondary"
                  size="icon-lg"
                  className="size-11 rounded-full"
                  aria-label="Check in with GPS"
                  onClick={() => {
                    setExpanded(false)
                    onGpsOpenChange(true)
                    detectLocation()
                  }}
                >
                  <MapPin className="size-5" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            animate={hasToggled ? { scale: [1, 0.94, 1] } : undefined}
            transition={{ duration: DURATION_ENTER, ease: EASE_OUT }}
          >
            <Button
              variant={expanded ? "ghost" : "default"}
              size="icon-lg"
              className={cn("size-11 rounded-full", !expanded && "shadow-sm")}
              aria-label={
                expanded ? "Close add menu" : "Expand add location options"
              }
              aria-expanded={expanded}
              onClick={() => toggleExpanded(!expanded)}
            >
              <motion.div
                animate={{ rotate: expanded ? 45 : 0 }}
                transition={{ duration: DURATION_ENTER, ease: EASE_OUT }}
              >
                <Plus className="size-5" />
              </motion.div>
            </Button>
          </motion.div>

          <AnimatePresence mode="popLayout" initial={false}>
            {!expanded ? (
              <motion.div
                key="explore"
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{
                  opacity: 0,
                  scale: 0.92,
                  transition: { duration: DURATION_EXIT, ease: EASE_IN },
                }}
                transition={{
                  duration: DURATION_ENTER,
                  ease: EASE_OUT,
                }}
                onMouseEnter={() => handleNavMouseEnter("explore")}
                onMouseLeave={handleNavMouseLeave}
              >
                <Button
                  variant="ghost"
                  className="h-11 rounded-full px-3 transition-colors"
                  onFocus={() => handleNavMouseEnter("explore")}
                  onBlur={handleNavMouseLeave}
                  aria-label={rightAriaLabel}
                  nativeButton={false}
                  render={<Link href={rightHref} prefetch={true} />}
                >
                  <div className="relative size-5 shrink-0">
                    <AnimatePresence initial={false}>
                      {isRightHome ? (
                        <motion.div
                          key="home"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{
                            duration: DURATION_ENTER,
                            ease: EASE_OUT,
                          }}
                          className="absolute inset-0 flex items-center justify-center"
                        >
                          <Home className="size-5" />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="explore"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{
                            duration: DURATION_ENTER,
                            ease: EASE_OUT,
                          }}
                          className="absolute inset-0 flex items-center justify-center"
                        >
                          <Compass className="size-5" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <AnimatePresence>
                    {hoveredNav === "explore" && (
                      <motion.span
                        initial={{ opacity: 0, width: 0, marginLeft: 0 }}
                        animate={{ opacity: 1, width: "auto", marginLeft: 6 }}
                        exit={{
                          opacity: 0,
                          width: 0,
                          marginLeft: 0,
                          transition: {
                            duration: DURATION_EXIT,
                            ease: EASE_IN_OUT,
                          },
                        }}
                        transition={{
                          duration: DURATION_ENTER,
                          ease: EASE_OUT,
                        }}
                        className="overflow-hidden text-xs font-medium whitespace-nowrap"
                      >
                        {rightLabel}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="search"
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{
                  opacity: 0,
                  scale: 0.92,
                  transition: { duration: DURATION_EXIT, ease: EASE_IN },
                }}
                transition={{ duration: DURATION_ENTER, ease: EASE_OUT }}
              >
                <Button
                  variant="secondary"
                  size="icon-lg"
                  className="size-11 rounded-full"
                  aria-label="Search places"
                  onClick={() => {
                    setExpanded(false)
                    onSearchOpenChange(true)
                  }}
                >
                  <Search className="size-5" />
                </Button>
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
            <DrawerDescription className="sr-only">
              Find places near your current location
            </DrawerDescription>
          </DrawerHeader>
          <div className="space-y-4 px-4 pb-4">
            <div className="flex items-center justify-between gap-3 rounded-2xl border bg-muted/40 p-3">
              <div className="flex min-w-0 items-center gap-2.5">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  {locating ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <MapPin className="size-4" />
                  )}
                </div>
                <div className="flex min-w-0 flex-col">
                  <span className="truncate text-sm font-medium text-foreground">
                    {locating
                      ? "Scanning GPS..."
                      : scannedCity ||
                        nearestPlaces[0]?.item.cityName ||
                        "Current Location"}
                  </span>
                  {coords && (
                    <span className="font-mono text-xs text-muted-foreground tabular-nums">
                      {coords.lat.toFixed(4)}°, {coords.lng.toFixed(4)}°
                    </span>
                  )}
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="h-10 shrink-0 rounded-full px-3.5 text-xs"
                onClick={detectLocation}
                disabled={locating}
              >
                {locating ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Crosshair className="size-3.5" />
                )}
                <span>{locating ? "Scanning..." : "Rescan"}</span>
              </Button>
            </div>

            {geoError && (
              <p className="rounded-2xl border bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                {geoError}
              </p>
            )}

            <div className="max-h-72 space-y-2 overflow-y-auto overscroll-y-contain">
              {nearestPlaces.length === 0 && (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  {locating
                    ? "Detecting nearby locations..."
                    : "No catalogued locations nearby."}
                </p>
              )}
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
                          {formatDistanceKm(distanceKm)}
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
            <DrawerDescription className="sr-only">
              Find any spot by name, city, or category and mark it visited
            </DrawerDescription>
          </DrawerHeader>
          <div className="space-y-3 px-4 pb-4">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
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
