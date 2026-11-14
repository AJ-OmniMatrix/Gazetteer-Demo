"use client"

import type { ElementType } from "react"
import { motion, useReducedMotion } from "motion/react"
import { DURATION_ENTER, EASE_OUT, ROW_STAGGER } from "@/lib/motion"
import { cn } from "@/lib/utils"

export interface BlurTextProps {
  text: string
  as?: ElementType
  delay?: number
  className?: string
  trigger?: "load" | "view" | "hover" | "click"
  animateBy?: "words" | "letters"
}

export default function BlurText({
  text,
  as: Component = "h1",
  delay = ROW_STAGGER * 1000,
  className,
}: BlurTextProps) {
  const reducedMotion = useReducedMotion()
  const words = text.split(" ")
  const staggerSec = delay / 1000

  return (
    <Component className={cn("flex flex-wrap items-center", className)}>
      <span className="sr-only select-none">{text}</span>
      {words.map((word, i) => (
        <span key={`${word}-${i}`} className="inline-block overflow-hidden">
          <motion.span
            aria-hidden="true"
            initial={reducedMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: DURATION_ENTER,
              ease: EASE_OUT,
              delay: i * staggerSec,
            }}
            className="inline-block"
          >
            {word}&nbsp;
          </motion.span>
        </span>
      ))}
    </Component>
  )
}
