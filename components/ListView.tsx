"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import {
  ArrowLeft,
  Clock,
  Compass,
  ExternalLink,
  ListCheck,
  MapPin,
  Search,
  SlidersHorizontal,
  Trash2,
  X,
} from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import { BlurHashImage } from "@/components/BlurHashImage"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Skeleton } from "@/components/ui/skeleton"
import { getUserVisitsAction } from "@/app/actions"
import { useCatalog } from "@/hooks/use-catalog"
import { PrefixTrie } from "@/lib/ads/trie"
import { SegmentTree } from "@/lib/ads/segment-tree"
import {
  DURATION_ENTER,
  DURATION_EXIT,
  EASE_IN,
  EASE_IN_OUT,
  EASE_OUT,
} from "@/lib/motion"
import type { UserVisitItem } from "@/lib/types"

export function ListView({
  initialVisits = [],
}: {
  initialVisits?: UserVisitItem[]
}) {
  const { catalog, undoCheckIn } = useCatalog()
  const user = catalog.user

  const { data: visits = initialVisits, isLoading } = useQuery({
    queryKey: ["user-visits", user?.id],
    queryFn: () => getUserVisitsAction(),
    enabled: Boolean(user?.id),
    initialData: initialVisits.length > 0 ? initialVisits : undefined,
    staleTime: 30_000,
  })

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCity, setSelectedCity] = useState<string>("all")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  const stats = useMemo(() => {
    if (!visits || visits.length === 0) {
      return {
        total: 0,
        cities: 0,
        countries: 0,
        last30Days: 0,
      }
    }
    const citySet = new Set<string>()
    const countrySet = new Set<string>()
    const latestTime = visits[0] ? new Date(visits[0].visitedAt).getTime() : 0
    const windowStart = latestTime - 30 * 86400 * 1000
    const dailyCounts = new Array(30).fill(0)

    for (const v of visits) {
      citySet.add(v.place.cityName)
      countrySet.add(v.place.countryCode)
      const t = new Date(v.visitedAt).getTime()
      if (t >= windowStart && t <= latestTime) {
        const dayIdx = Math.min(
          29,
          Math.max(0, Math.floor((latestTime - t) / (86400 * 1000)))
        )
        dailyCounts[dayIdx] += 1
      }
    }

    const segTree = SegmentTree.fromArray(dailyCounts)
    const last30Days = segTree.query(0, 29)

    return {
      total: visits.length,
      cities: citySet.size,
      countries: countrySet.size,
      last30Days,
    }
  }, [visits])

  const availableCities = useMemo(() => {
    const map = new Map<string, number>()
    for (const v of visits) {
      map.set(v.place.cityName, (map.get(v.place.cityName) ?? 0) + 1)
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]))
  }, [visits])

  const availableCategories = useMemo(() => {
    const map = new Map<string, { label: string; count: number }>()
    for (const v of visits) {
      const slug = v.place.categorySlug
      const existing = map.get(slug)
      if (existing) {
        existing.count += 1
      } else {
        map.set(slug, { label: v.place.categoryLabel, count: 1 })
      }
    }
    return Array.from(map.entries())
  }, [visits])

  const trie = useMemo(() => {
    return new PrefixTrie(
      visits,
      (v) =>
        `${v.place.name} ${v.place.cityName} ${v.place.countryName} ${v.place.categoryLabel}`
    )
  }, [visits])

  const filteredVisits = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    const prefixMatches = q ? new Set(trie.search(q, 100)) : null

    return visits.filter((v) => {
      if (selectedCity !== "all" && v.place.cityName !== selectedCity) {
        return false
      }
      if (
        selectedCategory !== "all" &&
        v.place.categorySlug !== selectedCategory
      ) {
        return false
      }
      if (q) {
        if (prefixMatches?.has(v)) {
          return true
        }
        const target =
          `${v.place.name} ${v.place.cityName} ${v.place.countryName} ${v.place.categoryLabel} ${v.place.description}`.toLowerCase()
        return target.includes(q)
      }
      return true
    })
  }, [visits, selectedCity, selectedCategory, searchQuery, trie])

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
    availableCategories.find(([slug]) => slug === selectedCategory)?.[1]
      ?.label || selectedCategory

  if (!user) {
    redirect("/signin")
  }

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-3xl font-medium tracking-tight text-balance sm:text-4xl">
            Personal Catalogue
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
            <span>Home</span>
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="flex flex-col gap-1 rounded-3xl border bg-card p-4 shadow-2xs">
          <span className="font-mono text-xs text-muted-foreground uppercase">
            Places Visited
          </span>
          <span className="font-mono text-2xl font-semibold text-foreground tabular-nums sm:text-3xl">
            {stats.total}
          </span>
        </div>

        <div className="flex flex-col gap-1 rounded-3xl border bg-card p-4 shadow-2xs">
          <span className="font-mono text-xs text-muted-foreground uppercase">
            Cities Explored
          </span>
          <span className="font-mono text-2xl font-semibold text-foreground tabular-nums sm:text-3xl">
            {stats.cities}
          </span>
        </div>

        <div className="flex flex-col gap-1 rounded-3xl border bg-card p-4 shadow-2xs">
          <span className="font-mono text-xs text-muted-foreground uppercase">
            Countries Stamped
          </span>
          <span className="font-mono text-2xl font-semibold text-foreground tabular-nums sm:text-3xl">
            {stats.countries}
          </span>
        </div>

        <div className="flex flex-col gap-1 rounded-3xl border bg-card p-4 shadow-2xs">
          <span className="font-mono text-xs text-muted-foreground uppercase">
            Last 30 Days
          </span>
          <span className="font-mono text-2xl font-semibold text-primary tabular-nums sm:text-3xl">
            {stats.last30Days}
          </span>
        </div>
      </div>

      {visits.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search visited places, cities, categories..."
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
                      All ({visits.length})
                    </Button>
                    {availableCities.map(([cityName, count]) => (
                      <Button
                        key={cityName}
                        variant={
                          selectedCity === cityName ? "default" : "outline"
                        }
                        size="sm"
                        className="h-7 rounded-full px-2.5 text-xs font-normal"
                        onClick={() => setSelectedCity(cityName)}
                      >
                        {cityName} ({count})
                      </Button>
                    ))}
                  </div>
                </div>

                {availableCategories.length > 0 && (
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
                        variant={
                          selectedCategory === "all" ? "default" : "outline"
                        }
                        size="sm"
                        className="h-7 rounded-full px-2.5 text-xs font-normal"
                        onClick={() => setSelectedCategory("all")}
                      >
                        All Categories
                      </Button>
                      {availableCategories.map(([slug, cat]) => (
                        <Button
                          key={slug}
                          variant={
                            selectedCategory === slug ? "default" : "outline"
                          }
                          size="sm"
                          className="h-7 rounded-full px-2.5 text-xs font-normal"
                          onClick={() => setSelectedCategory(slug)}
                        >
                          {cat.label} ({cat.count})
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
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
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col gap-3 rounded-4xl border bg-card p-4"
            >
              <Skeleton className="aspect-16/10 w-full rounded-2xl" />
              <Skeleton className="h-5 w-3/4 rounded-md" />
              <Skeleton className="h-4 w-1/2 rounded-md" />
            </div>
          ))}
        </div>
      ) : visits.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-4xl border border-dashed bg-card/40 py-16 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <ListCheck className="size-6" />
          </div>
          <h2 className="font-heading text-2xl font-medium tracking-tight">
            No Visits Logged Yet
          </h2>
          <p className="max-w-sm text-xs text-muted-foreground sm:text-sm">
            You haven&apos;t added any places to your catalogue. Tap + on
            Location of the Day or browse places in the City Explorer.
          </p>
          <div className="flex gap-2 pt-2">
            <Button
              size="sm"
              className="rounded-full px-4"
              nativeButton={false}
              render={<Link href="/explore" />}
            >
              <Compass />
              <span>Explore Places</span>
            </Button>
          </div>
        </div>
      ) : filteredVisits.length === 0 ? (
        <div className="rounded-3xl border border-dashed bg-card/40 py-12 text-center">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Search className="size-5" />
          </div>
          <h2 className="font-heading text-xl font-medium tracking-tight">
            No Visited Places Found
          </h2>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            No logged visits match your current search or filter criteria.
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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <AnimatePresence mode="popLayout">
            {filteredVisits.map((item, idx) => {
              const place = item.place
              const photo = place.primaryPhoto ?? place.photos?.[0]
              const visitDate = new Date(item.visitedAt).toLocaleDateString(
                undefined,
                {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                }
              )

              return (
                <motion.article
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{
                    opacity: 0,
                    scale: 0.95,
                    transition: { duration: DURATION_EXIT, ease: EASE_IN },
                  }}
                  transition={{
                    duration: DURATION_ENTER,
                    ease: EASE_OUT,
                    layout: { duration: DURATION_ENTER, ease: EASE_IN_OUT },
                    delay: Math.min(idx * 0.04, 0.24),
                  }}
                  className="group flex flex-col justify-between rounded-4xl border bg-card p-4 shadow-2xs transition-shadow hover:shadow-xs"
                >
                  <div className="space-y-3">
                    <div className="relative aspect-16/10 w-full overflow-hidden rounded-2xl bg-muted">
                      {photo ? (
                        <BlurHashImage
                          src={photo.imageUrl}
                          blurhash={photo.blurhash}
                          width={photo.width}
                          height={photo.height}
                          alt={place.name}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                          <Compass className="size-8 opacity-40" />
                        </div>
                      )}

                      <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                        <Badge
                          variant="secondary"
                          className="bg-background/90 text-xs backdrop-blur-md"
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
                        <span className="flex items-center gap-1 font-mono text-[11px] tabular-nums">
                          <Clock className="size-3" />
                          {visitDate}
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

                  <div className="mt-4 flex items-center justify-between gap-2 border-t border-border/80 pt-3">
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

                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-9 rounded-full px-3 text-xs text-muted-foreground hover:text-destructive"
                      onClick={() => undoCheckIn(place)}
                    >
                      <Trash2 className="size-3.5" />
                      <span>Remove</span>
                    </Button>
                  </div>
                </motion.article>
              )
            })}
          </AnimatePresence>
        </div>
      )}
    </section>
  )
}
