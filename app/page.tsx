import { DashboardLayout } from "@/components/dashboard-layout"
import { ProjectsOverview } from "@/components/projects-overview"
import { AnalysisStats } from "@/components/analysis-stats"
import { RecentActivity } from "@/components/recent-activity"

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Dashboard Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">AI Learning Service</h1>
            <p className="text-muted-foreground mt-2">
              Analyze your code with AI-powered insights and generate intelligent plugins
            </p>
          </div>
        </div>

        {/* Stats Overview */}
        <AnalysisStats />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Projects Overview - Takes 2 columns on large screens */}
          <div className="lg:col-span-2">
            <ProjectsOverview />
          </div>

          {/* Recent Activity Sidebar */}
          <div className="lg:col-span-1">
            <RecentActivity />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
