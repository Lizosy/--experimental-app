import clientPromise from './client';

let client;
let db;
let posts;

async function connectToDatabase() {
    try {
      client = await clientPromise;
      db = client.db('maybe'); // Replace 'yourDatabaseName' with your actual database name
      posts = db.collection('posts');
      console.log('Successfully connected to the database');
    } catch (error) {
      console.error('Failed to establish connection to database:', error);
    }
}

(async () => {
  await connectToDatabase();
})();

export async function getPosts() {
    try {
      if (!posts) await connectToDatabase();
  
      const result = await posts
        .find({})
        .limit(20)
        
        .toArray();
  
      return { posts: result };
    } catch (error) {
      return { error: 'Failed to fetch posts!' };
    }
}