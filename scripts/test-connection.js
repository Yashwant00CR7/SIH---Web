// scripts/test-connection.js
require('dotenv').config();
const { MongoClient } = require('mongodb');

async function testConnection() {
  const uri = process.env.MONGODB_URI;
  console.log('Testing connection with URI:', uri.replace(/\/\/.*@/, '//***:***@'));
  
  try {
    const client = new MongoClient(uri);
    await client.connect();
    console.log('✅ Successfully connected to MongoDB!');
    
    // List databases to verify connection
    const adminDb = client.db().admin();
    const dbs = await adminDb.listDatabases();
    console.log('📁 Available databases:', dbs.databases.map(db => db.name));
    
    await client.close();
    console.log('🔌 Connection closed');
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    if (error.code === 8000) {
      console.log('\n🔍 Troubleshooting tips:');
      console.log('1. Verify username and password in MongoDB Atlas');
      console.log('2. Check if the user exists in Database Access');
      console.log('3. Ensure the user has read/write permissions');
      console.log('4. Check if IP address is whitelisted in Network Access');
    }
  }
}

testConnection();