import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { LevelTestIntro } from './LevelTestIntro';
import { LESSONS_DATA } from '@/data/lessons';

interface Question {
  id: number;
  text: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const questionsData: Question[] = [
  {
    id: 1,
    text: '다음 중 올바른 한국어 문장은?',
    options: [
      '저는 학교에 가요',
      '저는 학교를 가요',
      '저는 학교 가요',
      '저는 학교에서 가요'
    ],
    correctIndex: 0,
    explanation: '"~에 가다"는 장소로 이동하는 것을 나타내는 가장 자연스러운 표현입니다. "저는 학교에 가요"가 올바른 문장입니다.'
  },
  {
    id: 2,
    text: '"안녕하세요"에 대한 적절한 대답은?',
    options: [
      '감사합니다',
      '안녕하세요',
      '죄송합니다',
      '괜찮아요'
    ],
    correctIndex: 1,
    explanation: '한국어에서 "안녕하세요"는 인사말이며, 똑같이 "안녕하세요"라고 대답하는 것이 일반적입니다.'
  },
  {
    id: 3,
    text: '시간을 물어볼 때 사용하는 표현은?',
    options: [
      '몇 살이에요?',
      '몇 시예요?',
      '어디예요?',
      '뭐예요?'
    ],
    correctIndex: 1,
    explanation: '"몇 시예요?"는 현재 시간을 묻는 정확한 표현입니다. "몇 살이에요?"는 나이를, "어디예요?"는 장소를, "뭐예요?"는 사물을 물을 때 사용합니다.'
  }
];

const AnswerFeedback: React.FC<{
  isCorrect: boolean;
  question: Question;
  onNext: () => void;
  isLastQuestion: boolean;
}> = ({ isCorrect, question, onNext, isLastQuestion }) => {
  const CorrectIcon = () => (
    <svg className="w-16 h-16 text-mint-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );

  const IncorrectIcon = () => (
    <svg className="w-16 h-16 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );

  const feedbackText = isCorrect ? '정답이에요!' : '틀렸어요!';
  const feedbackTextColor = isCorrect ? 'text-mint-600' : 'text-text-700';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-20">
      <div className="relative w-full max-w-sm bg-white rounded-[20px] p-6 text-center shadow-card">
        <div className={`mx-auto w-24 h-24 flex items-center justify-center bg-mint-50 rounded-full mb-4`}>
          {isCorrect ? <CorrectIcon /> : <IncorrectIcon />}
        </div>
        <p className={`text-2xl font-bold mb-3 ${feedbackTextColor}`}>{feedbackText}</p>
        
        {!isCorrect && (
          <p className="font-semibold text-text-800 mb-2">
            정답은 {question.correctIndex + 1}번이에요.
          </p>
        )}
        <p className="text-text-600 mb-8 px-4">{question.explanation}</p>
        
        <button
          onClick={onNext}
          className="w-full h-[52px] bg-mint-600 text-white rounded-[12px] text-[16px] font-semibold hover:bg-mint-700 transition-colors"
        >
          {isLastQuestion ? '결과 확인하기' : '다음'}
        </button>
      </div>
    </div>
  );
};

export const LevelTest = () => {
  const navigate = useNavigate();
  const [testStarted, setTestStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>([]);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleStartTest = () => {
    setTestStarted(true);
  };
  
  const handleSelectAndSubmit = (index: number) => {
    if (isAnswered) return;

    setSelectedOptionIndex(index);
    
    const correct = questionsData[currentQuestionIndex].correctIndex === index;
    setIsCorrect(correct);
    
    const updatedAnswers = [...userAnswers];
    updatedAnswers[currentQuestionIndex] = index;
    setUserAnswers(updatedAnswers);
    
    setIsAnswered(true);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questionsData.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOptionIndex(null);
      setIsAnswered(false);
      setIsCorrect(null);
    } else {
      setShowResult(true);
    }
  };

  if (!testStarted) {
    return <LevelTestIntro onStartTest={handleStartTest} />;
  }

  if (showResult) {
    const score = Math.round(
      (userAnswers.filter((answer, index) => answer === questionsData[index].correctIndex).length / questionsData.length) * 100
    );
    const level = score >= 90 ? 'Lv.4 상급' : score >= 70 ? 'Lv.3 중급' : score >= 50 ? 'Lv.2 초급' : 'Lv.1 기초';

    // Save the result to localStorage
    localStorage.setItem('userLevel', level);

    // Reset all lesson progress
    LESSONS_DATA.forEach(lesson => {
      localStorage.removeItem(`lesson-progress-${lesson.id}`);
    });

    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header title="레벨 테스트" />
        <div className="flex flex-col items-center justify-center flex-grow px-6 transform -translate-y-8">
          <div className="w-32 h-32 mb-8 flex items-center justify-center">
            <svg className="w-full h-full text-mint-600" viewBox="0 0 120 120" fill="none">
              <circle cx="60" cy="60" r="54" stroke="currentColor" strokeWidth="4" fill="none" />
              <path d="M35 60 L52 77 L85 44" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
          </div>
          <h2 className="text-[24px] font-bold text-text-900 mb-4">테스트 완료!</h2>
          <p className="text-[16px] text-text-700 text-center mb-3">당신의 한국어 레벨은</p>
          <div className="px-6 py-3 bg-mint-100 rounded-[12px] mb-8">
            <p className="text-[28px] font-bold text-mint-600">{level}</p>
          </div>
          <button onClick={() => navigate('/learning')} className="w-full max-w-sm h-[52px] bg-mint-600 text-white rounded-[14px] text-[15px] font-semibold hover:bg-mint-700">
            학습 시작하기
          </button>
        </div>
      </div>
    );
  }

  const question = questionsData[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questionsData.length) * 100;

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header title="레벨 테스트" showBack />
      
      {isAnswered && isCorrect !== null && (
        <AnswerFeedback
          isCorrect={isCorrect}
          question={question}
          onNext={handleNext}
          isLastQuestion={currentQuestionIndex === questionsData.length - 1}
        />
      )}

      <div className="p-4">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[14px] text-text-700">질문 {currentQuestionIndex + 1} / {questionsData.length}</span>
            <span className="text-[14px] font-semibold text-mint-600">{Math.round(progress)}%</span>
          </div>
          <div className="relative w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="absolute left-0 top-0 h-full bg-mint-600 rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="bg-white rounded-[20px] p-6 shadow-card mb-6">
          <h3 className="text-[18px] font-bold text-text-900 mb-6 leading-relaxed">{question.text}</h3>
          <div className="space-y-3">
            {question.options.map((option, index) => {
              const isSelected = selectedOptionIndex === index;
              let optionClass = 'border-line-200 bg-white hover:border-mint-600/50';
              if (isAnswered) {
                if (question.correctIndex === index) {
                  optionClass = 'border-mint-600 bg-mint-50 text-text-900 font-bold';
                } else if (isSelected) {
                  optionClass = 'border-red-400 bg-red-50 text-text-900';
                }
              } else if (isSelected) {
                optionClass = 'border-mint-600 bg-mint-50';
              }

              return (
                <button
                  key={index}
                  onClick={() => handleSelectAndSubmit(index)}
                  disabled={isAnswered}
                  className={`w-full text-left p-4 rounded-[12px] border-2 transition-all ${optionClass} disabled:cursor-not-allowed`}
                >
                  <span className="text-[15px] text-text-900">{option}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
