"use client"

import {
  RiAddLine,
  RiCheckLine,
  RiExternalLinkLine,
  RiMapPin2Line,
} from "@remixicon/react"
import { AnimatePresence, motion } from "motion/react"
import BlurText from "@/components/BlurText"
import { BlurHashImage } from "@/components/BlurHashImage"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useCatalog } from "@/hooks/use-catalog"
import {
  DURATION_ENTER,
  DURATION_EXIT,
  EASE_IN,
  EASE_OUT,
  ROW_STAGGER,
} from "@/lib/motion"
import type { CatalogPayload, PlacePhoto } from "@/lib/types"
import { cn } from "@/lib/utils"

interface LotdViewProps {
  initialData: CatalogPayload
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
  if (tiles.length === 0) {
    return null
  }
  return (
    <div className="grid max-h-[min(54vw,32rem)] min-h-0 w-full flex-1 grid-cols-12 grid-rows-[repeat(2,minmax(0,1fr))] gap-2 sm:gap-3">
      {tiles.map((photo, index) => (
        <motion.div
          key={photo.id}
          initial={{ opacity: 0, x: -8, scale: 0.98 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{
            duration: DURATION_ENTER,
            ease: EASE_OUT,
            delay: Math.min(index, 6) * ROW_STAGGER,
          }}
          className={cn(
            "min-h-0 min-w-0",
            getTileClasses(tiles.length, layoutSeed, index)
          )}
        >
          <BlurHashImage
            src={photo.imageUrl}
            alt={`${placeName} view ${index + 1}`}
            blurhash={photo.blurhash}
            width={photo.width}
            height={photo.height}
            fill
            className="rounded-2xl border border-border/60 shadow-xs sm:rounded-3xl"
          />
        </motion.div>
      ))}
    </div>
  )
}

export function LotdView({
  initialData,
  layoutSeed,
  todayLabel,
}: LotdViewProps) {
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

          <motion.div
            animate={{ scale: visited ? [1, 1.04, 1] : 1 }}
            transition={{ duration: 0.24, ease: EASE_OUT }}
          >
            <Button
              variant={visited ? "secondary" : "default"}
              className="min-h-11 rounded-full px-5"
              disabled={isPending}
              onClick={handleQuickAdd}
            >
              <AnimatePresence mode="popLayout" initial={false}>
                {visited ? (
                  <motion.span
                    key="visited"
                    initial={{ opacity: 0, filter: "blur(2px)", scale: 0.92 }}
                    animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
                    exit={{
                      opacity: 0,
                      filter: "blur(2px)",
                      scale: 0.92,
                      transition: { duration: DURATION_EXIT, ease: EASE_IN },
                    }}
                    transition={{ duration: DURATION_ENTER, ease: EASE_OUT }}
                    className="inline-flex items-center gap-1.5"
                  >
                    <RiCheckLine />
                    <span>In Your List</span>
                  </motion.span>
                ) : (
                  <motion.span
                    key="add"
                    initial={{ opacity: 0, filter: "blur(2px)", scale: 0.92 }}
                    animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
                    exit={{
                      opacity: 0,
                      filter: "blur(2px)",
                      scale: 0.92,
                      transition: { duration: DURATION_EXIT, ease: EASE_IN },
                    }}
                    transition={{ duration: DURATION_ENTER, ease: EASE_OUT }}
                    className="inline-flex items-center gap-1.5"
                  >
                    <RiAddLine />
                    <span>Add to List</span>
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}
