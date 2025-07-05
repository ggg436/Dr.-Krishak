// Server-side script to test Neon DB connection
const { neon } = require('@neondatabase/serverless');

async function testNeonConnection() {
  try {
    console.log('Testing Neon DB connection...');
    
    // Connection string
    const connectionString = 'postgresql://neondb_owner:npg_aWyRwHeT41rV@ep-misty-bird-a8emrqlr-pooler.eastus2.azure.neon.tech/neondb?sslmode=require&channel_binding=require';
    
    // Create SQL client
    const sql = neon(connectionString);
    
    // Test query
    console.log('Executing test query...');
    const result = await sql`SELECT current_timestamp as time, current_database() as db`;
    
    console.log('Connection successful!');
    console.log('Query result:', result);
    
    return { success: true, result };
  } catch (error) {
    console.error('Connection failed:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    
    return { success: false, error: error.message };
  }
}

// Run the test
testNeonConnection()
  .then(result => {
    if (result.success) {
      console.log('✅ Neon DB connection test passed');
    } else {
      console.log('❌ Neon DB connection test failed');
    }
  })
  .catch(err => {
    console.error('Unexpected error:', err);
  }); 