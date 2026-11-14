"use client"

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react"
import {
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useTransform,
  type AnimationPlaybackControls,
} from "motion/react"
import { cn } from "@/lib/utils"

interface ScrollRevealProps {
  fitViewport: boolean
  disabled?: boolean
  dock: ReactNode
  children: ReactNode
}

function isInsideScrollableOverlay(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) {
    return false
  }
  return Boolean(
    target.closest(
      '[role="dialog"], [data-slot="drawer-content"], [data-slot="dropdown-menu-content"]'
    )
  )
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export function ScrollReveal({
  fitViewport,
  disabled = false,
  dock,
  children,
}: ScrollRevealProps) {
  const reducedMotion = useReducedMotion()
  const bandRef = useRef<HTMLDivElement>(null)
  const animRef = useRef<AnimationPlaybackControls | null>(null)
  const fallTimerRef = useRef<number | null>(null)
  const fallingRef = useRef(false)
  const maxRevealRef = useRef(260)
  const touchYRef = useRef<number | null>(null)
  const lastScrollDownTimeRef = useRef(0)
  const lastResidualFlingTimeRef = useRef(0)
  const lastScrollYRef = useRef(0)
  const [maxReveal, setMaxReveal] = useState(260)
  const [dockHidden, setDockHidden] = useState(false)

  const offset = useMotionValue(0)

  const clearFallTimer = useCallback(() => {
    if (fallTimerRef.current !== null) {
      window.clearTimeout(fallTimerRef.current)
      fallTimerRef.current = null
    }
  }, [])

  const triggerGravityFall = useCallback(() => {
    clearFallTimer()
    const current = offset.get()
    if (current <= 0) {
      fallingRef.current = false
      return
    }
    fallingRef.current = true
    animRef.current?.stop()
    if (reducedMotion) {
      fallingRef.current = false
      offset.set(0)
      return
    }
    const max = Math.max(maxRevealRef.current, 1)
    const duration = clamp(0.12 + (current / max) * 0.12, 0.12, 0.2)
    animRef.current = animate(offset, 0, {
      duration,
      ease: [0.25, 1, 0.5, 1],
      onComplete: () => {
        fallingRef.current = false
      },
    })
  }, [clearFallTimer, offset, reducedMotion])

  const scheduleGravityFall = useCallback(
    (delayMs: number) => {
      clearFallTimer()
      fallTimerRef.current = window.setTimeout(triggerGravityFall, delayMs)
    },
    [clearFallTimer, triggerGravityFall]
  )

  useEffect(() => {
    const onScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop
      const now = performance.now()
      if (scrollY > lastScrollYRef.current + 1) {
        lastScrollDownTimeRef.current = now
      }
      lastScrollYRef.current = scrollY
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    const el = bandRef.current
    if (!el) {
      return
    }
    const updateHeight = () => {
      const next = Math.max(el.offsetHeight, 96)
      maxRevealRef.current = next
      setMaxReveal(next)
      if (offset.get() > next) {
        animRef.current?.stop()
        fallingRef.current = false
        offset.set(next)
      }
    }
    updateHeight()
    const observer = new ResizeObserver(updateHeight)
    observer.observe(el)
    return () => observer.disconnect()
  }, [offset])

  useEffect(() => {
    clearFallTimer()
    animRef.current?.stop()
    fallingRef.current = false
    offset.set(0)
  }, [fitViewport, disabled, clearFallTimer, offset])

  useEffect(() => {
    const applyWeightedDelta = (
      rawDelta: number,
      isTouch: boolean,
      isMouseWheel: boolean
    ): boolean => {
      const max = maxRevealRef.current
      if (fallingRef.current) {
        fallingRef.current = false
        animRef.current?.stop()
      }
      const current = offset.get()

      const scrollY = window.scrollY || document.documentElement.scrollTop
      const windowHeight = window.innerHeight
      const docHeight = document.documentElement.scrollHeight
      const atBottom = fitViewport || windowHeight + scrollY >= docHeight - 3

      if (current <= 0) {
        if (!atBottom || rawDelta <= 0) {
          return false
        }
        if (!fitViewport) {
          const now = performance.now()
          if (
            now - lastScrollDownTimeRef.current < 450 ||
            now - lastResidualFlingTimeRef.current < 250
          ) {
            lastResidualFlingTimeRef.current = now
            return false
          }
        }
      }

      if (rawDelta <= 0 && current <= 0) {
        return false
      }

      clearFallTimer()
      animRef.current?.stop()

      if (rawDelta < 0) {
        const next = clamp(current + rawDelta * (isTouch ? 0.6 : 0.4), 0, max)
        offset.set(next)
        if (next === 0) {
          return true
        }
        if (!isTouch) {
          scheduleGravityFall(isMouseWheel ? 110 : 75)
        }
        return true
      }

      const stepDelta = isTouch
        ? Math.min(rawDelta, 28) * 0.2
        : isMouseWheel
          ? 10
          : Math.min(rawDelta, 22) * 0.095

      const next = clamp(current + stepDelta, 0, max)
      offset.set(next)

      if (next > 0 && !isTouch) {
        scheduleGravityFall(isMouseWheel ? 110 : 75)
      }
      return true
    }

    const onWheel = (event: WheelEvent) => {
      if (
        disabled ||
        event.ctrlKey ||
        isInsideScrollableOverlay(event.target)
      ) {
        return
      }
      const isLineMode = event.deltaMode === 1
      const isMouseWheel = isLineMode || Math.abs(event.deltaY) >= 80
      const scale = isLineMode
        ? 16
        : event.deltaMode === 2
          ? window.innerHeight
          : 1
      const dy = event.deltaY * scale
      if (dy === 0) {
        return
      }
      if (applyWeightedDelta(dy, false, isMouseWheel)) {
        event.preventDefault()
      }
    }

    const onTouchStart = (event: TouchEvent) => {
      if (
        disabled ||
        event.touches.length !== 1 ||
        isInsideScrollableOverlay(event.target)
      ) {
        touchYRef.current = null
        return
      }
      clearFallTimer()
      animRef.current?.stop()
      fallingRef.current = false
      touchYRef.current = event.touches[0].clientY
    }

    const onTouchMove = (event: TouchEvent) => {
      if (
        disabled ||
        touchYRef.current === null ||
        event.touches.length !== 1 ||
        isInsideScrollableOverlay(event.target)
      ) {
        return
      }
      const nextY = event.touches[0].clientY
      const dy = touchYRef.current - nextY
      touchYRef.current = nextY
      if (dy === 0) {
        return
      }
      if (applyWeightedDelta(dy, true, false)) {
        event.preventDefault()
      }
    }

    const onTouchEnd = () => {
      touchYRef.current = null
      if (offset.get() > 0) {
        triggerGravityFall()
      }
    }

    window.addEventListener("wheel", onWheel, { passive: false })
    window.addEventListener("touchstart", onTouchStart, { passive: true })
    window.addEventListener("touchmove", onTouchMove, { passive: false })
    window.addEventListener("touchend", onTouchEnd, { passive: true })
    window.addEventListener("touchcancel", onTouchEnd, { passive: true })

    return () => {
      clearFallTimer()
      animRef.current?.stop()
      window.removeEventListener("wheel", onWheel)
      window.removeEventListener("touchstart", onTouchStart)
      window.removeEventListener("touchmove", onTouchMove)
      window.removeEventListener("touchend", onTouchEnd)
      window.removeEventListener("touchcancel", onTouchEnd)
    }
  }, [
    clearFallTimer,
    disabled,
    fitViewport,
    offset,
    reducedMotion,
    scheduleGravityFall,
    triggerGravityFall,
  ])

  const progress = useTransform(offset, (value) =>
    maxReveal > 0 ? clamp(value / maxReveal, 0, 1) : 0
  )
  const sheetY = useTransform(offset, (value) => -value)
  const edgeOpacity = useTransform(progress, [0, 0.06], [0, 1])
  const dockOpacity = useTransform(progress, [0, 0.1, 0.42], [1, 1, 0])
  const dockY = useTransform(progress, [0, 0.1, 0.45], [0, 0, 22])

  useMotionValueEvent(progress, "change", (latest) => {
    const nextHidden = latest > 0.28
    setDockHidden((prev) => (prev === nextHidden ? prev : nextHidden))
  })

  return (
    <div
      className={cn(
        "relative",
        fitViewport ? "h-dvh overflow-hidden" : "min-h-dvh overflow-x-clip"
      )}
    >
      <div
        ref={bandRef}
        aria-hidden="true"
        className="fixed inset-x-0 bottom-0 z-0 flex items-center justify-center bg-accent px-4 pt-8 pb-[max(2rem,calc(env(safe-area-inset-bottom)+1.25rem))] text-white sm:px-8 sm:pt-10 sm:pb-11"
      >
        <span className="origin-center scale-y-[1.24] pl-[0.08em] font-heading text-[2.75rem] leading-[0.9] font-semibold tracking-[0.08em] whitespace-nowrap text-white uppercase select-none sm:text-[5.25rem] lg:text-[8.75rem] xl:text-[11rem] 2xl:text-[13rem]">
          Gazetteer
        </span>
      </div>

      <motion.div
        style={{ y: sheetY }}
        className="relative z-10 bg-background will-change-transform"
      >
        {children}
        <motion.div
          aria-hidden="true"
          style={{ opacity: edgeOpacity }}
          className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-border/80"
        />
      </motion.div>

      <motion.div
        style={{ opacity: dockOpacity, y: dockY }}
        className={cn(
          "pointer-events-none fixed inset-x-0 bottom-0 z-40",
          dockHidden
            ? "[&>div]:pointer-events-none"
            : "[&>div]:pointer-events-auto"
        )}
      >
        {dock}
      </motion.div>
    </div>
  )
}
