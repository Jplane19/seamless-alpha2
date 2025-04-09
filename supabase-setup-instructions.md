# Supabase Setup Instructions for Seamless Alpha

Follow these steps to set up your Supabase database for Seamless Alpha:

## 1. Access SQL Editor

1. Log in to your Supabase dashboard
2. Navigate to your project: `seamless-alpha2`
3. Click on the "SQL Editor" tab in the left sidebar

## 2. Execute Schema Creation Scripts

Execute the following SQL scripts in order:

1. **Clean Start** (00-clean-start.sql)
   - This will drop any existing tables to give you a clean starting point

2. **Profile Setup** (01-profiles.sql)
   - Sets up the profiles table and auth trigger

3. **Tables** (02-tables.sql)
   - Creates all the main tables for the application

4. **RLS Policies** (03-rls.sql)
   - Adds Row Level Security policies for data protection

5. **Indexes** (04-indexes.sql)
   - Adds performance optimizing indexes

6. **Triggers** (05-triggers.sql)
   - Adds automation triggers

7. **Realtime** (06-realtime.sql)
   - Enables realtime subscriptions

8. **Seed Data** (07-seed-data.sql)
   - Adds sample data for testing

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
UPDATE profiles 
SET role = 'admin'
WHERE id = '[USER-UUID]';
```

## 6. Verify Setup

Run the connection check script to verify your setup:

```bash
node scripts/check-connection.js
```

This should return information about your client companies and confirm the connection is working properly.

## 7. Common Troubleshooting

If you encounter errors during setup:

- **"relation does not exist" errors**: Make sure you're running the scripts in the correct order
- **Foreign key constraint violations**: The clean-start script should handle this, but if not, check for existing data
- **RLS policy errors**: Make sure the tables exist before applying RLS policies
- **Auth trigger errors**: These can happen if the auth trigger already exists

If you need to start over, run the 00-clean-start.sql script again and begin the process from step 2.

## 8. Testing Login

After setting up the database and creating a user, you can test the login:

1. Start your local Next.js server: `npm run dev`
2. Navigate to http://localhost:3000
3. Log in with the user you created
4. If everything is set up correctly, you should be redirected to the dashboard