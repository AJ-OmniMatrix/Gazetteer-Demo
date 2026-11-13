import crypto from "node:crypto"
import { cookies } from "next/headers"
import type { RowDataPacket } from "mysql2"
import { getPool } from "@/db"
import { SEED_USERS } from "@/db/seed-data"
import type { User } from "./types"

const SESSION_COOKIE = "gazetteer_session"
const SESSION_TTL_MS = 30 * 86400 * 1000

interface MemorySession {
  userId: number
  expiresAt: number
}

declare global {
  var __memorySessions: Map<string, MemorySession> | undefined
  var __memoryUsers: User[] | undefined
}

function getMemorySessions(): Map<string, MemorySession> {
  if (!globalThis.__memorySessions) {
    globalThis.__memorySessions = new Map<string, MemorySession>()
  }
  return globalThis.__memorySessions
}

function getMemoryUsers(): User[] {
  if (!globalThis.__memoryUsers) {
    globalThis.__memoryUsers = SEED_USERS.map((u) => ({
      id: u.id,
      displayName: u.displayName,
      handle: u.handle,
      avatarUrl: u.avatarUrl,
      avatarBlurhash: u.avatarBlurhash,
      isDeveloper: u.isDeveloper,
    }))
  }
  return globalThis.__memoryUsers
}

function hasDatabase(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim())
}

export async function getSessionUser(): Promise<User | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  if (!token) {
    return null
  }

  if (!hasDatabase()) {
    const memSessions = getMemorySessions()
    const session = memSessions.get(token)
    if (!session || session.expiresAt <= Date.now()) {
      memSessions.delete(token)
      return null
    }
    const user = getMemoryUsers().find((u) => u.id === session.userId)
    return user ?? null
  }

  try {
    const pool = getPool()
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT u.id, u.display_name, u.handle, u.avatar_url, u.avatar_blurhash, u.is_developer
       FROM sessions s
       JOIN users u ON u.id = s.user_id
       WHERE s.session_token = ? AND s.expires_at > NOW()
       LIMIT 1`,
      [token]
    )

    if (rows.length === 0) {
      return null
    }

    const row = rows[0]
    return {
      id: Number(row.id),
      displayName: String(row.display_name),
      handle: String(row.handle),
      avatarUrl: String(row.avatar_url),
      avatarBlurhash: String(row.avatar_blurhash),
      isDeveloper: Boolean(row.is_developer),
    }
  } catch {
    return null
  }
}

export async function createSession(userId: number): Promise<string> {
  const token = crypto.randomBytes(32).toString("hex")
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS)

  if (!hasDatabase()) {
    getMemorySessions().set(token, {
      userId,
      expiresAt: expiresAt.getTime(),
    })
  } else {
    const pool = getPool()
    await pool.execute(
      `INSERT INTO sessions (user_id, session_token, expires_at)
       VALUES (?, ?, ?)`,
      [userId, token, expiresAt]
    )
  }

  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  })

  return token
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  if (token) {
    if (!hasDatabase()) {
      getMemorySessions().delete(token)
    } else {
      try {
        const pool = getPool()
        await pool.execute(`DELETE FROM sessions WHERE session_token = ?`, [
          token,
        ])
      } catch {}
    }
  }

  cookieStore.delete(SESSION_COOKIE)
}

export async function developerLogin(handle: string): Promise<User> {
  if (!hasDatabase()) {
    const user = getMemoryUsers().find(
      (u) => u.handle.toLowerCase() === handle.toLowerCase()
    )
    if (!user) {
      throw new Error(`Developer account @${handle} not found`)
    }
    await createSession(user.id)
    return user
  }

  const pool = getPool()
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT id, display_name, handle, avatar_url, avatar_blurhash, is_developer
     FROM users
     WHERE LOWER(handle) = LOWER(?) AND is_developer = 1
     LIMIT 1`,
    [handle]
  )

  if (rows.length === 0) {
    throw new Error(`Developer account @${handle} not found`)
  }

  const row = rows[0]
  const user: User = {
    id: Number(row.id),
    displayName: String(row.display_name),
    handle: String(row.handle),
    avatarUrl: String(row.avatar_url),
    avatarBlurhash: String(row.avatar_blurhash),
    isDeveloper: true,
  }

  await createSession(user.id)
  return user
}

export async function loginOrRegister(
  rawHandle: string,
  rawDisplayName?: string
): Promise<User> {
  const handle = rawHandle
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "")
    .slice(0, 40)

  if (!handle) {
    throw new Error(
      "Handle is required and must contain alphanumeric characters"
    )
  }

  const displayName = (rawDisplayName?.trim() || handle).slice(0, 80)

  if (!hasDatabase()) {
    const memoryUsers = getMemoryUsers()
    let user = memoryUsers.find((u) => u.handle === handle)
    if (!user) {
      user = {
        id: memoryUsers.length + 1,
        displayName,
        handle,
        avatarUrl: "/images/avatar.png",
        avatarBlurhash: "L~N+^As.V?j[~VayaefQIqWCozaz",
        isDeveloper: false,
      }
      memoryUsers.push(user)
    }
    await createSession(user.id)
    return user
  }

  const pool = getPool()
  const [existingRows] = await pool.execute<RowDataPacket[]>(
    `SELECT id, display_name, handle, avatar_url, avatar_blurhash, is_developer
     FROM users
     WHERE LOWER(handle) = LOWER(?)
     LIMIT 1`,
    [handle]
  )

  if (existingRows.length > 0) {
    const row = existingRows[0]
    const user: User = {
      id: Number(row.id),
      displayName: String(row.display_name),
      handle: String(row.handle),
      avatarUrl: String(row.avatar_url),
      avatarBlurhash: String(row.avatar_blurhash),
      isDeveloper: Boolean(row.is_developer),
    }
    await createSession(user.id)
    return user
  }

  const defaultAvatar = "/images/avatar.png"
  const defaultBlurhash = "L~N+^As.V?j[~VayaefQIqWCozaz"

  await pool.execute(
    `INSERT INTO users (display_name, handle, avatar_url, avatar_blurhash, is_developer)
     VALUES (?, ?, ?, ?, 0)`,
    [displayName, handle, defaultAvatar, defaultBlurhash]
  )

  const [createdRows] = await pool.execute<RowDataPacket[]>(
    `SELECT id, display_name, handle, avatar_url, avatar_blurhash, is_developer
     FROM users WHERE handle = ? LIMIT 1`,
    [handle]
  )

  const row = createdRows[0]
  const user: User = {
    id: Number(row.id),
    displayName: String(row.display_name),
    handle: String(row.handle),
    avatarUrl: String(row.avatar_url),
    avatarBlurhash: String(row.avatar_blurhash),
    isDeveloper: false,
  }

  await createSession(user.id)
  return user
}
