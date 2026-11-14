"use server"

import { revalidatePath } from "next/cache"
import {
  checkInPlace,
  getUserVisits,
  searchPlacesSql,
  undoCheckIn,
} from "@/db/queries"
import {
  destroySession,
  developerLogin,
  getSessionUser,
  loginOrRegister,
  loginUser,
  registerUser,
} from "@/lib/auth"
import type {
  PlaceSummary,
  User,
  UserVisitItem,
  VisitSource,
} from "@/lib/types"

export async function getCurrentUserAction(): Promise<User | null> {
  return getSessionUser()
}

export async function developerLoginAction(
  handle: string
): Promise<{ ok: boolean; user?: User; error?: string }> {
  try {
    const user = await developerLogin(handle)
    revalidatePath("/", "layout")
    return { ok: true, user }
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Developer login failed",
    }
  }
}

export async function loginAction(
  handle: string
): Promise<{ ok: boolean; user?: User; error?: string }> {
  try {
    const user = await loginUser(handle)
    revalidatePath("/", "layout")
    return { ok: true, user }
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Sign-in failed",
    }
  }
}

export async function registerAction(
  handle: string,
  displayName?: string
): Promise<{ ok: boolean; user?: User; error?: string }> {
  try {
    const user = await registerUser(handle, displayName)
    revalidatePath("/", "layout")
    return { ok: true, user }
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Sign-up failed",
    }
  }
}

export async function loginOrRegisterAction(
  handle: string,
  displayName?: string
): Promise<{ ok: boolean; user?: User; error?: string }> {
  try {
    const user = await loginOrRegister(handle, displayName)
    revalidatePath("/", "layout")
    return { ok: true, user }
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Sign-in failed",
    }
  }
}

export async function logoutAction(): Promise<{ ok: boolean }> {
  await destroySession()
  revalidatePath("/", "layout")
  revalidatePath("/list")
  revalidatePath("/explore")
  return { ok: true }
}

export async function checkInAction(
  placeId: number,
  source: VisitSource,
  idempotencyKey: string
): Promise<{ ok: boolean; alreadyVisited?: boolean; error?: string }> {
  try {
    const user = await getSessionUser()
    if (!user) {
      return {
        ok: false,
        error: "Authentication required. Please sign in to check in.",
      }
    }
    const result = await checkInPlace(user.id, placeId, source, idempotencyKey)
    revalidatePath("/list")
    revalidatePath("/explore")
    revalidatePath("/")
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
    const user = await getSessionUser()
    if (!user) {
      return {
        ok: false,
        error: "Authentication required.",
      }
    }
    await undoCheckIn(user.id, placeId)
    revalidatePath("/list")
    revalidatePath("/explore")
    revalidatePath("/")
    return { ok: true }
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to undo visit",
    }
  }
}

export async function getUserVisitsAction(): Promise<UserVisitItem[]> {
  const user = await getSessionUser()
  if (!user) {
    return []
  }
  return getUserVisits(user.id)
}

export async function searchPlacesAction(
  query: string
): Promise<PlaceSummary[]> {
  return searchPlacesSql(query, 8)
}
