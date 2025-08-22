import { generateObject } from "ai"
import { google } from "@ai-sdk/google"
import { z } from "zod"
import { DatabaseService, type Project } from "./database"

// Schema for function analysis results
const FunctionAnalysisSchema = z.object({
  functions: z.array(
    z.object({
      name: z.string(),
      description: z.string(),
      parameters: z.record(z.string()),
      returnType: z.string().optional(),
      filePath: z.string().optional(),
      lineNumber: z.number().optional(),
      complexityScore: z.number().min(1).max(10),
      insights: z.array(z.string()),
      suggestions: z.array(z.string()),
    }),
  ),
})

export class AnalysisService {
  private static async fetchWebsiteContent(url: string): Promise<string> {
    try {
      const response = await fetch(url)
      const html = await response.text()

      // Extract meaningful content (simplified approach)
      const scriptMatches = html.match(/<script[^>]*>([\s\S]*?)<\/script>/gi) || []
      const scripts = scriptMatches
        .map((script) => script.replace(/<\/?script[^>]*>/gi, ""))
        .filter((script) => script.trim().length > 0)
        .join("\n\n")

      return scripts || "No JavaScript content found"
    } catch (error) {
      throw new Error(`Failed to fetch website content: ${error}`)
    }
  }

  private static async analyzeCodeWithAI(code: string, projectType: string): Promise<any> {
    try {
      const prompt = `
        Analyze the following ${projectType} code and extract all functions, methods, and significant code blocks.
        For each function found, provide:
        - Function name
        - Description of what it does
        - Parameters and their types
        - Return type (if applicable)
        - File path (if determinable)
        - Line number (estimate if possible)
        - Complexity score (1-10, where 10 is most complex)
        - Key insights about the function
        - Suggestions for improvement

        Code to analyze:
        ${code.substring(0, 8000)} // Limit to avoid token limits
      `

      const result = await generateObject({
        model: google("gemini-1.5-flash"),
        prompt,
        schema: FunctionAnalysisSchema,
      })

      return result.object
    } catch (error) {
      console.error("AI analysis error:", error)
      throw new Error("Failed to analyze code with AI")
    }
  }

  static async analyzeProject(project: Project, analysisType = "full") {
    try {
      let codeContent = ""

      // Get code content based on project type
      if (project.project_type === "website" && project.url) {
        codeContent = await this.fetchWebsiteContent(project.url)
      } else if (project.project_type === "codebase") {
        // For codebase analysis, we'd typically integrate with GitHub API
        // For now, we'll use a placeholder
        codeContent = `
          // Sample codebase analysis
          function processUserData(userData) {
            if (!userData || !userData.email) {
              throw new Error('Invalid user data');
            }
            return {
              id: userData.id,
              email: userData.email.toLowerCase(),
              name: userData.name || 'Anonymous'
            };
          }

          async function saveToDatabase(data) {
            try {
              const result = await db.users.create(data);
              return result;
            } catch (error) {
              console.error('Database error:', error);
              throw error;
            }
          }
        `
      }

      if (!codeContent.trim()) {
        return {
          success: false,
          error: "No code content found to analyze",
        }
      }

      // Analyze with AI
      const analysisResult = await this.analyzeCodeWithAI(codeContent, project.project_type)

      // Store function maps in database
      let functionCount = 0
      for (const func of analysisResult.functions) {
        await DatabaseService.createFunctionMap({
          project_id: project.id,
          function_name: func.name,
          description: func.description,
          parameters: func.parameters,
          return_type: func.returnType,
          file_path: func.filePath,
          line_number: func.lineNumber,
          complexity_score: func.complexityScore,
          ai_analysis: {
            insights: func.insights,
            suggestions: func.suggestions,
          },
        })
        functionCount++
      }

      return {
        success: true,
        functionCount,
        analysisId: `analysis_${project.id}_${Date.now()}`,
      }
    } catch (error) {
      console.error("Analysis service error:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown analysis error",
      }
    }
  }
}
