import { Skeleton } from "@/components/ui/skeleton"

export default function ExploreLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-9 w-48 rounded-full" />
        <Skeleton className="h-4 w-72 rounded-full" />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Skeleton className="h-9 w-24 rounded-full" />
        <Skeleton className="h-9 w-28 rounded-full" />
        <Skeleton className="h-9 w-20 rounded-full" />
        <Skeleton className="h-9 w-32 rounded-full" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-3 rounded-2xl border p-3">
            <Skeleton className="aspect-[4/3] w-full rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-3/4 rounded-full" />
              <Skeleton className="h-4 w-1/2 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
