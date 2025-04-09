-- Seamless Alpha Enhanced Database Schema for Supabase

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  company TEXT,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('coordinator', 'client', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Client Companies table
CREATE TABLE client_companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  province TEXT,
  postal_code TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Client Contacts table
CREATE TABLE client_contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES client_companies(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  title TEXT,
  email TEXT,
  phone TEXT,
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Subcontractors table
CREATE TABLE subcontractors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  trade TEXT NOT NULL,
  address TEXT,
  city TEXT,
  province TEXT,
  postal_code TEXT,
  contact_name TEXT,
  phone TEXT,
  email TEXT,
  license_number TEXT,
  insurance_expiry DATE,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Projects table (enhanced)
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  address TEXT NOT NULL,
  city TEXT,
  province TEXT,
  postal_code TEXT,
  project_code TEXT,
  client_company_id UUID NOT NULL REFERENCES client_companies(id),
  primary_contact_id UUID REFERENCES client_contacts(id),
  status TEXT NOT NULL CHECK (status IN (
    'Planning', 'Permitting', 'Demo', 'Foundation', 'Framing', 
    'Mechanical', 'Electrical', 'Plumbing', 'Drywall', 
    'Finishing', 'Landscaping', 'Punch List', 'Complete'
  )),
  last_update TEXT,
  last_update_date DATE,
  start_date DATE,
  end_date DATE,
  estimated_value DECIMAL(12, 2),
  contract_value DECIMAL(12, 2),
  holdback_percentage DECIMAL(5, 2),
  holdback_amount DECIMAL(12, 2),
  po_number TEXT,
  permit_number TEXT,
  site_foreman TEXT,
  foreman_phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id)
);

-- Project Phases table
CREATE TABLE project_phases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'In Progress', 'Completed', 'Delayed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Cost Codes table
CREATE TABLE cost_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Budget Items table
CREATE TABLE budget_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  cost_code_id UUID REFERENCES cost_codes(id),
  description TEXT NOT NULL,
  estimated_amount DECIMAL(12, 2) NOT NULL,
  actual_amount DECIMAL(12, 2),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Expenses table
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  budget_item_id UUID REFERENCES budget_items(id),
  subcontractor_id UUID REFERENCES subcontractors(id),
  description TEXT NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  date DATE NOT NULL,
  invoice_number TEXT,
  receipt_path TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Project Status History table
CREATE TABLE project_status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  update_text TEXT,
  updated_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Project Assignments table (linking projects to team members)
CREATE TABLE project_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id),
  role TEXT NOT NULL CHECK (role IN ('Project Manager', 'Coordinator', 'Site Supervisor', 'Estimator', 'Admin')),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(project_id, profile_id, role)
);

-- Comments table for project discussions
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id),
  text TEXT NOT NULL,
  is_internal BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Documents table for file storage
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT,
  file_size BIGINT,
  category TEXT CHECK (category IN ('Contract', 'Permit', 'Drawing', 'Invoice', 'Photo', 'Other')),
  description TEXT,
  is_internal BOOLEAN NOT NULL DEFAULT FALSE,
  uploaded_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Time Tracking table for future expansion
CREATE TABLE time_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  phase_id UUID REFERENCES project_phases(id),
  user_id UUID NOT NULL REFERENCES profiles(id),
  date DATE NOT NULL,
  hours DECIMAL(5, 2) NOT NULL,
  description TEXT,
  is_billable BOOLEAN NOT NULL DEFAULT TRUE,
  is_approved BOOLEAN NOT NULL DEFAULT FALSE,
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Invoices table for future expansion
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  invoice_number TEXT NOT NULL,
  client_company_id UUID NOT NULL REFERENCES client_companies(id),
  date DATE NOT NULL,
  due_date DATE NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  tax_amount DECIMAL(12, 2),
  status TEXT NOT NULL CHECK (status IN ('Draft', 'Sent', 'Paid', 'Overdue', 'Cancelled')),
  notes TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Invoice Items table
CREATE TABLE invoice_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL,
  unit_price DECIMAL(12, 2) NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==================
-- RLS POLICIES
-- ==================

-- Enable row level security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE subcontractors ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE cost_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is admin or coordinator
CREATE OR REPLACE FUNCTION is_admin_or_coordinator()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role IN ('admin', 'coordinator')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user has access to a project
CREATE OR REPLACE FUNCTION has_project_access(project_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM projects p
    JOIN client_contacts cc ON p.primary_contact_id = cc.id
    JOIN profiles pr ON cc.profile_id = pr.id
    WHERE p.id = project_uuid AND pr.id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM project_assignments
    WHERE project_id = project_uuid AND profile_id = auth.uid() AND is_active = true
  ) OR is_admin_or_coordinator();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies for profiles table
CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins and coordinators can read all profiles" ON profiles
  FOR SELECT USING (is_admin_or_coordinator());

CREATE POLICY "Admins can update all profiles" ON profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for client_companies table
CREATE POLICY "Anyone authenticated can read client companies" ON client_companies
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Only admins and coordinators can modify client companies" ON client_companies
  FOR ALL USING (is_admin_or_coordinator());

-- Similar policies for other tables based on role and project access
-- ...

-- RLS Policies for projects
CREATE POLICY "Users can view projects they have access to" ON projects
  FOR SELECT USING (has_project_access(id));

CREATE POLICY "Only admins and coordinators can modify projects" ON projects
  FOR ALL USING (is_admin_or_coordinator());

-- RLS Policies for comments
CREATE POLICY "Users can view comments on accessible projects" ON comments
  FOR SELECT USING (has_project_access(project_id));

CREATE POLICY "Internal comments visible only to staff" ON comments
  FOR SELECT USING (
    (NOT is_internal) OR is_admin_or_coordinator()
  );

