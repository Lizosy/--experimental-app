import clientPromise from './client';

let client;
let db;
let movies;

async function connectToDatabase() {
    try {
      client = await clientPromise;
      db = client.db('sample_mflix'); // Replace 'yourDatabaseName' with your actual database name
      movies = db.collection('movies');
      console.log('Successfully connected to the database');
    } catch (error) {
      console.error('Failed to establish connection to database:', error);
    }
}

(async () => {
  await connectToDatabase();
})();

export async function getMovies() {
    try {
      if (!movies) await connectToDatabase();
  
      const result = await movies
        .find({})
        .limit(20)
        .map(user => ({ ...user, id: user._id.toString() }))
        .toArray();
  
      return { movies: result };
    } catch (error) {
      return { error: 'Failed to fetch movies!' };
    }
}