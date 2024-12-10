import clientPromise from '@lib/mongo/client';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const client = await clientPromise;
    const db = client.db('maybe'); // Replace with your actual database name
    const usersCollection = db.collection('users');

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ 
      $or: [{ email }, { username }] 
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = {
      username,
      email,
      password: hashedPassword,
      createdAt: new Date()
    };

    const result = await usersCollection.insertOne(newUser);

    // Retrieve the inserted document (exclude password)
    const insertedUser = await usersCollection.findOne(
      { _id: result.insertedId },
      { projection: { password: 0 } }
    );

    return res.status(201).json({ 
      success: true, 
      user: insertedUser 
    });

  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Registration failed' });
  }
}