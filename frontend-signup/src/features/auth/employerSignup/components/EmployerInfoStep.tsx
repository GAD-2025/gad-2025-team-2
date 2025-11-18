interface EmployerInfoStepProps {
  name: string;
  email: string;
  onNameChange: (name: string) => void;
  onEmailChange: (email: string) => void;
  onNext: () => void;
  onPrev: () => void;
  canProceed: boolean;
  error?: string | null;
}

const LABEL_CLASS = 'text-sm font-medium text-gray-900';
const INPUT_CLASS =
  'mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-base transition focus:border-emerald-500 focus:outline-none';

// 간단한 이메일 형식 검증
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export function EmployerInfoStep({
  name,
  email,
  onNameChange,
  onEmailChange,
  onNext,
  onPrev,
  canProceed,
  error,
}: EmployerInfoStepProps) {
  const nameError = name.trim() === '' ? null : null;
  const emailError =
    email.trim() !== '' && !isValidEmail(email) ? '올바른 이메일 형식을 입력해주세요.' : null;

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[420px] flex-col bg-white px-4 pb-10 pt-8">
      <header className="mb-6 flex items-center gap-2">
        <button type="button" onClick={onPrev} className="text-lg text-gray-700">
          ←
        </button>
        <span className="flex-1 text-center text-base font-semibold text-gray-900">
          고용주 가입
        </span>
        <div className="w-6" /> {/* 뒤로가기와 균형 맞추기 */}
      </header>

      <h1 className="mb-6 text-xl font-semibold text-gray-900">정보를 입력해 주세요</h1>

      <div className="space-y-5">
        {/* 이름 입력 */}
        <div>
          <label className={LABEL_CLASS} htmlFor="employer-name">
            이름 *
          </label>
          <input
            id="employer-name"
            type="text"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="입력하세요"
            className={INPUT_CLASS}
          />
          {nameError && <p className="mt-1 text-xs text-red-500">{nameError}</p>}
        </div>

        {/* 이메일 입력 */}
        <div>
          <label className={LABEL_CLASS} htmlFor="employer-email">
            이메일 *
          </label>
          <input
            id="employer-email"
            type="email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            placeholder="입력하세요"
            className={INPUT_CLASS}
          />
          {emailError && <p className="mt-1 text-xs text-red-500">{emailError}</p>}
        </div>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="mt-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* 하단 버튼 */}
      <div className="mt-auto pt-10">
        <button
          type="button"
          onClick={onNext}
          disabled={!canProceed}
          className={`h-12 w-full rounded-full text-base font-semibold text-white transition ${
            canProceed
              ? 'bg-emerald-500 hover:bg-emerald-600'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          다음
        </button>
      </div>
    </div>
  );
}
