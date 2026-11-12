"use server"

import { revalidatePath } from "next/cache"
import { checkInPlace, searchPlacesSql, undoCheckIn } from "@/db/queries"
import type { PlaceSummary, VisitSource } from "@/lib/types"

export async function checkInAction(
  placeId: number,
  source: VisitSource,
  idempotencyKey: string
): Promise<{ ok: boolean; alreadyVisited?: boolean; error?: string }> {
  try {
    const result = await checkInPlace(placeId, source, idempotencyKey)
    revalidatePath("/", "layout")
    return { ok: true, alreadyVisited: result.alreadyVisited }
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to save visit",
    }
  }
}

export async function undoCheckInAction(
  placeId: number
): Promise<{ ok: boolean; error?: string }> {
  try {
    await undoCheckIn(placeId)
    revalidatePath("/", "layout")
    return { ok: true }
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to undo visit",
    }
  }
}

export async function searchPlacesAction(
  query: string
): Promise<PlaceSummary[]> {
  return searchPlacesSql(query, 8)
}
