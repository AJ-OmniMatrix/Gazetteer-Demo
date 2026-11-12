"use client"

import { useEffect, useRef, useState, type Ref } from "react"
import Image from "next/image"
import { decode } from "blurhash"
import gsap from "gsap"
import { GSAP_EASE_OUT } from "@/lib/motion"
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
  mediaRef?: Ref<HTMLDivElement>
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
  mediaRef,
}: BlurHashImageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const revealRef = useRef<HTMLDivElement>(null)
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

  useEffect(() => {
    const el = revealRef.current
    if (!el || !loaded) {
      return
    }
    const mm = gsap.matchMedia()
    mm.add(
      {
        reduce: "(prefers-reduced-motion: reduce)",
        normal: "(min-width: 0px)",
      },
      (context) => {
        if (context.conditions?.reduce) {
          gsap.set(el, {
            opacity: 1,
            scale: 1,
            clipPath: "inset(0% 0% 0% 0%)",
          })
          return
        }
        gsap.fromTo(
          el,
          {
            opacity: 0,
            scale: 1.02,
            clipPath: "inset(6% 0% 0% 0%)",
          },
          {
            opacity: 1,
            scale: 1,
            clipPath: "inset(0% 0% 0% 0%)",
            duration: 0.32,
            ease: GSAP_EASE_OUT,
            clearProps: "transform,clipPath",
            force3D: true,
          }
        )
      }
    )
    return () => {
      mm.revert()
      gsap.killTweensOf(el)
    }
  }, [loaded])

  return (
    <div
      className={cn(
        "relative isolate overflow-hidden bg-muted",
        fill && "size-full",
        className
      )}
      style={fill ? undefined : { aspectRatio: `${width} / ${height}` }}
    >
      <div
        ref={mediaRef}
        className={cn(
          fill ? "absolute inset-0" : "relative size-full",
          "will-change-transform"
        )}
      >
        <canvas
          ref={canvasRef}
          width={32}
          height={24}
          aria-hidden="true"
          className="absolute inset-0 size-full object-cover"
        />
        <div
          ref={revealRef}
          className={cn(
            fill ? "absolute inset-0" : "relative size-full",
            "opacity-0"
          )}
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
        </div>
      </div>
    </div>
  )
}
