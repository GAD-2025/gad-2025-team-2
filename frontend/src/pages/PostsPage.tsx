import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';

interface Post {
  id: string;
  user_id: string;
  title: string;
  body: string;
  created_at: string;
}

export const PostsPage = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
        const response = await fetch(`${API_BASE_URL}/api/posts`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setPosts(data.posts || []);
      } catch (err) {
        console.error('Posts 로딩 오류:', err);
        setError(err instanceof Error ? err.message : '게시글을 불러오는데 실패했습니다');
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header title="게시글" showBack />
        <div className="p-4">
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-mint border-t-transparent mx-auto mb-4"></div>
              <p className="text-gray-600">로딩 중...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header title="게시글" showBack />
        <div className="p-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header title="게시글" showBack />
      
      <div className="p-4 space-y-4">
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">게시글이 없습니다</p>
          </div>
        ) : (
          posts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-[16px] border border-line-200 p-5 shadow-card"
            >
              <div className="mb-3">
                <h3 className="text-[18px] font-bold text-text-900 mb-2">
                  {post.title}
                </h3>
                <p className="text-[12px] text-text-500">
                  {formatDate(post.created_at)}
                </p>
              </div>
              
              <div className="mb-3">
                <p className="text-[14px] text-text-700 leading-relaxed whitespace-pre-wrap">
                  {post.body}
                </p>
              </div>
              
              <div className="flex items-center justify-between pt-3 border-t border-line-200">
                <span className="text-[12px] text-text-500">
                  작성자: {post.user_id}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
