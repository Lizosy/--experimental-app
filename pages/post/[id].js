// pages/post/[id].js
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function PostDetails() {
  const router = useRouter();
  const { id } = router.query;
  const [post, setPost] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    const fetchPost = async () => {
      try {
        const response = await fetch(`/api/post/${id}`);
        const data = await response.json();
        if (response.ok) {
          setPost(data);
        } else {
          throw new Error(data.message || 'Failed to fetch post');
        }
      } catch (error) {
        setError(error.message);
      }
    };

    fetchPost();
  }, [id]);

  if (error) return <p>Error: {error}</p>;
  if (!post) return <p>Loading...</p>;

  return (
    <div>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
      <small>By: {post.author}</small>
    </div>
  );
}
