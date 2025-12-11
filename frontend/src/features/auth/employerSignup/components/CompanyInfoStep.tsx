declare global {
  interface Window {
    daum: any;
  }
}

interface CompanyInfoStepProps {
  companyName: string;
  baseAddress: string;
  detailAddress: string;
  hasNoDetailAddress: boolean;
  onChangeCompanyName: (name: string) => void;
  onChangeBaseAddress: (address: string) => void;
  onChangeDetailAddress: (address: string) => void;
  onToggleNoDetailAddress: () => void;
  onSubmit: () => void;
  onPrev: () => void;
  isSubmitting: boolean;
  error?: string | null;
}

const MAX_COMPANY_NAME_LENGTH = 40;

export function CompanyInfoStep({
  companyName,
  baseAddress,
  detailAddress,
  hasNoDetailAddress,
  onChangeCompanyName,
  onChangeBaseAddress,
  onChangeDetailAddress,
  onToggleNoDetailAddress,
  onSubmit,
  onPrev,
  isSubmitting,
  error,
}: CompanyInfoStepProps) {
  const canProceed =
    companyName.trim().length > 0 &&
    baseAddress.trim() !== '' &&
    (hasNoDetailAddress || detailAddress.trim() !== '');

  const handleCompanyNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= MAX_COMPANY_NAME_LENGTH) {
      onChangeCompanyName(value);
    }
  };

  const handleAddressSearch = () => {
    if (!window.daum) {
      const script = document.createElement('script');
      script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
      script.onload = () => {
        openAddressSearch();
      };
      document.head.appendChild(script);
    } else {
      openAddressSearch();
    }
  };

  const openAddressSearch = () => {
    new window.daum.Postcode({
      oncomplete: function (data: any) {
        let fullAddress = data.address;
        let extraAddress = '';

        if (data.addressType === 'R') {
          if (data.bname !== '') {
            extraAddress += data.bname;
          }
          if (data.buildingName !== '') {
            extraAddress += extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName;
          }
          fullAddress += extraAddress !== '' ? ` (${extraAddress})` : '';
        }

        onChangeBaseAddress(fullAddress);
      },
      width: '100%',
      height: '100%',
    }).open();
  };

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
          회사 추가
        </span>
        <div className="w-6" /> {/* 뒤로가기와 균형 맞추기 */}
      </header>

      <h1 className="mb-6 text-xl font-semibold text-gray-900">
        회사 정보를 입력해 주세요
      </h1>

      <div className="mb-6 space-y-5">
        {/* 회사 이름 */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label htmlFor="company-name" className="text-sm font-medium text-gray-900">
              회사 이름 *
            </label>
            <span className="text-xs text-gray-500">
              {companyName.length}/{MAX_COMPANY_NAME_LENGTH}
            </span>
          </div>
          <input
            id="company-name"
            type="text"
            value={companyName}
            onChange={handleCompanyNameChange}
            placeholder="회사 이름을 입력해 주세요"
            className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-base transition focus:border-emerald-500 focus:outline-none"
            maxLength={MAX_COMPANY_NAME_LENGTH}
          />
        </div>

        {/* 기본 주소 */}
        <div>
          <label htmlFor="base-address" className="mb-2 block text-sm font-medium text-gray-900">
            주소 *
          </label>
          <div className="relative">
            <input
              id="base-address"
              type="text"
              value={baseAddress}
              readOnly
              onClick={handleAddressSearch}
              placeholder="주소를 검색하세요"
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 pr-12 text-base transition focus:border-emerald-500 focus:outline-none cursor-pointer"
            />
            <button
              type="button"
              onClick={handleAddressSearch}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
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
          {isSubmitting ? '처리 중...' : '완료'}
        </button>
      </div>
    </div>
  );
}


