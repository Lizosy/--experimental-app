"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import "./home.css";

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [message, setMessage] = useState("");

  // Check authentication on component mount
  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      // Redirect to login if not authenticated
      router.push('/login');
      return;
    }

    // Parse user data
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);

    // Fetch posts
    const fetchPosts = async () => {
      try {
        const response = await fetch("/api/post", {
          headers: {
            'Authorization': `Bearer ${parsedUser.token}`
          }
        });

        if (!response.ok) {
          if (response.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('user');
            setUser(null);
            router.push('/login');
            return;
          }
          throw new Error("Failed to fetch posts");
        }

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
  }, [router]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      setMessage("Please log in to create a post");
      return;
    }

    const post = {
      title,
      content,
      author: user.username, // Use logged-in user's username
      createdAt: new Date(),
    };

    try {
      const response = await fetch("/api/post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(post),
      });

      if (response.ok) {
        const newPost = await response.json();
        setMessage("Post created successfully!");
        setTitle("");
        setContent("");
        setPosts([...posts, newPost]);
      } else {
        const errorData = await response.json();
        setMessage(errorData.error || "Failed to create post");
      }
    } catch (error) {
      setMessage("Network error. Please try again.");
    }
  };

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/login');
  };

  // If not authenticated, show nothing
  if (!user) {
    return null;
  }

  return (
    <div className="home-container">
      <div className="home-layout">
        {/* Logout Button */}
        <div className="logout-section">
          <span>Welcome, {user.username}</span>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>

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