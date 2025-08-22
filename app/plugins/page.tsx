import { DashboardLayout } from "@/components/dashboard-layout"
import { PluginManager } from "@/components/plugin-manager"

export default function PluginsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Plugin Manager</h1>
          <p className="text-muted-foreground mt-2">
            Generate and manage standalone JavaScript plugins from your AI analysis results
          </p>
        </div>

        <PluginManager />
      </div>
    </DashboardLayout>
  )
}
