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