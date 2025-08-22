"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { BarChart3, Code2, FolderOpen, Menu, Puzzle, Settings, X, Brain, Activity } from "lucide-react"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navigation = [
    { name: "Dashboard", href: "/", icon: BarChart3, current: true },
    { name: "Projects", href: "/projects", icon: FolderOpen, current: false },
    { name: "Analysis", href: "/analysis", icon: Brain, current: false },
    { name: "Plugins", href: "/plugins", icon: Puzzle, current: false },
    { name: "Activity", href: "/activity", icon: Activity, current: false },
    { name: "Settings", href: "/settings", icon: Settings, current: false },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="fixed left-0 top-0 h-full w-64 bg-sidebar border-r border-sidebar-border">
            <SidebarContent navigation={navigation} onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:block lg:w-64 lg:bg-sidebar lg:border-r lg:border-sidebar-border">
        <SidebarContent navigation={navigation} />
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top navigation */}
        <div className="sticky top-0 z-40 bg-background border-b border-border px-4 py-4 lg:px-6">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>

            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm">
                <Code2 className="h-4 w-4 mr-2" />
                New Analysis
              </Button>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="px-4 py-6 lg:px-6">{children}</main>
      </div>
    </div>
  )
}

function SidebarContent({
  navigation,
  onClose,
}: {
  navigation: any[]
  onClose?: () => void
}) {
  return (
    <div className="flex h-full flex-col">
      {/* Logo and close button */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <Brain className="h-8 w-8 text-sidebar-accent" />
          <span className="text-lg font-bold text-sidebar-foreground">AI Learning</span>
        </div>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose} className="lg:hidden">
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6">
        <ul className="space-y-2">
          {navigation.map((item) => (
            <li key={item.name}>
              <a
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  item.current
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground"
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-sidebar-border">
        <p className="text-xs text-muted-foreground">AI Learning Service v1.0</p>
      </div>
    </div>
  )
}
