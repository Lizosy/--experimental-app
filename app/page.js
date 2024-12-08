"use client";

import { useState, useEffect } from "react";
import "./home.css"; // Import CSS

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState("");
  const [message, setMessage] = useState("");

  // Fetch posts
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch("/api/post");
        const data = await response.json();

        if (Array.isArray(data)) {
          setPosts(data);
        } else if (data.posts && Array.isArray(data.posts)) {
          setPosts(data.posts);
        } else {
          throw new Error("Invalid posts data");
        }
      } catch (error) {
        setError(error.message);
      }
    };

    fetchPosts();
  }, []);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const post = {
      title,
      content,
      author,
      createdAt: new Date(),
    };

    const response = await fetch("/api/post", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(post),
    });

    if (response.ok) {
      setMessage("Post created successfully!");
      setTitle("");
      setContent("");
      setAuthor("");
      const updatedPosts = await response.json();
      setPosts([...posts, updatedPosts]);
    } else {
      setMessage("Failed to create post.");
    }
  };

  return (
    <div className="home-container">
      <div className="home-layout">
        {/* Create Post Section */}
        <div className="create-post-section">
          <div className="header">DeSwuCafe ☕</div>
          <h1>Create a New Post</h1>
          <form onSubmit={handleSubmit}>
            <div>
              <label>Title:</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="form-input"
              />
            </div>
            <div>
              <label>Content:</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                className="form-input"
              />
            </div>
            <div>
              <label>Author:</label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                required
                className="form-input"
              />
            </div>
            <button type="submit" className="submit-button">
              Create Post
            </button>
          </form>
          {message && <p className="message">{message}</p>}
        </div>

        {/* Posts List Section */}
        <div className="posts-list-section">
          <h1>Posts</h1>
          {error ? (
            <p className="error">Error: {error}</p>
          ) : posts.length === 0 ? (
            <p>No posts available</p>
          ) : (
            <ul className="posts-list">
              {posts.map((post) => (
                <li key={post._id} className="post-item">
                  <h2>{post.title}</h2>
                  <p>{post.content}</p>
                  <small>By: {post.author}</small>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}