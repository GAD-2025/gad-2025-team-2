import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { useState, useRef, useEffect } from 'react';

import { LESSON_CONTENTS } from '@/data/lessonContents';

export const LessonTopicQuiz = () => {
  const { lessonId, topicId } = useParams<{ lessonId: string; topicId: string }>();
  const navigate = useNavigate();
  const dialogRef = useRef<HTMLDialogElement>(null);

  const contentKey = `${lessonId}-${topicId}`;
  const lessonData = LESSON_CONTENTS[contentKey as keyof typeof LESSON_CONTENTS];

  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [isCorrectAnswer, setIsCorrectAnswer] = useState<boolean | null>(null);

  useEffect(() => {
    if (isPopupVisible) {
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
    }
  }, [isPopupVisible]);

  const handleFinishAndGoHome = () => {
    try {
      // 1. Update progress
      const progressKey = `lesson-progress-${lessonId}`;
      let progressData = { completedTopics: [] as string[] };
      const savedProgress = localStorage.getItem(progressKey);
      if (savedProgress) {
        // It's possible parsing fails if data is corrupt
        progressData = JSON.parse(savedProgress);
      }

      if (topicId && !progressData.completedTopics.includes(topicId)) {
        progressData.completedTopics.push(topicId);
      }
      localStorage.setItem(progressKey, JSON.stringify(progressData));
    } catch (error) {
      console.error("Could not save progress, but will navigate anyways:", error);
    }
    
    // 2. Navigate home, even if saving progress failed
    navigate('/learning');
  };

  const handleAnswer = (option: string, answer: string) => {
    if (selectedAnswer) return;

    const isCorrect = option === answer;
    setSelectedAnswer(option);
    setIsCorrectAnswer(isCorrect);
    setIsPopupVisible(true);
  };

  if (!lessonData || !lessonData.quiz) {
    return <div>퀴즈를 찾을 수 없습니다.</div>;
  }

  const { quiz } = lessonData;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <Header title={lessonData.title} showBack />
      <div className="p-6">
        <div className="bg-white p-5 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-3">{quiz.question}</h3>
          <div className="space-y-2">
            {quiz.options.map((option) => {
              const isSelected = selectedAnswer === option;
              
              let buttonClass = "w-full text-left p-3 rounded-md transition-colors ";
              if (isSelected) {
                buttonClass += isCorrectAnswer ? "bg-mint-100 text-mint-700 font-bold" : "bg-red-100 text-red-700 font-bold";
              } else {
                buttonClass += "bg-gray-100 hover:bg-gray-200";
              }

              return (
                <button
                  key={option}
                  className={buttonClass}
                  onClick={() => handleAnswer(option, quiz.answer)}
                  disabled={selectedAnswer !== null}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <dialog ref={dialogRef} onCancel={(e) => e.preventDefault()} className="w-full max-w-sm rounded-2xl p-0 [&::backdrop]:bg-black/60">
        <div className="bg-white p-6 text-center">
            <h3 className="text-xl font-bold text-text-900 mb-3">
              {isCorrectAnswer ? "정답입니다!" : "오답입니다."}
            </h3>
            {!isCorrectAnswer && (
              <p className="text-text-700 mb-5">해설: {quiz.quizExplanation}</p>
            )}
            <button
              onClick={handleFinishAndGoHome}
              className="w-full h-12 bg-mint-600 text-white rounded-lg font-semibold"
            >
              학습 홈으로 돌아가기
            </button>
          </div>
      </dialog>
    </div>
  );
};
