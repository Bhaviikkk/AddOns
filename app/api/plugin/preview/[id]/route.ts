import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const pluginId = Number.parseInt(params.id)

    if (isNaN(pluginId)) {
      return NextResponse.json({ error: "Invalid plugin ID" }, { status: 400 })
    }

    const pluginConfig = await DatabaseService.getPluginConfig(pluginId)

    if (!pluginConfig) {
      return NextResponse.json({ error: "Plugin not found" }, { status: 404 })
    }

    return NextResponse.json({
      id: pluginConfig.id,
      name: pluginConfig.config_name,
      version: pluginConfig.version,
      code: pluginConfig.plugin_code,
      created_at: pluginConfig.created_at,
    })
  } catch (error) {
    console.error("Error previewing plugin:", error)
    return NextResponse.json({ error: "Failed to preview plugin" }, { status: 500 })
  }
}
