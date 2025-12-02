import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
}

export const LevelTest = () => {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showResult, setShowResult] = useState(false);

  const questions: Question[] = [
    {
      id: 1,
      question: '다음 중 올바른 한국어 문장은?',
      options: [
        '저는 학교에 가요',
        '저는 학교를 가요',
        '저는 학교 가요',
        '저는 학교에서 가요'
      ],
      correctAnswer: 0
    },
    {
      id: 2,
      question: '"안녕하세요"에 대한 적절한 대답은?',
      options: [
        '감사합니다',
        '안녕하세요',
        '죄송합니다',
        '괜찮아요'
      ],
      correctAnswer: 1
    },
    {
      id: 3,
      question: '시간을 물어볼 때 사용하는 표현은?',
      options: [
        '몇 살이에요?',
        '몇 시예요?',
        '어디예요?',
        '뭐예요?'
      ],
      correctAnswer: 1
    }
  ];

  const handleSelectAnswer = (index: number) => {
    console.log('Selected answer index:', index);
    setSelectedAnswer(index);
  };

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setSelectedAnswer(null);
    }
  };

  const handleNext = () => {
    if (selectedAnswer === null) return;

    const newAnswers = [...answers, selectedAnswer];
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
    } else {
      // 테스트 완료
      setShowResult(true);
    }
  };

  const calculateScore = () => {
    let correct = 0;
    answers.forEach((answer, index) => {
      if (answer === questions[index].correctAnswer) {
        correct++;
      }
    });
    return Math.round((correct / questions.length) * 100);
  };

  const getLevel = (score: number) => {
    if (score >= 90) return 'Lv.4 상급';
    if (score >= 70) return 'Lv.3 중급';
    if (score >= 50) return 'Lv.2 초급';
    return 'Lv.1 기초';
  };

  if (showResult) {
    const score = calculateScore();
    const level = getLevel(score);

    return (
      <div className="min-h-screen bg-background pb-20">
        <Header title="레벨 테스트" />
        
        <div className="flex flex-col items-center justify-center px-6 pt-24">
          {/* Success Icon */}
          <div className="w-32 h-32 mb-8 flex items-center justify-center">
            <svg className="w-full h-full text-mint-600" viewBox="0 0 120 120" fill="none">
              <circle cx="60" cy="60" r="54" stroke="currentColor" strokeWidth="4" fill="none" />
              <path d="M35 60 L52 77 L85 44" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
          </div>

          {/* Result */}
          <h2 className="text-[24px] font-bold text-text-900 mb-3">테스트 완료!</h2>
          <p className="text-[16px] text-text-700 text-center mb-2">
            당신의 한국어 레벨은
          </p>
          <div className="px-6 py-3 bg-mint-100 rounded-[12px] mb-8">
            <p className="text-[28px] font-bold text-mint-600">{level}</p>
          </div>
          <p className="text-[14px] text-text-500 text-center mb-12">
            정답률: {score}% ({answers.filter((a, i) => a === questions[i].correctAnswer).length}/{questions.length}문제)
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 w-full max-w-sm">
            <button
              onClick={() => navigate('/learning')}
              className="h-[52px] bg-mint-600 text-white rounded-[14px] text-[15px] 
                       font-semibold hover:bg-mint-700 transition-colors"
            >
              학습 시작하기
            </button>
            <button
              onClick={() => {
                setCurrentQuestion(0);
                setSelectedAnswer(null);
                setAnswers([]);
                setShowResult(false);
              }}
              className="h-[52px] bg-white border border-mint-600 text-mint-600 rounded-[14px] 
                       text-[15px] font-semibold hover:bg-mint-50 transition-colors"
            >
              다시 테스트하기
            </button>
          </div>
        </div>
      </div>
    );
  }

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header title="레벨 테스트" showBack />

      <div className="p-4">
        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[14px] text-text-700">
              질문 {currentQuestion + 1} / {questions.length}
            </span>
            <span className="text-[14px] font-semibold text-mint-600">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="relative w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="absolute left-0 top-0 h-full bg-mint-600 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-[20px] p-6 shadow-card mb-6">
          <h3 className="text-[18px] font-bold text-text-900 mb-6 leading-relaxed">
            {question.question}
          </h3>

          {/* Options */}
          <div className="space-y-3">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleSelectAnswer(index)}
                className={`w-full text-left p-4 rounded-[12px] border-2 transition-all ${
                  selectedAnswer === index
                    ? 'border-mint-600 bg-mint-50'
                    : 'border-line-200 bg-white hover:border-mint-600/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    selectedAnswer === index
                      ? 'border-mint-600 bg-mint-600'
                      : 'border-gray-300'
                  }`}>
                    {selectedAnswer === index && (
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className="text-[15px] text-text-900">{option}</span>
                </div>
              </button>
            ))}
          </div>

          {selectedAnswer !== null && (
            <div className="mt-6 flex gap-3">
              {currentQuestion > 0 && (
                <button
                  onClick={handlePrev}
                  className="w-full h-[52px] bg-gray-200 text-gray-700 rounded-[12px] text-[16px] 
                           font-semibold hover:bg-gray-300 transition-colors"
                >
                  이전
                </button>
              )}
              <button
                onClick={handleNext}
                className="w-full h-[52px] bg-mint-600 text-white rounded-[12px] text-[16px] 
                         font-semibold hover:bg-mint-700 transition-colors"
              >
                {currentQuestion === questions.length - 1 ? '결과 확인하기' : '다음'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-line-200 p-4">
        <div className="flex gap-3">
          {currentQuestion > 0 && (
            <button
              onClick={handlePrev}
              className="w-full h-[52px] bg-gray-200 text-gray-700 rounded-[12px] text-[16px] 
                       font-semibold hover:bg-gray-300 transition-colors"
            >
              이전
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={selectedAnswer === null}
            className="w-full h-[52px] bg-mint-600 text-white rounded-[12px] text-[16px] 
                     font-semibold hover:bg-mint-700 transition-colors disabled:opacity-50 
                     disabled:cursor-not-allowed"
          >
            {currentQuestion === questions.length - 1 ? '결과 확인하기' : '다음'}
          </button>
        </div>
      </div>
    </div>
  );
};

