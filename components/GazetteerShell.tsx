"use client"

import { useState, type ReactNode } from "react"
import { usePathname } from "next/navigation"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { MotionConfig } from "motion/react"
import { Toaster } from "@/components/ui/sonner"
import { FloatingDock } from "@/components/FloatingDock"
import { TopRightPill } from "@/components/TopRightPill"
import { ScrollReveal } from "@/components/ScrollReveal"
import { AuthProvider } from "@/components/auth-context"
import { useCatalog } from "@/hooks/use-catalog"
import type { CatalogPayload } from "@/lib/types"

interface GazetteerShellProps {
  initialData: CatalogPayload
  children: ReactNode
}

function InnerShell({ initialData, children }: GazetteerShellProps) {
  const pathname = usePathname()
  const fitViewport = pathname === "/"
  const { catalog, visitedSet, checkIn, logout, openAuth } =
    useCatalog(initialData)
  const [gpsOpen, setGpsOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)

  return (
    <MotionConfig reducedMotion="user">
      <TopRightPill
        user={catalog.user}
        mode={catalog.mode}
        visitedCount={visitedSet.size}
        helpOpen={helpOpen}
        onHelpOpenChange={setHelpOpen}
        onOpenAuth={() => openAuth()}
        onLogout={logout}
      />

      <ScrollReveal
        fitViewport={fitViewport}
        disabled={gpsOpen || searchOpen || helpOpen}
        dock={
          <FloatingDock
            places={catalog.places}
            visitedSet={visitedSet}
            gpsOpen={gpsOpen}
            onGpsOpenChange={setGpsOpen}
            searchOpen={searchOpen}
            onSearchOpenChange={setSearchOpen}
            onCheckIn={checkIn}
          />
        }
      >
        <main
          className={
            fitViewport
              ? "mx-auto flex h-dvh w-full max-w-6xl flex-col overflow-hidden px-4 pt-[max(4.25rem,calc(env(safe-area-inset-top)+3.25rem))] pb-[max(5.75rem,calc(env(safe-area-inset-bottom)+4.75rem))] sm:px-8 sm:pt-6 sm:pb-24"
              : "mx-auto min-h-dvh w-full max-w-4xl px-4 pt-20 pb-32 sm:px-8 sm:pt-24"
          }
        >
          {children}
        </main>
      </ScrollReveal>

      <Toaster position="top-center" />
    </MotionConfig>
  )
}

export function GazetteerShell({ initialData, children }: GazetteerShellProps) {
  const [queryClient] = useState(() => {
    const client = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 30_000,
        },
      },
    })
    client.setQueryData(["catalog"], initialData)
    return client
  })

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider
        onAuthSuccess={() =>
          queryClient.invalidateQueries({ queryKey: ["catalog"] })
        }
      >
        <InnerShell initialData={initialData}>{children}</InnerShell>
      </AuthProvider>
    </QueryClientProvider>
  )
}
