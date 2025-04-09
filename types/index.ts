export type User = {
  id: string;
  email: string;
  role: 'coordinator' | 'client';
}

export type Project = {
  id: string;
  name: string;
  address: string;
  client_id: string;
  status: ProjectStatus;
  start_date: string;
  end_date: string;
  last_update: string;
  last_update_date: string;
  created_at: string;
}

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