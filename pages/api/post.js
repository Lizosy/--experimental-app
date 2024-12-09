import clientPromise from '@lib/mongo/client';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  // Get token from Authorization header
  const authHeader = req.headers.authorization;
  
  if (req.method === 'GET') {
    // For GET request, token is optional but helpful
    try {
      const client = await clientPromise;
      const db = client.db('maybe');
      const postsCollection = db.collection('posts');

      const posts = await postsCollection.find({}).toArray();
      return res.status(200).json(posts);
    } catch (error) {
      console.error('Error fetching posts:', error);
      return res.status(500).json({ error: 'Failed to fetch posts!' });
    }
  } else if (req.method === 'POST') {
    // For POST request, authentication is required
    if (!authHeader) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const client = await clientPromise;
      const db = client.db('maybe');
      const postsCollection = db.collection('posts');

      // Extract post data
      const { title, content, author } = req.body;

      if (!title || !content || !author) {
        return res.status(400).json({ error: 'All fields are required!' });
      }

      // Create new post with additional metadata
      const newPost = { 
        title, 
        content, 
        author, 
        userId: decoded.id, // Add user ID who created the post
        createdAt: new Date(),
        userEmail: decoded.email // Optional: add user email if needed
      };

      const result = await postsCollection.insertOne(newPost);

      // Retrieve the inserted document
      const insertedPost = await postsCollection.findOne({ _id: result.insertedId });

      return res.status(201).json({ success: true, post: insertedPost });
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ error: 'Invalid token' });
      }
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token expired' });
      }
      console.error('Post creation error:', error);
      return res.status(500).json({ error: 'Failed to create post!' });
    }
  } else {
    // Method not allowed
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}