import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';

interface CommentType {
  id: string;
  author: string;
  authorNationality: string;
  content: string;
  timeAgo: string;
}

interface CommunityPost {
  id: string;
  author: string;
  authorNationality: string;
  content: string;
  likes: number;
  comments: number;
  timeAgo: string;
  commentsData?: CommentType[];
}

interface CommunityDetailData {
  id: string;
  name: string;
  description: string;
  members: number;
  category: string;
  rules: string[];
  posts: CommunityPost[];
  icon: string;
}

const dummyCommunityDetails: CommunityDetailData[] = [
  {
    id: '1',
    name: '서울 외국인 모임',
    description: '서울에서 생활하는 외국인들의 모임. 정보 교환, 친목 도모, 행사 참여 등 다양한 활동을 함께 합니다.',
    members: 1234,
    category: '지역',
    rules: [
      '서로 존중하고 배려하는 언어를 사용해주세요.',
      '광고 및 상업적 목적의 게시물은 금지합니다.',
      '개인 정보 보호에 유의해주세요.'
    ],
    posts: [
      {
        id: '101',
        author: '알렉스',
        authorNationality: '🇺🇸',
        content: '이번 주말 한강 피크닉 같이 갈 분 구해요! 도시락 싸서 오시면 됩니다.',
        likes: 25,
        comments: 2,
        timeAgo: '1일 전',
        commentsData: [
          { id: 'c1-1', author: '제시카', authorNationality: '🇬🇧', content: '저도 가고 싶어요! 몇 시에 어디서 만나요?', timeAgo: '1일 전' },
          { id: 'c1-2', author: '김민준', authorNationality: '🇰🇷', content: '도시락은 제가 준비할까요? 🍙', timeAgo: '23시간 전' },
        ],
      },
      {
        id: '102',
        author: '리나',
        authorNationality: '🇯🇵',
        content: '남산타워 야경 보러 갈 사람? 같이 가면 더 좋을 것 같아요!',
        likes: 18,
        comments: 0,
        timeAgo: '2일 전',
      },
      {
        id: '103',
        author: '마틴',
        authorNationality: '🇫🇷',
        content: '신촌에서 맛있는 프랑스 음식점 아시는 분 추천해주세요!',
        likes: 10,
        comments: 1,
        timeAgo: '3일 전',
        commentsData: [
          { id: 'c1-3', author: '박선우', authorNationality: '🇰🇷', content: '에릭스 키친 추천해요! 예약 필수입니다.', timeAgo: '2일 전' },
        ],
      },
    ],
    icon: '🏙️',
  },
  {
    id: '2',
    name: '한국어 학습 커뮤니티',
    description: '함께 한국어를 공부하고 실력을 향상시키는 커뮤니티입니다. 스터디 그룹, 언어 교환 등을 통해 서로 도움을 주고받아요.',
    members: 3456,
    category: '학습',
    rules: [
      '학습에 방해가 되는 행위는 삼가주세요.',
      '질문은 구체적으로 해주세요.',
      '다른 학습자의 의견을 존중해주세요.'
    ],
    posts: [
      {
        id: '201',
        author: '응웬',
        authorNationality: '🇻🇳',
        content: '토픽 시험 준비하시는 분들 같이 스터디 하실 분 구합니다! 주 2회 강남역 스터디룸에서 만날 예정입니다.',
        likes: 30,
        comments: 3,
        timeAgo: '6시간 전',
        commentsData: [
          { id: 'c2-1', author: '타오', authorNationality: '🇨🇳', content: '저도 토픽 준비 중인데, 참여하고 싶어요!', timeAgo: '5시간 전' },
          { id: 'c2-2', author: '이사벨', authorNationality: '🇪🇸', content: '스터디 시간대가 어떻게 되나요?', timeAgo: '4시간 전' },
          { id: 'c2-3', author: '정영희', authorNationality: '🇰🇷', content: '좋은 스터디 그룹이네요! 응원합니다.', timeAgo: '3시간 전' },
        ],
      },
      {
        id: '202',
        author: '김하나',
        authorNationality: '🇰🇷',
        content: '한국어 문법 질문 받습니다! 어려웠던 부분 편하게 질문해주세요.',
        likes: 40,
        comments: 0,
        timeAgo: '12시간 전',
      },
    ],
    icon: '📚',
  },
  {
    id: '3',
    name: '알바 정보 공유',
    description: '외국인들을 위한 알바 정보와 구인/구직 팁을 공유하는 커뮤니티입니다. 합법적인 일자리 정보만 공유해주세요.',
    members: 2890,
    category: '구직',
    rules: [
      '불법적인 알바 정보 공유는 금지합니다.',
      '정확한 정보를 제공해주세요.',
      '개인적인 연락처는 신중하게 공유해주세요.'
    ],
    posts: [
      {
        id: '301',
        author: '마리아',
        authorNationality: '🇵🇭',
        content: '동대문에서 의류 매장 알바 구해요! 한국어 가능하신 분 우대합니다.',
        likes: 15,
        comments: 1,
        timeAgo: '4시간 전',
        commentsData: [
          { id: 'c3-1', author: '안젤라', authorNationality: '🇺🇸', content: '어떤 요일 가능한가요?', timeAgo: '3시간 전' },
        ],
      },
      {
        id: '302',
        author: '이민준',
        authorNationality: '🇰🇷',
        content: '카페 알바 구인중입니다. 평일 저녁 시간 가능하신 분 환영합니다!',
        likes: 20,
        comments: 0,
        timeAgo: '1일 전',
      },
    ],
    icon: '💼',
  },
  {
    id: '4',
    name: '음식 맛집 추천',
    description: '한국의 숨겨진 맛집들을 서로 추천하고 정보를 공유하는 커뮤니티입니다. 새로운 맛집을 발견하고 경험을 공유해보세요.',
    members: 5678,
    category: '생활',
    rules: [
      '허위 정보는 삼가주세요.',
      '식당에 대한 예의를 지켜주세요.',
      '개인의 취향을 존중해주세요.'
    ],
    posts: [
      {
        id: '401',
        author: '제임스',
        authorNationality: '🇬🇧',
        content: '종로3가에 있는 백반집 정말 맛있네요! 가격도 저렴하고 반찬도 푸짐해요.',
        likes: 35,
        comments: 0,
        timeAgo: '3시간 전',
      },
      {
        id: '402',
        author: '후지사와',
        authorNationality: '🇯🇵',
        content: '명동에 괜찮은 스시집 추천해주실 분 계신가요? 혼밥 가능한 곳이면 좋겠어요.',
        likes: 22,
        comments: 0,
        timeAgo: '1일 전',
      },
    ],
    icon: '🍽️',
  },
  {
    id: '5',
    name: '비자/체류 정보',
    description: '비자 신청, 체류 연장, 국적 취득 등 외국인들이 한국에 거주하면서 필요한 법률 및 행정 정보를 공유하는 커뮤니티입니다.',
    members: 4321,
    category: '법률',
    rules: [
      '정확한 법률 정보를 공유해주세요.',
      '전문적인 조언은 전문가에게 문의하세요.',
      '타인의 개인 정보를 보호해주세요.'
    ],
    posts: [
      {
        id: '501',
        author: '존',
        authorNationality: '🇨🇦',
        content: 'E-2 비자 연장 준비 중인데, 필요한 서류 목록 최신 정보 아시는 분 있나요?',
        likes: 10,
        comments: 0,
        timeAgo: '5시간 전',
      },
      {
        id: '502',
        author: '타냐',
        authorNationality: '🇷🇺',
        content: '결혼 이민 비자(F-6) 신청해보신 분들 경험담 공유 부탁드립니다!',
        likes: 18,
        comments: 0,
        timeAgo: '2일 전',
      },
    ],
    icon: '📋',
  },
];

