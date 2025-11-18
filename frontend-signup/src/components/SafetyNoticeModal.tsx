'use client';

import { useRouter } from 'next/navigation';

interface SafetyNoticeModalProps {
  onClose: () => void;
  onNeverShowAgain: () => void;
}

export function SafetyNoticeModal({
  onClose,
  onNeverShowAgain,
}: SafetyNoticeModalProps) {
  const router = useRouter();

  const handleCheckNotice = () => {
    // 공지사항 페이지로 이동 (나중에 구현)
    console.log('공지사항 확인하기 클릭');
    // TODO: router.push('/notice') 또는 '/safe-jobs-notice'
    // 일단 모달만 닫기
    onClose();
  };

  const handleNeverShowAgain = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('hideSafetyNotice', 'true');
    }
    onNeverShowAgain();
  };

  // 오버레이 클릭 시 모달 닫기
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4"
      onClick={handleOverlayClick}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white px-6 py-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 아이콘 영역 */}
        <div className="mb-4 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
            <span className="text-3xl">🛡️</span>
          </div>
        </div>

        {/* 제목 */}
        <h2 className="mb-4 text-center text-lg font-semibold text-gray-900">
          안전한 일자리 이용 안내
        </h2>

        {/* 본문 */}
        <div className="mb-6 space-y-2 text-sm leading-relaxed text-gray-600">
          <p>
            최근 과열된 구직시장으로 인해 높은 급여를 미끼로 한 사기/불법 광고가
            증가하고 있습니다.
          </p>
          <p>
            워크페어는 이러한 위험으로부터 이용자를 보호하기 위해 공지사항을
            안내드리고 있습니다.
          </p>
          <p>
            믿을 수 있는 일자리만 만나보세요.
          </p>
        </div>

        {/* 버튼 영역 */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleCheckNotice}
            className="h-12 w-full rounded-full bg-emerald-500 text-base font-semibold text-white transition hover:bg-emerald-600 active:bg-emerald-700"
          >
            공지사항 확인하기
          </button>
          <button
            type="button"
            onClick={handleNeverShowAgain}
            className="w-full text-sm text-gray-500 transition hover:text-gray-700 active:text-gray-800"
          >
            다시 보지 않기
          </button>
        </div>
      </div>
    </div>
  );
}

