import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';

interface Post {
  id: number;
  user_id: string;
  title: string;
  body: string;
  created_at: string;
}

interface PostsResponse {
  posts: Post[];
}

export const PostsPage = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
        const response = await fetch(`${API_BASE_URL}/api/posts`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch posts: ${response.status} ${response.statusText}`);
        }
        
        const data: PostsResponse = await response.json();
        setPosts(data.posts || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching posts:', err);
        setError(err instanceof Error ? err.message : '게시글을 불러오는데 실패했습니다.');
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header title="게시글 목록" showBack />
      
      <div className="p-4 space-y-4">
        {loading && (
          <div className="text-center py-8 text-text-500">
            로딩 중...
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
          </div>
        )}
        
        {!loading && !error && posts.length === 0 && (
          <div className="text-center py-8 text-text-500">
            게시글이 없습니다.
          </div>
        )}
        
        {!loading && !error && posts.length > 0 && (
          <div className="space-y-4">
            {posts.map((post) => (
              <div
                key={post.id}
                className="bg-white rounded-[16px] p-5 shadow-card"
              >
                <div className="mb-2">
                  <h3 className="text-[16px] font-bold text-text-900">
                    {post.title}
                  </h3>
                </div>
                
                <div className="mb-3">
                  <p className="text-[14px] text-text-700 whitespace-pre-wrap">
                    {post.body}
                  </p>
                </div>
                
                <div className="flex items-center justify-between text-[12px] text-text-500">
                  <span>작성자: {post.user_id}</span>
                  <span>{formatDate(post.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

