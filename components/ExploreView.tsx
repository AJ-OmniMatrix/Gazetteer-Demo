"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import {
  RiArrowLeftLine,
  RiCompass3Line,
  RiExternalLinkLine,
  RiMapPin2Line,
} from "@remixicon/react"
import { motion } from "motion/react"
import { BlurHashImage } from "@/components/BlurHashImage"
import { VisitStatusButton } from "@/components/VisitStatusButton"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useCatalog } from "@/hooks/use-catalog"
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

  const [selectedCity, setSelectedCity] = useState<string>("all")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  const activeCity =
    selectedCity !== "all"
      ? (cities.find((c) => c.cityName === selectedCity) ?? null)
      : null

  const basePlaces =
    selectedCity === "all"
      ? catalog.places
      : catalog.places.filter((p) => p.cityName === selectedCity)

  const availableCategories = useMemo(() => {
    const set = new Set<string>()
    for (const p of basePlaces) {
      set.add(p.categorySlug)
    }
    return Array.from(set)
  }, [basePlaces])

  const filteredPlaces =
    selectedCategory === "all"
      ? basePlaces
      : basePlaces.filter((p) => p.categorySlug === selectedCategory)

  const visitedInScope = basePlaces.filter((p) => visitedSet.has(p.id)).length

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
          <RiArrowLeftLine />
          <span>Back to Home</span>
        </Button>
      </section>
    )
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-primary">
            <RiCompass3Line className="size-4" />
            <span className="font-mono text-xs tracking-widest uppercase">
              City Explorer
            </span>
          </div>
          <h1 className="font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            {activeCity ? `Visiting ${activeCity.cityName}` : "All Cities"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {activeCity ? (
              <>
                {activeCity.countryName} ({activeCity.countryCode}) ·{" "}
                <span className="font-mono tabular-nums">
                  {activeCity.lat.toFixed(4)}°, {activeCity.lng.toFixed(4)}°
                </span>
                {" · "}
                <span className="font-mono font-medium text-foreground tabular-nums">
                  {visitedInScope}
                </span>{" "}
                of{" "}
                <span className="font-mono tabular-nums">
                  {basePlaces.length}
                </span>{" "}
                visited
              </>
            ) : (
              <>
                Browse all catalogued places across {cities.length}{" "}
                {cities.length === 1 ? "city" : "cities"} (
                <span className="font-mono font-medium text-foreground tabular-nums">
                  {visitedInScope}
                </span>{" "}
                of{" "}
                <span className="font-mono tabular-nums">
                  {basePlaces.length}
                </span>{" "}
                visited)
              </>
            )}
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="h-9 self-start rounded-full px-4 text-xs sm:self-end"
          nativeButton={false}
          render={<Link href="/" prefetch={true} />}
        >
          <RiArrowLeftLine className="size-3.5" />
          <span>Featured Spot</span>
        </Button>
      </div>

      <div className="space-y-2">
        <p className="font-mono text-xs tracking-wider text-muted-foreground uppercase">
          Select City
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant={selectedCity === "all" ? "default" : "outline"}
            size="sm"
            className="h-9 rounded-full px-4 text-xs"
            onClick={() => {
              setSelectedCity("all")
              setSelectedCategory("all")
            }}
          >
            <span>All Cities</span>
            <span className="font-mono text-[11px] tabular-nums opacity-70">
              ({catalog.places.length})
            </span>
          </Button>

          {cities.map((city) => {
            const isSelected = selectedCity === city.cityName
            return (
              <Button
                key={city.cityName}
                variant={isSelected ? "default" : "outline"}
                size="sm"
                className="h-9 rounded-full px-4 text-xs"
                onClick={() => {
                  setSelectedCity(city.cityName)
                  setSelectedCategory("all")
                }}
              >
                <span>{city.cityName}</span>
                <span className="font-mono text-[11px] tabular-nums opacity-70">
                  ({city.count})
                </span>
              </Button>
            )
          })}
        </div>
      </div>

      {availableCategories.length > 1 && (
        <div className="flex flex-wrap items-center gap-1.5 border-y py-2.5">
          <Button
            variant={selectedCategory === "all" ? "secondary" : "ghost"}
            size="sm"
            className="h-8 rounded-full px-3 text-xs"
            onClick={() => setSelectedCategory("all")}
          >
            All Categories
          </Button>
          {availableCategories.map((slug) => {
            const isSelected = selectedCategory === slug
            const label = slug.replace(/_/g, " ")
            return (
              <Button
                key={slug}
                variant={isSelected ? "secondary" : "ghost"}
                size="sm"
                className="h-8 rounded-full px-3 text-xs capitalize"
                onClick={() => setSelectedCategory(slug)}
              >
                {label}
              </Button>
            )
          })}
        </div>
      )}

      {filteredPlaces.length === 0 ? (
        <div className="rounded-3xl border bg-muted/30 p-8 text-center text-sm text-muted-foreground">
          No locations match the selected category in this city.
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
                        <RiCompass3Line className="size-8 opacity-40" />
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
                    <RiMapPin2Line className="size-3.5" />
                    <span>Maps</span>
                    <RiExternalLinkLine className="size-3 opacity-60" />
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
