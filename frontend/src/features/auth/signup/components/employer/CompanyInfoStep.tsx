import { useState } from 'react';
import { EmployerSignupData } from '../../hooks/useEmployerSignupWizard';

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
  formData: EmployerSignupData;
  updateFormData: (updates: Partial<EmployerSignupData>) => void;
}

declare global {
  interface Window {
    daum: any;
  }
}

export function CompanyInfoStep({ formData, updateFormData }: CompanyInfoStepProps) {
  const [showAddressSearch, setShowAddressSearch] = useState(false);
  const [showIndustryDropdown, setShowIndustryDropdown] = useState(false);

  const handleAddressSearch = () => {
    setShowAddressSearch(true);
    
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

        updateFormData({ address: fullAddress });
        setShowAddressSearch(false);
      },
      onclose: function () {
        setShowAddressSearch(false);
      },
      width: '100%',
      height: '100%',
    }).open();
  };

  return (
    <div className="mx-auto flex h-full w-full max-w-[420px] flex-col bg-white px-6 pt-4 pb-32">
      <h1 className="mb-3 text-[26px] font-bold text-gray-900">
        회사 정보를 입력해 주세요
      </h1>

      <div className="flex-1 space-y-6">
        {/* 회사 이름 입력 */}
        <div>
          <label className="mb-2 flex items-center text-[15px] font-medium text-gray-700">
            회사 이름 <span className="ml-1 text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.companyName}
            onChange={(e) => updateFormData({ companyName: e.target.value })}
            placeholder="회사 이름을 입력해 주세요"
            maxLength={30}
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-[17px] text-gray-900 placeholder-gray-400 focus:border-primary-mint focus:outline-none focus:ring-1 focus:ring-primary-mint"
          />
          <p className="mt-1.5 text-[13px] text-gray-500">
            {formData.companyName.length}/30
          </p>
        </div>

        {/* 주소 입력 */}
        <div>
          <label className="mb-2 flex items-center text-[15px] font-medium text-gray-700">
            주소 <span className="ml-1 text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={formData.address}
              readOnly
              onClick={handleAddressSearch}
              placeholder="(예) 판교역로 166, 분당 주공, 백현동 532"
              className="w-full cursor-pointer rounded-xl border border-gray-300 bg-white px-4 py-3.5 pr-12 text-[17px] text-gray-900 placeholder-gray-400 focus:border-primary-mint focus:outline-none focus:ring-1 focus:ring-primary-mint"
            />
            <button
              type="button"
              onClick={handleAddressSearch}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </div>

        {/* 상세주소 입력 */}
        {formData.address && (
          <div>
            <label className="mb-2 flex items-center text-[15px] font-medium text-gray-700">
              상세 주소 <span className="ml-1 text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.addressDetail}
              onChange={(e) => updateFormData({ addressDetail: e.target.value })}
              placeholder="상세 주소를 입력하세요"
              disabled={formData.noDetailAddress}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-[17px] text-gray-900 placeholder-gray-400 focus:border-primary-mint focus:outline-none focus:ring-1 focus:ring-primary-mint disabled:bg-gray-50 disabled:text-gray-400"
            />
            
            {/* 상세주소 없음 체크박스 */}
            <div className="mt-3 flex items-center">
              <input
                type="checkbox"
                id="noDetailAddress"
                checked={formData.noDetailAddress}
                onChange={(e) => {
                  const checked = e.target.checked;
                  updateFormData({
                    noDetailAddress: checked,
                    addressDetail: checked ? '' : formData.addressDetail,
                  });
                }}
                className="h-5 w-5 rounded border-gray-300 text-primary-mint focus:ring-primary-mint"
              />
              <label htmlFor="noDetailAddress" className="ml-2 text-[15px] text-gray-700">
                상세주소 없음
              </label>
            </div>
          </div>
        )}

        {/* 가게 전화번호 입력 */}
        <div>
          <label className="mb-2 flex items-center text-[15px] font-medium text-gray-700">
            가게 전화번호 <span className="ml-1 text-red-500">*</span>
          </label>
          <input
            type="tel"
            value={formData.phone || ''}
            onChange={(e) => {
              // 숫자만 허용하고 하이픈 자동 추가
              const value = e.target.value.replace(/[^0-9]/g, '');
              let formatted = value;
              if (value.length > 3 && value.length <= 7) {
                formatted = `${value.slice(0, 3)}-${value.slice(3)}`;
              } else if (value.length > 7) {
                formatted = `${value.slice(0, 3)}-${value.slice(3, 7)}-${value.slice(7, 11)}`;
              }
              updateFormData({ phone: formatted });
            }}
            placeholder="010-1234-5678"
            maxLength={13}
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-[17px] text-gray-900 placeholder-gray-400 focus:border-primary-mint focus:outline-none focus:ring-1 focus:ring-primary-mint"
          />
          <p className="mt-1.5 text-[13px] text-gray-500">
            가게 연락 가능한 전화번호를 입력해주세요
          </p>
        </div>

        {/* 업직종 선택 */}
        <div>
          <label className="mb-2 flex items-center text-[15px] font-medium text-gray-700">
            업직종 <span className="ml-1 text-red-500">*</span>
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowIndustryDropdown(!showIndustryDropdown)}
              className="w-full h-[48px] px-4 bg-white rounded-xl border border-gray-300
                       text-[17px] text-left text-gray-900 placeholder:text-gray-500
                       focus:outline-none focus:ring-1 focus:ring-primary-mint focus:border-primary-mint
                       flex items-center justify-between transition"
            >
              <span className={formData.industry ? 'text-gray-900' : 'text-gray-500'}>
                {formData.industry || '업직종을 선택하세요'}
              </span>
              <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showIndustryDropdown && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                {INDUSTRY_OPTIONS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      updateFormData({ industry: option });
                      setShowIndustryDropdown(false);
                    }}
                    className="w-full px-4 py-3 text-left text-[15px] text-gray-900 hover:bg-mint-50 transition-colors"
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


