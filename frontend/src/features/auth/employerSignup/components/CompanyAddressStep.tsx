interface CompanyAddressStepProps {
  baseAddress: string;
  detailAddress: string;
  hasNoDetailAddress: boolean;
  onChangeBaseAddress: (address: string) => void;
  onChangeDetailAddress: (address: string) => void;
  onToggleNoDetailAddress: () => void;
  onSubmit: () => void;
  onPrev: () => void;
  isSubmitting: boolean;
  error?: string | null;
}

export function CompanyAddressStep({
  baseAddress,
  detailAddress,
  hasNoDetailAddress,
  onChangeBaseAddress,
  onChangeDetailAddress,
  onToggleNoDetailAddress,
  onSubmit,
  onPrev,
  isSubmitting,
  error,
}: CompanyAddressStepProps) {
  const canProceed =
    baseAddress.trim() !== '' &&
    (hasNoDetailAddress || detailAddress.trim() !== '');

  const handleSubmit = () => {
    if (canProceed && !isSubmitting) {
      onSubmit();
    }
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[420px] flex-col bg-white px-4 pb-10 pt-8">
      <header className="mb-6 flex items-center gap-2">
        <button type="button" onClick={onPrev} className="text-lg text-gray-700">
          ←
        </button>
        <span className="flex-1 text-center text-base font-semibold text-gray-900">
          주소
        </span>
        <div className="w-6" /> {/* 뒤로가기와 균형 맞추기 */}
      </header>

      <div className="mb-6 space-y-5">
        {/* 기본 주소 */}
        <div>
          <label htmlFor="base-address" className="mb-2 block text-sm font-medium text-gray-900">
            주소 *
          </label>
          <input
            id="base-address"
            type="text"
            value={baseAddress}
            onChange={(e) => onChangeBaseAddress(e.target.value)}
            placeholder="예) 서울시 중구 세종대로 110"
            className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-base transition focus:border-emerald-500 focus:outline-none"
          />
        </div>

        {/* 상세 주소 */}
        <div>
          <label
            htmlFor="detail-address"
            className="mb-2 block text-sm font-medium text-gray-900"
          >
            상세 주소 *
          </label>
          <input
            id="detail-address"
            type="text"
            value={detailAddress}
            onChange={(e) => onChangeDetailAddress(e.target.value)}
            placeholder="상세 주소를 입력해 주세요"
            disabled={hasNoDetailAddress}
            className={`w-full rounded-2xl border border-gray-200 px-4 py-3 text-base transition focus:border-emerald-500 focus:outline-none ${
              hasNoDetailAddress ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''
            }`}
          />
        </div>

        {/* 상세주소 없음 체크박스 */}
        <div className="flex items-center gap-2">
          <input
            id="no-detail-address"
            type="checkbox"
            checked={hasNoDetailAddress}
            onChange={onToggleNoDetailAddress}
            className="h-5 w-5 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500"
          />
          <label
            htmlFor="no-detail-address"
            className="text-sm font-medium text-gray-900 cursor-pointer"
          >
            상세주소 없음
          </label>
        </div>
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
          onClick={handleSubmit}
          disabled={!canProceed || isSubmitting}
          className={`h-12 w-full rounded-full text-base font-semibold text-white transition ${
            canProceed && !isSubmitting
              ? 'bg-emerald-500 hover:bg-emerald-600'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {isSubmitting ? '처리 중...' : '주소 입력하기'}
        </button>
      </div>
    </div>
  );
}



