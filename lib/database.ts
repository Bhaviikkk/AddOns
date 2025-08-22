// Database connection and query utilities for Neon Postgres
import { neon } from "@neondatabase/serverless"

let sql: ReturnType<typeof neon> | null = null
let connectionError: string | null = null
let isRetrying = false

function initializeDatabase() {
  if (!process.env.DATABASE_URL) {
    connectionError =
      "DATABASE_URL environment variable is not set. Please add your Neon database URL to the environment variables."
    console.warn("[v0] DATABASE_URL not found - database operations will fail until configured")
    return
  }

  // Validate DATABASE_URL format
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl.startsWith("postgresql://") && !databaseUrl.startsWith("postgres://")) {
    connectionError = "DATABASE_URL must be a valid PostgreSQL connection string"
    console.error("[v0] Invalid DATABASE_URL format:", databaseUrl.substring(0, 20) + "...")
    return
  }

  console.log("[v0] Initializing database connection:", databaseUrl.substring(0, 30) + "...")

  sql = neon(databaseUrl, {
    connectionTimeoutMillis: 15000, // 15 second timeout (reduced from 30s)
    idleTimeoutMillis: 30000,
    // Add additional connection options for better reliability
    arrayMode: false,
    fullResults: false,
  })

  // Test connection on startup with retry
  testConnectionWithRetry()
}

