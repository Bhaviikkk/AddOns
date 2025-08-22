import type { Project, FunctionMap } from "./database"
import { PluginTemplates } from "./plugin-templates"

export class PluginGenerator {
  static async generatePlugin(project: Project, functions: FunctionMap[], features: string[] = []): Promise<string> {
    // Use advanced template if features are specified, otherwise use basic template
    if (features.length > 0) {
      return PluginTemplates.generateAdvancedPlugin(project, functions, features)
    } else {
      return PluginTemplates.generateBasicPlugin(project, functions)
    }
  }
}
