"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import {
  RiArrowLeftLine,
  RiCompass3Line,
  RiDeleteBinLine,
  RiExternalLinkLine,
  RiFlashlightLine,
  RiListCheck2,
  RiLockLine,
  RiMapPin2Line,
  RiTimeLine,
} from "@remixicon/react"
import { motion } from "motion/react"
import { BlurHashImage } from "@/components/BlurHashImage"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { getUserVisitsAction } from "@/app/actions"
import { useCatalog } from "@/hooks/use-catalog"
import { SegmentTree } from "@/lib/ads/segment-tree"
import { DURATION_ENTER, EASE_OUT } from "@/lib/motion"
import type { UserVisitItem } from "@/lib/types"

export function ListView({
  initialVisits = [],
}: {
  initialVisits?: UserVisitItem[]
}) {
  const { catalog, undoCheckIn, openAuth } = useCatalog()
  const user = catalog.user

  const { data: visits = initialVisits, isLoading } = useQuery({
    queryKey: ["user-visits", user?.id],
    queryFn: () => getUserVisitsAction(),
    enabled: Boolean(user?.id),
    initialData: initialVisits.length > 0 ? initialVisits : undefined,
    staleTime: 30_000,
  })

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

  const filteredVisits = useMemo(() => {
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
      return true
    })
  }, [visits, selectedCity, selectedCategory])

  if (!user) {
    return (
      <section className="mx-auto flex max-w-xl flex-col items-center justify-center gap-4 rounded-4xl border bg-card p-8 text-center shadow-xs sm:p-10">
        <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <RiLockLine className="size-7" />
        </div>
        <Badge
          variant="secondary"
          className="px-3 py-1 font-mono text-xs tracking-wider uppercase"
        >
          Authentication Required
        </Badge>
        <h1 className="font-heading text-3xl font-medium tracking-tight text-balance sm:text-4xl">
          Your Personal Travel List
        </h1>
        <p className="max-w-md text-sm text-muted-foreground">
          Sign in to keep track of every place you visit, unlock your travel
          stats across cities, and save destinations to your personal catalogue.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Button
            className="min-h-11 rounded-full px-6 font-medium"
            onClick={() =>
              openAuth("Sign in to view and manage your travel list")
            }
          >
            <RiFlashlightLine />
            <span>Sign In / Test Login</span>
          </Button>

          <Button
            variant="outline"
            className="min-h-11 rounded-full px-5"
            nativeButton={false}
            render={<Link href="/explore" prefetch={true} />}
          >
            <RiCompass3Line />
            <span>Explore Cities</span>
          </Button>
        </div>
      </section>
    )
  }

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary">
            <RiListCheck2 className="size-5" />
            <span className="font-mono text-xs tracking-wider uppercase">
              Personal Catalogue
            </span>
          </div>
          <h1 className="font-heading text-3xl font-medium tracking-tight text-balance sm:text-4xl">
            {user.displayName}&apos;s List
          </h1>
          <p className="text-xs text-muted-foreground sm:text-sm">
            @{user.handle} · Catalogued travel logs and visited destinations
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-9 rounded-full px-3.5 text-xs"
            nativeButton={false}
            render={<Link href="/explore" prefetch={true} />}
          >
            <RiCompass3Line className="size-4 text-primary" />
            <span>Explore Cities</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-9 rounded-full px-3 text-xs"
            nativeButton={false}
            render={<Link href="/" prefetch={true} />}
          >
            <RiArrowLeftLine className="size-4" />
            <span>LOTD</span>
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
        <div className="flex flex-col gap-3 rounded-3xl border bg-card/60 p-3.5 sm:p-4">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mr-1 text-xs font-medium text-muted-foreground">
              City:
            </span>
            <Button
              variant={selectedCity === "all" ? "default" : "outline"}
              size="sm"
              className="h-7 rounded-full px-3 text-xs font-normal"
              onClick={() => setSelectedCity("all")}
            >
              All ({visits.length})
            </Button>
            {availableCities.map(([cityName, count]) => (
              <Button
                key={cityName}
                variant={selectedCity === cityName ? "default" : "outline"}
                size="sm"
                className="h-7 rounded-full px-3 text-xs font-normal"
                onClick={() => setSelectedCity(cityName)}
              >
                {cityName} ({count})
              </Button>
            ))}
          </div>

          {availableCategories.length > 1 && (
            <div className="flex flex-wrap items-center gap-1.5 border-t border-border/60 pt-2.5">
              <span className="mr-1 text-xs font-medium text-muted-foreground">
                Category:
              </span>
              <Button
                variant={selectedCategory === "all" ? "secondary" : "ghost"}
                size="sm"
                className="h-6 rounded-full px-2.5 text-[11px]"
                onClick={() => setSelectedCategory("all")}
              >
                All
              </Button>
              {availableCategories.map(([slug, cat]) => (
                <Button
                  key={slug}
                  variant={selectedCategory === slug ? "secondary" : "ghost"}
                  size="sm"
                  className="h-6 rounded-full px-2.5 text-[11px]"
                  onClick={() => setSelectedCategory(slug)}
                >
                  {cat.label} ({cat.count})
                </Button>
              ))}
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
              <Skeleton className="aspect-16/9 w-full rounded-2xl" />
              <Skeleton className="h-5 w-3/4 rounded-md" />
              <Skeleton className="h-4 w-1/2 rounded-md" />
            </div>
          ))}
        </div>
      ) : visits.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-4xl border border-dashed bg-card/40 py-16 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <RiListCheck2 className="size-6" />
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
              <RiCompass3Line />
              <span>Explore Places</span>
            </Button>
          </div>
        </div>
      ) : filteredVisits.length === 0 ? (
        <div className="rounded-3xl border border-dashed py-12 text-center text-sm text-muted-foreground">
          No visited places match the selected filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: DURATION_ENTER,
                  ease: EASE_OUT,
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
                        <RiCompass3Line className="size-8 opacity-40" />
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
                        <RiTimeLine className="size-3" />
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
                    <RiMapPin2Line className="size-3.5" />
                    <span>Maps</span>
                    <RiExternalLinkLine className="size-3 opacity-60" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 rounded-full px-3 text-xs text-muted-foreground hover:text-destructive"
                    onClick={() => undoCheckIn(place)}
                  >
                    <RiDeleteBinLine className="size-3.5" />
                    <span>Remove</span>
                  </Button>
                </div>
              </motion.article>
            )
          })}
        </div>
      )}
    </section>
  )
}
