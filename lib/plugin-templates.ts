import type { Project, FunctionMap } from "./database"

export class PluginTemplates {
  static generateBasicPlugin(project: Project, functions: FunctionMap[]): string {
    return `
/**
 * AI Learning Service - Basic Plugin
 * Generated for: ${project.name}
 * Generated on: ${new Date().toISOString()}
 */

(function(window) {
  'use strict';
  
  const AILearningPlugin = {
    projectName: '${project.name}',
    version: '1.0.0',
    
    insights: ${JSON.stringify(
      functions.map((f) => ({
        name: f.function_name,
        description: f.description,
        complexity: f.complexity_score,
        suggestions: f.ai_analysis?.suggestions || [],
      })),
      null,
      2,
    )},
    
    getFunctionInsights: function(functionName) {
      return this.insights.find(f => f.name === functionName) || null;
    },
    
    showAllInsights: function() {
      console.group('🤖 AI Learning Insights');
      this.insights.forEach(insight => {
        console.log(\`\${insight.name}: \${insight.description}\`);
      });
      console.groupEnd();
    },
    
    init: function() {
      console.log('🤖 AI Learning Plugin initialized');
      window.AILearning = this;
      return this;
    }
  };
  
  // Auto-initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => AILearningPlugin.init());
  } else {
    AILearningPlugin.init();
  }
  
})(window);
    `.trim()
  }

  static generateAdvancedPlugin(project: Project, functions: FunctionMap[], features: string[]): string {
    const hasVisualIndicator = features.includes("visual-indicator")
    const hasPerformanceMonitoring = features.includes("performance-monitoring")
    const hasErrorTracking = features.includes("error-tracking")

    return `
/**
 * AI Learning Service - Advanced Plugin
 * Generated for: ${project.name}
 * Features: ${features.join(", ")}
 * Generated on: ${new Date().toISOString()}
 */

(function(window) {
  'use strict';
  
  const AILearningPlugin = {
    projectName: '${project.name}',
    version: '1.1.0',
    features: ${JSON.stringify(features)},
    
    insights: ${JSON.stringify(
      functions.map((f) => ({
        name: f.function_name,
        description: f.description,
        complexity: f.complexity_score,
        insights: f.ai_analysis?.insights || [],
        suggestions: f.ai_analysis?.suggestions || [],
      })),
      null,
      2,
    )},
    
    ${
      hasPerformanceMonitoring
        ? `
    performanceData: {},
    
    trackPerformance: function(functionName, startTime, endTime) {
      if (!this.performanceData[functionName]) {
        this.performanceData[functionName] = [];
      }
      this.performanceData[functionName].push({
        duration: endTime - startTime,
        timestamp: Date.now()
      });
    },
    
    getPerformanceReport: function(functionName) {
      const data = this.performanceData[functionName] || [];
      if (data.length === 0) return null;
      
      const durations = data.map(d => d.duration);
      return {
        calls: data.length,
        avgDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
        minDuration: Math.min(...durations),
        maxDuration: Math.max(...durations)
      };
    },
    `
        : ""
    }
    
    ${
      hasErrorTracking
        ? `
    errors: [],
    
    trackError: function(error, functionName) {
      this.errors.push({
        error: error.message,
        function: functionName,
        timestamp: Date.now(),
        stack: error.stack
      });
      
      // Send to analytics if available
      if (typeof gtag !== 'undefined') {
        gtag('event', 'ai_learning_error', {
          function_name: functionName,
          error_message: error.message
        });
      }
    },
    
    getErrorReport: function() {
      return {
        totalErrors: this.errors.length,
        recentErrors: this.errors.slice(-10),
        errorsByFunction: this.errors.reduce((acc, err) => {
          acc[err.function] = (acc[err.function] || 0) + 1;
          return acc;
        }, {})
      };
    },
    `
        : ""
    }
    
    getFunctionInsights: function(functionName) {
      return this.insights.find(f => f.name === functionName) || null;
    },
    
    showInsights: function(functionName) {
      if (functionName) {
        const insight = this.getFunctionInsights(functionName);
        if (insight) {
          console.group('🤖 AI Insights for ' + functionName);
          console.log('Description:', insight.description);
          console.log('Complexity:', insight.complexity + '/10');
          console.log('Insights:', insight.insights);
          console.log('Suggestions:', insight.suggestions);
          ${
            hasPerformanceMonitoring
              ? `
          const perf = this.getPerformanceReport(functionName);
          if (perf) {
            console.log('Performance:', perf);
          }
          `
              : ""
          }
          console.groupEnd();
        }
      } else {
        console.group('🤖 All AI Insights');
        this.insights.forEach(f => {
          console.log(\`\${f.name} (Complexity: \${f.complexity}/10): \${f.description}\`);
        });
        console.groupEnd();
      }
    },
    
    ${
      hasVisualIndicator
        ? `
    addVisualIndicator: function() {
      const indicator = document.createElement('div');
      indicator.innerHTML = '🤖 AI Insights';
      indicator.style.cssText = \`
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #0891b2, #0e7490);
        color: white;
        padding: 12px 16px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        z-index: 10000;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(8, 145, 178, 0.3);
        transition: all 0.3s ease;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      \`;
      
      indicator.onmouseover = () => {
        indicator.style.transform = 'translateY(-2px)';
        indicator.style.boxShadow = '0 6px 16px rgba(8, 145, 178, 0.4)';
      };
      
      indicator.onmouseout = () => {
        indicator.style.transform = 'translateY(0)';
        indicator.style.boxShadow = '0 4px 12px rgba(8, 145, 178, 0.3)';
      };
      
      indicator.onclick = () => this.showInsights();
      document.body.appendChild(indicator);
    },
    `
        : ""
    }
    
    init: function() {
      console.log('🤖 AI Learning Plugin initialized for:', this.projectName);
      console.log('Features enabled:', this.features);
      
      window.AILearning = this;
      
      ${hasVisualIndicator ? "this.addVisualIndicator();" : ""}
      
      ${
        hasErrorTracking
          ? `
      // Global error handler
      window.addEventListener('error', (event) => {
        this.trackError(event.error, 'global');
      });
      `
          : ""
      }
      
      return this;
    }
  };
  
  // Auto-initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => AILearningPlugin.init());
  } else {
    AILearningPlugin.init();
  }
  
})(window);
    `.trim()
  }
}
