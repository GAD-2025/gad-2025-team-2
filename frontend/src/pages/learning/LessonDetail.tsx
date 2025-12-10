import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Header } from '@/components/Header';
import { LESSONS_DATA } from '@/data/lessons';

export const LessonDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'overview' | 'topics'>('overview');
  
  const lesson = LESSONS_DATA.find(l => l.id === id) || LESSONS_DATA[0];
  
  const [completedTopics, setCompletedTopics] = useState<Set<string>>(new Set());

  useEffect(() => {
    const updateProgress = () => {
      const progressKey = `lesson-progress-${id}`;
      try {
        const savedProgress = localStorage.getItem(progressKey);
        if (savedProgress) {
          const progressData = JSON.parse(savedProgress);
          if (progressData && progressData.completedTopics) {
            setCompletedTopics(new Set(progressData.completedTopics));
          } else {
            setCompletedTopics(new Set());
          }
        } else {
          setCompletedTopics(new Set());
        }
      } catch (e) {
        console.error("Failed to parse progress data", e);
        setCompletedTopics(new Set());
      }
    };

    updateProgress();
  }, [id, location]);

  const progressPercent = lesson.topics.length > 0
    ? Math.round((completedTopics.size / lesson.topics.length) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header title="강의 상세" showBack />

      <div className="p-4">
        {/* Lesson Header Card */}
        <div className="bg-gradient-to-br from-mint-600 to-mint-500 rounded-[20px] p-5 mb-6 text-white">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <span className="inline-block px-[10px] py-[4px] bg-white/30 rounded-[8px] 
                           text-[12px] font-medium mb-2">
                {lesson.level}
              </span>
              <h1 className="text-[22px] font-bold mb-2">{lesson.title}</h1>
              <p className="text-[13px] opacity-90">{lesson.duration}</p>
            </div>
          </div>

          {/* Progress */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[12px] opacity-90">진도율</span>
              <span className="text-[14px] font-bold">{progressPercent}%</span>
            </div>
            <div className="relative w-full h-2 bg-white/30 rounded-full overflow-hidden">
              <div 
                className="absolute left-0 top-0 h-full bg-white rounded-full transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <p className="text-[13px] opacity-90">
            {completedTopics.size} / {lesson.topics.length} 완료
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4 border-b border-line-200">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-3 text-[15px] font-semibold transition-colors relative ${
              activeTab === 'overview'
                ? 'text-mint-600'
                : 'text-text-500'
            }`}
          >
            개요
            {activeTab === 'overview' && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-mint-600" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('topics')}
            className={`flex-1 py-3 text-[15px] font-semibold transition-colors relative ${
              activeTab === 'topics'
                ? 'text-mint-600'
                : 'text-text-500'
            }`}
          >
            강의 구성
            {activeTab === 'topics' && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-mint-600" />
            )}
          </button>
        </div>

        {/* Content */}
        {activeTab === 'overview' ? (
          <div className="space-y-5">
            {/* Solve Problem Button */}
            <div className="bg-white rounded-[16px] p-5 shadow-card text-center">
              <h3 className="text-[16px] font-bold text-text-900 mb-3">실력 확인하기</h3>
              <p className="text-[14px] text-text-700 mb-4">문제를 풀고 진도율을 올려보세요!</p>
              <button
                onClick={() => navigate(`/learning/lesson/${lesson.id}/quiz`)}
                className="w-full h-[48px] bg-mint-100 text-mint-700 rounded-[12px] font-semibold hover:bg-mint-200 transition-colors"
              >
                오늘의 문제 풀기
              </button>
            </div>

            {/* Description */}
            <div className="bg-white rounded-[16px] p-5 shadow-card">
              <h3 className="text-[16px] font-bold text-text-900 mb-3">강의 소개</h3>
              <p className="text-[14px] text-text-700 leading-relaxed">
                {lesson.description}
              </p>
            </div>

            {/* Objectives */}
            <div className="bg-white rounded-[16px] p-5 shadow-card">
              <h3 className="text-[16px] font-bold text-text-900 mb-3">학습 목표</h3>
              <ul className="space-y-2">
                {lesson.objectives.map((objective, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-mint-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-[14px] text-text-700">{objective}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {lesson.topics.map((topic, index) => {
              const isCompleted = completedTopics.has(topic.id);

              return (
                <div
                  key={topic.id}
                  className="bg-white rounded-[16px] p-4 shadow-card flex items-center 
                           justify-between hover:shadow-soft transition-all cursor-pointer"
                  onClick={() => {
                    if (lesson.id === '1' && (topic.id === '1' || topic.id === '2')) {
                      navigate(`/learning/lesson/${lesson.id}/topic/${topic.id}`);
                    } else {
                      alert('준비 중입니다.');
                    }
                  }}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center 
                                  text-[14px] font-bold ${
                      isCompleted
                        ? 'bg-mint-600 text-white'
                        : 'bg-gray-100 text-text-500'
                    }`}>
                      {isCompleted ? '✓' : index + 1}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-[15px] font-semibold text-text-900 mb-0.5">
                        {topic.title}
                      </h4>
                      {isCompleted && (
                        <p className="text-[12px] text-mint-600">완료</p>
                      )}
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-text-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-line-200 p-4">
        <button
          onClick={() => {
            // 첫 번째 미완료 토픽으로 이동하거나 처음부터 시작
            alert('강의 콘텐츠 재생 (구현 예정)');
          }}
          className="w-full h-[52px] bg-mint-600 text-white rounded-[12px] text-[16px] 
                   font-semibold hover:bg-mint-700 transition-colors flex items-center 
                   justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z"/>
          </svg>
          학습 시작하기
        </button>
      </div>
    </div>
  );
};

