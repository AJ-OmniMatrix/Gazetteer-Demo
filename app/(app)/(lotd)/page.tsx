import { randomInt } from "node:crypto"
import { ViewTransition } from "react"
import { LotdView } from "@/components/LotdView"

export const dynamic = "force-dynamic"

export default function HomePage() {
  const layoutSeed = randomInt(2)
  const todayLabel = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })

  return (
    <ViewTransition enter="page-fade" exit="page-fade" default="none">
      <LotdView layoutSeed={layoutSeed} todayLabel={todayLabel} />
    </ViewTransition>
  )
}
