interface ApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyWithBasicResume: () => void;
  onEditResumeAndApply: () => void;
}

export const ApplyModal = ({
  isOpen,
  onClose,
  onApplyWithBasicResume,
  onEditResumeAndApply,
}: ApplyModalProps) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/40 z-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[24px] z-50 shadow-2xl animate-slide-up">
        <div className="p-6">
          {/* Handle bar */}
          <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-6" />
          
          {/* Title */}
          <h2 className="text-[20px] font-bold text-text-900 mb-6">지원하기</h2>
          
          {/* Options */}
          <div className="space-y-3">
            {/* 기본 이력서로 지원하기 */}
            <button
              onClick={onApplyWithBasicResume}
              className="w-full h-[60px] bg-mint-600 text-white rounded-[16px] 
                       flex items-center gap-3 px-4 hover:bg-mint-700 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-[16px] font-semibold">기본 이력서로 지원하기</span>
            </button>
            
            {/* 이력서 수정하고 제출하기 */}
            <button
              onClick={onEditResumeAndApply}
              className="w-full h-[60px] bg-white border-2 border-gray-200 text-text-900 
                       rounded-[16px] flex items-center gap-3 px-4 hover:bg-gray-50 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span className="text-[16px] font-semibold">이력서 수정하고 제출하기</span>
            </button>
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

