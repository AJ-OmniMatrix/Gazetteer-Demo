"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { decode } from "blurhash"
import { cn } from "@/lib/utils"

const blurhashCache = new Map<string, ImageData>()

interface BlurHashImageProps {
  src: string
  alt: string
  blurhash: string
  width: number
  height: number
  fill?: boolean
  className?: string
  imgClassName?: string
  loading?: "eager" | "lazy"
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
  loading,
}: BlurHashImageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !blurhash) return
    try {
      const ctx = canvas.getContext("2d")
      if (!ctx) return
      let imageData = blurhashCache.get(blurhash)
      if (!imageData) {
        const pixels = decode(blurhash, 8, 6)
        imageData = ctx.createImageData(8, 6)
        imageData.data.set(pixels)
        blurhashCache.set(blurhash, imageData)
      }
      ctx.putImageData(imageData, 0, 0)
    } catch {}
  }, [blurhash])

  return (
    <div
      className={cn(
        "relative isolate overflow-hidden bg-muted",
        fill && "size-full",
        className
      )}
      style={fill ? undefined : { aspectRatio: `${width} / ${height}` }}
    >
      <div className={cn(fill ? "absolute inset-0" : "relative size-full")}>
        <canvas
          ref={canvasRef}
          width={8}
          height={6}
          aria-hidden="true"
          className="absolute inset-0 size-full object-cover"
        />
        <div
          className={cn(
            fill ? "absolute inset-0" : "relative size-full",
            "transition-all duration-300 ease-out motion-reduce:transition-none",
            loaded ? "scale-100 opacity-100" : "scale-[1.02] opacity-0"
          )}
        >
          <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            loading={loading}
            unoptimized
            onLoad={() => setLoaded(true)}
            className={cn("size-full object-cover", imgClassName)}
          />
        </div>
      </div>
    </div>
  )
}
