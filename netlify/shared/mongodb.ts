import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI as string;
const DB_NAME = 'bookclub';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env');
}

let cachedClient: MongoClient | null = null;

export async function connectToDatabase() {
  if (cachedClient) {
    return {
      client: cachedClient,
      db: cachedClient.db(DB_NAME),
    };
  }

  // Create a new MongoClient with options suitable for edge functions
  const client = await MongoClient.connect(MONGODB_URI, {
    maxPoolSize: 1, // Reduce connection pool size for edge functions
    serverSelectionTimeoutMS: 5000, // Reduce timeout for edge functions
    socketTimeoutMS: 5000,
  });
  
  cachedClient = client;

  return {
    client,
    db: client.db(DB_NAME),
  };
} 