interface StepIntroBottomSheetProps {
  open: boolean;
  onStart: () => void;
  onClose: () => void;
}

export function StepIntroBottomSheet({
  open,
  onStart,
  onClose,
}: StepIntroBottomSheetProps) {
  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/40"
        onClick={onClose}
      />
      <div className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-white px-6 pb-8 pt-6 shadow-xl max-w-[420px] left-1/2 transform -translate-x-1/2">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-[15px] text-gray-500">Step 1 / 프로필 기본 정보</p>
          <button
            type="button"
            onClick={onClose}
            className="text-[26px] text-gray-400"
          >
            ×
          </button>
        </div>
        <p className="mb-6 text-[15px] text-gray-700">
          나의 프로필 정보를 입력하고 더 많은 조건 맞춤 추천을 받아보세요.
        </p>
        <button
          type="button"
          onClick={onStart}
          className="h-12 w-full rounded-full bg-primary-mint text-[17px] font-semibold text-white"
        >
          시작
        </button>
      </div>
    </>
  );
}

