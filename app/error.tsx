"use client"

import { AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
        <AlertCircle className="size-6" />
      </div>
      <h1 className="mb-2 font-heading text-3xl font-medium text-balance sm:text-4xl">
        Something went wrong
      </h1>
      <p className="mb-6 max-w-md text-sm text-muted-foreground">
        {error.message ||
          "An unexpected error occurred while loading this view."}
      </p>
      <Button onClick={reset} variant="outline" className="rounded-full">
        <RefreshCw className="size-4" />
        Try again
      </Button>
    </div>
  )
}
