import React from 'react';
import { Header } from '@/components/Header';

interface LevelTestIntroProps {
  onStartTest: () => void;
}

export const LevelTestIntro: React.FC<LevelTestIntroProps> = ({ onStartTest }) => {
  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <Header title="레벨 테스트" />

      <div className="flex flex-col items-center px-6 pt-12">
        {/* Icon */}
        <div className="w-16 h-16 mb-6 bg-mint-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-mint-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>

        {/* Title & Subtitle */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">빠른 레벨 진단</h1>
        <p className="text-gray-600 text-center mb-8">
          5분 안에 현재 수정님의 한국어 수준을 파악할 수 있습니다.
        </p>

        {/* Info Boxes */}
        <div className="flex w-full justify-around gap-2 text-center mb-10">
          <div className="flex-1 bg-white p-3 rounded-lg shadow-sm">
            <div className="text-sm text-gray-500">소요시간</div>
            <div className="font-semibold text-gray-800">약 5분</div>
          </div>
          <div className="flex-1 bg-white p-3 rounded-lg shadow-sm">
            <div className="text-sm text-gray-500">문항수</div>
            <div className="font-semibold text-gray-800">3문항</div>
          </div>
          <div className="flex-1 bg-white p-3 rounded-lg shadow-sm">
            <div className="text-sm text-gray-500">난이도</div>
            <div className="font-semibold text-gray-800">적응형</div>
          </div>
        </div>

        {/* Test Composition */}
        <div className="w-full text-left mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">테스트 구성</h2>
          <div className="space-y-3">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="font-semibold text-gray-800">1. 기본 어휘 (5문항)</h3>
              <p className="text-sm text-gray-600">일상 및 업무 관련 기본 단어</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="font-semibold text-gray-800">2. 듣기 이해 (5문항)</h3>
              <p className="text-sm text-gray-600">간단한 지시사항 및 대화 이해</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="font-semibold text-gray-800">3. 상황 대응 (10문항)</h3>
              <p className="text-sm text-gray-600">업무 상황에서의 적절한 표현 선택</p>
            </div>
          </div>
        </div>
        
        {/* Info Alert */}
        <div className="w-full bg-green-50 border border-green-200 p-4 rounded-lg mb-10">
          <div className="font-bold text-green-800 mb-1">WorkFair의 한마디</div>
          <p className="text-sm text-green-700">
            답을 모르더라도 최선의 선택을 해보세요! 문제의 난이도가 실시간으로 조정됩니다.
          </p>
        </div>

        {/* Start Button */}
        <div className="w-full pb-8">
          <button
            onClick={onStartTest}
            className="w-full h-[52px] bg-mint-600 text-white rounded-[12px] text-[16px] 
                     font-semibold hover:bg-mint-700 transition-colors"
          >
            레벨 테스트 시작하기
          </button>
        </div>
      </div>
    </div>
  );
};
