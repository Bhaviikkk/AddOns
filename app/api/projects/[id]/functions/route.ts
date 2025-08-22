import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const projectId = Number.parseInt(params.id)

    if (isNaN(projectId)) {
      return NextResponse.json({ error: "Invalid project ID" }, { status: 400 })
    }

    const functions = await DatabaseService.getFunctionMapsByProject(projectId)
    return NextResponse.json({ functions })
  } catch (error) {
    console.error("Error fetching function maps:", error)
    return NextResponse.json({ error: "Failed to fetch function maps" }, { status: 500 })
  }
}
