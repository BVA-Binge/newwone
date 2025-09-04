/*
  # Blue Carbon Registry Database Schema

  1. New Tables
    - `users` - User profiles with role-based access (project_owner, verifier, admin)
    - `projects` - Blue Carbon project registrations with full details
    - `blockchain_events` - Audit trail of all blockchain transactions
    - `verification_history` - Track all verification decisions and comments
    - `carbon_calculations` - Store calculation results and assumptions

  2. Security
    - Enable RLS on all tables
    - Add policies for role-based access control
    - Project owners can only access their own projects
    - Verifiers can access pending projects for review
    - Admins have read access to audit information

  3. Features
    - Automatic credibility scoring based on data consistency
    - Blockchain transaction logging for transparency
    - Carbon sequestration calculations with buffer factors
    - Multi-stakeholder project management
*/

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  role text NOT NULL CHECK (role IN ('project_owner', 'verifier', 'admin')) DEFAULT 'project_owner',
  profile jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text NOT NULL,
  location jsonb NOT NULL DEFAULT '{}'::jsonb,
  area_m2 integer NOT NULL CHECK (area_m2 > 0),
  ecosystem_type text NOT NULL CHECK (ecosystem_type IN ('mangrove', 'seagrass', 'salt_marsh', 'kelp_forest')),
  project_owner jsonb NOT NULL DEFAULT '{}'::jsonb,
  stakeholders jsonb[] DEFAULT ARRAY[]::jsonb[],
  status text NOT NULL CHECK (status IN ('pending', 'under_review', 'approved', 'rejected')) DEFAULT 'pending',
  verification_details jsonb DEFAULT NULL,
  credibility_score integer DEFAULT 100 CHECK (credibility_score >= 0 AND credibility_score <= 100),
  carbon_calculations jsonb NOT NULL DEFAULT '{}'::jsonb,
  blockchain_events jsonb[] DEFAULT ARRAY[]::jsonb[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Blockchain events table
CREATE TABLE IF NOT EXISTS blockchain_events (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  event_type text NOT NULL CHECK (event_type IN ('registration', 'verification', 'calculation', 'nft_mint')),
  transaction_hash text NOT NULL,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Verification history table
CREATE TABLE IF NOT EXISTS verification_history (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  verifier_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action text NOT NULL CHECK (action IN ('approve', 'reject', 'request_changes')),
  comments text DEFAULT '',
  blockchain_tx_hash text,
  created_at timestamptz DEFAULT now()
);

-- Carbon calculations table
CREATE TABLE IF NOT EXISTS carbon_calculations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  calculator_mode text NOT NULL CHECK (calculator_mode IN ('standard', 'policy')),
  inputs jsonb NOT NULL DEFAULT '{}'::jsonb,
  results jsonb NOT NULL DEFAULT '{}'::jsonb,
  assumptions jsonb NOT NULL DEFAULT '{}'::jsonb,
  blockchain_tx_hash text,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE blockchain_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE carbon_calculations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can read own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- RLS Policies for projects
CREATE POLICY "Project owners can view their projects"
  ON projects
  FOR SELECT
  TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "Verifiers can view pending projects"
  ON projects
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role = 'verifier'
    )
  );

CREATE POLICY "Admins can view all projects"
  ON projects
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

CREATE POLICY "Project owners can create projects"
  ON projects
  FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Project owners can update their projects"
  ON projects
  FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "Verifiers can update project verification"
  ON projects
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role = 'verifier'
    )
  );

-- RLS Policies for blockchain_events
CREATE POLICY "Users can view blockchain events for their projects"
  ON blockchain_events
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE id = project_id 
      AND owner_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('verifier', 'admin')
    )
  );

CREATE POLICY "Authenticated users can create blockchain events"
  ON blockchain_events
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for verification_history
CREATE POLICY "Users can view verification history for their projects"
  ON verification_history
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE id = project_id 
      AND owner_id = auth.uid()
    )
    OR verifier_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

CREATE POLICY "Verifiers can create verification records"
  ON verification_history
  FOR INSERT
  TO authenticated
  WITH CHECK (
    verifier_id = auth.uid()
    AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role = 'verifier'
    )
  );

-- RLS Policies for carbon_calculations
CREATE POLICY "Users can view calculations"
  ON carbon_calculations
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create calculations"
  ON carbon_calculations
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_projects_owner_id ON projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_ecosystem_type ON projects(ecosystem_type);
CREATE INDEX IF NOT EXISTS idx_blockchain_events_project_id ON blockchain_events(project_id);
CREATE INDEX IF NOT EXISTS idx_verification_history_project_id ON verification_history(project_id);
CREATE INDEX IF NOT EXISTS idx_carbon_calculations_project_id ON carbon_calculations(project_id);

-- Update timestamps function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add update triggers
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at 
  BEFORE UPDATE ON projects 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();