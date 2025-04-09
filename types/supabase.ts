// Project Status Types
export type ProjectStatus = 
  | 'Planning'
  | 'Permitting'
  | 'Demo'
  | 'Foundation'
  | 'Framing'
  | 'Mechanical'
  | 'Electrical'
  | 'Plumbing'
  | 'Drywall'
  | 'Finishing'
  | 'Landscaping'
  | 'Punch List'
  | 'Complete';

// Phase Status Types
export type PhaseStatus = 'Pending' | 'In Progress' | 'Completed' | 'Delayed';

// Invoice Status Types
export type InvoiceStatus = 'Draft' | 'Sent' | 'Paid' | 'Overdue' | 'Cancelled';

// Document Category Types
export type DocumentCategory = 'Contract' | 'Permit' | 'Drawing' | 'Invoice' | 'Photo' | 'Other';

// User Role Types
export type UserRole = 'coordinator' | 'client' | 'admin';

// Project Assignment Role Types
export type ProjectAssignmentRole = 'Project Manager' | 'Coordinator' | 'Site Supervisor' | 'Estimator' | 'Admin';

// Profile Type
export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  company: string | null;
  phone: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
};

// Client Company Type
export type ClientCompany = {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  province: string | null;
  postal_code: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

// Client Contact Type
export type ClientContact = {
  id: string;
  company_id: string;
  profile_id: string | null;
  first_name: string;
  last_name: string;
  title: string | null;
  email: string | null;
  phone: string | null;
  is_primary: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

// Subcontractor Type
export type Subcontractor = {
  id: string;
  name: string;
  trade: string;
  address: string | null;
  city: string | null;
  province: string | null;
  postal_code: string | null;
  contact_name: string | null;
  phone: string | null;
  email: string | null;
  license_number: string | null;
  insurance_expiry: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

// Project Type
export type Project = {
  id: string;
  name: string;
  description: string | null;
  address: string;
  city: string | null;
  province: string | null;
  postal_code: string | null;
  project_code: string | null;
  client_company_id: string;
  primary_contact_id: string | null;
  status: ProjectStatus;
  last_update: string | null;
  last_update_date: string | null;
  start_date: string | null;
  end_date: string | null;
  estimated_value: number | null;
  contract_value: number | null;
  holdback_percentage: number | null;
  holdback_amount: number | null;
  po_number: string | null;
  permit_number: string | null;
  site_foreman: string | null;
  foreman_phone: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
};

// Project Phase Type
export type ProjectPhase = {
  id: string;
  project_id: string;
  name: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  status: PhaseStatus;
  created_at: string;
  updated_at: string;
};

// Cost Code Type
export type CostCode = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

// Budget Item Type
export type BudgetItem = {
  id: string;
  project_id: string;
  cost_code_id: string | null;
  description: string;
  estimated_amount: number;
  actual_amount: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

// Expense Type
export type Expense = {
  id: string;
  project_id: string;
  budget_item_id: string | null;
  subcontractor_id: string | null;
  description: string;
  amount: number;
  date: string;
  invoice_number: string | null;
  receipt_path: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

// Project Status History Type
export type ProjectStatusHistory = {
  id: string;
  project_id: string;
  status: string;
  update_text: string | null;
  updated_by: string | null;
  created_at: string;
};

// Project Assignment Type
export type ProjectAssignment = {
  id: string;
  project_id: string;
  profile_id: string;
  role: ProjectAssignmentRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

// Comment Type
export type Comment = {
  id: string;
  project_id: string;
  user_id: string;
  text: string;
  is_internal: boolean;
  created_at: string;
  updated_at: string;
};

// Document Type
export type Document = {
  id: string;
  project_id: string;
  name: string;
  file_path: string;
  file_type: string | null;
  file_size: number | null;
  category: DocumentCategory | null;
  description: string | null;
  is_internal: boolean;
  uploaded_by: string | null;
  created_at: string;
};

// Time Entry Type
export type TimeEntry = {
  id: string;
  project_id: string;
  phase_id: string | null;
  user_id: string;
  date: string;
  hours: number;
  description: string | null;
  is_billable: boolean;
  is_approved: boolean;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
};

// Invoice Type
export type Invoice = {
  id: string;
  project_id: string;
  invoice_number: string;
  client_company_id: string;
  date: string;
  due_date: string;
  amount: number;
  tax_amount: number | null;
  status: InvoiceStatus;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

// Invoice Item Type
export type InvoiceItem = {
  id: string;
  invoice_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
  created_at: string;
  updated_at: string;
};

// Types with relations included
export type ProjectWithRelations = Project & {
  client_company: ClientCompany;
  primary_contact?: ClientContact;
  created_by_user?: Profile;
  phases?: ProjectPhase[];
  budget_items?: BudgetItem[];
  status_history?: ProjectStatusHistory[];
  team_members?: (ProjectAssignment & { profile: Profile })[];
};

export type ProjectStatusHistoryWithUser = ProjectStatusHistory & {
  updated_by_user?: Profile;
};

export type CommentWithUser = Comment & {
  user: Profile;
};

export type DocumentWithUser = Document & {
  uploader?: Profile;
};

export type TimeEntryWithRelations = TimeEntry & {
  user: Profile;
  phase?: ProjectPhase;
  approved_by_user?: Profile;
};

export type ExpenseWithRelations = Expense & {
  budget_item?: BudgetItem;
  subcontractor?: Subcontractor;
  created_by_user?: Profile;
};