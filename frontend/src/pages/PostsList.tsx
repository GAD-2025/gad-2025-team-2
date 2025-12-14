import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';

interface Post {
  id: string;
  user_id: string;
  title: string;
  body: string;
  created_at: string;
}

export const PostsList = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
      const response = await fetch(`${API_BASE_URL}/api/posts`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch posts: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      setPosts(data.posts || []);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError(err instanceof Error ? err.message : '게시글을 불러오는데 실패했습니다');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

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
    <div className="min-h-screen bg-background pb-20">
      <Header title="게시글 목록" showBack />
      
      <div className="p-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-mint-600 border-t-transparent mx-auto"></div>
            <p className="mt-4 text-text-500">불러오는 중...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-[12px] p-4 text-center">
            <p className="text-red-700 text-[14px]">{error}</p>
            <button
              onClick={fetchPosts}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded-[8px] text-[14px] hover:bg-red-700 transition-colors"
            >
              다시 시도
            </button>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 mx-auto text-text-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-text-500 text-[15px]">게시글이 없습니다</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div
                key={post.id}
                className="bg-white rounded-[16px] p-5 shadow-card border border-line-200 hover:shadow-soft transition-all"
              >
                <h3 className="text-[18px] font-bold text-text-900 mb-2 line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-[14px] text-text-700 mb-4 line-clamp-3 whitespace-pre-wrap">
                  {post.body}
                </p>
                <div className="flex items-center justify-between pt-3 border-t border-line-200">
                  <span className="text-[12px] text-text-500">
                    작성자 ID: {post.user_id}
                  </span>
                  <span className="text-[12px] text-text-500">
                    {formatDate(post.created_at)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
