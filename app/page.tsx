import { ViewTransition } from "react"
import { LotdView } from "@/components/LotdView"

export const dynamic = "force-dynamic"

export default function HomePage() {
  const now = new Date()
  const layoutSeed = Math.floor(now.getTime() / 86400000) % 2
  const todayLabel = now.toLocaleDateString("en-US", {
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
