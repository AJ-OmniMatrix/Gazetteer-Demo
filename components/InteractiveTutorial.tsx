"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { ArrowLeft, ArrowRight, Check, Sparkles, X } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DURATION_ENTER,
  DURATION_EXIT,
  EASE_IN,
  EASE_OUT,
} from "@/lib/motion"
import type { User } from "@/lib/types"
import { cn } from "@/lib/utils"

interface TourStep {
  selector: string
  title: string
  subtitle: string
  description: string
  tip?: string
  radius: number
  pad?: number
  preferredPlacement?: "top" | "bottom"
}

interface TargetRect {
  top: number
  left: number
  width: number
  height: number
  radius: number
}

interface InteractiveTutorialProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user?: User | null
}

const TOUR_STEPS: TourStep[] = [
  {
    selector: '[data-tour="lotd"]',
    title: "Location of the Day",
    subtitle: "Daily Showcase",
    description:
      "Every 24 hours, Gazetteer spotlights an architectural or cultural wonder with curated high-resolution photography, history, and geographical coordinates.",
    tip: "Scroll down to inspect the photo collage and explore architectural context.",
    radius: 16,
    pad: 10,
    preferredPlacement: "bottom",
  },
  {
    selector: '[data-tour="dock-list"]',
    title: "Your Travel List",
    subtitle: "Personal Catalog",
    description:
      "View all your visited locations and wishlist destinations in one place. Filter by category, review coordinates, and manage your catalogue.",
    tip: "Tap this button anytime to navigate directly to your curated travel list.",
    radius: 9999,
    pad: 6,
    preferredPlacement: "top",
  },
  {
    selector: '[data-tour="dock-explore"]',
    title: "Explore Destinations",
    subtitle: "City Showcase",
    description:
      "Discover iconic world cities like Kyoto and Paris, with hand-picked shrines, museums, temples, and historical landmarks.",
    tip: "Tap this button anytime to discover destinations organized by city.",
    radius: 9999,
    pad: 6,
    preferredPlacement: "top",
  },
  {
    selector: '[data-tour="dock-expand"]',
    title: "Action Compass & Tools",
    subtitle: "Expandable Deck",
    description:
      "Tap the center plus button to expand your command dock, revealing Nearby GPS radius scanning and instant prefix trie search.",
    tip: "Try tapping '+' now or anytime to reveal quick travel actions!",
    radius: 9999,
    pad: 6,
    preferredPlacement: "top",
  },
]

function getCutoutPath(vw: number, vh: number, rect: TargetRect | null) {
  if (!rect) {
    return `M 0,0 H ${vw} V ${vh} H 0 Z`
  }
  const { top, left, width, height, radius } = rect
  const right = left + width
  const bottom = top + height
  const r = Math.max(0, Math.min(radius, width / 2, height / 2))
  if (r === 0) {
    return `M 0,0 H ${vw} V ${vh} H 0 Z M ${left},${top} H ${right} V ${bottom} H ${left} Z`
  }
  return `M 0,0 H ${vw} V ${vh} H 0 Z M ${left + r},${top} H ${right - r} A ${r},${r} 0 0 1 ${right},${top + r} V ${bottom - r} A ${r},${r} 0 0 1 ${right - r},${bottom} H ${left + r} A ${r},${r} 0 0 1 ${left},${bottom - r} V ${top + r} A ${r},${r} 0 0 1 ${left + r},${top} Z`
}

