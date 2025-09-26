// lib/mongodb.ts
import { MongoClient, Db } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://Yash:Yash@cluster0.sapi4ib.mongodb.net/";
const MONGODB_DB = process.env.MONGODB_DB || "sih";

let cachedDb: Db | null = null;

export async function connectToDatabase() {
  if (cachedDb) {
    return cachedDb;
  }

  // Check if it's a local MongoDB connection
  const isLocal = MONGODB_URI.includes('localhost') || MONGODB_URI.includes('127.0.0.1');
  
  const options = isLocal ? {} : {
    tls: true,
    tlsAllowInvalidCertificates: false,
    tlsAllowInvalidHostnames: false,
  };

  const client = await MongoClient.connect(MONGODB_URI, options);

  const db = client.db(MONGODB_DB);
  cachedDb = db;
  return db;
}
