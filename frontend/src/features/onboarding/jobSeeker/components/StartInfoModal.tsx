interface StartInfoModalProps {
  open: boolean;
  onClose: (goToSettings: boolean) => void;
}

export function StartInfoModal({ open, onClose }: StartInfoModalProps) {
  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/40"
        onClick={() => onClose(false)}
      />
      <div className="fixed inset-x-0 top-1/2 z-50 mx-4 -translate-y-1/2 rounded-2xl bg-white px-6 py-6 shadow-xl max-w-[420px] left-1/2 transform -translate-x-1/2">
        <h2 className="mb-3 text-[20px] font-semibold text-gray-900">
          알려드려요
        </h2>
        <p className="mb-6 text-[15px] text-gray-600">
          앱에 대한 접근 권한을 허용해 주세요.
          <br />
          앱 사용 시 권한을 수정할 수 있어요.
        </p>
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => onClose(true)}
            className="h-12 w-full rounded-full bg-primary-mint text-[17px] font-semibold text-white"
          >
            설정으로 이동하기
          </button>
          <button
            type="button"
            onClick={() => onClose(false)}
            className="h-12 w-full rounded-full border border-gray-200 bg-white text-[17px] font-semibold text-gray-700"
          >
            다음에 할게요
          </button>
        </div>
      </div>
    </>
  );
}