export const CommunityDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showJoinModal, setShowJoinModal] = React.useState(false);
  const [isJoined, setIsJoined] = React.useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = React.useState(false);

  // State to manage posts with local like/comment status
  const [communityPosts, setCommunityPosts] = React.useState<CommunityPost[]>([]);

  React.useEffect(() => {
    if (community) {
      setCommunityPosts(community.posts.map(post => ({ ...post }))); // Deep copy for mutable state
    }
  }, [community]);

  const handleConfirmJoin = () => {
    setShowJoinModal(false);
    setIsJoined(true);
    setShowWelcomeModal(true);
  };

  const handleLikeToggle = (postId: string) => {
    setCommunityPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId
          ? {
              ...post,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1,
              isLiked: !post.isLiked,
            }
          : post
      )
    );
  };

  const handleToggleComments = (postId: string) => {
    setCommunityPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId
          ? {
              ...post,
              showComments: !post.showComments,
            }
          : post
      )
    );
  };

  const JoinCommunityModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-20">
      <div className="bg-white rounded-[20px] p-6 text-center shadow-lg max-w-sm w-full">
        <h3 className="text-lg font-bold mb-2 text-text-900">커뮤니티 가입</h3>
        <p className="text-sm text-text-700 mb-6">'{community?.name}'에 가입하시겠습니까?</p>
        <div className="flex justify-center gap-3">
          <button onClick={() => setShowJoinModal(false)} className="flex-1 h-[48px] bg-gray-100 text-text-800 rounded-[12px] font-semibold">취소</button>
          <button onClick={handleConfirmJoin} className="flex-1 h-[48px] bg-mint-600 text-white rounded-[12px] font-semibold">가입</button>
        </div>
      </div>
    </div>
  );

  const WelcomeModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-20">
      <div className="bg-white rounded-[20px] p-8 text-center shadow-lg max-w-sm w-full">
        <div className="text-5xl mb-4">🎉</div>
        <h3 className="text-xl font-bold mb-2 text-text-900">가입을 환영합니다!</h3>
        <p className="text-md text-text-700 mb-6">이제 '{community?.name}'의 멤버입니다.</p>
        <button onClick={() => setShowWelcomeModal(false)} className="w-full h-[48px] bg-mint-600 text-white rounded-[12px] font-semibold">확인</button>
      </div>
    </div>
  );
  
  if (!community) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <Header title="커뮤니티" showBack />
        <p className="text-text-700 text-lg">커뮤니티를 찾을 수 없습니다.</p>
        <button
          onClick={() => navigate('/network')}
          className="mt-4 px-4 py-2 bg-mint-600 text-white rounded-lg"
        >
          목록으로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title={community.name} showBack />
      
      {showJoinModal && <JoinCommunityModal />}
      {showWelcomeModal && <WelcomeModal />}

      <div className="p-4 space-y-4">
        {/* Community Info */}
        <div className="bg-white rounded-[16px] p-4 shadow-card border border-line-200">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-16 h-16 bg-mint-100 rounded-[12px] flex items-center 
                           justify-center text-[36px] flex-shrink-0">
              {community.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-[20px] font-bold text-text-900">
                  {community.name}
                </h2>
                <span className="px-[8px] py-[2px] bg-gray-100 text-text-700 
                               rounded-[6px] text-[12px] font-medium">
                  {community.category}
                </span>
              </div>
              <p className="text-[14px] text-text-700">
                {community.members.toLocaleString()}명 멤버
              </p>
            </div>
          </div>
          <p className="text-[14px] text-text-800 leading-relaxed mb-4">
            {community.description}
          </p>
          <button 
            onClick={() => !isJoined && setShowJoinModal(true)}
            disabled={isJoined}
            className={`w-full h-[48px] rounded-[12px] text-[16px] font-semibold transition-colors
                           ${isJoined 
                              ? 'bg-mint-100 text-mint-700 cursor-not-allowed' 
                              : 'bg-mint-600 text-white hover:bg-mint-700'}`}
          >
            {isJoined ? '가입 완료' : '커뮤니티 가입'}
          </button>
        </div>

        {/* Community Rules */}
        {community.rules.length > 0 && (
          <div className="bg-white rounded-[16px] p-4 shadow-card border border-line-200">
            <h3 className="text-[16px] font-bold text-text-900 mb-3">커뮤니티 규칙</h3>
            <ul className="list-disc list-inside text-[14px] text-text-800 space-y-1">
              {community.rules.map((rule, index) => (
                <li key={index}>{rule}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Create Post for Community */}
        <div className="bg-white rounded-[16px] p-4 shadow-card border border-line-200">
            <button
                onClick={() => {
                  alert('커뮤니티 게시글 작성 페이지 (구현 예정)');
                }}
                className="w-full text-left p-3 bg-background rounded-[12px] 
                         text-[14px] text-text-500 hover:bg-gray-100 transition-colors"
              >
                무슨 생각을 하고 계신가요?
              </button>
        </div>

        {/* Community Posts */}
        <div className="space-y-3">
          {communityPosts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-[16px] p-4 shadow-card border border-line-200"
            >
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
                      {community.name} • {post.timeAgo}
                    </p>
                  </div>
                </div>
                <button className="p-1 text-text-500 hover:bg-gray-100 rounded-full">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                  </svg>
                </button>
              </div>
              <p className="text-[14px] text-text-800 leading-relaxed mb-3">
                {post.content}
              </p>
              <div className="flex items-center gap-4 pt-3 border-t border-line-200">
                {/* Like Button */}
                <button
                  onClick={() => handleLikeToggle(post.id)}
                  className="flex items-center gap-1 text-text-700 hover:text-mint-600 transition-colors"
                >
                  <svg
                    className={`w-5 h-5 ${post.isLiked ? 'fill-red-500 text-red-500' : 'text-text-700'}`}
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                  <span className="text-[13px] font-medium">{post.likes}</span>
                </button>
                {/* Comment Button */}
                <button
                  onClick={() => handleToggleComments(post.id)}
                  className="flex items-center gap-1 text-text-700 hover:text-mint-600 transition-colors"
                >
                  <svg
                    className={`w-5 h-5 ${post.showComments ? 'text-mint-600' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  <span className="text-[13px] font-medium">{post.commentsData ? post.commentsData.length : 0}</span>
                </button>
                <button className="flex items-center gap-1 text-text-700 hover:text-mint-600 
                                 transition-colors ml-auto">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                </button>
              </div>
              {/* Comments Section */}
              {post.showComments && post.commentsData && post.commentsData.length > 0 && (
                <div className="mt-4 pt-3 border-t border-line-200">
                  <h5 className="text-[13px] font-semibold text-text-800 mb-2">댓글</h5>
                  <div className="space-y-3">
                    {post.commentsData.map((comment) => (
                      <div key={comment.id} className="flex items-start gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-gray-100 to-gray-200 
                                       rounded-full flex items-center justify-center text-[16px] flex-shrink-0">
                          {comment.authorNationality}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-1">
                            <span className="text-[13px] font-semibold text-text-900">{comment.author}</span>
                            <span className="text-[11px] text-text-500">• {comment.timeAgo}</span>
                          </div>
                          <p className="text-[13px] text-text-800 leading-snug">{comment.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
