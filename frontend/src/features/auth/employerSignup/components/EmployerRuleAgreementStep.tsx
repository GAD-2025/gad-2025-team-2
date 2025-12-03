interface EmployerRuleAgreementStepProps {
  onPrev: () => void;
  onAgreeRules: () => void;
  isSubmitting: boolean;
  error?: string | null;
}

export function EmployerRuleAgreementStep({
  onPrev,
  onAgreeRules,
  isSubmitting,
  error,
}: EmployerRuleAgreementStepProps) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[420px] flex-col bg-white px-4 pb-10 pt-8">
      <header className="mb-6 flex items-center gap-2">
        <button type="button" onClick={onPrev} className="text-lg text-gray-700">
          ←
        </button>
        <span className="flex-1 text-center text-base font-semibold text-gray-900">
          규정 동의
        </span>
        <div className="w-6" /> {/* 뒤로가기와 균형 맞추기 */}
      </header>

      {/* 상단 아이콘 */}
      <div className="mb-6 flex justify-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50">
          <span className="text-4xl">🛡️</span>
        </div>
      </div>

      {/* 제목 (빨간색 강조) */}
      <h1 className="mb-4 text-center text-xl font-semibold text-red-600">
        잠깐! 불건전 이용자는 신고 및 영구정지됩니다
      </h1>

      {/* 본문 안내 */}
      <div className="mb-6 space-y-3 text-sm leading-relaxed text-gray-700">
        <p>
          워크페어는 불법행위에 대해 수사 기관에 적극 협조하고 있습니다.
        </p>
        <p className="text-xs text-gray-600">
          유흥업소, 유흥주점, 불건전 마사지, 토킹바, 대화카페, 인터넷 방송, 신체노출모델, 다단계,
          선투자 부업, 금전 거래, 구매대행, 기본 급여가 없는 등의 공고를 올리거나 타 대화 채널로
          유도하는 경우 경고 없이 이용 제한합니다.
        </p>
      </div>

      {/* 규정 리스트 */}
      <div className="mb-6 space-y-3">
        <button
          type="button"
          className="flex w-full items-center justify-between rounded-2xl border border-gray-200 bg-white px-4 py-4 text-left transition hover:bg-gray-50"
        >
          <span className="text-sm font-medium text-gray-900">공고 등록 제한 규정</span>
          <span className="text-gray-400">→</span>
        </button>
        <button
          type="button"
          className="flex w-full items-center justify-between rounded-2xl border border-gray-200 bg-white px-4 py-4 text-left transition hover:bg-gray-50"
        >
          <span className="text-sm font-medium text-gray-900">계정 이용 정지 규정</span>
          <span className="text-gray-400">→</span>
        </button>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* 하단 버튼 */}
      <div className="mt-auto pt-10">
        <button
          type="button"
          onClick={onAgreeRules}
          disabled={isSubmitting}
          className={`h-12 w-full rounded-full text-base font-semibold text-white transition ${
            isSubmitting
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700'
          }`}
        >
          {isSubmitting ? '처리 중...' : '규정에 동의합니다'}
        </button>
      </div>
    </div>
  );
}



