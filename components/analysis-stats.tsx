"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, Brain, Code2, Puzzle } from "lucide-react"

interface Stats {
  totalProjects: number
  completedAnalyses: number
  functionsAnalyzed: number
  pluginsGenerated: number
}

export function AnalysisStats() {
  const [stats, setStats] = useState<Stats>({
    totalProjects: 0,
    completedAnalyses: 0,
    functionsAnalyzed: 0,
    pluginsGenerated: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/stats")
        const data = await response.json()
        setStats(data)
      } catch (error) {
        console.error("Failed to fetch stats:", error)
        // Fallback to mock data if API fails
        setStats({
          totalProjects: 0,
          completedAnalyses: 0,
          functionsAnalyzed: 0,
          pluginsGenerated: 0,
        })
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const statCards = [
    {
      title: "Total Projects",
      value: stats.totalProjects,
      icon: BarChart3,
      description: "Active analysis projects",
    },
    {
      title: "Completed Analyses",
      value: stats.completedAnalyses,
      icon: Brain,
      description: "Successfully analyzed",
    },
    {
      title: "Functions Analyzed",
      value: stats.functionsAnalyzed,
      icon: Code2,
      description: "AI-powered insights",
    },
    {
      title: "Plugins Generated",
      value: stats.pluginsGenerated,
      icon: Puzzle,
      description: "Ready for deployment",
    },
  ]

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-muted animate-pulse rounded w-20"></div>
              <div className="h-4 w-4 bg-muted animate-pulse rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted animate-pulse rounded w-16 mb-1"></div>
              <div className="h-3 bg-muted animate-pulse rounded w-24"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stat.value}</div>
            <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
