"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, AlertCircle, Puzzle } from "lucide-react"
import { useState, useEffect } from "react"

interface ActivityItem {
  id: string
  type: "analysis_completed" | "analysis_started" | "plugin_generated" | "analysis_failed"
  project: string
  timestamp: string
  details?: string
}

export function RecentActivity() {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const response = await fetch("/api/activity")
        const data = await response.json()

        // Transform API data to match component interface
        const transformedActivities = data.activities.map((activity: any) => ({
          id: activity.id,
          type: activity.type,
          project: activity.project_name,
          timestamp: formatTimestamp(activity.timestamp),
          details: activity.details,
        }))

        setActivities(transformedActivities)
      } catch (error) {
        console.error("Failed to fetch activity:", error)
        setActivities([])
      } finally {
        setLoading(false)
      }
    }

    fetchActivity()
  }, [])

  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours} hours ago`
    if (diffInHours < 48) return "1 day ago"
    return `${Math.floor(diffInHours / 24)} days ago`
  }

  const getActivityIcon = (type: ActivityItem["type"]) => {
    switch (type) {
      case "analysis_completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "analysis_started":
        return <Clock className="h-4 w-4 text-primary" />
      case "plugin_generated":
        return <Puzzle className="h-4 w-4 text-secondary" />
      case "analysis_failed":
        return <AlertCircle className="h-4 w-4 text-destructive" />
    }
  }

  const getActivityText = (type: ActivityItem["type"]) => {
    switch (type) {
      case "analysis_completed":
        return "Analysis completed"
      case "analysis_started":
        return "Analysis started"
      case "plugin_generated":
        return "Plugin generated"
      case "analysis_failed":
        return "Analysis failed"
    }
  }

  const getActivityColor = (type: ActivityItem["type"]) => {
    switch (type) {
      case "analysis_completed":
        return "default"
      case "analysis_started":
        return "secondary"
      case "plugin_generated":
        return "default"
      case "analysis_failed":
        return "destructive"
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest updates from your analysis projects</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="h-4 w-4 bg-muted animate-pulse rounded-full mt-1"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted animate-pulse rounded w-20"></div>
                  <div className="h-3 bg-muted animate-pulse rounded w-32"></div>
                  <div className="h-3 bg-muted animate-pulse rounded w-16"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest updates from your analysis projects</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3">
              <div className="mt-1">{getActivityIcon(activity.type)}</div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={getActivityColor(activity.type)} className="text-xs">
                    {getActivityText(activity.type)}
                  </Badge>
                </div>

                <p className="text-sm font-medium text-foreground">{activity.project}</p>

                {activity.details && <p className="text-xs text-muted-foreground">{activity.details}</p>}

                <p className="text-xs text-muted-foreground mt-1">{activity.timestamp}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
