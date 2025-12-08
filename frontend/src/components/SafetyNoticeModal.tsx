interface SafetyNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SafetyNoticeModal = ({ isOpen, onClose }: SafetyNoticeModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl p-6 max-w-md mx-4 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
        >
          ×
        </button>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">안전 공지</h2>
          <p className="text-sm text-gray-500">구직자를 위한 안전 가이드</p>
        </div>

        <div className="space-y-4 mb-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">⚠️ 주의사항</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• 면접 시 신분증을 제출하지 마세요</li>
              <li>• 금전 요구가 있다면 즉시 신고하세요</li>
              <li>• 계약서를 반드시 확인하세요</li>
              <li>• 의심스러운 제안은 거절하세요</li>
            </ul>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">✅ 안전한 구직활동</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• 공개된 장소에서 면접을 진행하세요</li>
              <li>• 근로계약서를 작성하세요</li>
              <li>• 의심스러운 점은 문의하세요</li>
              <li>• 개인정보를 신중히 관리하세요</li>
            </ul>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
        >
          확인했습니다
        </button>
      </div>
    </div>
  );
};


