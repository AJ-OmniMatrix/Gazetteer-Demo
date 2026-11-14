"use client"

import { useState } from "react"
import type { LucideIcon } from "lucide-react"
import { Check, Plus } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import { Button } from "@/components/ui/button"
import { DURATION_ENTER, DURATION_EXIT, EASE_IN, EASE_OUT } from "@/lib/motion"
import { cn } from "@/lib/utils"

interface VisitStatusButtonProps {
  visited: boolean
  activeLabel: string
  idleLabel: string
  disabled?: boolean
  size?: "default" | "sm" | "icon"
  iconOnly?: boolean
  idleIcon?: LucideIcon
  activeIcon?: LucideIcon
  className?: string
  onClick: () => void
}

export function VisitStatusButton({
  visited,
  activeLabel,
  idleLabel,
  disabled = false,
  size = "default",
  iconOnly = false,
  idleIcon: IdleIcon = Plus,
  activeIcon: ActiveIcon = Check,
  className,
  onClick,
}: VisitStatusButtonProps) {
  const Icon = visited ? ActiveIcon : IdleIcon
  const label = visited ? activeLabel : idleLabel
  const [prevVisited, setPrevVisited] = useState(visited)

  if (visited !== prevVisited) {
    setPrevVisited(visited)
  }

  const shouldPulse = visited && !prevVisited

  return (
    <motion.div
      initial={false}
      animate={shouldPulse ? { scale: [1, 1.04, 1] } : { scale: 1 }}
      transition={{ duration: DURATION_ENTER, ease: EASE_OUT }}
    >
      <Button
        variant={visited ? "secondary" : "default"}
        size={iconOnly ? "icon" : size}
        className={cn(
          "rounded-full transition-[colors,transform]",
          visited && "border border-border/80 text-foreground",
          className
        )}
        disabled={disabled}
        onClick={onClick}
        aria-label={label}
        title={label}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={visited ? "visited" : "idle"}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{
              opacity: 0,
              scale: 0.92,
              transition: { duration: DURATION_EXIT, ease: EASE_IN },
            }}
            transition={{ duration: DURATION_ENTER, ease: EASE_OUT }}
            className={cn(
              "inline-flex items-center justify-center",
              !iconOnly && "gap-1.5"
            )}
          >
            <Icon className={iconOnly ? "size-5" : "size-4"} />
            {!iconOnly && <span>{label}</span>}
          </motion.span>
        </AnimatePresence>
      </Button>
    </motion.div>
  )
}
