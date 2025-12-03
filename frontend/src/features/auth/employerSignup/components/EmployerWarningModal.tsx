interface EmployerWarningModalProps {
  open: boolean;
  onConfirmGoRules: () => void;
  onSkip: () => void;
}

export function EmployerWarningModal({
  open,
  onConfirmGoRules,
  onSkip,
}: EmployerWarningModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white px-6 py-6 shadow-xl">
        {/* 제목 */}
        <h2 className="mb-4 text-center text-lg font-semibold text-gray-900">
          알려드려요
        </h2>

        {/* 본문 */}
        <div className="mb-6 text-sm leading-relaxed text-gray-600">
          <p>
            알림에 대한 접근 권한을 허용해 주세요. 앱 설정으로 가서 권한을 수정할 수 있어요.
          </p>
        </div>

        {/* 버튼 영역 */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={onConfirmGoRules}
            className="h-12 w-full rounded-full bg-emerald-500 text-base font-semibold text-white transition hover:bg-emerald-600 active:bg-emerald-700"
          >
            설정으로 이동하기
          </button>
          <button
            type="button"
            onClick={onSkip}
            className="h-12 w-full rounded-full border border-gray-200 bg-white text-base font-semibold text-gray-700 transition hover:bg-gray-50 active:bg-gray-100"
          >
            다음에 할게요
          </button>
        </div>
      </div>
    </div>
  );
}



