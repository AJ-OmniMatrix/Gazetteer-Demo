import { randomInt } from "node:crypto"
import { ViewTransition } from "react"
import { DbSetupNotice } from "@/components/DbSetupNotice"
import { GazetteerShell } from "@/components/GazetteerShell"
import { LotdView } from "@/components/LotdView"
import { getCatalogData } from "@/db/queries"

export const dynamic = "force-dynamic"

export default async function HomePage() {
  let data
  try {
    data = await getCatalogData()
  } catch (error) {
    return (
      <DbSetupNotice
        message={error instanceof Error ? error.message : "Database error"}
      />
    )
  }

  const layoutSeed = randomInt(2)
  const todayLabel = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })

  return (
    <ViewTransition>
      <GazetteerShell initialData={data} fitViewport>
        <LotdView
          initialData={data}
          layoutSeed={layoutSeed}
          todayLabel={todayLabel}
        />
      </GazetteerShell>
    </ViewTransition>
  )
}
