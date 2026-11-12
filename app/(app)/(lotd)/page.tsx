import { randomInt } from "node:crypto"
import { LotdView } from "@/components/LotdView"

export const dynamic = "force-dynamic"

export default function HomePage() {
  const layoutSeed = randomInt(2)
  const todayLabel = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })

  return <LotdView layoutSeed={layoutSeed} todayLabel={todayLabel} />
}

