# Seamless Alpha Database Schema Diagram

```mermaid
erDiagram
    PROFILES {
        uuid id PK
        text email
        text full_name
        text company
        text phone
        text role
        timestamp created_at
        timestamp updated_at
    }
    
    CLIENT_COMPANIES {
        uuid id PK
        text name
        text address
        text city
        text province
        text postal_code
        text phone
        text email
        text website
        text notes
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }
    
    CLIENT_CONTACTS {
        uuid id PK
        uuid company_id FK
        uuid profile_id FK
        text first_name
        text last_name
        text title
        text email
        text phone
        boolean is_primary
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }
    
    SUBCONTRACTORS {
        uuid id PK
        text name
        text trade
        text address
        text city
        text province
        text postal_code
        text contact_name
        text phone
        text email
        text license_number
        date insurance_expiry
        text notes
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }
    
    PROJECTS {
        uuid id PK
        text name
        text description
        text address
        text city
        text province
        text postal_code
        text project_code
        uuid client_company_id FK
        uuid primary_contact_id FK
        text status
        text last_update
        date last_update_date
        date start_date
        date end_date
        decimal estimated_value
        decimal contract_value
        decimal holdback_percentage
        decimal holdback_amount
        text po_number
        text permit_number
        text site_foreman
        text foreman_phone
        timestamp created_at
        timestamp updated_at
        uuid created_by FK
    }
    
    PROJECT_PHASES {
        uuid id PK
        uuid project_id FK
        text name
        text description
        date start_date
        date end_date
        text status
        timestamp created_at
        timestamp updated_at
    }
    
    COST_CODES {
        uuid id PK
        text code
        text name
        text description
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }
    
    BUDGET_ITEMS {
        uuid id PK
        uuid project_id FK
        uuid cost_code_id FK
        text description
        decimal estimated_amount
        decimal actual_amount
        text notes
        timestamp created_at
        timestamp updated_at
    }
    
    EXPENSES {
        uuid id PK
        uuid project_id FK
        uuid budget_item_id FK
        uuid subcontractor_id FK
        text description
        decimal amount
        date date
        text invoice_number
        text receipt_path
        uuid created_by FK
        timestamp created_at
        timestamp updated_at
    }
    
    PROJECT_STATUS_HISTORY {
        uuid id PK
        uuid project_id FK
        text status
        text update_text
        uuid updated_by FK
        timestamp created_at
    }
    
    PROJECT_ASSIGNMENTS {
        uuid id PK
        uuid project_id FK
        uuid profile_id FK
        text role
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }
    
    COMMENTS {
        uuid id PK
        uuid project_id FK
        uuid user_id FK
        text text
        boolean is_internal
        timestamp created_at
        timestamp updated_at
    }
    
    DOCUMENTS {
        uuid id PK
        uuid project_id FK
        text name
        text file_path
        text file_type
        bigint file_size
        text category
        text description
        boolean is_internal
        uuid uploaded_by FK
        timestamp created_at
    }
    
    TIME_ENTRIES {
        uuid id PK
        uuid project_id FK
        uuid phase_id FK
        uuid user_id FK
        date date
        decimal hours
        text description
        boolean is_billable
        boolean is_approved
        uuid approved_by FK
        timestamp approved_at
        timestamp created_at
        timestamp updated_at
    }
    
    INVOICES {
        uuid id PK
        uuid project_id FK
        text invoice_number
        uuid client_company_id FK
        date date
        date due_date
        decimal amount
        decimal tax_amount
        text status
        text notes
        uuid created_by FK
        timestamp created_at
        timestamp updated_at
    }
    
    INVOICE_ITEMS {
        uuid id PK
        uuid invoice_id FK
        text description
        decimal quantity
        decimal unit_price
        decimal amount
        timestamp created_at
        timestamp updated_at
    }
    
    AUTH_USERS ||--o{ PROFILES : "extended by"
    PROFILES ||--o{ PROJECT_ASSIGNMENTS : "assigned to"
    PROFILES ||--o{ COMMENTS : "made by"
    PROFILES ||--o{ CLIENT_CONTACTS : "linked to"
    PROFILES ||--o{ PROJECTS : "created by"
    PROFILES ||--o{ PROJECT_STATUS_HISTORY : "updated by"
    PROFILES ||--o{ DOCUMENTS : "uploaded by"
    PROFILES ||--o{ TIME_ENTRIES : "entered by"
    PROFILES ||--o{ TIME_ENTRIES : "approved by"
    PROFILES ||--o{ EXPENSES : "created by"
    PROFILES ||--o{ INVOICES : "created by"
    
    CLIENT_COMPANIES ||--o{ CLIENT_CONTACTS : "has"
    CLIENT_COMPANIES ||--o{ PROJECTS : "has"
    CLIENT_COMPANIES ||--o{ INVOICES : "billed to"
    
    CLIENT_CONTACTS ||--o{ PROJECTS : "primary contact for"
    
    PROJECTS ||--o{ PROJECT_PHASES : "has"
    PROJECTS ||--o{ PROJECT_STATUS_HISTORY : "has"
    PROJECTS ||--o{ PROJECT_ASSIGNMENTS : "has"
    PROJECTS ||--o{ COMMENTS : "has"
    PROJECTS ||--o{ DOCUMENTS : "has"
    PROJECTS ||--o{ TIME_ENTRIES : "tracked for"
    PROJECTS ||--o{ BUDGET_ITEMS : "has"
    PROJECTS ||--o{ EXPENSES : "has"
    PROJECTS ||--o{ INVOICES : "has"
    
    PROJECT_PHASES ||--o{ TIME_ENTRIES : "tracked for"
    
    COST_CODES ||--o{ BUDGET_ITEMS : "used in"
    
    BUDGET_ITEMS ||--o{ EXPENSES : "linked to"
    
    SUBCONTRACTORS ||--o{ EXPENSES : "paid to"
    
    INVOICES ||--o{ INVOICE_ITEMS : "contains"
```

