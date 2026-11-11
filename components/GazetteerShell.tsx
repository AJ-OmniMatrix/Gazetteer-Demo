"use client"

import { useState, type ReactNode } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Toaster } from "@/components/ui/sonner"
import { CommandMenu } from "@/components/CommandMenu"
import { FloatingDock } from "@/components/FloatingDock"
import { TopRightPill } from "@/components/TopRightPill"
import { useCatalog } from "@/hooks/use-catalog"
import type { CatalogPayload } from "@/lib/types"

interface GazetteerShellProps {
  initialData: CatalogPayload
  children: ReactNode
}

function InnerShell({ initialData, children }: GazetteerShellProps) {
  const { catalog, visitedSet, checkIn } = useCatalog(initialData)
  const [commandOpen, setCommandOpen] = useState(false)
  const [gpsOpen, setGpsOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)

  return (
    <>
      <TopRightPill
        user={catalog.user}
        mode={catalog.mode}
        visitedCount={visitedSet.size}
        helpOpen={helpOpen}
        onHelpOpenChange={setHelpOpen}
        onOpenCommand={() => setCommandOpen(true)}
      />

      <main className="mx-auto min-h-dvh w-full max-w-4xl px-4 pt-20 pb-32 sm:px-8 sm:pt-24">
        {children}
      </main>

      <FloatingDock
        places={catalog.places}
        visitedSet={visitedSet}
        gpsOpen={gpsOpen}
        onGpsOpenChange={setGpsOpen}
        searchOpen={searchOpen}
        onSearchOpenChange={setSearchOpen}
        onCheckIn={checkIn}
      />

      <CommandMenu
        open={commandOpen}
        onOpenChange={setCommandOpen}
        places={catalog.places}
        visitedSet={visitedSet}
        onOpenGps={() => setGpsOpen(true)}
        onOpenSearch={() => setSearchOpen(true)}
        onOpenHelp={() => setHelpOpen(true)}
        onCheckIn={(place) => checkIn(place, "search")}
      />

      <Toaster position="top-center" />
    </>
  )
}

export function GazetteerShell({ initialData, children }: GazetteerShellProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <InnerShell initialData={initialData}>{children}</InnerShell>
    </QueryClientProvider>
  )
}

