import React, { useState, useEffect } from 'react';

interface Post {
  id: string;
  title: string;
  body: string;
  author: string;
  created_at: string;
}

export const PostsList: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/posts'); // Assuming /api/posts is proxied or relative to the frontend
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: Post[] = await response.json();
        setPosts(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-mint-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-4">
        <p>Error loading posts: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      <h2 className="text-2xl font-bold text-text-900">Posts</h2>
      {posts.length === 0 ? (
        <p className="text-text-500">No posts found.</p>
      ) : (
        posts.map((post) => (
          <div key={post.id} className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
            <h3 className="text-xl font-semibold text-text-800 mb-1">{post.title}</h3>
            <p className="text-text-600 text-sm mb-2">by {post.author} on {new Date(post.created_at).toLocaleDateString()}</p>
            <p className="text-text-700">{post.body}</p>
          </div>
        ))
      )}
    </div>
  );
};
