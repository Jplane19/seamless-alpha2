// Script to check Supabase connection after setup
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://eqlflgqqudsbeffkpvao.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxbGZsZ3FxdWRzYmVmZmtwdmFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQwNzI2NzMsImV4cCI6MjA1OTY0ODY3M30.dyl2-6teq9Kcn-_mXaxPvEK5KA9eOImvPpHDxGXmyco';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkConnection() {
  console.log('Checking Supabase connection...');

  try {
    // Try to access the client_companies table, which should exist after setup
    const { data, error } = await supabase
      .from('client_companies')
      .select('name')
      .limit(5);
    
    if (error) {
      console.error('Error accessing client_companies:', error);
      return;
    }
    
    console.log('Connection successful!');
    console.log(`Found ${data.length} client companies:`);
    data.forEach(company => console.log(`- ${company.name}`));
    
    // Check projects table
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('name, status')
      .limit(5);
    
    if (projectsError) {
      console.error('Error accessing projects:', projectsError);
    } else {
      console.log(`\nFound ${projects.length} projects:`);
      projects.forEach(project => console.log(`- ${project.name} (${project.status})`));
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

checkConnection();