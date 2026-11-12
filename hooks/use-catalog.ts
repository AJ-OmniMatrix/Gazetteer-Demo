"use client"

import { useMemo } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { checkInAction, undoCheckInAction } from "@/app/actions"
import type { CatalogPayload, PlaceSummary, VisitSource } from "@/lib/types"

async function fetchCatalog(): Promise<CatalogPayload> {
  const res = await fetch("/api/catalog")
  if (!res.ok) {
    throw new Error("Failed to load catalog")
  }
  return res.json()
}

export function useCatalog(initialData?: CatalogPayload) {
  const queryClient = useQueryClient()
  const seedData =
    initialData ?? queryClient.getQueryData<CatalogPayload>(["catalog"])

  const query = useQuery({
    queryKey: ["catalog"],
    queryFn: fetchCatalog,
    initialData: seedData,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  })

  const visitedIds = query.data?.visitedIds
  const visitedSet = useMemo(() => new Set(visitedIds ?? []), [visitedIds])

  const undoMutation = useMutation({
    mutationFn: async (place: PlaceSummary) => {
      const res = await undoCheckInAction(place.id)
      if (!res.ok) {
        throw new Error(res.error ?? "Could not remove visit")
      }
    },
    onMutate: async (place) => {
      await queryClient.cancelQueries({ queryKey: ["catalog"] })
      const prev = queryClient.getQueryData<CatalogPayload>(["catalog"])
      queryClient.setQueryData<CatalogPayload>(["catalog"], (old) => {
        if (!old) {
          return old
        }
        return {
          ...old,
          visitedIds: old.visitedIds.filter((id) => id !== place.id),
          lotd:
            old.lotd.id === place.id
              ? { ...old.lotd, visited: false }
              : old.lotd,
        }
      })
      return { prev }
    },
    onError: (err, _place, ctx) => {
      if (ctx?.prev) {
        queryClient.setQueryData(["catalog"], ctx.prev)
      }
      toast.error(err instanceof Error ? err.message : "Failed to undo visit")
    },
    onSuccess: (_data, place) => {
      toast.info(`Removed ${place.name} from your list`)
      queryClient.invalidateQueries({ queryKey: ["catalog"] })
    },
  })

  const checkInMutation = useMutation({
    mutationFn: async ({
      place,
      source,
      idempotencyKey,
    }: {
      place: PlaceSummary
      source: VisitSource
      idempotencyKey: string
    }) => {
      const res = await checkInAction(place.id, source, idempotencyKey)
      if (!res.ok) {
        throw new Error(res.error ?? "Check-in failed")
      }
      return res
    },
    onMutate: async ({ place }) => {
      await queryClient.cancelQueries({ queryKey: ["catalog"] })
      const prev = queryClient.getQueryData<CatalogPayload>(["catalog"])
      queryClient.setQueryData<CatalogPayload>(["catalog"], (old) => {
        if (!old) {
          return old
        }
        const nextIds = old.visitedIds.includes(place.id)
          ? old.visitedIds
          : [...old.visitedIds, place.id]
        return {
          ...old,
          visitedIds: nextIds,
          lotd:
            old.lotd.id === place.id
              ? { ...old.lotd, visited: true }
              : old.lotd,
        }
      })
      return { prev }
    },
    onError: (err, _vars, ctx) => {
      if (ctx?.prev) {
        queryClient.setQueryData(["catalog"], ctx.prev)
      }
      toast.error(err instanceof Error ? err.message : "Could not save visit")
    },
    onSuccess: (res, { place }) => {
      queryClient.invalidateQueries({ queryKey: ["catalog"] })
      if (res.alreadyVisited) {
        toast.info(`${place.name} is already in your list`)
        return
      }
      toast.success(`Added ${place.name}`, {
        description: `${place.cityName}, ${place.countryCode}`,
        action: {
          label: "Undo",
          onClick: () => undoMutation.mutate(place),
        },
      })
    },
  })

  const checkIn = (place: PlaceSummary, source: VisitSource) => {
    checkInMutation.mutate({
      place,
      source,
      idempotencyKey: crypto.randomUUID(),
    })
  }

  const catalog = query.data ?? seedData
  if (!catalog) {
    throw new Error("useCatalog must be used within GazetteerShell")
  }

  return {
    catalog,
    visitedSet,
    checkIn,
    undoCheckIn: (place: PlaceSummary) => undoMutation.mutate(place),
    isPending: checkInMutation.isPending || undoMutation.isPending,
  }
}
