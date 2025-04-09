-- Script to check for existing tables and drop them if needed for a clean start

-- Check if tables exist and drop them in the correct order to avoid foreign key conflicts
DO $$ 
DECLARE
  table_exists BOOLEAN;
BEGIN
  -- Check and drop invoice_items
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'invoice_items'
  ) INTO table_exists;
  
  IF table_exists THEN
    DROP TABLE IF EXISTS public.invoice_items;
    RAISE NOTICE 'Dropped table: invoice_items';
  END IF;

  -- Check and drop invoices
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'invoices'
  ) INTO table_exists;
  
  IF table_exists THEN
    DROP TABLE IF EXISTS public.invoices;
    RAISE NOTICE 'Dropped table: invoices';
  END IF;

  -- Check and drop time_entries
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'time_entries'
  ) INTO table_exists;
  
  IF table_exists THEN
    DROP TABLE IF EXISTS public.time_entries;
    RAISE NOTICE 'Dropped table: time_entries';
  END IF;

  -- Check and drop documents
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'documents'
  ) INTO table_exists;
  
  IF table_exists THEN
    DROP TABLE IF EXISTS public.documents;
    RAISE NOTICE 'Dropped table: documents';
  END IF;

  -- Check and drop comments
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'comments'
  ) INTO table_exists;
  
  IF table_exists THEN
    DROP TABLE IF EXISTS public.comments;
    RAISE NOTICE 'Dropped table: comments';
  END IF;

  -- Check and drop project_assignments
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'project_assignments'
  ) INTO table_exists;
  
  IF table_exists THEN
    DROP TABLE IF EXISTS public.project_assignments;
    RAISE NOTICE 'Dropped table: project_assignments';
  END IF;

  -- Check and drop project_status_history
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'project_status_history'
  ) INTO table_exists;
  
  IF table_exists THEN
    DROP TABLE IF EXISTS public.project_status_history;
    RAISE NOTICE 'Dropped table: project_status_history';
  END IF;

  -- Check and drop expenses
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'expenses'
  ) INTO table_exists;
  
  IF table_exists THEN
    DROP TABLE IF EXISTS public.expenses;
    RAISE NOTICE 'Dropped table: expenses';
  END IF;

  -- Check and drop budget_items
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'budget_items'
  ) INTO table_exists;
  
  IF table_exists THEN
    DROP TABLE IF EXISTS public.budget_items;
    RAISE NOTICE 'Dropped table: budget_items';
  END IF;

  -- Check and drop project_phases
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'project_phases'
  ) INTO table_exists;
  
  IF table_exists THEN
    DROP TABLE IF EXISTS public.project_phases;
    RAISE NOTICE 'Dropped table: project_phases';
  END IF;

  -- Check and drop projects
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'projects'
  ) INTO table_exists;
  
  IF table_exists THEN
    DROP TABLE IF EXISTS public.projects;
    RAISE NOTICE 'Dropped table: projects';
  END IF;

  -- Check and drop client_contacts
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'client_contacts'
  ) INTO table_exists;
  
  IF table_exists THEN
    DROP TABLE IF EXISTS public.client_contacts;
    RAISE NOTICE 'Dropped table: client_contacts';
  END IF;

  -- Check and drop client_companies
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'client_companies'
  ) INTO table_exists;
  
  IF table_exists THEN
    DROP TABLE IF EXISTS public.client_companies;
    RAISE NOTICE 'Dropped table: client_companies';
  END IF;

  -- Check and drop cost_codes
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'cost_codes'
  ) INTO table_exists;
  
  IF table_exists THEN
    DROP TABLE IF EXISTS public.cost_codes;
    RAISE NOTICE 'Dropped table: cost_codes';
  END IF;

  -- Check and drop subcontractors
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'subcontractors'
  ) INTO table_exists;
  
  IF table_exists THEN
    DROP TABLE IF EXISTS public.subcontractors;
    RAISE NOTICE 'Dropped table: subcontractors';
  END IF;

  -- Drop profiles last since other tables depend on it
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'profiles'
  ) INTO table_exists;
  
  IF table_exists THEN
    DROP TABLE IF EXISTS public.profiles;
    RAISE NOTICE 'Dropped table: profiles';
  END IF;

  -- Drop functions if they exist
  DROP FUNCTION IF EXISTS is_admin_or_coordinator();
  DROP FUNCTION IF EXISTS has_project_access(UUID);
  DROP FUNCTION IF EXISTS update_updated_at_column();
  DROP FUNCTION IF EXISTS record_project_status_change();
  DROP FUNCTION IF EXISTS calculate_holdback_amount();

  RAISE NOTICE 'All existing tables and functions have been dropped. Ready for a clean installation.';
END $$;