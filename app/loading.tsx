import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <main className="mx-auto min-h-dvh w-full max-w-4xl px-4 pt-20 pb-32 sm:px-8 sm:pt-24">
      <div className="flex flex-col gap-6 sm:gap-8">
        <div className="flex flex-col items-center gap-3">
          <Skeleton className="h-4 w-28 rounded-full" />
          <Skeleton className="h-11 w-72 rounded-full sm:w-96" />
        </div>
        <div className="grid grid-cols-6 gap-2.5 sm:gap-3">
          <Skeleton className="col-span-6 min-h-60 rounded-3xl sm:col-span-4 sm:row-span-2" />
          <Skeleton className="col-span-3 min-h-36 rounded-3xl sm:col-span-2" />
          <Skeleton className="col-span-3 min-h-36 rounded-3xl sm:col-span-2" />
          <Skeleton className="col-span-2 min-h-40 rounded-3xl" />
          <Skeleton className="col-span-2 min-h-40 rounded-3xl" />
          <Skeleton className="col-span-2 min-h-40 rounded-3xl" />
        </div>
        <Skeleton className="h-32 w-full rounded-4xl" />
      </div>
    </main>
  )
}

