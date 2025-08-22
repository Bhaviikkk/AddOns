"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Download, Eye, Plus, Puzzle } from "lucide-react"

interface PluginConfig {
  id: number
  project_id: number
  config_name: string
  plugin_code: string
  version: string
  is_active: boolean
  created_at: string
  updated_at: string
}

interface Project {
  id: number
  name: string
  status: string
}

export function PluginManager() {
  const [plugins, setPlugins] = useState<PluginConfig[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false)
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false)
  const [selectedPlugin, setSelectedPlugin] = useState<PluginConfig | null>(null)
  const [generating, setGenerating] = useState(false)

  // Form state for plugin generation
  const [formData, setFormData] = useState({
    projectId: "",
    pluginName: "",
    features: [] as string[],
  })

  const availableFeatures = [
    { id: "visual-indicator", label: "Visual Indicator", description: "Show AI insights indicator on page" },
    { id: "console-logging", label: "Console Logging", description: "Enhanced console output for insights" },
    { id: "performance-monitoring", label: "Performance Monitoring", description: "Track function performance" },
    { id: "error-tracking", label: "Error Tracking", description: "Monitor and report errors" },
  ]

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Fetch projects
      const projectsResponse = await fetch("/api/projects")
      const projectsData = await projectsResponse.json()
      setProjects(projectsData.projects?.filter((p: Project) => p.status === "completed") || [])

      // Fetch real plugin data from API instead of mock data
      const pluginsResponse = await fetch("/api/plugins")
      const pluginsData = await pluginsResponse.json()
      setPlugins(pluginsData.plugins || [])
    } catch (error) {
      console.error("Failed to fetch data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleGeneratePlugin = async (e: React.FormEvent) => {
    e.preventDefault()
    setGenerating(true)

    try {
      const response = await fetch("/api/plugin/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: Number.parseInt(formData.projectId),
          pluginName: formData.pluginName,
          features: formData.features,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setGenerateDialogOpen(false)
        setFormData({ projectId: "", pluginName: "", features: [] })
        fetchData() // Refresh the plugin list
      }
    } catch (error) {
      console.error("Failed to generate plugin:", error)
    } finally {
      setGenerating(false)
    }
  }

  const handleDownloadPlugin = async (pluginId: number, pluginName: string) => {
    try {
      const response = await fetch(`/api/plugin/download/${pluginId}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `${pluginName.replace(/[^a-zA-Z0-9]/g, "_")}.js`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error("Failed to download plugin:", error)
    }
  }

  const handlePreviewPlugin = async (plugin: PluginConfig) => {
    setSelectedPlugin(plugin)
    setPreviewDialogOpen(true)
  }

  const handleFeatureToggle = (featureId: string, checked: boolean) => {
    if (checked) {
      setFormData({ ...formData, features: [...formData.features, featureId] })
    } else {
      setFormData({ ...formData, features: formData.features.filter((f) => f !== featureId) })
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Plugin Manager</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Plugin Manager</CardTitle>
              <CardDescription>
                Generate and manage standalone JavaScript plugins for your analyzed projects
              </CardDescription>
            </div>

            <Dialog open={generateDialogOpen} onOpenChange={setGenerateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Generate Plugin
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Generate New Plugin</DialogTitle>
                  <DialogDescription>
                    Create a standalone JavaScript plugin from your analysis results
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleGeneratePlugin} className="space-y-4">
                  <div>
                    <Label htmlFor="project">Select Project</Label>
                    <select
                      id="project"
                      value={formData.projectId}
                      onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                      className="w-full p-2 border border-border rounded-md bg-background"
                      required
                    >
                      <option value="">Choose a completed project...</option>
                      {projects.map((project) => (
                        <option key={project.id} value={project.id}>
                          {project.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="pluginName">Plugin Name</Label>
                    <Input
                      id="pluginName"
                      value={formData.pluginName}
                      onChange={(e) => setFormData({ ...formData, pluginName: e.target.value })}
                      placeholder="My AI Insights Plugin"
                      required
                    />
                  </div>

                  <div>
                    <Label>Features</Label>
                    <div className="space-y-3 mt-2">
                      {availableFeatures.map((feature) => (
                        <div key={feature.id} className="flex items-start space-x-2">
                          <Checkbox
                            id={feature.id}
                            checked={formData.features.includes(feature.id)}
                            onCheckedChange={(checked) => handleFeatureToggle(feature.id, checked as boolean)}
                          />
                          <div className="grid gap-1.5 leading-none">
                            <label
                              htmlFor={feature.id}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {feature.label}
                            </label>
                            <p className="text-xs text-muted-foreground">{feature.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setGenerateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={generating}>
                      {generating && (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      )}
                      Generate Plugin
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>

        <CardContent>
          {plugins.length === 0 ? (
            <div className="text-center py-8">
              <Puzzle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No plugins generated yet</h3>
              <p className="text-muted-foreground mb-4">Generate your first plugin from a completed analysis project</p>
            </div>
          ) : (
            <div className="space-y-4">
              {plugins.map((plugin) => (
                <div
                  key={plugin.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-card rounded-lg">
                      <Puzzle className="h-5 w-5 text-primary" />
                    </div>

                    <div>
                      <h4 className="font-medium text-foreground">{plugin.config_name}</h4>
                      <p className="text-sm text-muted-foreground">Version {plugin.version}</p>
                      <p className="text-xs text-muted-foreground">
                        Created {new Date(plugin.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant={plugin.is_active ? "default" : "secondary"}>
                      {plugin.is_active ? "Active" : "Inactive"}
                    </Badge>

                    <Button size="sm" variant="outline" onClick={() => handlePreviewPlugin(plugin)}>
                      <Eye className="h-4 w-4 mr-1" />
                      Preview
                    </Button>

                    <Button size="sm" onClick={() => handleDownloadPlugin(plugin.id, plugin.config_name)}>
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Plugin Preview Dialog */}
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Plugin Preview: {selectedPlugin?.config_name}</DialogTitle>
            <DialogDescription>Preview the generated JavaScript code for your plugin</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Badge>Version {selectedPlugin?.version}</Badge>
              <Badge variant="outline">JavaScript</Badge>
            </div>

            <div className="bg-muted p-4 rounded-lg overflow-auto max-h-96">
              <pre className="text-sm">
                <code>{selectedPlugin?.plugin_code}</code>
              </pre>
            </div>

            <div className="bg-card p-4 rounded-lg">
              <h4 className="font-medium mb-2">Integration Instructions</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Add this script tag to your website's HTML to integrate the AI insights plugin:
              </p>
              <div className="bg-muted p-3 rounded font-mono text-sm">
                {`<script src="path/to/${selectedPlugin?.config_name.replace(/[^a-zA-Z0-9]/g, "_")}_v${selectedPlugin?.version}.js"></script>`}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setPreviewDialogOpen(false)}>
              Close
            </Button>
            {selectedPlugin && (
              <Button onClick={() => handleDownloadPlugin(selectedPlugin.id, selectedPlugin.config_name)}>
                <Download className="h-4 w-4 mr-2" />
                Download Plugin
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
