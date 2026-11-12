"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { decode } from "blurhash"
import { motion } from "motion/react"
import { EASE_OUT } from "@/lib/motion"
import { cn } from "@/lib/utils"

interface BlurHashImageProps {
  src: string
  alt: string
  blurhash: string
  width: number
  height: number
  fill?: boolean
  className?: string
  imgClassName?: string
}

export function BlurHashImage({
  src,
  alt,
  blurhash,
  width,
  height,
  fill = false,
  className,
  imgClassName,
}: BlurHashImageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !blurhash) {
      return
    }
    try {
      const pixels = decode(blurhash, 32, 24)
      const ctx = canvas.getContext("2d")
      if (!ctx) {
        return
      }
      const imageData = ctx.createImageData(32, 24)
      imageData.data.set(pixels)
      ctx.putImageData(imageData, 0, 0)
    } catch {}
  }, [blurhash])

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-muted",
        fill && "size-full",
        className
      )}
      style={fill ? undefined : { aspectRatio: `${width} / ${height}` }}
    >
      <canvas
        ref={canvasRef}
        width={32}
        height={24}
        aria-hidden="true"
        className="absolute inset-0 size-full object-cover"
      />
      <motion.div
        initial={false}
        animate={
          loaded
            ? {
                opacity: 1,
                scale: 1,
                clipPath: "inset(0% 0% 0% 0%)",
              }
            : {
                opacity: 0,
                scale: 1.02,
                clipPath: "inset(6% 0% 0% 0%)",
              }
        }
        transition={{ duration: 0.32, ease: EASE_OUT }}
        className={cn(fill ? "absolute inset-0" : "relative size-full")}
      >
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          unoptimized
          onLoad={() => setLoaded(true)}
          className={cn("size-full object-cover", imgClassName)}
        />
      </motion.div>
    </div>
  )
}
