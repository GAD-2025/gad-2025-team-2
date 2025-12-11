import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Header } from '@/components/Header';
import { createStore, type StoreCreatePayload } from '@/api/endpoints';

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

const MANAGEMENT_ROLES = ['본사 관리자', '지점 관리자'];
const STORE_TYPES = ['직영점', '가맹점', '개인·독립 매장'];

declare global {
  interface Window {
    daum: any;
  }
}

export const StoreAdd = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [showAddressSearch, setShowAddressSearch] = useState(false);
  const [showIndustryDropdown, setShowIndustryDropdown] = useState(false);
  
  const [formData, setFormData] = useState({
    store_name: '',
    address: '',
    address_detail: '',
    phone: '',
    industry: '',
    industryCustom: '',
    business_license: null as File | null,
    management_role: '본사 관리자',
    store_type: '직영점',
  });

  const handleChange = (field: string, value: string | File | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

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

        handleChange('address', fullAddress);
        setShowAddressSearch(false);
      },
      onclose: function () {
        setShowAddressSearch(false);
      },
      width: '100%',
      height: '100%',
    }).open();
  };

  const handleIndustrySelect = (industry: string) => {
    if (industry === '기타') {
      handleChange('industry', '기타');
      handleChange('industryCustom', '');
    } else {
      handleChange('industry', industry);
      handleChange('industryCustom', '');
    }
    setShowIndustryDropdown(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    handleChange('business_license', file);
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.store_name.trim()) {
      toast.error('가게 이름을 입력해주세요');
      return;
    }
    if (!formData.address.trim()) {
      toast.error('가게 위치를 등록해주세요');
      return;
    }
    if (!formData.phone.trim()) {
      toast.error('전화번호를 입력해주세요');
      return;
    }
    const finalIndustry = formData.industry === '기타' ? formData.industryCustom : formData.industry;
    if (!finalIndustry.trim()) {
      toast.error('업직종을 선택해주세요');
      return;
    }

    try {
      setSubmitting(true);
      
      const userId = localStorage.getItem('signup_user_id');
      if (!userId) {
        toast.error('로그인이 필요합니다');
        navigate('/auth/signin');
        return;
      }

      // TODO: 사업자등록증 파일 업로드 처리
      const businessLicenseFileName = formData.business_license ? formData.business_license.name : null;

      const payload: StoreCreatePayload = {
        user_id: userId,
        store_name: formData.store_name,
        address: formData.address,
        address_detail: formData.address_detail,
        phone: formData.phone,
        industry: finalIndustry,
        business_license: businessLicenseFileName,
        management_role: formData.management_role,
        store_type: formData.store_type,
        is_main: false, // 새로 추가하는 매장은 대표가게가 아님
      };

      await createStore(payload);
      
      toast.success('매장이 등록되었습니다');
      navigate('/mypage');
    } catch (error) {
      console.error('매장 등록 실패:', error);
      toast.error('매장 등록에 실패했습니다');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header title="매장 추가 등록" showBack />

      <div className="p-4 space-y-5">
        {/* 관리 역할 및 매장 구조 */}
        <div className="bg-white rounded-[16px] p-5 shadow-card">
          <h3 className="text-[16px] font-bold text-text-900 mb-4">매장 정보</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-[14px] font-medium text-text-900 mb-2">
                관리 역할
              </label>
              <select
                value={formData.management_role}
                onChange={(e) => handleChange('management_role', e.target.value)}
                className="w-full h-[48px] px-4 bg-background rounded-[12px] border border-line-200
                         text-[14px] text-text-900 focus:outline-none focus:ring-2 focus:ring-mint-600"
              >
                {MANAGEMENT_ROLES.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[14px] font-medium text-text-900 mb-2">
                매장 구조
              </label>
              <select
                value={formData.store_type}
                onChange={(e) => handleChange('store_type', e.target.value)}
                className="w-full h-[48px] px-4 bg-background rounded-[12px] border border-line-200
                         text-[14px] text-text-900 focus:outline-none focus:ring-2 focus:ring-mint-600"
              >
                {STORE_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 기본 정보 */}
        <div className="bg-white rounded-[16px] p-5 shadow-card">
          <h3 className="text-[16px] font-bold text-text-900 mb-4">기본 정보</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-[14px] font-medium text-text-900 mb-2">
                가게 이름 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.store_name}
                onChange={(e) => handleChange('store_name', e.target.value)}
                placeholder="가게 이름을 입력하세요"
                className="w-full h-[48px] px-4 bg-background rounded-[12px] border border-line-200
                         text-[14px] text-text-900 placeholder:text-text-500
                         focus:outline-none focus:ring-2 focus:ring-mint-600"
              />
            </div>

            <div>
              <label className="block text-[14px] font-medium text-text-900 mb-2">
                업직종 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowIndustryDropdown(!showIndustryDropdown)}
                  className="w-full h-[48px] px-4 bg-background rounded-[12px] border border-line-200
                           text-[14px] text-left text-text-900 placeholder:text-text-500
                           focus:outline-none focus:ring-2 focus:ring-mint-600 flex items-center justify-between"
                >
                  <span className={formData.industry ? 'text-text-900' : 'text-text-500'}>
                    {formData.industry || '업직종을 선택하세요'}
                  </span>
                  <svg className="w-5 h-5 text-text-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {showIndustryDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-line-200 rounded-[12px] shadow-lg max-h-60 overflow-y-auto">
                    {INDUSTRY_OPTIONS.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => handleIndustrySelect(option)}
                        className="w-full px-4 py-3 text-left text-[14px] text-text-900 hover:bg-mint-50 transition-colors"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {formData.industry === '기타' && (
                <input
                  type="text"
                  value={formData.industryCustom}
                  onChange={(e) => handleChange('industryCustom', e.target.value)}
                  placeholder="업직종을 직접 입력하세요"
                  className="w-full h-[48px] px-4 bg-background rounded-[12px] border border-line-200 mt-2
                           text-[14px] text-text-900 placeholder:text-text-500
                           focus:outline-none focus:ring-2 focus:ring-mint-600"
                />
              )}
            </div>

            <div>
              <label className="block text-[14px] font-medium text-text-900 mb-2">
                가게 위치 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.address}
                  readOnly
                  onClick={handleAddressSearch}
                  placeholder="주소를 검색하세요"
                  className="w-full h-[48px] px-4 pr-12 bg-background rounded-[12px] border border-line-200
                           text-[14px] text-text-900 placeholder:text-text-500 cursor-pointer
                           focus:outline-none focus:ring-2 focus:ring-mint-600"
                />
                <button
                  type="button"
                  onClick={handleAddressSearch}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-500 hover:text-text-700"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
              {formData.address && (
                <input
                  type="text"
                  value={formData.address_detail}
                  onChange={(e) => handleChange('address_detail', e.target.value)}
                  placeholder="상세 주소를 입력하세요"
                  className="w-full h-[48px] px-4 bg-background rounded-[12px] border border-line-200 mt-2
                           text-[14px] text-text-900 placeholder:text-text-500
                           focus:outline-none focus:ring-2 focus:ring-mint-600"
                />
              )}
            </div>

            <div>
              <label className="block text-[14px] font-medium text-text-900 mb-2">
                전화번호 <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, '');
                  handleChange('phone', digits);
                }}
                placeholder="01012345678"
                maxLength={11}
                className="w-full h-[48px] px-4 bg-background rounded-[12px] border border-line-200
                         text-[14px] text-text-900 placeholder:text-text-500
                         focus:outline-none focus:ring-2 focus:ring-mint-600"
              />
            </div>

            <div>
              <label className="block text-[14px] font-medium text-text-900 mb-2">
                사업자 등록증
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="businessLicense"
              />
              <label
                htmlFor="businessLicense"
                className="flex items-center justify-center w-full h-[48px] px-4 bg-background rounded-[12px] border border-line-200
                         text-[14px] text-text-700 cursor-pointer hover:bg-mint-50 transition-colors"
              >
                {formData.business_license ? (
                  <span className="text-mint-600">{formData.business_license.name}</span>
                ) : (
                  <span className="text-text-500">사업자 등록증 사진을 첨부하세요</span>
                )}
              </label>
            </div>
          </div>
        </div>

        {/* 등록 버튼 */}
        <div className="bg-white rounded-[16px] p-5 shadow-card">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full h-[52px] bg-mint-600 text-white rounded-[12px] text-[16px] 
                     font-semibold hover:bg-mint-700 transition-colors disabled:opacity-50
                     active:scale-[0.98]"
          >
            {submitting ? '등록 중...' : '매장 등록하기'}
          </button>
        </div>
      </div>
    </div>
  );
};


