import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

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

  const client = await MongoClient.connect(MONGODB_URI);
  cachedClient = client;

  return {
    client,
    db: client.db(DB_NAME),
  };
} 