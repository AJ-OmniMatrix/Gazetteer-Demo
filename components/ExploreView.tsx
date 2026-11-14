"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Compass,
  ExternalLink,
  MapPin,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react"
import { motion } from "motion/react"
import { BlurHashImage } from "@/components/BlurHashImage"
import { VisitStatusButton } from "@/components/VisitStatusButton"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useCatalog } from "@/hooks/use-catalog"
import { PrefixTrie } from "@/lib/ads/trie"
import { DURATION_ENTER, EASE_OUT } from "@/lib/motion"

interface CityInfo {
  cityName: string
  countryName: string
  countryCode: string
  lat: number
  lng: number
  count: number
}

export function ExploreView() {
  const { catalog, visitedSet, checkIn, undoCheckIn } = useCatalog()

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCity, setSelectedCity] = useState<string>("all")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  const cities = useMemo(() => {
    const map = new Map<string, CityInfo>()
    for (const place of catalog.places) {
      const existing = map.get(place.cityName)
      if (existing) {
        existing.count += 1
      } else {
        map.set(place.cityName, {
          cityName: place.cityName,
          countryName: place.countryName,
          countryCode: place.countryCode,
          lat: place.lat,
          lng: place.lng,
          count: 1,
        })
      }
    }
    return Array.from(map.values()).sort((a, b) =>
      a.cityName.localeCompare(b.cityName)
    )
  }, [catalog.places])

  const categories = useMemo(() => {
    const map = new Map<string, { label: string; count: number }>()
    for (const place of catalog.places) {
      const existing = map.get(place.categorySlug)
      if (existing) {
        existing.count += 1
      } else {
        map.set(place.categorySlug, {
          label: place.categoryLabel,
          count: 1,
        })
      }
    }
    return Array.from(map.entries())
      .map(([slug, info]) => ({ slug, ...info }))
      .sort((a, b) => a.label.localeCompare(b.label))
  }, [catalog.places])

  const trie = useMemo(() => {
    return new PrefixTrie(
      catalog.places,
      (p) => `${p.name} ${p.cityName} ${p.countryName} ${p.categoryLabel}`
    )
  }, [catalog.places])

  const filteredPlaces = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    const prefixMatches = q ? new Set(trie.search(q, 100)) : null

    return catalog.places.filter((place) => {
      if (selectedCity !== "all" && place.cityName !== selectedCity) {
        return false
      }
      if (
        selectedCategory !== "all" &&
        place.categorySlug !== selectedCategory
      ) {
        return false
      }
      if (q) {
        if (prefixMatches?.has(place)) {
          return true
        }
        const target =
          `${place.name} ${place.cityName} ${place.countryName} ${place.categoryLabel} ${place.description}`.toLowerCase()
        return target.includes(q)
      }
      return true
    })
  }, [catalog.places, selectedCity, selectedCategory, searchQuery, trie])

  const activeFilterCount =
    (selectedCity !== "all" ? 1 : 0) + (selectedCategory !== "all" ? 1 : 0)

  const resetFilters = () => {
    setSelectedCity("all")
    setSelectedCategory("all")
  }

  const resetAll = () => {
    setSearchQuery("")
    resetFilters()
  }

  const selectedCategoryLabel =
    categories.find((c) => c.slug === selectedCategory)?.label ||
    selectedCategory

  if (catalog.places.length === 0) {
    return (
      <section className="mx-auto flex max-w-xl flex-col items-center justify-center gap-4 rounded-4xl border bg-card p-8 text-center shadow-xs">
        <Badge
          variant="secondary"
          className="px-3 py-1 font-mono text-xs tracking-wider uppercase"
        >
          City Explorer
        </Badge>
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          No Cities Catalogued Yet
        </h1>
        <p className="max-w-md text-sm text-muted-foreground">
          You haven&apos;t added any locations yet. Add your first city and
          places using the location tool or directly in the repo.
        </p>
        <Button
          variant="outline"
          className="min-h-11 rounded-full px-5"
          nativeButton={false}
          render={<Link href="/" prefetch={true} />}
        >
          <ArrowLeft />
          <span>Back to Home</span>
        </Button>
      </section>
    )
  }

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-3xl font-medium tracking-tight text-balance sm:text-4xl">
            Explore Cities
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-9 rounded-full px-3 text-xs"
            nativeButton={false}
            render={<Link href="/" prefetch={true} />}
          >
            <ArrowLeft className="size-4" />
            <span>Location of the Day</span>
          </Button>
        </div>
      </header>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search places, cities, categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-full rounded-2xl border bg-card pr-9 pl-10 shadow-2xs placeholder:text-muted-foreground/70"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          <Popover>
            <PopoverTrigger
              render={
                <Button
                  variant={activeFilterCount > 0 ? "secondary" : "outline"}
                  className="h-10 shrink-0 gap-2 rounded-2xl px-3.5 shadow-2xs"
                  aria-label="Open filter options"
                />
              }
            >
              <SlidersHorizontal className="size-4 text-muted-foreground" />
              <span className="hidden text-xs font-medium sm:inline">
                Filter
              </span>
              {activeFilterCount > 0 && (
                <Badge
                  variant="default"
                  className="flex size-5 items-center justify-center rounded-full p-0 font-mono text-[10px]"
                >
                  {activeFilterCount}
                </Badge>
              )}
            </PopoverTrigger>
            <PopoverContent
              align="end"
              sideOffset={8}
              className="w-80 space-y-4 rounded-3xl p-4 sm:w-96"
            >
              <div className="flex items-center justify-between border-b pb-2">
                <span className="font-heading text-sm font-medium">
                  Filters
                </span>
                {activeFilterCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                    onClick={resetFilters}
                  >
                    Reset all
                  </Button>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-muted-foreground uppercase">
                    City
                  </span>
                  {selectedCity !== "all" && (
                    <button
                      type="button"
                      onClick={() => setSelectedCity("all")}
                      className="text-[11px] text-muted-foreground hover:text-foreground"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="flex max-h-36 flex-wrap gap-1.5 overflow-y-auto pr-1">
                  <Button
                    variant={selectedCity === "all" ? "default" : "outline"}
                    size="sm"
                    className="h-7 rounded-full px-2.5 text-xs font-normal"
                    onClick={() => setSelectedCity("all")}
                  >
                    All Cities ({catalog.places.length})
                  </Button>
                  {cities.map((city) => (
                    <Button
                      key={city.cityName}
                      variant={
                        selectedCity === city.cityName ? "default" : "outline"
                      }
                      size="sm"
                      className="h-7 rounded-full px-2.5 text-xs font-normal"
                      onClick={() => setSelectedCity(city.cityName)}
                    >
                      {city.cityName} ({city.count})
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2 border-t pt-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-muted-foreground uppercase">
                    Category
                  </span>
                  {selectedCategory !== "all" && (
                    <button
                      type="button"
                      onClick={() => setSelectedCategory("all")}
                      className="text-[11px] text-muted-foreground hover:text-foreground"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="flex max-h-36 flex-wrap gap-1.5 overflow-y-auto pr-1">
                  <Button
                    variant={selectedCategory === "all" ? "default" : "outline"}
                    size="sm"
                    className="h-7 rounded-full px-2.5 text-xs font-normal"
                    onClick={() => setSelectedCategory("all")}
                  >
                    All Categories
                  </Button>
                  {categories.map((cat) => (
                    <Button
                      key={cat.slug}
                      variant={
                        selectedCategory === cat.slug ? "default" : "outline"
                      }
                      size="sm"
                      className="h-7 rounded-full px-2.5 text-xs font-normal"
                      onClick={() => setSelectedCategory(cat.slug)}
                    >
                      {cat.label} ({cat.count})
                    </Button>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {(selectedCity !== "all" ||
          selectedCategory !== "all" ||
          searchQuery) && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {selectedCity !== "all" && (
              <Badge
                variant="secondary"
                className="gap-1 rounded-full py-0.5 pr-1.5 pl-2.5 text-xs"
              >
                <span>City: {selectedCity}</span>
                <button
                  type="button"
                  onClick={() => setSelectedCity("all")}
                  className="hover:text-foreground"
                  aria-label="Remove city filter"
                >
                  <X className="size-3" />
                </button>
              </Badge>
            )}
            {selectedCategory !== "all" && (
              <Badge
                variant="secondary"
                className="gap-1 rounded-full py-0.5 pr-1.5 pl-2.5 text-xs"
              >
                <span>Category: {selectedCategoryLabel}</span>
                <button
                  type="button"
                  onClick={() => setSelectedCategory("all")}
                  className="hover:text-foreground"
                  aria-label="Remove category filter"
                >
                  <X className="size-3" />
                </button>
              </Badge>
            )}
            {searchQuery && (
              <Badge
                variant="secondary"
                className="gap-1 rounded-full py-0.5 pr-1.5 pl-2.5 text-xs"
              >
                <span>&ldquo;{searchQuery}&rdquo;</span>
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="hover:text-foreground"
                  aria-label="Remove search filter"
                >
                  <X className="size-3" />
                </button>
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-[11px] text-muted-foreground hover:text-foreground"
              onClick={resetAll}
            >
              Clear all
            </Button>
          </div>
        )}
      </div>

      {filteredPlaces.length === 0 ? (
        <div className="rounded-3xl border border-dashed bg-card/40 p-12 text-center">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Search className="size-5" />
          </div>
          <h2 className="font-heading text-xl font-medium tracking-tight">
            No Locations Found
          </h2>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            No locations match your current search or filter criteria.
          </p>
          <div className="mt-4 flex justify-center">
            <Button
              variant="outline"
              size="sm"
              className="rounded-full px-4"
              onClick={resetAll}
            >
              Clear search and filters
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPlaces.map((place, index) => {
            const visited = visitedSet.has(place.id)
            const photo = place.primaryPhoto

            return (
              <motion.article
                key={place.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: DURATION_ENTER, ease: EASE_OUT }}
                className="flex flex-col justify-between overflow-hidden rounded-3xl border bg-card p-3 shadow-xs"
              >
                <div className="space-y-3">
                  <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-muted">
                    {photo ? (
                      <BlurHashImage
                        src={photo.imageUrl}
                        alt={place.name}
                        blurhash={photo.blurhash}
                        width={photo.width}
                        height={photo.height}
                        fill
                        loading={index < 6 ? "eager" : "lazy"}
                        className="size-full object-cover"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center text-muted-foreground">
                        <Compass className="size-8 opacity-40" />
                      </div>
                    )}
                    <div className="absolute top-2.5 left-2.5">
                      <Badge
                        variant="secondary"
                        className="bg-background/80 text-[11px] backdrop-blur-sm"
                      >
                        {place.categoryLabel}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-1 px-1">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        {place.cityName}, {place.countryCode}
                      </span>
                      <span className="font-mono text-[11px] tabular-nums">
                        {place.lat.toFixed(3)}°, {place.lng.toFixed(3)}°
                      </span>
                    </div>
                    <h2 className="font-heading text-xl font-medium tracking-tight text-balance">
                      {place.name}
                    </h2>
                    <p className="line-clamp-2 text-xs text-muted-foreground">
                      {place.description}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between gap-2 border-t pt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 rounded-full px-3 text-xs"
                    nativeButton={false}
                    render={
                      <a
                        href={place.mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      />
                    }
                  >
                    <MapPin className="size-3.5" />
                    <span>Maps</span>
                    <ExternalLink className="size-3 opacity-60" />
                  </Button>

                  <VisitStatusButton
                    visited={visited}
                    activeLabel="Visited"
                    idleLabel="Add"
                    size="sm"
                    className="h-9 px-4 text-xs"
                    onClick={() => {
                      if (visited) {
                        undoCheckIn(place)
                      } else {
                        checkIn(place, "explore")
                      }
                    }}
                  />
                </div>
              </motion.article>
            )
          })}
        </div>
      )}
    </section>
  )
}
