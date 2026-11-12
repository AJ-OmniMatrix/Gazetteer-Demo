import type { ReactNode } from "react"
import { DbSetupNotice } from "@/components/DbSetupNotice"
import { GazetteerShell } from "@/components/GazetteerShell"
import { getCatalogData } from "@/db/queries"

export const dynamic = "force-dynamic"

export default async function AppLayout({ children }: { children: ReactNode }) {
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

  return <GazetteerShell initialData={data}>{children}</GazetteerShell>
}

