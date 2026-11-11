"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { decode } from "blurhash"
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
      className={cn("relative overflow-hidden bg-muted", fill && "size-full", className)}
      style={fill ? undefined : { aspectRatio: `${width} / ${height}` }}
    >
      <canvas
        ref={canvasRef}
        width={32}
        height={24}
        aria-hidden="true"
        className="absolute inset-0 size-full object-cover"
      />
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        unoptimized
        onLoad={() => setLoaded(true)}
        className={cn(
          "relative size-full object-cover transition-opacity duration-300",
          loaded ? "opacity-100" : "opacity-0",
          imgClassName
        )}
      />
    </div>
  )
}
