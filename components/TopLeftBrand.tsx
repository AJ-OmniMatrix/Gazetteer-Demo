"use client"

import Link from "next/link"
import { AnimatePresence, motion } from "motion/react"
import { DURATION_ENTER, DURATION_EXIT, EASE_IN, EASE_OUT } from "@/lib/motion"

interface TopLeftBrandProps {
  visible: boolean
}

export function TopLeftBrand({ visible }: TopLeftBrandProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="top-left-brand"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{
            opacity: 0,
            y: -6,
            transition: { duration: DURATION_EXIT, ease: EASE_IN },
          }}
          transition={{ duration: DURATION_ENTER, ease: EASE_OUT }}
          style={{ viewTransitionName: "top-left-brand" }}
          className="fixed top-[max(1rem,env(safe-area-inset-top))] left-[max(1.25rem,calc(env(safe-area-inset-left)+0.5rem))] z-40 flex h-11 items-center sm:h-12"
        >
          <Link
            href="/"
            prefetch={true}
            aria-label="Gazetteer Home"
            className="font-heading text-2xl font-bold tracking-wide text-foreground transition-opacity hover:opacity-80 active:scale-[0.98] sm:text-3xl"
          >
            Gazetteer
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
