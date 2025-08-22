import { NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database"

export async function GET() {
  try {
    const plugins = await DatabaseService.getAllPluginConfigs()
    return NextResponse.json({ plugins })
  } catch (error) {
    console.error("Error fetching plugins:", error)
    return NextResponse.json({ error: "Failed to fetch plugins" }, { status: 500 })
  }
}
