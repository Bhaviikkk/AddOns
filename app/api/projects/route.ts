import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database"

export async function GET() {
  try {
    const projects = await DatabaseService.getAllProjects()
    return NextResponse.json({ projects })
  } catch (error) {
    console.error("Error fetching projects:", error)
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, url, project_type } = body

    // Validate required fields
    if (!name || !project_type) {
      return NextResponse.json({ error: "Name and project_type are required" }, { status: 400 })
    }

    if (!["website", "codebase"].includes(project_type)) {
      return NextResponse.json({ error: "project_type must be 'website' or 'codebase'" }, { status: 400 })
    }

    const project = await DatabaseService.createProject({
      name,
      description,
      url,
      project_type,
      status: "pending",
    })

    return NextResponse.json({ project }, { status: 201 })
  } catch (error) {
    console.error("Error creating project:", error)
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 })
  }
}
