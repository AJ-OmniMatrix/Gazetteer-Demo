import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <main className="mx-auto flex h-dvh w-full max-w-6xl flex-col overflow-hidden px-4 pt-[max(4.25rem,calc(env(safe-area-inset-top)+3.25rem))] pb-[max(5.75rem,calc(env(safe-area-inset-bottom)+4.75rem))] sm:px-8 sm:pt-6 sm:pb-24">
      <div className="flex min-h-0 flex-1 flex-col justify-center gap-3 sm:gap-4">
        <div className="flex shrink-0 flex-col items-center gap-2">
          <Skeleton className="h-3.5 w-28 rounded-full" />
          <Skeleton className="h-9 w-64 rounded-full sm:h-11 sm:w-88" />
        </div>
        <div className="grid max-h-[min(54vw,32rem)] min-h-0 w-full flex-1 grid-cols-12 grid-rows-[repeat(2,minmax(0,1fr))] gap-2 sm:gap-3">
          <Skeleton className="col-span-4 row-span-2 min-h-0 rounded-2xl sm:rounded-3xl" />
          <Skeleton className="col-span-5 min-h-0 rounded-2xl sm:rounded-3xl" />
          <Skeleton className="col-span-3 min-h-0 rounded-2xl sm:rounded-3xl" />
          <Skeleton className="col-span-2 min-h-0 rounded-2xl sm:rounded-3xl" />
          <Skeleton className="col-span-3 min-h-0 rounded-2xl sm:rounded-3xl" />
          <Skeleton className="col-span-3 min-h-0 rounded-2xl sm:rounded-3xl" />
        </div>
        <div className="mt-2 flex shrink-0 flex-col justify-between gap-3 sm:mt-3 sm:flex-row sm:items-center sm:gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-4 w-36 rounded-full" />
            </div>
            <Skeleton className="h-8 w-56 rounded-full" />
            <Skeleton className="h-4 w-80 max-w-full rounded-full" />
          </div>
          <div className="flex shrink-0 items-center gap-2.5">
            <Skeleton className="h-11 w-36 rounded-full" />
            <Skeleton className="h-11 w-32 rounded-full" />
          </div>
        </div>
      </div>
    </main>
  )
}
