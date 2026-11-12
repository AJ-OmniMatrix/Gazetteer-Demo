"use client"

import { useEffect, useRef, useState, type PointerEvent } from "react"
import gsap from "gsap"
import { RiExternalLinkLine, RiMapPin2Line } from "@remixicon/react"
import { motion } from "motion/react"
import BlurText from "@/components/BlurText"
import { BlurHashImage } from "@/components/BlurHashImage"
import { VisitStatusButton } from "@/components/VisitStatusButton"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useCatalog } from "@/hooks/use-catalog"
import {
  DURATION_ENTER,
  DURATION_HOVER_ENTER,
  DURATION_HOVER_EXIT,
  EASE_OUT,
  GSAP_BOUNCE_ENTER,
  GSAP_EASE_OUT,
  ROW_STAGGER,
} from "@/lib/motion"
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

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

function getHoverScale(
  tileEl: HTMLDivElement | null,
  gridEl: HTMLDivElement | null,
  tileCount: number
): number {
  if (!tileEl || !gridEl) {
    return 1
  }
  const areaScale = Math.sqrt(
    Math.max(tileEl.clientWidth * tileEl.clientHeight, 1)
  )
  const shrinkTotal = clamp(gridEl.clientWidth * 0.008, 4, 9)
  const minScale = tileCount === 1 ? 0.984 : 0.97
  const maxScale = tileCount === 1 ? 0.99 : 0.984
  return clamp(1 - shrinkTotal / areaScale, minScale, maxScale)
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
  const gridRef = useRef<HTMLDivElement>(null)
  const tileRefs = useRef<(HTMLDivElement | null)[]>([])
  const entryRefs = useRef<(HTMLDivElement | null)[]>([])
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  const mediaRefs = useRef<(HTMLDivElement | null)[]>([])
  const reducedMotionRef = useRef(false)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  useEffect(() => {
    const gridEl = gridRef.current
    if (!gridEl || tileCount === 0) {
      return
    }
    const entryEls = entryRefs.current
      .slice(0, tileCount)
      .filter((el): el is HTMLDivElement => Boolean(el))
    const cards = cardRefs.current.slice(0, tileCount)
    const mediaEls = mediaRefs.current.slice(0, tileCount)

    const mm = gsap.matchMedia()
    mm.add(
      {
        reduce: "(prefers-reduced-motion: reduce)",
        normal: "(min-width: 0px)",
      },
      (context) => {
        const isReduced = Boolean(context.conditions?.reduce)
        reducedMotionRef.current = isReduced
        if (isReduced) {
          gsap.set(entryEls, { opacity: 1, x: 0, scale: 1 })
          gsap.set(cards, { scale: 1 })
          gsap.set(mediaEls, { scale: 1 })
          return
        }
        gsap.fromTo(
          entryEls,
          { opacity: 0, x: -8, scale: 0.98 },
          {
            opacity: 1,
            x: 0,
            scale: 1,
            duration: DURATION_ENTER,
            ease: GSAP_EASE_OUT,
            stagger: ROW_STAGGER,
            clearProps: "transform",
            force3D: true,
          }
        )
      }
    )

    return () => {
      mm.revert()
      gsap.killTweensOf([...entryEls, ...cards, ...mediaEls])
    }
  }, [tileCount, layoutSeed])

  const activeIndex =
    hoveredIndex !== null && hoveredIndex < tileCount ? hoveredIndex : null

  useEffect(() => {
    if (tileCount === 0 || reducedMotionRef.current) {
      return
    }
    for (let index = 0; index < tileCount; index++) {
      const cardEl = cardRefs.current[index]
      const mediaEl = mediaRefs.current[index]
      if (!cardEl) {
        continue
      }
      const isActive = activeIndex === index
      const scale = isActive
        ? getHoverScale(tileRefs.current[index], gridRef.current, tileCount)
        : 1
      gsap.to(cardEl, {
        scale,
        duration: isActive ? DURATION_HOVER_ENTER : DURATION_HOVER_EXIT,
        ease: isActive ? GSAP_BOUNCE_ENTER : GSAP_EASE_OUT,
        overwrite: "auto",
        force3D: true,
        onUpdate: () => {
          if (!mediaEl) {
            return
          }
          const liveScale = Number(gsap.getProperty(cardEl, "scaleX")) || 1
          gsap.set(mediaEl, {
            scale: Math.max(1, 1 / liveScale),
            force3D: true,
          })
        },
      })
    }
  }, [activeIndex, tileCount])

  if (tileCount === 0) {
    return null
  }

  const handleTilePointer =
    (index: number) => (event: PointerEvent<HTMLDivElement>) => {
      if (event.pointerType !== "touch") {
        setHoveredIndex(index)
      }
    }

  return (
    <div
      ref={gridRef}
      onPointerLeave={() => setHoveredIndex(null)}
      onPointerCancel={() => setHoveredIndex(null)}
      className="relative grid max-h-[min(54vw,32rem)] min-h-0 w-full flex-1 grid-cols-12 grid-rows-[repeat(2,minmax(0,1fr))] gap-2 sm:gap-3"
    >
      {tiles.map((photo, index) => (
        <div
          key={photo.id}
          ref={(el) => {
            tileRefs.current[index] = el
          }}
          onPointerEnter={handleTilePointer(index)}
          onPointerMove={handleTilePointer(index)}
          className={cn(
            "relative min-h-0 min-w-0",
            getTileClasses(tileCount, layoutSeed, index)
          )}
        >
          <div
            ref={(el) => {
              entryRefs.current[index] = el
            }}
            className="size-full opacity-0"
          >
            <div
              ref={(el) => {
                cardRefs.current[index] = el
              }}
              className="relative size-full will-change-transform"
            >
              <BlurHashImage
                src={photo.imageUrl}
                alt={`${placeName} view ${index + 1}`}
                blurhash={photo.blurhash}
                width={photo.width}
                height={photo.height}
                fill
                loading="eager"
                mediaRef={(el) => {
                  mediaRefs.current[index] = el
                }}
                className="rounded-2xl border border-border/60 shadow-xs sm:rounded-3xl"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export function LotdView({ layoutSeed, todayLabel }: LotdViewProps) {
  const { catalog, visitedSet, checkIn, undoCheckIn, isPending } = useCatalog()
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
            disabled={isPending}
            className="min-h-11 px-5"
            onClick={handleQuickAdd}
          />
        </div>
      </motion.div>
    </section>
  )
}
