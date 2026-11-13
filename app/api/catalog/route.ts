import { NextResponse } from "next/server"
import { getCatalogData } from "@/db/queries"
import { getSessionUser } from "@/lib/auth"

export async function GET() {
  try {
    const user = await getSessionUser()
    const data = await getCatalogData(user)
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Database unavailable",
      },
      { status: 500 }
    )
  }
}
