import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error('Please add your Mongo URI to .env.local');
}

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

let clientPromise;

// In production, connect to the database once and reuse the connection pool
if (process.env.NODE_ENV === 'production') {
  if (!global._mongoClientPromise) {
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In development, connect to the database before each request
  clientPromise = client.connect();
}

// Export a function that returns the clientPromise
export default async function connectToDatabase() {
  if (!clientPromise) {
    clientPromise = client.connect();
  }

  const client = await clientPromise;
  return client.db();
}