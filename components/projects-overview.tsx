"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Globe, Code, Clock, CheckCircle, AlertCircle, Loader2 } from "lucide-react"

interface Project {
  id: number
  name: string
  description?: string
  url?: string
  project_type: "website" | "codebase"
  status: "pending" | "analyzing" | "completed" | "failed"
  created_at: string
  updated_at: string
}

export function ProjectsOverview() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [creating, setCreating] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    url: "",
    project_type: "website" as "website" | "codebase",
  })

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const response = await fetch("/api/projects")
      const data = await response.json()
      setProjects(data.projects || [])
    } catch (error) {
      console.error("Failed to fetch projects:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const data = await response.json()
        setProjects([data.project, ...projects])
        setCreateDialogOpen(false)
        setFormData({ name: "", description: "", url: "", project_type: "website" })
      }
    } catch (error) {
      console.error("Failed to create project:", error)
    } finally {
      setCreating(false)
    }
  }

  const startAnalysis = async (projectId: number) => {
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      })

      if (response.ok) {
        // Update project status locally
        setProjects(projects.map((p) => (p.id === projectId ? { ...p, status: "analyzing" } : p)))

        // Refresh projects after a delay to get updated status
        setTimeout(fetchProjects, 2000)
      }
    } catch (error) {
      console.error("Failed to start analysis:", error)
    }
  }

  const getStatusIcon = (status: Project["status"]) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-muted-foreground" />
      case "analyzing":
        return <Loader2 className="h-4 w-4 text-primary animate-spin" />
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "failed":
        return <AlertCircle className="h-4 w-4 text-destructive" />
    }
  }

  const getStatusColor = (status: Project["status"]) => {
    switch (status) {
      case "pending":
        return "secondary"
      case "analyzing":
        return "default"
      case "completed":
        return "default"
      case "failed":
        return "destructive"
      default:
        return "secondary"
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Projects</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Projects</CardTitle>
            <CardDescription>Manage your code analysis projects and view their status</CardDescription>
          </div>

          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Project
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
                <DialogDescription>Add a new website or codebase for AI analysis</DialogDescription>
              </DialogHeader>

              <form onSubmit={handleCreateProject} className="space-y-4">
                <div>
                  <Label htmlFor="name">Project Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="My Website Analysis"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="project_type">Project Type</Label>
                  <Select
                    value={formData.project_type}
                    onValueChange={(value: "website" | "codebase") => setFormData({ ...formData, project_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="website">Website</SelectItem>
                      <SelectItem value="codebase">Codebase</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="url">URL (optional)</Label>
                  <Input
                    id="url"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    placeholder="https://example.com"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description (optional)</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of the project..."
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={creating}>
                    {creating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Create Project
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent>
        {projects.length === 0 ? (
          <div className="text-center py-8">
            <Code className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No projects yet</h3>
            <p className="text-muted-foreground mb-4">Create your first project to start analyzing code with AI</p>
          </div>
        ) : (
          <div className="space-y-4">
            {projects.map((project) => (
              <div
                key={project.id}
                className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-card rounded-lg">
                    {project.project_type === "website" ? (
                      <Globe className="h-5 w-5 text-primary" />
                    ) : (
                      <Code className="h-5 w-5 text-primary" />
                    )}
                  </div>

                  <div>
                    <h4 className="font-medium text-foreground">{project.name}</h4>
                    {project.description && <p className="text-sm text-muted-foreground">{project.description}</p>}
                    {project.url && <p className="text-xs text-muted-foreground mt-1">{project.url}</p>}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(project.status)}
                    <Badge variant={getStatusColor(project.status)}>{project.status}</Badge>
                  </div>

                  {project.status === "pending" && (
                    <Button size="sm" onClick={() => startAnalysis(project.id)}>
                      Start Analysis
                    </Button>
                  )}

                  {project.status === "completed" && (
                    <Button size="sm" variant="outline">
                      View Results
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
