"use client"

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
  size?: "default" | "sm"
  className?: string
  onClick: () => void
}

export function VisitStatusButton({
  visited,
  activeLabel,
  idleLabel,
  disabled = false,
  size = "default",
  className,
  onClick,
}: VisitStatusButtonProps) {
  return (
    <motion.div
      animate={{ scale: visited ? [1, 1.04, 1] : 1 }}
      transition={{ duration: DURATION_ENTER, ease: EASE_OUT }}
    >
      <Button
        variant={visited ? "secondary" : "default"}
        size={size}
        className={cn("rounded-full", className)}
        disabled={disabled}
        onClick={onClick}
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
            className="inline-flex items-center gap-1.5"
          >
            {visited ? (
              <Check className="size-4" />
            ) : (
              <Plus className="size-4" />
            )}
            <span>{visited ? activeLabel : idleLabel}</span>
          </motion.span>
        </AnimatePresence>
      </Button>
    </motion.div>
  )
}
