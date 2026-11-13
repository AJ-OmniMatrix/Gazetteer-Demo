import mysql, { type Pool, type PoolConnection } from "mysql2/promise"

declare global {
  var __gazetteerPool: Pool | undefined
}

function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error("DATABASE_URL is not configured")
  }
  return url
}

export function createPool(multipleStatements = false): Pool {
  const url = getDatabaseUrl()
  const needsSsl = url.includes("tidbcloud.com") && !url.includes("ssl=")
  return mysql.createPool({
    uri: url,
    connectionLimit: 5,
    waitForConnections: true,
    multipleStatements,
    ...(needsSsl
      ? { ssl: { minVersion: "TLSv1.2", rejectUnauthorized: true } }
      : {}),
  })
}

export function getPool(): Pool {
  if (!globalThis.__gazetteerPool) {
    globalThis.__gazetteerPool = createPool(false)
  }
  return globalThis.__gazetteerPool
}

export async function withTransaction<T>(
  fn: (conn: PoolConnection) => Promise<T>
): Promise<T> {
  const conn = await getPool().getConnection()
  try {
    await conn.beginTransaction()
    const result = await fn(conn)
    await conn.commit()
    return result
  } catch (error) {
    await conn.rollback()
    throw error
  } finally {
    conn.release()
  }
}
