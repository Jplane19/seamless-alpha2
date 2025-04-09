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
-- RLS Policies for client_contacts table
CREATE POLICY "Anyone authenticated can read client contacts" ON client_contacts
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Only admins and coordinators can modify client contacts" ON client_contacts
  FOR ALL USING (is_admin_or_coordinator());

-- RLS Policies for subcontractors table
CREATE POLICY "Anyone authenticated can read subcontractors" ON subcontractors
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Only admins and coordinators can modify subcontractors" ON subcontractors
  FOR ALL USING (is_admin_or_coordinator());

-- RLS Policies for projects
CREATE POLICY "Users can view projects they have access to" ON projects
  FOR SELECT USING (has_project_access(id));

CREATE POLICY "Only admins and coordinators can modify projects" ON projects
  FOR ALL USING (is_admin_or_coordinator());

-- RLS Policies for project_phases
CREATE POLICY "Users can view phases for accessible projects" ON project_phases
  FOR SELECT USING (has_project_access(project_id));

CREATE POLICY "Only admins and coordinators can modify project phases" ON project_phases
  FOR ALL USING (is_admin_or_coordinator());

-- RLS Policies for cost_codes
CREATE POLICY "Anyone authenticated can read cost codes" ON cost_codes
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Only admins and coordinators can modify cost codes" ON cost_codes
  FOR ALL USING (is_admin_or_coordinator());

-- RLS Policies for budget_items
CREATE POLICY "Users can view budget items for accessible projects" ON budget_items
  FOR SELECT USING (has_project_access(project_id));

CREATE POLICY "Only admins and coordinators can modify budget items" ON budget_items
  FOR ALL USING (is_admin_or_coordinator());

-- RLS Policies for expenses
CREATE POLICY "Users can view expenses for accessible projects" ON expenses
  FOR SELECT USING (has_project_access(project_id));

CREATE POLICY "Only admins and coordinators can modify expenses" ON expenses
  FOR ALL USING (is_admin_or_coordinator());

-- RLS Policies for project_status_history
CREATE POLICY "Users can view status history for accessible projects" ON project_status_history
  FOR SELECT USING (has_project_access(project_id));

CREATE POLICY "Only admins and coordinators can add status history" ON project_status_history
  FOR INSERT USING (is_admin_or_coordinator());

-- RLS Policies for project_assignments
CREATE POLICY "Users can view assignments for accessible projects" ON project_assignments
  FOR SELECT USING (has_project_access(project_id));

CREATE POLICY "Only admins and coordinators can modify assignments" ON project_assignments
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

CREATE POLICY "Users can delete their own comments" ON comments
  FOR DELETE USING (user_id = auth.uid());

-- Documents policies
CREATE POLICY "Users can view documents on accessible projects" ON documents
  FOR SELECT USING (
    has_project_access(project_id) AND (NOT is_internal OR is_admin_or_coordinator())
  );

CREATE POLICY "Only admins and coordinators can manage documents" ON documents
  FOR ALL USING (is_admin_or_coordinator());

-- RLS Policies for time_entries
CREATE POLICY "Users can view time entries for accessible projects" ON time_entries
  FOR SELECT USING (has_project_access(project_id));

CREATE POLICY "Users can create their own time entries" ON time_entries
  FOR INSERT WITH CHECK (
    has_project_access(project_id) AND user_id = auth.uid()
  );

CREATE POLICY "Users can update their own time entries" ON time_entries
  FOR UPDATE USING (
    user_id = auth.uid() AND NOT is_approved
  );

CREATE POLICY "Only admins and coordinators can approve time entries" ON time_entries
  FOR UPDATE USING (
    is_admin_or_coordinator()
  );

-- RLS Policies for invoices
CREATE POLICY "Users can view invoices for accessible projects" ON invoices
  FOR SELECT USING (has_project_access(project_id));

CREATE POLICY "Only admins and coordinators can manage invoices" ON invoices
  FOR ALL USING (is_admin_or_coordinator());

-- RLS Policies for invoice_items
CREATE POLICY "Users can view invoice items for accessible invoices" ON invoice_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM invoices
      WHERE invoices.id = invoice_items.invoice_id
      AND has_project_access(invoices.project_id)
    )
  );

CREATE POLICY "Only admins and coordinators can manage invoice items" ON invoice_items
  FOR ALL USING (is_admin_or_coordinator());