"use client";

import { useEffect, useState } from 'react';

import './index.css';

export default function Index() {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null);

  // Fetch posts when the component mounts
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch('/api/post');  // Correct the endpoint if needed
        const data = await response.json();

        console.log('Fetched data:', data); // Debugging line to check the data structure

        if (data.error) {
          throw new Error(data.error);
        }

        // Debug to see if the posts are inside an object or directly in an array
        if (Array.isArray(data) && data.length > 0) {
          setPosts(data);  // If it's a direct array, use it
        } else if (data.posts && Array.isArray(data.posts)) {
          setPosts(data.posts);  // If posts are inside an object, use the posts array
        } else {
          throw new Error('Invalid posts data');
        }
      } catch (error) {
        setError(error.message);
      }
    };

    fetchPosts();
  }, []); // Empty dependency array means it runs once when the component mounts

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="post-list">
      <h1>Posts</h1>
      {posts.length === 0 ? (
        <p>No posts available</p>
      ) : (
        <ul>
          {posts.map((post) => (
            <li key={post._id} className="post-item">
              <h2 className="post-title">{post.title}</h2>
              <p className="post-content">{post.content}</p>
              <small className="post-author">By: {post.author}</small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
