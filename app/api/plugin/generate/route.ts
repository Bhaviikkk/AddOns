import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database"
import { PluginGenerator } from "@/lib/plugin-generator"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { projectId, pluginName, features = [] } = body

    if (!projectId || !pluginName) {
      return NextResponse.json({ error: "Project ID and plugin name are required" }, { status: 400 })
    }

    // Get project and function maps
    const project = await DatabaseService.getProject(projectId)
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    const functions = await DatabaseService.getFunctionMapsByProject(projectId)

    // Generate plugin code
    const pluginCode = await PluginGenerator.generatePlugin(project, functions, features)

    // Save plugin configuration
    const pluginConfig = await DatabaseService.createPluginConfig({
      project_id: projectId,
      config_name: pluginName,
      plugin_code: pluginCode,
      version: "1.0.0",
      is_active: true,
    })

    return NextResponse.json({
      message: "Plugin generated successfully",
      pluginId: pluginConfig.id,
      downloadUrl: `/api/plugin/download/${pluginConfig.id}`,
    })
  } catch (error) {
    console.error("Error generating plugin:", error)
    return NextResponse.json({ error: "Failed to generate plugin" }, { status: 500 })
  }
}