async function testConnectionWithRetry(maxRetries = 3, delay = 2000) {
  if (!sql || isRetrying) return false

  isRetrying = true

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[v0] Testing database connection (attempt ${attempt}/${maxRetries})...`)

      // Use a simpler query with timeout
      const result = await Promise.race([
        sql`SELECT 1 as test`,
        new Promise((_, reject) => setTimeout(() => reject(new Error("Connection test timeout")), 10000)),
      ])

      console.log("[v0] Database connection successful")
      connectionError = null
      isRetrying = false
      return true
    } catch (error) {
      console.error(`[v0] Database connection attempt ${attempt} failed:`, error)

      if (attempt === maxRetries) {
        connectionError = `Database connection failed after ${maxRetries} attempts: ${error instanceof Error ? error.message : "Unknown error"}`
        console.error("[v0] All connection attempts failed. Database will operate in offline mode.")
      } else {
        console.log(`[v0] Retrying in ${delay}ms...`)
        await new Promise((resolve) => setTimeout(resolve, delay))
        delay *= 1.5 // Exponential backoff
      }
    }
  }

  isRetrying = false
  return false
}

async function testConnection() {
  if (!sql) return false

  try {
    console.log("[v0] Testing database connection...")
    const result = await sql`SELECT 1 as test`
    console.log("[v0] Database connection successful")
    connectionError = null
    return true
  } catch (error) {
    connectionError = `Database connection failed: ${error instanceof Error ? error.message : "Unknown error"}`
    console.error("[v0] Database connection failed:", error)
    return false
  }
}

// Initialize database on module load
initializeDatabase()

// Database types
export interface Project {
  id: number
  name: string
  description?: string
  url?: string
  project_type: "website" | "codebase"
  status: "pending" | "analyzing" | "completed" | "failed"
  created_at: Date
  updated_at: Date
}

export interface FunctionMap {
  id: number
  project_id: number
  function_name: string
  description?: string
  parameters?: Record<string, any>
  return_type?: string
  file_path?: string
  line_number?: number
  complexity_score?: number
  ai_analysis?: Record<string, any>
  created_at: Date
}

export interface PluginConfig {
  id: number
  project_id: number
  config_name: string
  plugin_code: string
  version: string
  is_active: boolean
  created_at: Date
  updated_at: Date
}

// Database query functions
export class DatabaseService {
  private static checkConnection(): void {
    if (!sql) {
      throw new Error(
        connectionError ||
          "Database not initialized. Please ensure DATABASE_URL environment variable is set with your Neon database connection string.",
      )
    }
  }

  private static async executeQuery<T>(queryFn: () => Promise<T>, operation: string): Promise<T> {
    this.checkConnection()

    try {
      console.log(`[v0] Executing ${operation}...`)

      // Add timeout wrapper for all queries
      const result = await Promise.race([
        queryFn(),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error(`Query timeout after 15 seconds`)), 15000)),
      ])

      console.log(`[v0] ${operation} completed successfully`)
      return result
    } catch (error) {
      console.error(`[v0] ${operation} failed:`, error)

      // Check if it's a connection error and attempt reconnection
      if (
        error instanceof Error &&
        (error.message.includes("fetch failed") ||
          error.message.includes("Connect Timeout") ||
          error.message.includes("timeout") ||
          error.message.includes("ENOTFOUND") ||
          error.message.includes("ECONNREFUSED"))
      ) {
        console.log("[v0] Connection error detected, attempting to reconnect...")

        // Try to reconnect
        if (!isRetrying) {
          setTimeout(() => testConnectionWithRetry(), 1000)
        }

        throw new Error(
          `Database connection failed. This might be due to network issues or incorrect DATABASE_URL. Please verify your Neon database is running and accessible. Error: ${error.message}`,
        )
      }

      throw error
    }
  }

  static isDatabaseReady(): boolean {
    return sql !== null && connectionError === null
  }

  static getConnectionError(): string | null {
    return connectionError
  }

  static async reconnect(): Promise<boolean> {
    console.log("[v0] Manual reconnection requested...")
    return await testConnectionWithRetry()
  }

  // Project operations
  static async createProject(data: Omit<Project, "id" | "created_at" | "updated_at">): Promise<Project> {
    return this.executeQuery(async () => {
      const result = await sql!`
        INSERT INTO projects (name, description, url, project_type, status)
        VALUES (${data.name}, ${data.description || null}, ${data.url || null}, ${data.project_type}, ${data.status})
        RETURNING *
      `
      return result[0] as Project
    }, "createProject")
  }

  static async getProject(id: number): Promise<Project | null> {
    return this.executeQuery(async () => {
      const result = await sql!`
        SELECT * FROM projects WHERE id = ${id}
      `
      return (result[0] as Project) || null
    }, "getProject")
  }

  static async getAllProjects(): Promise<Project[]> {
    return this.executeQuery(async () => {
      const result = await sql!`
        SELECT * FROM projects ORDER BY created_at DESC
      `
      return result as Project[]
    }, "getAllProjects")
  }

  static async updateProjectStatus(id: number, status: Project["status"]): Promise<void> {
    return this.executeQuery(async () => {
      await sql!`
        UPDATE projects 
        SET status = ${status}, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ${id}
      `
    }, "updateProjectStatus")
  }

  // Function map operations
  static async createFunctionMap(data: Omit<FunctionMap, "id" | "created_at">): Promise<FunctionMap> {
    return this.executeQuery(async () => {
      const result = await sql!`
        INSERT INTO function_maps (
          project_id, function_name, description, parameters, return_type, 
          file_path, line_number, complexity_score, ai_analysis
        )
        VALUES (
          ${data.project_id}, ${data.function_name}, ${data.description || null},
          ${JSON.stringify(data.parameters) || null}, ${data.return_type || null},
          ${data.file_path || null}, ${data.line_number || null}, 
          ${data.complexity_score || null}, ${JSON.stringify(data.ai_analysis) || null}
        )
        RETURNING *
      `
      return result[0] as FunctionMap
    }, "createFunctionMap")
  }

  static async getFunctionMapsByProject(projectId: number): Promise<FunctionMap[]> {
    return this.executeQuery(async () => {
      const result = await sql!`
        SELECT * FROM function_maps 
        WHERE project_id = ${projectId} 
        ORDER BY function_name
      `
      return result as FunctionMap[]
    }, "getFunctionMapsByProject")
  }

  // Plugin config operations
  static async createPluginConfig(data: Omit<PluginConfig, "id" | "created_at" | "updated_at">): Promise<PluginConfig> {
    return this.executeQuery(async () => {
      const result = await sql!`
        INSERT INTO plugin_configs (project_id, config_name, plugin_code, version, is_active)
        VALUES (${data.project_id}, ${data.config_name}, ${data.plugin_code}, ${data.version}, ${data.is_active})
        RETURNING *
      `
      return result[0] as PluginConfig
    }, "createPluginConfig")
  }

  static async getActivePluginConfigs(projectId: number): Promise<PluginConfig[]> {
    return this.executeQuery(async () => {
      const result = await sql!`
        SELECT * FROM plugin_configs 
        WHERE project_id = ${projectId} AND is_active = true
        ORDER BY created_at DESC
      `
      return result as PluginConfig[]
    }, "getActivePluginConfigs")
  }

  static async getAllPluginConfigs(): Promise<PluginConfig[]> {
    return this.executeQuery(async () => {
      const result = await sql!`
        SELECT pc.*, p.name as project_name 
        FROM plugin_configs pc
        JOIN projects p ON pc.project_id = p.id
        ORDER BY pc.created_at DESC
      `
      return result as PluginConfig[]
    }, "getAllPluginConfigs")
  }

  static async getPluginConfig(id: number): Promise<PluginConfig | null> {
    return this.executeQuery(async () => {
      const result = await sql!`
        SELECT * FROM plugin_configs WHERE id = ${id}
      `
      return (result[0] as PluginConfig) || null
    }, "getPluginConfig")
  }

  static async updatePluginConfig(id: number, updates: Partial<PluginConfig>): Promise<void> {
    return this.executeQuery(async () => {
      const setClause = Object.keys(updates)
        .map((key) => `${key} = $${Object.keys(updates).indexOf(key) + 2}`)
        .join(", ")

      await sql!`
        UPDATE plugin_configs 
        SET ${sql.unsafe(setClause)}, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ${id}
      `
    }, "updatePluginConfig")
  }

  static async deletePluginConfig(id: number): Promise<void> {
    return this.executeQuery(async () => {
      await sql!`
        DELETE FROM plugin_configs WHERE id = ${id}
      `
    }, "deletePluginConfig")
  }

  static async getProjectStats(): Promise<{
    totalProjects: number
    completedAnalyses: number
    functionsAnalyzed: number
    pluginsGenerated: number
  }> {
    return this.executeQuery(async () => {
      const [projectStats] = await sql!`
        SELECT 
          COUNT(*) as total_projects,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_analyses
        FROM projects
      `

      const [functionStats] = await sql!`
        SELECT COUNT(*) as functions_analyzed FROM function_maps
      `

      const [pluginStats] = await sql!`
        SELECT COUNT(*) as plugins_generated FROM plugin_configs WHERE is_active = true
      `

      return {
        totalProjects: Number(projectStats.total_projects),
        completedAnalyses: Number(projectStats.completed_analyses),
        functionsAnalyzed: Number(functionStats.functions_analyzed),
        pluginsGenerated: Number(pluginStats.plugins_generated),
      }
    }, "getProjectStats")
  }

  static async getRecentActivity(limit = 10): Promise<
    Array<{
      id: string
      type: string
      project_name: string
      timestamp: string
      details?: string
    }>
  > {
    return this.executeQuery(async () => {
      const result = await sql!`
        SELECT 
          'project_' || p.id as id,
          CASE 
            WHEN p.status = 'completed' THEN 'analysis_completed'
            WHEN p.status = 'analyzing' THEN 'analysis_started'
            WHEN p.status = 'failed' THEN 'analysis_failed'
            ELSE 'project_created'
          END as type,
          p.name as project_name,
          p.updated_at as timestamp,
          CASE 
            WHEN p.status = 'completed' THEN 
              (SELECT 'Found ' || COUNT(*) || ' functions' FROM function_maps WHERE project_id = p.id)
            ELSE NULL
          END as details
        FROM projects p
        WHERE p.updated_at >= NOW() - INTERVAL '7 days'
        
        UNION ALL
        
        SELECT 
          'plugin_' || pc.id as id,
          'plugin_generated' as type,
          p.name as project_name,
          pc.created_at as timestamp,
          pc.config_name || ' v' || pc.version as details
        FROM plugin_configs pc
        JOIN projects p ON pc.project_id = p.id
        WHERE pc.created_at >= NOW() - INTERVAL '7 days'
        
        ORDER BY timestamp DESC
        LIMIT ${limit}
      `

      return result as Array<{
        id: string
        type: string
        project_name: string
        timestamp: string
        details?: string
      }>
    }, "getRecentActivity")
  }
}

export { sql }
