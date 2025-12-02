import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Community {
  id: string;
  name: string;
  members: number;
  icon: string;
  description: string;
  category: string;
}

interface Post {
  id: string;
  author: string;
  authorNationality: string;
  content: string;
  likes: number;
  comments: number;
  timeAgo: string;
  communityName: string;
}

export const Network = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'communities' | 'feed'>('communities');

  const communities: Community[] = [
    {
      id: '1',
      name: '서울 외국인 모임',
      members: 1234,
      icon: '🏙️',
      description: '서울에서 생활하는 외국인들의 모임',
      category: '지역'
    },
    {
      id: '2',
      name: '한국어 학습 커뮤니티',
      members: 3456,
      icon: '📚',
      description: '함께 한국어를 공부하는 커뮤니티',
      category: '학습'
    },
    {
      id: '3',
      name: '알바 정보 공유',
      members: 2890,
      icon: '💼',
      description: '알바 정보와 팁을 공유하는 곳',
      category: '구직'
    },
    {
      id: '4',
      name: '음식 맛집 추천',
      members: 5678,
      icon: '🍽️',
      description: '한국의 맛집을 추천하고 공유',
      category: '생활'
    },
    {
      id: '5',
      name: '비자/체류 정보',
      members: 4321,
      icon: '📋',
      description: '비자와 체류에 관한 정보 교환',
      category: '법률'
    },
    {
      id: '6',
      name: 'K-POP 팬 모임',
      members: 8765,
      icon: '🎤',
      description: 'K-POP을 사랑하는 사람들의 소통 공간',
      category: '취미'
    },
    {
      id: '7',
      name: '부산 거주자 모임',
      members: 987,
      icon: '🌉',
      description: '부산에 사는 외국인들의 커뮤니티',
      category: '지역'
    },
    {
      id: '8',
      name: 'E-7 비자 홀더 모임',
      members: 1543,
      icon: '🧑‍💻',
      description: 'E-7 비자를 가진 전문직 종사자 정보 공유',
      category: '법률'
    },
    {
      id: '9',
      name: '한국 드라마 같이 봐요',
      members: 6543,
      icon: '📺',
      description: '한국 드라마에 대한 이야기를 나누는 곳',
      category: '취미'
    },
    {
      id: '10',
      name: '대학생/유학생 모임',
      members: 3123,
      icon: '🎓',
      description: '한국에서 공부하는 학생들의 정보 교환',
      category: '학습'
    },
    {
      id: '11',
      name: '주말 등산/캠핑 모임',
      members: 789,
      icon: '🏕️',
      description: '주말마다 자연을 즐기는 아웃도어 커뮤니티',
      category: '취미'
    },
    {
      id: '12',
      name: '한국 요리 레시피',
      members: 4873,
      icon: '🍳',
      description: '집에서 만드는 한국 요리 레시피 공유',
      category: '생활'
    },
    {
      id: '13',
      name: '인천/경기 거주자 모임',
      members: 852,
      icon: '✈️',
      description: '인천과 경기도에 사는 외국인들의 모임',
      category: '지역'
    },
    {
      id: '14',
      name: '반려동물과 함께하기',
      members: 1789,
      icon: '🐾',
      description: '한국에서 반려동물을 키우는 팁 공유',
      category: '생활'
    },
    {
      id: '15',
      name: 'D-2/D-4 비자 정보',
      members: 2456,
      icon: '🧑‍🏫',
      description: '유학생 비자에 대한 모든 정보',
      category: '법률'
    },
  ];

  const posts: Post[] = [
    {
      id: '1',
      author: '마리아',
      authorNationality: '🇵🇭',
      content: '강남역 근처에서 주말 알바 구하는데 좋은 곳 있을까요? 서빙 경험 있습니다!',
      likes: 12,
      comments: 8,
      timeAgo: '2시간 전',
      communityName: '알바 정보 공유'
    },
    {
      id: '2',
      author: '응웬',
      authorNationality: '🇻🇳',
      content: 'Lv.3 중급 합격했어요! 다들 응원해주셔서 감사합니다 🎉',
      likes: 45,
      comments: 23,
      timeAgo: '5시간 전',
      communityName: '한국어 학습 커뮤니티'
    },
    {
      id: '3',
      author: '알렉스',
      authorNationality: '🇺🇸',
      content: '홍대에서 저녁 식사할 분 계신가요? 새로운 친구 만나고 싶어요!',
      likes: 8,
      comments: 15,
      timeAgo: '8시간 전',
      communityName: '서울 외국인 모임'
    }
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-white border-b border-line-200 px-4 py-4 sticky top-0 z-10">
        <h1 className="text-[20px] font-bold text-text-900">네트워킹</h1>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-line-200">
        <div className="flex">
          <button
            onClick={() => setActiveTab('communities')}
            className={`flex-1 py-3 text-[15px] font-semibold transition-colors relative ${
              activeTab === 'communities'
                ? 'text-mint-600'
                : 'text-text-500'
            }`}
          >
            커뮤니티
            {activeTab === 'communities' && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-mint-600" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('feed')}
            className={`flex-1 py-3 text-[15px] font-semibold transition-colors relative ${
              activeTab === 'feed'
                ? 'text-mint-600'
                : 'text-text-500'
            }`}
          >
            피드
            {activeTab === 'feed' && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-mint-600" />
            )}
          </button>
        </div>
      </div>

      <div className="p-4">
        {activeTab === 'communities' ? (
          /* Communities List */
          <div className="space-y-3">
            {communities.map((community) => (
              <div
                key={community.id}
                onClick={() => navigate(`/network/community/${community.id}`)}
                className="bg-white rounded-[16px] p-4 shadow-card hover:shadow-soft 
                         transition-all cursor-pointer border border-line-200"
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-mint-100 rounded-[12px] flex items-center 
                               justify-center text-[24px] flex-shrink-0">
                    {community.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-[16px] font-semibold text-text-900">
                        {community.name}
                      </h3>
                      <span className="px-[8px] py-[2px] bg-gray-100 text-text-700 
                                   rounded-[6px] text-[11px] font-medium">
                        {community.category}
                      </span>
                    </div>
                    <p className="text-[13px] text-text-700 mb-2">
                      {community.description}
                    </p>
                    <div className="flex items-center gap-1 text-[12px] text-text-500">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      <span>{community.members.toLocaleString()}명</span>
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-text-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Feed */
          <div className="space-y-4">
            {/* Create Post */}
            <div className="bg-white rounded-[16px] p-4 shadow-card border border-line-200">
              <button
                onClick={() => {
                  // Navigate to create post page
                  alert('게시글 작성 페이지 (구현 예정)');
                }}
                className="w-full text-left p-3 bg-background rounded-[12px] 
                         text-[14px] text-text-500 hover:bg-gray-100 transition-colors"
              >
                무슨 생각을 하고 계신가요?
              </button>
            </div>

            {/* Posts */}
            {posts.map((post) => (
              <div
                key={post.id}
                className="bg-white rounded-[16px] p-4 shadow-card border border-line-200"
              >
                {/* Post Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-mint-100 to-mint-200 
                                 rounded-full flex items-center justify-center text-[20px]">
                      {post.authorNationality}
                    </div>
                    <div>
                      <h4 className="text-[14px] font-semibold text-text-900">
                        {post.author}
                      </h4>
                      <p className="text-[12px] text-text-500">
                        {post.communityName} • {post.timeAgo}
                      </p>
                    </div>
                  </div>
                  <button className="p-1 text-text-500 hover:bg-gray-100 rounded-full">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                    </svg>
                  </button>
                </div>

                {/* Post Content */}
                <p className="text-[14px] text-text-900 leading-relaxed mb-3">
                  {post.content}
                </p>

                {/* Post Actions */}
                <div className="flex items-center gap-4 pt-3 border-t border-line-200">
                  <button className="flex items-center gap-1 text-text-700 hover:text-mint-600 
                                   transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span className="text-[13px] font-medium">{post.likes}</span>
                  </button>
                  <button className="flex items-center gap-1 text-text-700 hover:text-mint-600 
                                   transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span className="text-[13px] font-medium">{post.comments}</span>
                  </button>
                  <button className="flex items-center gap-1 text-text-700 hover:text-mint-600 
                                   transition-colors ml-auto">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

