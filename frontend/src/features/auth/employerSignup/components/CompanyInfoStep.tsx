import { useState } from 'react';

declare global {
  interface Window {
    daum: any;
  }
}

const INDUSTRY_OPTIONS = [
  '외식업',
  '매장관리',
  '서비스',
  '사무직',
  '고객상담',
  '영업',
  '생산',
  'IT',
  '디자인',
  '미디어',
  '배달',
  '운전',
  '병원',
  '교육',
  '기타',
];

interface CompanyInfoStepProps {
  companyName: string;
  baseAddress: string;
  detailAddress: string;
  hasNoDetailAddress: boolean;
  phone: string;
  industry: string;
  onChangeCompanyName: (name: string) => void;
  onChangeBaseAddress: (address: string) => void;
  onChangeDetailAddress: (address: string) => void;
  onChangePhone: (phone: string) => void;
  onChangeIndustry: (industry: string) => void;
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
  phone,
  industry,
  onChangeCompanyName,
  onChangeBaseAddress,
  onChangeDetailAddress,
  onChangePhone,
  onChangeIndustry,
  onToggleNoDetailAddress,
  onSubmit,
  onPrev,
  isSubmitting,
  error,
}: CompanyInfoStepProps) {
  const [showIndustryDropdown, setShowIndustryDropdown] = useState(false);

  const canProceed =
    companyName.trim().length > 0 &&
    baseAddress.trim() !== '' &&
    phone.trim() !== '' &&
    industry.trim() !== '' &&
    (hasNoDetailAddress || detailAddress.trim() !== '');

  const handleIndustrySelect = (selectedIndustry: string) => {
    onChangeIndustry(selectedIndustry);
    setShowIndustryDropdown(false);
  };

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

        {/* 전화번호 입력 */}
        <div>
          <label htmlFor="phone" className="mb-2 block text-sm font-medium text-gray-900">
            가게 전화번호 <span className="text-red-500">*</span>
          </label>
          <input
            id="phone"
            type="tel"
            value={phone || ''}
            onChange={(e) => {
              // 숫자만 허용하고 하이픈 자동 추가
              const value = e.target.value.replace(/[^0-9]/g, '');
              let formatted = value;
              if (value.length > 3 && value.length <= 7) {
                formatted = `${value.slice(0, 3)}-${value.slice(3)}`;
              } else if (value.length > 7) {
                formatted = `${value.slice(0, 3)}-${value.slice(3, 7)}-${value.slice(7, 11)}`;
              }
              onChangePhone(formatted);
            }}
            placeholder="010-1234-5678"
            maxLength={13}
            className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-base transition focus:border-emerald-500 focus:outline-none"
          />
          <p className="mt-1 text-xs text-gray-500">
            가게 연락 가능한 전화번호를 입력해주세요
          </p>
        </div>

        {/* 업직종 선택 */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-900">
            업직종 <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowIndustryDropdown(!showIndustryDropdown)}
              className="w-full h-12 px-4 bg-white rounded-2xl border border-gray-200
                       text-base text-left text-gray-900 placeholder:text-gray-500
                       focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500
                       flex items-center justify-between transition"
            >
              <span className={industry ? 'text-gray-900' : 'text-gray-500'}>
                {industry || '업직종을 선택하세요'}
              </span>
              <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showIndustryDropdown && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-2xl shadow-lg max-h-60 overflow-y-auto">
                {INDUSTRY_OPTIONS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleIndustrySelect(option)}
                    className="w-full px-4 py-3 text-left text-base text-gray-900 hover:bg-emerald-50 transition-colors"
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
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


