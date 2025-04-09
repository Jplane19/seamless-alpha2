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