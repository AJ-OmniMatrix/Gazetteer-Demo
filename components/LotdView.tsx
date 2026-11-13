"use client"

import Link from "next/link"
import {
  RiCompass3Line,
  RiExternalLinkLine,
  RiMapPin2Line,
} from "@remixicon/react"
import { motion } from "motion/react"
import BlurText from "@/components/BlurText"
import { BlurHashImage } from "@/components/BlurHashImage"
import { VisitStatusButton } from "@/components/VisitStatusButton"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useCatalog } from "@/hooks/use-catalog"
import { DURATION_ENTER, EASE_OUT, ROW_STAGGER } from "@/lib/motion"
import type { PlacePhoto } from "@/lib/types"
import { cn } from "@/lib/utils"

interface LotdViewProps {
  layoutSeed: number
  todayLabel: string
}

const TILE_LAYOUTS: Record<number, [string[], string[]]> = {
  1: [["col-span-12 row-span-2"], ["col-span-12 row-span-2"]],
  2: [
    ["col-span-7 row-span-2", "col-span-5 row-span-2"],
    ["col-span-5 row-span-2", "col-span-7 row-span-2"],
  ],
  3: [
    ["col-span-7 row-span-2", "col-span-5", "col-span-5"],
    ["col-span-5", "col-span-7 row-span-2", "col-span-5"],
  ],
  4: [
    [
      "col-span-5 row-span-2",
      "col-span-4",
      "col-span-3 row-span-2",
      "col-span-4",
    ],
    [
      "col-span-3 row-span-2",
      "col-span-4",
      "col-span-5 row-span-2",
      "col-span-4",
    ],
  ],
  5: [
    [
      "col-span-5 row-span-2",
      "col-span-4",
      "col-span-3",
      "col-span-3",
      "col-span-4",
    ],
    [
      "col-span-3",
      "col-span-6 row-span-2",
      "col-span-3",
      "col-span-3",
      "col-span-3",
    ],
  ],
  6: [
    [
      "col-span-4 row-span-2",
      "col-span-5",
      "col-span-3",
      "col-span-2",
      "col-span-3",
      "col-span-3",
    ],
    [
      "col-span-4 row-span-2",
      "col-span-3",
      "col-span-2",
      "col-span-3 row-span-2",
      "col-span-2",
      "col-span-3",
    ],
  ],
  7: [
    [
      "col-span-4 row-span-2",
      "col-span-3",
      "col-span-2",
      "col-span-3",
      "col-span-2",
      "col-span-3",
      "col-span-3",
    ],
    [
      "col-span-2",
      "col-span-3",
      "col-span-4 row-span-2",
      "col-span-3",
      "col-span-3",
      "col-span-2",
      "col-span-3",
    ],
  ],
}

function getTileClasses(count: number, variant: number, index: number): string {
  const clamped = Math.min(Math.max(count, 1), 7)
  return TILE_LAYOUTS[clamped][variant % 2][index] ?? "col-span-4"
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
  const tileCount = tiles.length

  if (tileCount === 0) {
    return null
  }

  return (
    <div className="relative grid max-h-[min(54vw,32rem)] min-h-0 w-full flex-1 grid-cols-12 grid-rows-[repeat(2,minmax(0,1fr))] gap-2 sm:gap-3">
      {tiles.map((photo, index) => (
        <motion.div
          key={photo.id}
          initial={{ opacity: 0, x: -8, scale: 0.98 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{
            duration: DURATION_ENTER,
            ease: EASE_OUT,
            delay: Math.min(index * ROW_STAGGER, 0.2),
          }}
          whileHover={{ scale: 1.015 }}
          className={cn(
            "relative min-h-0 min-w-0 transition-transform",
            getTileClasses(tileCount, layoutSeed, index)
          )}
        >
          <BlurHashImage
            src={photo.imageUrl}
            alt={`${placeName} view ${index + 1}`}
            blurhash={photo.blurhash}
            width={photo.width}
            height={photo.height}
            fill
            loading="eager"
            className="size-full rounded-2xl border border-border/60 shadow-xs sm:rounded-3xl"
          />
        </motion.div>
      ))}
    </div>
  )
}

export function LotdView({ layoutSeed, todayLabel }: LotdViewProps) {
  const { catalog, visitedSet, checkIn, undoCheckIn } = useCatalog()
  const { lotd } = catalog

  if (!lotd) {
    return (
      <section className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 text-center">
        <Badge
          variant="secondary"
          className="px-3 py-1 font-mono text-xs tracking-wider uppercase"
        >
          Gazetteer Travel Catalogue
        </Badge>
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-balance sm:text-5xl">
          Welcome to Gazetteer
        </h1>
        <p className="max-w-md text-sm text-muted-foreground sm:text-base">
          No locations added yet. Start your travel catalogue by adding your
          first location and photos.
        </p>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
          <Button
            variant="default"
            className="h-11 rounded-full px-5"
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

  const visited = visitedSet.has(lotd.id)

  const handleQuickAdd = () => {
    if (visited) {
      undoCheckIn(lotd)
      return
    }
    checkIn(lotd, "lotd_quick_add")
  }

  return (
    <section className="flex min-h-0 flex-1 flex-col justify-center gap-3 sm:gap-4">
      <header className="flex shrink-0 flex-col items-center gap-1 text-center">
        <p className="font-mono text-[11px] tracking-widest text-muted-foreground uppercase tabular-nums sm:text-xs">
          {todayLabel}
        </p>
        <BlurText
          text="Location of the Day"
          trigger="load"
          animateBy="words"
          delay={90}
          className="justify-center text-center font-heading text-3xl leading-tight font-semibold tracking-tight text-balance sm:text-4xl lg:text-[2.75rem]"
        />
      </header>

      <CollageGrid
        photos={lotd.photos}
        placeName={lotd.name}
        layoutSeed={layoutSeed}
      />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: DURATION_ENTER, ease: EASE_OUT, delay: 0.16 }}
        className="mt-2 flex shrink-0 flex-col justify-between gap-3 sm:mt-3 sm:flex-row sm:items-center sm:gap-6"
      >
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
            <Badge variant="secondary">{lotd.categoryLabel}</Badge>
            <span className="text-sm text-muted-foreground">
              {lotd.cityName}, {lotd.countryName}
            </span>
            <span className="font-mono text-xs text-muted-foreground tabular-nums">
              {lotd.lat.toFixed(4)}°, {lotd.lng.toFixed(4)}°
            </span>
          </div>
          <h2 className="font-heading text-2xl font-medium tracking-tight text-balance sm:text-3xl">
            {lotd.name}
          </h2>
          <p className="line-clamp-2 text-xs text-muted-foreground sm:line-clamp-1 sm:text-sm">
            {lotd.description}
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            className="min-h-11 rounded-full px-4"
            nativeButton={false}
            render={
              <a
                href={lotd.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
              />
            }
          >
            <RiMapPin2Line />
            <span>Open in Maps</span>
            <RiExternalLinkLine className="size-3.5 opacity-60" />
          </Button>

          <VisitStatusButton
            visited={visited}
            activeLabel="In Your List"
            idleLabel="Add to List"
            className="min-h-11 px-5"
            onClick={handleQuickAdd}
          />
        </div>
      </motion.div>
    </section>
  )
}
