import clientPromise from '@lib/mongo/client';

export default async function handler(req, res) {
  const client = await clientPromise;
  const db = client.db('maybe'); // Replace 'maybe' with your actual database name
  const postsCollection = db.collection('posts');

  if (req.method === 'GET') {
    // Handle GET request: Fetch all posts
    try {
      const posts = await postsCollection.find({}).toArray();
      return res.status(200).json(posts);
    } catch (error) {
      console.error('Error fetching posts:', error);
      return res.status(500).json({ error: 'Failed to fetch posts!' });
    }
  } else if (req.method === 'POST') {
    // Handle POST request: Create a new post
    const { title, content, author } = req.body;

    if (!title || !content || !author) {
      return res.status(400).json({ error: 'All fields are required!' });
    }

    try {
      const newPost = { title, content, author, createdAt: new Date() };
      const result = await postsCollection.insertOne(newPost);

      // Retrieve the inserted document (MongoDB v4+ compatibility)
      const insertedPost = await postsCollection.findOne({ _id: result.insertedId });

      return res.status(201).json({ success: true, post: insertedPost });
    } catch (error) {
      console.error('Error creating post:', error);
      return res.status(500).json({ error: 'Failed to create post!' });
    }
  } else {
    // Method not allowed
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}