export function InteractiveTutorial({
  open,
  onOpenChange,
  user,
}: InteractiveTutorialProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null)
  const [viewport, setViewport] = useState({ width: 1200, height: 800 })
  const [cardHeight, setCardHeight] = useState(280)
  const cardRef = useRef<HTMLDivElement | null>(null)

  const currentStep = TOUR_STEPS[step]

  useEffect(() => {
    if (!open || !cardRef.current) return
    const el = cardRef.current
    const ro = new ResizeObserver(() => {
      const h = el.offsetHeight
      if (h > 0) {
        setCardHeight(h)
      }
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [open, step])

  const updateMeasurements = useCallback(() => {
    if (typeof window === "undefined" || !open) return
    const vw = window.innerWidth
    const vh = window.innerHeight
    setViewport({ width: vw, height: vh })

    const cur = TOUR_STEPS[step]
    if (!cur) return

    const el = document.querySelector(cur.selector)
    if (el) {
      el.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "nearest",
      })
      const r = el.getBoundingClientRect()
      const pad = cur.pad ?? 8
      const top = Math.max(0, r.top - pad)
      const left = Math.max(0, r.left - pad)
      const width = r.width + pad * 2
      const height = r.height + pad * 2
      const maxR = Math.min(width, height) / 2
      const radius = Math.min(cur.radius, maxR)
      setTargetRect({ top, left, width, height, radius })
    } else {
      const w = Math.min(320, vw - 48)
      const h = 72
      setTargetRect({
        top: (vh - h) / 2,
        left: (vw - w) / 2,
        width: w,
        height: h,
        radius: 16,
      })
    }
  }, [open, step])

  useEffect(() => {
    if (!open) return
    const id = requestAnimationFrame(updateMeasurements)
    const timer = setTimeout(updateMeasurements, 80)
    return () => {
      cancelAnimationFrame(id)
      clearTimeout(timer)
    }
  }, [open, step, updateMeasurements])

  useEffect(() => {
    if (!open) return
    if (pathname !== "/") {
      router.push("/")
    }
  }, [open, pathname, router])

  useEffect(() => {
    if (!open) return

    const handleResize = () => updateMeasurements()
    const handleScroll = () => updateMeasurements()

    window.addEventListener("resize", handleResize)
    window.addEventListener("scroll", handleScroll, true)

    return () => {
      window.removeEventListener("resize", handleResize)
      window.removeEventListener("scroll", handleScroll, true)
    }
  }, [open, updateMeasurements])

  const handleFinish = useCallback(() => {
    try {
      localStorage.setItem("gazetteer_seen_tutorial", "true")
      if (user?.id) {
        localStorage.setItem(`gazetteer_seen_tutorial_user_${user.id}`, "true")
      }
    } catch {}
    onOpenChange(false)
  }, [onOpenChange, user])

  const handleNext = useCallback(() => {
    if (step < TOUR_STEPS.length - 1) {
      setStep((s) => s + 1)
    } else {
      handleFinish()
    }
  }, [step, handleFinish])

  const handleBack = useCallback(() => {
    if (step > 0) {
      setStep((s) => s - 1)
    }
  }, [step])

  useEffect(() => {
    if (!open) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleFinish()
      } else if (e.key === "ArrowRight") {
        handleNext()
      } else if (e.key === "ArrowLeft") {
        handleBack()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [open, handleFinish, handleNext, handleBack])

  if (!open) {
    return null
  }

  const cardWidth = Math.min(360, viewport.width - 32)
  let cardTop: number

  if (!targetRect) {
    cardTop = (viewport.height - cardHeight) / 2
  } else if (currentStep.preferredPlacement === "bottom") {
    cardTop = targetRect.top + targetRect.height + 16
  } else {
    cardTop = targetRect.top - cardHeight - 20
  }

  cardTop = Math.max(
    16,
    Math.min(viewport.height - cardHeight - 16, cardTop)
  )

  const targetCenterX = targetRect
    ? targetRect.left + targetRect.width / 2
    : viewport.width / 2
  let cardLeft = targetCenterX - cardWidth / 2
  cardLeft = Math.max(16, Math.min(viewport.width - cardWidth - 16, cardLeft))

  const cutoutPath = getCutoutPath(viewport.width, viewport.height, targetRect)

  return (
    <div className="fixed inset-0 z-[9990] select-none">
      <svg
        aria-hidden="true"
        className="fixed inset-0 size-full pointer-events-auto"
        width={viewport.width}
        height={viewport.height}
      >
        <path
          fillRule="evenodd"
          d={cutoutPath}
          fill="rgba(0, 0, 0, 0.65)"
          className="transition-all duration-300 ease-out"
        />
      </svg>

      {targetRect && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{
            opacity: 1,
            scale: 1,
            top: targetRect.top,
            left: targetRect.left,
            width: targetRect.width,
            height: targetRect.height,
            borderRadius: targetRect.radius,
          }}
          transition={{
            type: "spring",
            stiffness: 350,
            damping: 32,
          }}
          style={{
            position: "fixed",
            zIndex: 9992,
            pointerEvents: "none",
          }}
          className="border-2 border-primary ring-4 ring-primary/25 shadow-[0_0_24px_rgba(245,158,11,0.35)]"
        />
      )}

      <AnimatePresence mode="wait">
        <motion.div
          ref={cardRef}
          key={`tour-card-${step}`}
          initial={{ opacity: 0, y: 10, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{
            opacity: 0,
            y: -6,
            scale: 0.96,
            transition: { duration: DURATION_EXIT, ease: EASE_IN },
          }}
          transition={{ duration: DURATION_ENTER, ease: EASE_OUT }}
          style={{
            position: "fixed",
            top: cardTop,
            left: cardLeft,
            width: cardWidth,
            zIndex: 9995,
          }}
          className="pointer-events-auto flex flex-col gap-3 rounded-2xl border border-border/90 bg-background/98 p-4 shadow-2xl backdrop-blur-md sm:p-5"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="gap-1 border-primary/30 bg-primary/10 font-mono text-[11px] text-primary"
              >
                <Sparkles className="size-3" />
                <span>
                  {step + 1} / {TOUR_STEPS.length}
                </span>
              </Badge>
              <span className="font-mono text-[10px] tracking-wider text-muted-foreground uppercase">
                {currentStep.subtitle}
              </span>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="size-7 rounded-full text-muted-foreground hover:text-foreground"
              onClick={handleFinish}
              aria-label="Skip tutorial"
            >
              <X className="size-3.5" />
            </Button>
          </div>

          <div className="space-y-1">
            <h3 className="font-heading text-lg font-semibold tracking-tight text-foreground">
              {currentStep.title}
            </h3>
            <p className="text-xs leading-relaxed text-muted-foreground">
              {currentStep.description}
            </p>
          </div>

          {currentStep.tip && (
            <div className="flex items-start gap-2 rounded-xl border border-primary/20 bg-primary/5 p-2.5 text-[11px] text-foreground">
              <Sparkles className="mt-0.5 size-3.5 shrink-0 text-primary" />
              <span>{currentStep.tip}</span>
            </div>
          )}

          <div className="flex items-center gap-1.5 py-0.5">
            {TOUR_STEPS.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setStep(i)}
                className={cn(
                  "h-1.5 flex-1 rounded-full transition-all duration-200",
                  step === i
                    ? "bg-primary"
                    : "bg-muted hover:bg-muted-foreground/30"
                )}
                aria-label={`Jump to tutorial step ${i + 1}`}
              />
            ))}
          </div>

          <div className="flex items-center justify-between gap-2 pt-1">
            {step > 0 ? (
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 rounded-full px-3 text-xs"
                onClick={handleBack}
              >
                <ArrowLeft className="size-3" />
                <span>Back</span>
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 rounded-full px-3 text-xs text-muted-foreground hover:text-foreground"
                onClick={handleFinish}
              >
                <span>Skip Tour</span>
              </Button>
            )}

            {step < TOUR_STEPS.length - 1 ? (
              <Button
                variant="default"
                size="sm"
                className="h-8 gap-1.5 rounded-full px-3.5 text-xs shadow-xs"
                onClick={handleNext}
              >
                <span>Next</span>
                <ArrowRight className="size-3" />
              </Button>
            ) : (
              <Button
                variant="default"
                size="sm"
                className="h-8 gap-1.5 rounded-full px-3.5 text-xs shadow-xs"
                onClick={handleFinish}
              >
                <span>Got It</span>
                <Check className="size-3" />
              </Button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