CREATE POLICY "Users can create comments on accessible projects" ON comments
  FOR INSERT WITH CHECK (
    has_project_access(project_id) AND user_id = auth.uid()
  );

CREATE POLICY "Users can update their own comments" ON comments
  FOR UPDATE USING (user_id = auth.uid());

-- Documents policies
CREATE POLICY "Users can view documents on accessible projects" ON documents
  FOR SELECT USING (
    has_project_access(project_id) AND (NOT is_internal OR is_admin_or_coordinator())
  );

CREATE POLICY "Only admins and coordinators can manage documents" ON documents
  FOR ALL USING (is_admin_or_coordinator());

-- ==================
-- INDEXES
-- ==================

-- Indexes for profiles
CREATE INDEX idx_profiles_role ON profiles(role);

-- Indexes for client tables
CREATE INDEX idx_client_companies_name ON client_companies(name);
CREATE INDEX idx_client_contacts_company_id ON client_contacts(company_id);
CREATE INDEX idx_client_contacts_profile_id ON client_contacts(profile_id);
CREATE INDEX idx_client_contacts_name ON client_contacts(first_name, last_name);

-- Indexes for projects
CREATE INDEX idx_projects_client_company_id ON projects(client_company_id);
CREATE INDEX idx_projects_primary_contact_id ON projects(primary_contact_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_created_at ON projects(created_at);
CREATE INDEX idx_projects_project_code ON projects(project_code);
CREATE INDEX idx_projects_address ON projects USING gin (to_tsvector('english', address));
CREATE INDEX idx_projects_city ON projects(city);

-- Indexes for project_phases
CREATE INDEX idx_project_phases_project_id ON project_phases(project_id);
CREATE INDEX idx_project_phases_status ON project_phases(status);

-- Indexes for financial tables
CREATE INDEX idx_budget_items_project_id ON budget_items(project_id);
CREATE INDEX idx_budget_items_cost_code_id ON budget_items(cost_code_id);
CREATE INDEX idx_expenses_project_id ON expenses(project_id);
CREATE INDEX idx_expenses_budget_item_id ON expenses(budget_item_id);
CREATE INDEX idx_expenses_date ON expenses(date);

-- Indexes for status history
CREATE INDEX idx_project_status_history_project_id ON project_status_history(project_id);
CREATE INDEX idx_project_status_history_created_at ON project_status_history(created_at);

-- Indexes for project assignments
CREATE INDEX idx_project_assignments_project_id ON project_assignments(project_id);
CREATE INDEX idx_project_assignments_profile_id ON project_assignments(profile_id);

-- Indexes for comments
CREATE INDEX idx_comments_project_id ON comments(project_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_comments_created_at ON comments(created_at);

-- Indexes for documents
CREATE INDEX idx_documents_project_id ON documents(project_id);
CREATE INDEX idx_documents_category ON documents(category);
CREATE INDEX idx_documents_name ON documents USING gin (to_tsvector('english', name));

-- Indexes for time tracking
CREATE INDEX idx_time_entries_project_id ON time_entries(project_id);
CREATE INDEX idx_time_entries_user_id ON time_entries(user_id);
CREATE INDEX idx_time_entries_date ON time_entries(date);
CREATE INDEX idx_time_entries_is_approved ON time_entries(is_approved);

-- Indexes for invoices
CREATE INDEX idx_invoices_project_id ON invoices(project_id);
CREATE INDEX idx_invoices_client_company_id ON invoices(client_company_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_date ON invoices(date);
CREATE INDEX idx_invoice_items_invoice_id ON invoice_items(invoice_id);

-- ==================
-- TRIGGERS
-- ==================

-- Trigger function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all tables with that column
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_client_companies_updated_at
  BEFORE UPDATE ON client_companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_client_contacts_updated_at
  BEFORE UPDATE ON client_contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subcontractors_updated_at
  BEFORE UPDATE ON subcontractors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_phases_updated_at
  BEFORE UPDATE ON project_phases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cost_codes_updated_at
  BEFORE UPDATE ON cost_codes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budget_items_updated_at
  BEFORE UPDATE ON budget_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at
  BEFORE UPDATE ON expenses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_assignments_updated_at
  BEFORE UPDATE ON project_assignments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_time_entries_updated_at
  BEFORE UPDATE ON time_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoice_items_updated_at
  BEFORE UPDATE ON invoice_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger to record project status changes
CREATE OR REPLACE FUNCTION record_project_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF (OLD.status IS NULL OR NEW.status != OLD.status OR NEW.last_update != OLD.last_update) THEN
    INSERT INTO project_status_history (project_id, status, update_text, updated_by)
    VALUES (NEW.id, NEW.status, NEW.last_update, auth.uid());
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER record_project_status_change
  AFTER UPDATE ON projects
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status OR OLD.last_update IS DISTINCT FROM NEW.last_update)
  EXECUTE FUNCTION record_project_status_change();

-- Trigger to calculate holdback amount based on percentage
CREATE OR REPLACE FUNCTION calculate_holdback_amount()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.contract_value IS NOT NULL AND NEW.holdback_percentage IS NOT NULL THEN
    NEW.holdback_amount := (NEW.contract_value * NEW.holdback_percentage) / 100;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_project_holdback_amount
  BEFORE INSERT OR UPDATE ON projects
  FOR EACH ROW
  WHEN (NEW.contract_value IS NOT NULL AND NEW.holdback_percentage IS NOT NULL)
  EXECUTE FUNCTION calculate_holdback_amount();

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE projects;
ALTER PUBLICATION supabase_realtime ADD TABLE project_status_history;
ALTER PUBLICATION supabase_realtime ADD TABLE comments;
ALTER PUBLICATION supabase_realtime ADD TABLE project_phases;