"use client"

import Link from "next/link"
import { RiArrowLeftLine, RiListCheck2 } from "@remixicon/react"
import { Button } from "@/components/ui/button"
import { useCatalog } from "@/hooks/use-catalog"

export function ListView() {
  const { visitedSet } = useCatalog()

  return (
    <section className="mx-auto flex max-w-xl flex-col items-start gap-4 rounded-4xl border bg-card p-6 shadow-xs sm:p-8">
      <div className="flex items-center gap-2 text-primary">
        <RiListCheck2 className="size-5" />
        <span className="font-mono text-xs tracking-wider uppercase">
          Phase 2
        </span>
      </div>
      <h1 className="font-heading text-3xl font-medium text-balance">
        Your Travel List
      </h1>
      <p className="text-sm text-muted-foreground">
        Saved check-ins currently logged:{" "}
        <span className="font-mono font-medium text-foreground tabular-nums">
          {visitedSet.size}
        </span>
        . Full list filtering and timeline views arrive next.
      </p>
      <Button
        variant="outline"
        className="min-h-11 rounded-full px-4"
        render={<Link href="/" />}
      >
        <RiArrowLeftLine />
        <span>Back to Location of the Day</span>
      </Button>
    </section>
  )
}

