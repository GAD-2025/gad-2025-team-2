interface EmployerTermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAgree: () => void;
}

export function EmployerTermsModal({ isOpen, onClose, onAgree }: EmployerTermsModalProps) {
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
        <h2 className="mb-4 text-center text-[22px] font-bold text-red-500">
          잠깐 ! 불법 사업자는 신고 및 활동 영구정지 됩니다 !
        </h2>

        {/* 내용 */}
        <div className="mb-6 rounded-xl bg-gray-50 p-4">
          <p className="text-center text-[14px] leading-relaxed text-gray-700">
            워크페어 는 불법행위에 대해
          </p>
          <p className="text-center text-[14px] leading-relaxed text-gray-700">
            수사 기관에 적극 협조하고 있습니다
          </p>
        </div>

        <p className="mb-6 text-center text-[13px] leading-relaxed text-gray-600">
          유흥업소, 유흥주점, 불건전 마사지, 인터넷 방송, 신체노출모델, 금전 거래, 구매대행, 기본 급여가 없는 등의 공고를 올리거나 타 대화 채널로 유도하는 경우 경고 없이 이용 제한합니다.
        </p>

        {/* 버튼 영역 */}
        <button
          onClick={onAgree}
          className="w-full rounded-xl bg-primary-mint py-3.5 text-[16px] font-semibold text-white transition-colors hover:bg-primary-mint/90"
        >
          규정에 동의합니다
        </button>
      </div>
    </div>
  );
}
