# Supabase Setup Instructions for Seamless Alpha

Follow these steps to set up your Supabase database for Seamless Alpha:

## 1. Access SQL Editor

1. Log in to your Supabase dashboard
2. Navigate to your project: `seamless-alpha2`
3. Click on the "SQL Editor" tab in the left sidebar

## 2. Execute Schema Creation Script

1. Create a new query
2. Copy and paste the entire contents of the `database-schema.sql` file into the editor
3. Execute the query by clicking the "Run" button

This will create all the necessary tables, indexes, RLS policies, and functions for your application.

## 3. Set Up Storage

1. Navigate to the "Storage" tab in the left sidebar
2. Create a new bucket called `documents` with the following settings:
   - Public access: Enabled (to allow file downloads)
   - Upload file size limit: 50 MB

## 4. Set Up Authentication

1. Navigate to the "Authentication" tab in the left sidebar
2. Under "Settings":
   - Enable "Email" authentication
   - Configure password policies as desired
   - Set up any additional providers you may need
   
## 5. Create Admin User

1. Navigate to the "Authentication" tab
2. Click "Users" in the sub-menu
3. Click "Add User"
4. Create an admin user with your email
5. After creating the user, note the user UUID
6. Go back to the SQL Editor and run:

```sql
INSERT INTO profiles (id, email, full_name, role)
VALUES ('[USER-UUID]', '[YOUR-EMAIL]', 'Admin User', 'admin');
```

## 6. Enable Realtime

1. Navigate to the "Database" tab
2. Click "Replication" in the sub-menu
3. Enable "Realtime" for the following tables:
   - projects
   - project_status_history
   - comments
   - project_phases

## 7. Configure Client Environment

1. Verify your environment variables in `.env.local` match your Supabase project
2. The environment variables should be:

```
NEXT_PUBLIC_SUPABASE_URL=https://eqlflgqqudsbeffkpvao.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxbGZsZ3FxdWRzYmVmZmtwdmFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQwNzI2NzMsImV4cCI6MjA1OTY0ODY3M30.dyl2-6teq9Kcn-_mXaxPvEK5KA9eOImvPpHDxGXmyco
```

## 8. Test the Connection

After setting up your database, run your local Next.js development server:

```bash
npm run dev
```

Your Seamless Alpha application should now be able to connect to your Supabase project and utilize all the database features.