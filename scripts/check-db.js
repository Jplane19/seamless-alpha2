// Simple script to check the Supabase database schema
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://eqlflgqqudsbeffkpvao.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxbGZsZ3FxdWRzYmVmZmtwdmFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQwNzI2NzMsImV4cCI6MjA1OTY0ODY3M30.dyl2-6teq9Kcn-_mXaxPvEK5KA9eOImvPpHDxGXmyco';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
  try {
    // This query uses RPC to execute SQL directly
    const { data, error } = await supabase.rpc('list_tables');
    
    if (error) {
      console.error('Error fetching tables:', error);
      
      // Try to execute a simple query to see if the connection works
      console.log('Testing connection with a simple query...');
      const { data: testData, error: testError } = await supabase
        .from('profiles')
        .select('*')
        .limit(1);
      
      if (testError) {
        console.log('Test query error:', testError);
      } else {
        console.log('Test query successful, found:', testData);
      }
      
      return;
    }
    
    console.log('Current tables in the database:');
    if (data.length === 0) {
      console.log('No tables found in the public schema.');
    } else {
      data.forEach(table => {
        console.log(`- ${table.name}`);
      });
    }
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

checkTables();