"use client"

import Link from "next/link"
import { RiArrowLeftLine, RiCompass3Line } from "@remixicon/react"
import { Button } from "@/components/ui/button"
import { useCatalog } from "@/hooks/use-catalog"

export function ExploreView() {
  const { catalog } = useCatalog()

  return (
    <section className="mx-auto flex max-w-xl flex-col items-start gap-4 rounded-4xl border bg-card p-6 shadow-xs sm:p-8">
      <div className="flex items-center gap-2 text-primary">
        <RiCompass3Line className="size-5" />
        <span className="font-mono text-xs tracking-wider uppercase">
          Phase 2
        </span>
      </div>
      <h1 className="font-heading text-3xl font-medium text-balance">
        Explore Cities
      </h1>
      <p className="text-sm text-muted-foreground">
        Catalogued spots ready in TiDB:{" "}
        <span className="font-mono font-medium text-foreground tabular-nums">
          {catalog.places.length}
        </span>
        . Full city and category browsing arrives next.
      </p>
      <Button
        variant="outline"
        className="min-h-11 rounded-full px-4"
        nativeButton={false}
        render={<Link href="/" />}
      >
        <RiArrowLeftLine />
        <span>Back to Location of the Day</span>
      </Button>
    </section>
  )
}
