"use client"

import Link from "next/link"
import { Compass } from "lucide-react"
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
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{
            opacity: 0,
            y: -8,
            transition: { duration: DURATION_EXIT, ease: EASE_IN },
          }}
          transition={{ duration: DURATION_ENTER, ease: EASE_OUT }}
          style={{ viewTransitionName: "top-left-brand" }}
          className="fixed top-[max(1rem,env(safe-area-inset-top))] left-[max(1rem,env(safe-area-inset-left))] z-40 flex items-center"
        >
          <Link
            href="/"
            prefetch={true}
            aria-label="Gazetteer Home"
            className="group flex h-12 items-center gap-2.5 rounded-full border border-border/80 bg-background/90 px-3.5 shadow-sm backdrop-blur-md transition-colors hover:border-border hover:bg-accent/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <div className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform duration-200 group-hover:scale-105 group-active:scale-95">
              <Compass className="size-4 shrink-0 transition-transform duration-300 ease-out group-hover:rotate-45" />
            </div>
            <span className="font-heading text-base font-semibold tracking-tight text-foreground">
              Gazetteer
            </span>
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
