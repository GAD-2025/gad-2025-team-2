import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { API_BASE_URL } from '@/api/client';

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
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/api/posts`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setPosts(data.posts || []);
    } catch (err) {
      console.error('Posts 로딩 오류:', err);
      setError('게시글을 불러오는데 실패했습니다.');
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
    <div className="min-h-screen bg-background">
      <Header title="게시글" />
      
      <main className="px-4 py-6 pb-20">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-text-500">로딩 중...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={fetchPosts}
              className="px-4 py-2 bg-mint-600 text-white rounded-lg hover:bg-mint-700"
            >
              다시 시도
            </button>
          </div>
        ) : posts.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-text-500">게시글이 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div
                key={post.id}
                className="bg-white rounded-[12px] border border-line-200 p-4 shadow-sm"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-[16px] font-semibold text-text-900 flex-1">
                    {post.title}
                  </h3>
                  <span className="text-[12px] text-text-500 ml-2">
                    {formatDate(post.created_at)}
                  </span>
                </div>
                <p className="text-[14px] text-text-700 leading-relaxed whitespace-pre-wrap">
                  {post.body}
                </p>
                <div className="mt-3 pt-3 border-t border-line-200">
                  <span className="text-[12px] text-text-500">
                    작성자: {post.user_id}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
