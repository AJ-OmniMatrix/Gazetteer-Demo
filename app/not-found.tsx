import Link from "next/link"
import { Compass, Home } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Compass className="size-6" />
      </div>
      <h1 className="mb-2 font-heading text-3xl font-medium text-balance sm:text-4xl">
        Lost on the Map
      </h1>
      <p className="mb-6 max-w-md text-sm text-muted-foreground">
        The page you are looking for does not exist or has been relocated.
      </p>
      <Button
        variant="outline"
        className="rounded-full"
        nativeButton={false}
        render={<Link href="/" prefetch={true} />}
      >
        <Home className="size-4" />
        <span>Back to Gazetteer</span>
      </Button>
    </div>
  )
}
