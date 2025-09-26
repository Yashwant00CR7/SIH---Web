// scripts/verify-seed.js
require('dotenv').config();
const { MongoClient } = require('mongodb');

async function verifyData() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB || 'sih';
  
  try {
    const client = new MongoClient(uri);
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db(dbName);
    const collection = db.collection('occurrences');
    
    const count = await collection.countDocuments();
    console.log(`📊 Total documents in occurrences collection: ${count}`);
    
    if (count > 0) {
      const sample = await collection.findOne();
      console.log('📄 Sample document:');
      console.log(JSON.stringify(sample, null, 2));
    }
    
    await client.close();
    console.log('🔌 Connection closed');
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
  }
}

verifyData();