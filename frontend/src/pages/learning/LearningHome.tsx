import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LESSONS_DATA } from '@/data/lessons';
import type { Lesson } from '@/data/lessons';

interface LessonWithProgress extends Lesson {
  completed: boolean;
  progress: number;
}

export const LearningHome = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [lessonsWithProgress, setLessonsWithProgress] = useState<LessonWithProgress[]>([]);
  
  const userLevel = localStorage.getItem('userLevel');

  useEffect(() => {
    const calculateProgress = () => {
      const newLessonsWithProgress = LESSONS_DATA.map(lesson => {
        const progressKey = `lesson-progress-${lesson.id}`;
        let completedTopicsCount = 0;
        
        try {
          const savedProgress = localStorage.getItem(progressKey);
          if (savedProgress) {
            const progressData = JSON.parse(savedProgress);
            if (progressData && progressData.completedTopics) {
              completedTopicsCount = new Set(progressData.completedTopics).size;
            }
          }
        } catch (e) {
          console.error("Failed to parse progress data for lesson " + lesson.id, e);
        }

        const totalTopics = lesson.topics.length;
        const progress = totalTopics > 0 ? Math.round((completedTopicsCount / totalTopics) * 100) : 0;
        
        return {
          ...lesson,
          progress,
          completed: progress === 100,
        };
      });
      setLessonsWithProgress(newLessonsWithProgress);
    };

    calculateProgress();
  }, [location]);

  const totalProgress = lessonsWithProgress.reduce((sum, lesson) => sum + lesson.progress, 0);
  const currentProgress = lessonsWithProgress.length > 0 ? Math.round(totalProgress / lessonsWithProgress.length) : 0;

  const levels = ['all', 'Lv.1 기초', 'Lv.2 초급', 'Lv.3 중급', 'Lv.4 상급'];

  const filteredLessons = selectedLevel === 'all' 
    ? lessonsWithProgress 
    : lessonsWithProgress.filter(lesson => lesson.level === selectedLevel);

  const getLevelButtonStyle = (level: string) => {
    if (level === selectedLevel) {
      return 'bg-mint-600 text-white';
    }
    switch (level) {
      case 'Lv.1 기초': return 'bg-mint-100 text-mint-700 border border-mint-200 hover:bg-mint-200';
      case 'Lv.2 초급': return 'bg-mint-200 text-mint-800 border border-mint-300 hover:bg-mint-300';
      case 'Lv.3 중급': return 'bg-mint-300 text-mint-900 border border-mint-400 hover:bg-mint-400';
      case 'Lv.4 상급': return 'bg-mint-500 text-white border border-mint-600 hover:bg-mint-600';
      default: return 'bg-white text-text-700 border border-line-200 hover:border-mint-600';
    }
  };

  const getLevelTagStyle = (level: string) => {
    switch (level) {
      case 'Lv.1 기초': return 'bg-mint-100 text-mint-700';
      case 'Lv.2 초급': return 'bg-mint-200 text-mint-800';
      case 'Lv.3 중급': return 'bg-mint-300 text-mint-900';
      case 'Lv.4 상급': return 'bg-mint-500 text-white';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-white border-b border-line-200 px-4 py-4 sticky top-0 z-10">
        <h1 className="text-[20px] font-bold text-text-900">학습</h1>
      </header>

      <div className="p-4">
        {/* Current Learning Status */}
        <div className="bg-gradient-to-br from-mint-600 to-mint-500 rounded-[20px] p-5 mb-6 text-white">
          {userLevel ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-[13px] opacity-90 mb-1">현재 학습 레벨</p>
                  <h2 className="text-[24px] font-bold">{userLevel}</h2>
                </div>
                <div className="text-right">
                  <p className="text-[32px] font-bold">{currentProgress}%</p>
                  <p className="text-[12px] opacity-90">완료</p>
                </div>
              </div>
              <div className="relative w-full h-3 bg-white/30 rounded-full overflow-hidden mb-4">
                <div
                  className="absolute left-0 top-0 h-full bg-white rounded-full transition-all"
                  style={{ width: `${currentProgress}%` }}
                />
              </div>
            </>
          ) : (
            <div className="text-center py-2">
              <h2 className="text-[18px] font-bold mb-2">아직 측정된 레벨이 없어요</h2>
              <p className="text-[14px] opacity-90 mb-4">레벨 테스트로 나의 한국어 실력을 확인해보세요!</p>
            </div>
          )}
          <button
            onClick={() => navigate('/learning/level-test')}
            className="w-full h-[44px] bg-white text-mint-600 rounded-[12px] font-semibold hover:bg-white/90 transition-colors"
          >
            📝 레벨 테스트 시작하기
          </button>
        </div>

        {/* Level Filter */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[14px] font-semibold text-text-900">레벨별 강의</p>
          </div>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
            {levels.map((level) => (
              <button
                key={level}
                onClick={() => setSelectedLevel(level)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-[13px] font-medium transition-colors ${getLevelButtonStyle(level)}`}
              >
                {level === 'all' ? '전체' : level}
              </button>
            ))}
          </div>
        </div>

        {/* Lesson List */}
        <div className="space-y-3">
          {filteredLessons.map((lesson) => {
            // 사용자의 정확한 레벨과 일치하는 강의만 열림
            const isLocked = userLevel ? lesson.level !== userLevel : true;

            if (isLocked) {
              return (
                <div
                  key={lesson.id}
                  className="bg-gray-50 rounded-[16px] p-4 shadow-card border border-line-200 opacity-70"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-[10px] py-[4px] rounded-[8px] text-[12px] font-medium ${getLevelTagStyle(lesson.level)}`}>
                          {lesson.level}
                        </span>
                      </div>
                      <h3 className="text-[16px] font-semibold text-gray-500 mb-1">
                        {lesson.title}
                      </h3>
                    </div>
                    <div className="w-6 h-6 text-gray-400 flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={lesson.id}
                onClick={() => navigate(`/learning/lesson/${lesson.id}`)}
                className="bg-white rounded-[16px] p-4 shadow-card hover:shadow-soft 
                         transition-all cursor-pointer border border-line-200"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-[10px] py-[4px] rounded-[8px] text-[12px] font-medium ${getLevelTagStyle(lesson.level)}`}>
                        {lesson.level}
                      </span>
                      {lesson.completed && (
                        <span className="text-[20px]">✅</span>
                      )}
                    </div>
                    <h3 className="text-[16px] font-semibold text-text-900 mb-1">
                      {lesson.title}
                    </h3>
                  </div>
                  <svg className="w-6 h-6 text-text-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>

                {/* Progress Bar */}
                <div className="mb-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[12px] text-text-700">진도율</span>
                    <span className="text-[12px] font-semibold text-mint-600">{lesson.progress}%</span>
                  </div>
                  <div className="relative w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="absolute left-0 top-0 h-full bg-mint-600 rounded-full transition-all"
                      style={{ width: `${lesson.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredLessons.length === 0 && (
          <div className="text-center py-12">
            <p className="text-text-500 text-[15px]">해당 레벨의 강의가 없습니다</p>
          </div>
        )}
      </div>
    </div>
  );
};

