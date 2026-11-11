import { NextResponse } from "next/server"
import { getCatalogData } from "@/db/queries"

export async function GET() {
  try {
    const data = await getCatalogData()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Database unavailable" },
      { status: 500 }
    )
  }
}