## Database Schema Overview

The Seamless Alpha database schema is designed for a construction project management application with the following key features:

### Core Entities

- **Profiles**: Extends Supabase auth users with additional information and role (coordinator, client, admin)
- **Client Companies**: Organizations that hire the construction company
- **Client Contacts**: Individuals who represent client companies
- **Projects**: Central entity containing all project information (status, timeline, financials)
- **Subcontractors**: External companies who perform specialized work

### Project Management

- **Project Phases**: Segments of a project with their own timeline and status
- **Project Status History**: Timeline of all status changes with updates
- **Project Assignments**: Team member assignments to projects with specific roles

### Financial Management

- **Cost Codes**: Standard categories for budgeting and expense tracking
- **Budget Items**: Line items in a project budget
- **Expenses**: Actual costs incurred on projects
- **Invoices & Invoice Items**: Billing to clients

### Communication & Documentation

- **Comments**: Discussion threads on projects (internal or client-visible)
- **Documents**: Files attached to projects (categorized and permission-controlled)

### Time Tracking

- **Time Entries**: Hours logged against projects and phases

## Security Model

- Row-Level Security (RLS) policies ensure:
  - Clients can only see their own projects
  - Internal notes and documents remain private from clients
  - Only coordinators and admins can create/modify most entities
  - Helper functions determine access rights for complex cases

## Performance Optimizations

- Strategic indexing on:
  - Foreign keys for relationship lookups
  - Frequently queried fields (status, dates, codes)
  - Text search fields using GIN indexes
  - Status filters and date ranges

## Realtime Updates

- Configured for projects, status history, comments, and phases to enable instant updates across clients

## Triggers & Automation

- Automatic timestamp maintenance
- Status change recording
- Holdback amount calculation