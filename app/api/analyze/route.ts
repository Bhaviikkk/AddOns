import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database"
import { AnalysisService } from "@/lib/analysis-service"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { projectId, analysisType = "full" } = body

    if (!projectId) {
      return NextResponse.json({ error: "Project ID is required" }, { status: 400 })
    }

    // Get project details
    const project = await DatabaseService.getProject(projectId)
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    // Update project status to analyzing
    await DatabaseService.updateProjectStatus(projectId, "analyzing")

    // Start analysis process
    const analysisResult = await AnalysisService.analyzeProject(project, analysisType)

    if (analysisResult.success) {
      // Update project status to completed
      await DatabaseService.updateProjectStatus(projectId, "completed")

      return NextResponse.json({
        message: "Analysis completed successfully",
        functionCount: analysisResult.functionCount,
        analysisId: analysisResult.analysisId,
      })
    } else {
      // Update project status to failed
      await DatabaseService.updateProjectStatus(projectId, "failed")

      return NextResponse.json({ error: analysisResult.error }, { status: 500 })
    }
  } catch (error) {
    console.error("Error during analysis:", error)
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 })
  }
}
