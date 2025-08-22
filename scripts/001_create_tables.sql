-- Create the main tables for AI Learning Service

-- Projects table to store website/codebase analysis projects
CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    url VARCHAR(500),
    project_type VARCHAR(50) NOT NULL CHECK (project_type IN ('website', 'codebase')),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'analyzing', 'completed', 'failed')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Function maps table to store AI-generated analysis results
CREATE TABLE IF NOT EXISTS function_maps (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    function_name VARCHAR(255) NOT NULL,
    description TEXT,
    parameters JSONB,
    return_type VARCHAR(100),
    file_path VARCHAR(500),
    line_number INTEGER,
    complexity_score INTEGER CHECK (complexity_score >= 1 AND complexity_score <= 10),
    ai_analysis JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Plugin configurations table to store generated plugin settings
CREATE TABLE IF NOT EXISTS plugin_configs (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    config_name VARCHAR(255) NOT NULL,
    plugin_code TEXT NOT NULL,
    version VARCHAR(20) DEFAULT '1.0.0',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_type ON projects(project_type);
CREATE INDEX IF NOT EXISTS idx_function_maps_project_id ON function_maps(project_id);
CREATE INDEX IF NOT EXISTS idx_plugin_configs_project_id ON plugin_configs(project_id);
CREATE INDEX IF NOT EXISTS idx_plugin_configs_active ON plugin_configs(is_active);
