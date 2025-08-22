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

    // Return the plugin code as a downloadable JavaScript file
    return new NextResponse(pluginConfig.plugin_code, {
      headers: {
        "Content-Type": "application/javascript",
        "Content-Disposition": `attachment; filename="${pluginConfig.config_name.replace(/[^a-zA-Z0-9]/g, "_")}_v${pluginConfig.version}.js"`,
        "Cache-Control": "no-cache",
      },
    })
  } catch (error) {
    console.error("Error downloading plugin:", error)
    return NextResponse.json({ error: "Failed to download plugin" }, { status: 500 })
  }
}
