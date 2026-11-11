"use client"

import {
  RiAddLine,
  RiCheckLine,
  RiExternalLinkLine,
  RiMapPin2Line,
} from "@remixicon/react"
import BlurText from "@/components/BlurText"
import { BlurHashImage } from "@/components/BlurHashImage"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useCatalog } from "@/hooks/use-catalog"
import type { CatalogPayload, PlacePhoto } from "@/lib/types"

interface LotdViewProps {
  initialData: CatalogPayload
  layoutSeed: number
  todayLabel: string
}

function getTileClasses(count: number, variant: number, index: number): string {
  const v = variant % 2

  if (count <= 4) {
    if (v === 0) {
      if (index === 0) return "col-span-6 sm:col-span-4 sm:row-span-2 min-h-56"
      if (index === 1) return "col-span-3 sm:col-span-2 min-h-36"
      if (index === 2) return "col-span-3 sm:col-span-2 min-h-36"
      return "col-span-6 min-h-40"
    }
    if (index === 0) return "col-span-6 sm:col-span-3 min-h-52"
    if (index === 1) return "col-span-6 sm:col-span-3 min-h-52"
    if (index === 2) return "col-span-3 sm:col-span-2 min-h-40"
    return "col-span-3 sm:col-span-4 min-h-40"
  }

  if (count === 5) {
    if (v === 0) {
      if (index === 0) return "col-span-6 sm:col-span-3 sm:row-span-2 min-h-56"
      if (index === 1) return "col-span-3 sm:col-span-3 min-h-36"
      if (index === 2) return "col-span-3 sm:col-span-3 min-h-36"
      if (index === 3) return "col-span-3 sm:col-span-2 min-h-40"
      return "col-span-3 sm:col-span-4 min-h-40"
    }
    if (index < 3) return "col-span-2 min-h-44"
    if (index === 3) return "col-span-4 min-h-48"
    return "col-span-2 min-h-48"
  }

  if (count === 6) {
    if (v === 0) {
      if (index === 0) return "col-span-6 sm:col-span-4 sm:row-span-2 min-h-60"
      if (index === 1) return "col-span-3 sm:col-span-2 min-h-36"
      if (index === 2) return "col-span-3 sm:col-span-2 min-h-36"
      return "col-span-2 min-h-40"
    }
    if (index === 0) return "col-span-6 sm:col-span-2 min-h-44"
    if (index === 1) return "col-span-6 sm:col-span-4 min-h-44"
    if (index === 2) return "col-span-3 min-h-44"
    if (index === 3) return "col-span-3 min-h-44"
    if (index === 4) return "col-span-4 min-h-40"
    return "col-span-2 min-h-40"
  }

  if (v === 0) {
    if (index === 0) return "col-span-6 sm:col-span-4 sm:row-span-2 min-h-60"
    if (index === 1) return "col-span-3 sm:col-span-2 min-h-36"
    if (index === 2) return "col-span-3 sm:col-span-2 min-h-36"
    if (index <= 5) return "col-span-2 min-h-40"
    return "col-span-6 min-h-36"
  }
  if (index <= 1) return "col-span-3 min-h-48"
  if (index <= 4) return "col-span-2 min-h-40"
  if (index === 5) return "col-span-4 min-h-44"
  return "col-span-2 min-h-44"
}

function CollageGrid({
  photos,
  placeName,
  layoutSeed,
}: {
  photos: PlacePhoto[]
  placeName: string
  layoutSeed: number
}) {
  const tiles = photos.slice(0, 7)
  return (
    <div className="grid grid-cols-6 gap-2.5 sm:gap-3">
      {tiles.map((photo, index) => (
        <div
          key={photo.id}
          className={getTileClasses(tiles.length, layoutSeed, index)}
        >
          <BlurHashImage
            src={photo.imageUrl}
            alt={`${placeName} view ${index + 1}`}
            blurhash={photo.blurhash}
            width={photo.width}
            height={photo.height}
            fill
            className="rounded-3xl border border-border/60 shadow-xs"
          />
        </div>
      ))}
    </div>
  )
}

export function LotdView({ initialData, layoutSeed, todayLabel }: LotdViewProps) {
  const { catalog, visitedSet, checkIn, undoCheckIn, isPending } =
    useCatalog(initialData)
  const { lotd } = catalog
  const visited = visitedSet.has(lotd.id)

  const handleQuickAdd = () => {
    if (visited) {
      undoCheckIn(lotd)
      return
    }
    checkIn(lotd, "lotd_quick_add")
  }

  return (
    <section className="flex flex-col gap-6 sm:gap-8">
      <header className="flex flex-col items-center gap-2 text-center">
        <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase tabular-nums">
          {todayLabel}
        </p>
        <BlurText
          text="Location of the Day"
          trigger="load"
          animateBy="words"
          delay={90}
          className="font-heading justify-center text-center text-4xl font-semibold tracking-tight text-balance sm:text-5xl"
        />
      </header>

      <CollageGrid
        photos={lotd.photos}
        placeName={lotd.name}
        layoutSeed={layoutSeed}
      />

      <div className="flex flex-col justify-between gap-5 rounded-4xl border border-border/80 bg-card p-5 shadow-xs sm:flex-row sm:items-center sm:p-6">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{lotd.categoryLabel}</Badge>
            <span className="text-sm text-muted-foreground">
              {lotd.cityName}, {lotd.countryName}
            </span>
          </div>
          <h2 className="font-heading text-2xl font-medium tracking-tight text-balance sm:text-3xl">
            {lotd.name}
          </h2>
          <p className="text-sm text-muted-foreground">{lotd.description}</p>
          <p className="font-mono text-xs text-muted-foreground tabular-nums">
            {lotd.lat.toFixed(4)}°, {lotd.lng.toFixed(4)}°
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            className="min-h-11 rounded-full px-4"
            render={
              <a href={lotd.mapsUrl} target="_blank" rel="noopener noreferrer" />
            }
          >
            <RiMapPin2Line />
            <span>Open in Maps</span>
            <RiExternalLinkLine className="size-3.5 opacity-60" />
          </Button>

          <Button
            variant={visited ? "secondary" : "default"}
            className="min-h-11 rounded-full px-5"
            disabled={isPending}
            onClick={handleQuickAdd}
          >
            {visited ? (
              <>
                <RiCheckLine />
                <span>In Your List</span>
              </>
            ) : (
              <>
                <RiAddLine />
                <span>Add to List</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </section>
  )
}
