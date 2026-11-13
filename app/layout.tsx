import type { Metadata, Viewport } from "next"
import type { ReactNode } from "react"
import { EB_Garamond, IBM_Plex_Sans, JetBrains_Mono } from "next/font/google"
import { cn } from "@/lib/utils"
import { ThemeProvider } from "@/components/theme-provider"
import { DbSetupNotice } from "@/components/DbSetupNotice"
import { GazetteerShell } from "@/components/GazetteerShell"
import { getCatalogData } from "@/db/queries"
import { getSessionUser } from "@/lib/auth"
import "./globals.css"

export const dynamic = "force-dynamic"

const ebGaramondHeading = EB_Garamond({
  subsets: ["latin"],
  variable: "--font-heading",
})

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: "Gazetteer — Travel Catalogue",
  description: "Personal travel catalogue and location tracker.",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  let data
  let dbError: string | null = null
  try {
    const user = await getSessionUser()
    data = await getCatalogData(user)
  } catch (error) {
    dbError = error instanceof Error ? error.message : "Database error"
  }

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        jetbrainsMono.variable,
        "font-sans",
        ibmPlexSans.variable,
        ebGaramondHeading.variable
      )}
    >
      <body
        suppressHydrationWarning
        className="min-h-dvh bg-background text-foreground selection:bg-primary/15"
      >
        <ThemeProvider>
          {dbError || !data ? (
            <DbSetupNotice message={dbError ?? "Database error"} />
          ) : (
            <GazetteerShell initialData={data}>{children}</GazetteerShell>
          )}
        </ThemeProvider>
      </body>
    </html>
  )
}
