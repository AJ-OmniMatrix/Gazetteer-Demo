import type { Metadata, Viewport } from "next"
import { EB_Garamond, IBM_Plex_Sans, JetBrains_Mono } from "next/font/google"
import { cn } from "@/lib/utils"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
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
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
