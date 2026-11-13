"use client"

import { useMemo } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { checkInAction, logoutAction, undoCheckInAction } from "@/app/actions"
import { useAuth } from "@/components/auth-context"
import type {
  CatalogPayload,
  PlaceSummary,
  UserVisitItem,
  VisitSource,
} from "@/lib/types"

async function fetchCatalog(): Promise<CatalogPayload> {
  const res = await fetch("/api/catalog")
  if (!res.ok) {
    throw new Error("Failed to load catalog")
  }
  return res.json()
}

export function useCatalog(initialData?: CatalogPayload) {
  const queryClient = useQueryClient()
  const { openAuth } = useAuth()
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
      await queryClient.cancelQueries({ queryKey: ["user-visits"] })

      const prev = queryClient.getQueryData<CatalogPayload>(["catalog"])
      const prevVisits = queryClient.getQueriesData<UserVisitItem[]>({
        queryKey: ["user-visits"],
      })

      queryClient.setQueryData<CatalogPayload>(["catalog"], (old) => {
        if (!old) {
          return old
        }
        return {
          ...old,
          visitedIds: old.visitedIds.filter((id) => id !== place.id),
          lotd:
            old.lotd && old.lotd.id === place.id
              ? { ...old.lotd, visited: false }
              : old.lotd,
        }
      })

      queryClient.setQueriesData<UserVisitItem[]>(
        { queryKey: ["user-visits"] },
        (old) => (old ? old.filter((v) => v.place.id !== place.id) : old)
      )

      return { prev, prevVisits }
    },
    onError: (err, _place, ctx) => {
      if (ctx?.prev) {
        queryClient.setQueryData(["catalog"], ctx.prev)
      }
      if (ctx?.prevVisits) {
        for (const [key, val] of ctx.prevVisits) {
          queryClient.setQueryData(key, val)
        }
      }
      toast.error(err instanceof Error ? err.message : "Failed to undo visit")
    },
    onSuccess: (_data, place) => {
      toast.info(`Removed ${place.name} from your list`)
      queryClient.invalidateQueries({ queryKey: ["catalog"] })
      queryClient.invalidateQueries({ queryKey: ["user-visits"] })
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
    onMutate: async ({ place, source }) => {
      await queryClient.cancelQueries({ queryKey: ["catalog"] })
      await queryClient.cancelQueries({ queryKey: ["user-visits"] })

      const prev = queryClient.getQueryData<CatalogPayload>(["catalog"])
      const prevVisits = queryClient.getQueriesData<UserVisitItem[]>({
        queryKey: ["user-visits"],
      })

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
            old.lotd && old.lotd.id === place.id
              ? { ...old.lotd, visited: true }
              : old.lotd,
        }
      })

      const optimisticVisit: UserVisitItem = {
        id: -Date.now(),
        placeId: place.id,
        source,
        visitedAt: new Date().toISOString(),
        place,
      }

      queryClient.setQueriesData<UserVisitItem[]>(
        { queryKey: ["user-visits"] },
        (old) =>
          old
            ? [optimisticVisit, ...old.filter((v) => v.place.id !== place.id)]
            : [optimisticVisit]
      )

      return { prev, prevVisits }
    },
    onError: (err, _vars, ctx) => {
      if (ctx?.prev) {
        queryClient.setQueryData(["catalog"], ctx.prev)
      }
      if (ctx?.prevVisits) {
        for (const [key, val] of ctx.prevVisits) {
          queryClient.setQueryData(key, val)
        }
      }
      toast.error(err instanceof Error ? err.message : "Could not save visit")
    },
    onSuccess: (res, { place }) => {
      queryClient.invalidateQueries({ queryKey: ["catalog"] })
      queryClient.invalidateQueries({ queryKey: ["user-visits"] })
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

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await logoutAction()
    },
    onSuccess: () => {
      toast.info("Signed out")
      queryClient.invalidateQueries({ queryKey: ["catalog"] })
    },
  })

  const checkIn = (place: PlaceSummary, source: VisitSource) => {
    const user = query.data?.user ?? seedData?.user
    if (!user) {
      openAuth("Sign in to save this place to your travel list")
      return
    }
    checkInMutation.mutate({
      place,
      source,
      idempotencyKey: crypto.randomUUID(),
    })
  }

  const undoCheckIn = (place: PlaceSummary) => {
    const user = query.data?.user ?? seedData?.user
    if (!user) {
      openAuth("Sign in to manage your travel list")
      return
    }
    undoMutation.mutate(place)
  }

  const catalog = query.data ?? seedData
  if (!catalog) {
    throw new Error("useCatalog must be used within GazetteerShell")
  }

  return {
    catalog,
    visitedSet,
    checkIn,
    undoCheckIn,
    logout: () => logoutMutation.mutate(),
    openAuth,
    isPending: checkInMutation.isPending || undoMutation.isPending,
  }
}
