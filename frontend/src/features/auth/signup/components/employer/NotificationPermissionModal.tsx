interface NotificationPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoToSettings: () => void;
}

export function NotificationPermissionModal({ 
  isOpen, 
  onClose, 
  onGoToSettings 
}: NotificationPermissionModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        {/* 아이콘 */}
        <div className="mb-4 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-mint/10">
            <svg className="h-10 w-10 text-primary-mint" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
        </div>

        {/* 제목 */}
        <h2 className="mb-4 text-center text-[22px] font-bold text-gray-900">
          알려드려요
        </h2>

        {/* 내용 */}
        <div className="mb-6 rounded-xl bg-gray-50 p-4">
          <p className="text-center text-[14px] leading-relaxed text-gray-700">
            알림에 대한 접근 권한을 허용해 주세요. 앱 설정으로 가서 권한을 수정할 수 있어요.
          </p>
        </div>

        {/* 버튼 영역 */}
        <div className="space-y-3">
          <button
            onClick={onGoToSettings}
            className="w-full rounded-xl bg-primary-mint py-3.5 text-[16px] font-semibold text-white transition-colors hover:bg-primary-mint/90"
          >
            설정으로 이동하기
          </button>
          <button
            onClick={onClose}
            className="w-full rounded-xl bg-gray-100 py-3.5 text-[16px] font-medium text-gray-700 transition-colors hover:bg-gray-200"
          >
            다음에 할게요
          </button>
        </div>
      </div>
    </div>
  );
}

