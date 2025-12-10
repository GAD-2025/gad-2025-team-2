import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Header } from '@/components/Header';
import { getStores, getStore, type StoreData } from '@/api/endpoints';
import InfoPopover from '@/components/InfoPopover';

interface JobFormData {
  title: string;
  shopName: string;
  shopAddress: string;
  shopAddressDetail: string;
  shopPhone: string;
  businessLicense: File | null;
  wageType: 'hourly' | 'weekly' | 'monthly';
  wage: string;
  workDays: string[];
  workHours: string;
  workStartTime: string;
  workEndTime: string;
  workHoursNegotiable: boolean;
  workPeriod: string;
  industry: string;
  industryCustom: string;
  requiredLanguage: string;
  requiredVisa: string[];
  positions: string;
  deadline: string;
  employerMessage: string;
  preferredSkills: string;
}

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

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAYS_KOREAN = ['월', '화', '수', '목', '금', '토', '일'];

const generateTimeOptions = () => {
  const options = [];
  for (let i = 1; i <= 24; i++) {
    options.push(`${i.toString().padStart(2, '0')}:00`);
  }
  return options;
};

export const JobCreate = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [employerProfileId, setEmployerProfileId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [stores, setStores] = useState<StoreData[]>([]);
  const [selectedStore, setSelectedStore] = useState<StoreData | null>(null);
  const [showAddressSearch, setShowAddressSearch] = useState(false);
  const [showIndustryDropdown, setShowIndustryDropdown] = useState(false);
  
  const [formData, setFormData] = useState<JobFormData>({
    title: '',
    shopName: '',
    shopAddress: '',
    shopAddressDetail: '',
    shopPhone: '',
    businessLicense: null,
    wageType: 'hourly',
    wage: '10320',
    workDays: [],
    workHours: '',
    workStartTime: '09:00',
    workEndTime: '18:00',
    workHoursNegotiable: false,
    workPeriod: '',
    industry: '',
    industryCustom: '',
    requiredLanguage: 'Lv.2 초급',
    requiredVisa: [],
    positions: '1',
    deadline: '',
    employerMessage: '',
    preferredSkills: '',
  });

  // Load employer profile on mount
  useEffect(() => {
    const loadEmployerProfile = async () => {
      try {
        // Get signup user ID from localStorage (stored during signup)
        let userId = localStorage.getItem('signup_user_id');
        
        // For testing: use test employer if no user_id found
        if (!userId) {
          console.warn('No user_id in localStorage, using test employer');
          userId = 'employer-test-001'; // Test data
          localStorage.setItem('signup_user_id', userId);
        }

        // Fetch employer profile
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
        const response = await fetch(`${API_BASE_URL}/employer/profile/${userId}`);
        if (!response.ok) {
          if (response.status === 404) {
            // 프로필이 없으면 공고 등록 불가 - 사용자에게 안내
            console.warn('고용주 프로필을 찾을 수 없습니다.');
            toast.error('고용주 프로필이 없습니다. 먼저 프로필을 생성해주세요.');
            // 홈으로 리다이렉트하거나 프로필 생성 페이지로 이동
            setTimeout(() => {
              navigate('/employer/home');
            }, 2000);
            return;
          } else {
            console.error('프로필 정보를 가져오는데 실패했습니다');
            toast.error('프로필 정보를 불러올 수 없습니다.');
            setTimeout(() => {
              navigate('/employer/home');
            }, 2000);
            return;
          }
        }

        const profile = await response.json();
        setEmployerProfileId(profile.id);
        console.log('Loaded employer profile:', profile);

        // 매장 목록 가져오기
        try {
          const storesData = await getStores(userId);
          setStores(storesData);
          // 대표가게가 있으면 자동 선택
          const mainStore = storesData.find(s => s.is_main);
          if (mainStore) {
            setSelectedStore(mainStore);
            // 매장 정보를 폼에 자동 입력
            setFormData(prev => ({
              ...prev,
              shopName: mainStore.store_name,
              shopAddress: mainStore.address,
              shopAddressDetail: mainStore.address_detail || '',
              shopPhone: mainStore.phone,
              industry: mainStore.industry,
            }));
          }
        } catch (error) {
          console.error('매장 목록 로드 실패:', error);
        }
      } catch (error) {
        console.error('프로필 로드 실패:', error);
        toast.error('프로필을 불러오는 중 오류가 발생했습니다.');
        setTimeout(() => {
          navigate('/employer/home');
        }, 2000);
      } finally {
        setLoading(false);
      }
    };

    loadEmployerProfile();
  }, [navigate]);

  const languageOptions = ['제한없음', 'Lv.1 기초', 'Lv.2 초급', 'Lv.3 중급', 'Lv.4 상급'];
  const visaOptions = ['E-9', 'H-2', 'F-4', 'F-5', 'F-6', 'D-10'];
  const timeOptions = generateTimeOptions();

  const handleChange = (field: keyof JobFormData, value: string | string[] | boolean | File | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleStoreSelect = async (store: StoreData) => {
    setSelectedStore(store);
    // 매장 정보를 폼에 자동 입력 (수정 불가)
    setFormData(prev => ({
      ...prev,
      shopName: store.store_name,
      shopAddress: store.address,
      shopAddressDetail: store.address_detail || '',
      shopPhone: store.phone,
      industry: store.industry,
    }));
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

        handleChange('shopAddress', fullAddress);
        setShowAddressSearch(false);
      },
      onclose: function () {
        setShowAddressSearch(false);
      },
      width: '100%',
      height: '100%',
    }).open();
  };

  const toggleDay = (day: string) => {
    setFormData(prev => ({
      ...prev,
      workDays: prev.workDays.includes(day)
        ? prev.workDays.filter(d => d !== day)
        : [...prev.workDays, day]
    }));
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

  const toggleVisa = (visa: string) => {
    setFormData(prev => ({
      ...prev,
      requiredVisa: prev.requiredVisa.includes(visa)
        ? prev.requiredVisa.filter(v => v !== visa)
        : [...prev.requiredVisa, visa]
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    handleChange('businessLicense', file);
  };

  const handleSubmit = async (isDraft = false) => {
    // Validation
    if (!selectedStore) {
      toast.error('매장을 선택해주세요');
      return;
    }
    if (!formData.title.trim()) {
      toast.error('공고 제목을 입력해주세요');
      return;
    }
    if (!formData.wage || parseFloat(formData.wage) <= 0) {
      const wageTypeLabel = formData.wageType === 'hourly' ? '시급' : formData.wageType === 'weekly' ? '주급' : '월급';
      toast.error(`${wageTypeLabel}을 입력해주세요`);
      return;
    }
    // 최저시급 검증 (시급인 경우만)
    if (formData.wageType === 'hourly') {
      const wageAmount = parseFloat(formData.wage);
      if (wageAmount < 10320) {
        toast.error('시급은 최저시급(10,320원) 이상이어야 합니다');
        return;
      }
    }
    if (!formData.deadline) {
      toast.error('마감일을 선택해주세요');
      return;
    }
    const finalIndustry = formData.industry === '기타' ? formData.industryCustom : formData.industry;
    if (!finalIndustry.trim()) {
      toast.error('업직종을 선택해주세요');
      return;
    }

    try {
      setSubmitting(true);
      
      // Prepare job data
      const finalIndustry = formData.industry === '기타' ? formData.industryCustom : formData.industry;
      const workDaysStr = formData.workDays.length > 0 
        ? formData.workDays.map(d => DAYS_KOREAN[DAYS_OF_WEEK.indexOf(d)]).join(', ')
        : '협의';
      const workHoursStr = formData.workHoursNegotiable
        ? '협의'
        : `${formData.workStartTime} ~ ${formData.workEndTime}`;

      // 매장 정보가 없으면 에러
      if (!selectedStore) {
        toast.error('매장을 선택해주세요');
        return;
      }

      const jobData = {
        employer_profile_id: employerProfileId,
        title: formData.title,
        shop_name: selectedStore.store_name,
        shop_address: selectedStore.address,
        shop_address_detail: selectedStore.address_detail || '',
        shop_phone: selectedStore.phone,
        location: selectedStore.address, // location 필드에도 주소 설정
        description: formData.employerMessage || '자세한 내용은 문의 바랍니다.',
        category: finalIndustry,
        wage: parseInt(formData.wage),
        wage_type: formData.wageType, // 시급/주급/월급 타입 추가
        work_days: workDaysStr,
        work_hours: workHoursStr,
        deadline: new Date(formData.deadline).toISOString(),
        positions: parseInt(formData.positions),
        required_language: formData.requiredLanguage,
        required_visa: formData.requiredVisa,
        benefits: formData.preferredSkills || null,
        employer_message: formData.employerMessage || null,
      };

      if (isDraft) {
        // TODO: Implement draft save functionality
        toast.success('임시저장되었습니다');
        navigate('/job-management');
        return;
      }

      // API call to create job posting
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
      const response = await fetch(`${API_BASE_URL}/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jobData),
      });

      if (!response.ok) {
        throw new Error('공고 등록에 실패했습니다');
      }

      const result = await response.json();
      console.log('공고 등록 성공:', result);
      
      toast.success('공고가 등록되었습니다');
      navigate('/job-management');
    } catch (error) {
      console.error('공고 등록 실패:', error);
      toast.error('공고 등록에 실패했습니다');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-mint border-t-transparent"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header title="새 공고 등록" showBack />

      <div className="p-4 space-y-5">
        {/* 매장 선택 Section */}
        <div className="bg-white rounded-[16px] p-5 shadow-card">
          <h3 className="text-[16px] font-bold text-text-900 mb-4">기본 정보</h3>
          
          {!selectedStore ? (
            <div className="space-y-3">
              <p className="text-[14px] text-text-700 mb-4">공고를 등록할 매장을 선택해주세요</p>
              {stores.length > 0 ? (
                stores.map((store) => (
                  <button
                    key={store.id}
                    type="button"
                    onClick={() => handleStoreSelect(store)}
                    className="w-full p-4 bg-background rounded-[12px] border-2 border-line-200 hover:border-mint-600 transition-all text-left"
                  >
                    {store.is_main && (
                      <span className="inline-block px-2 py-1 mb-2 bg-mint-100 text-mint-700 text-[11px] font-semibold rounded-[6px]">
                        기본매장
                      </span>
                    )}
                    <h4 className="text-[15px] font-semibold text-text-900 mb-1">{store.store_name}</h4>
                    <p className="text-[13px] text-text-700 mb-1">{store.address}</p>
                    <p className="text-[13px] text-text-500">{store.industry}</p>
                  </button>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-[14px] text-text-500 mb-4">등록된 매장이 없습니다</p>
                  <button
                    type="button"
                    onClick={() => navigate('/employer/store-add')}
                    className="px-4 py-2 bg-mint-600 text-white rounded-[12px] text-[14px] font-semibold"
                  >
                    매장 추가하기
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* 선택된 매장 정보 표시 (수정 불가) */}
              <div className="p-4 bg-mint-50 rounded-[12px] border border-mint-200">
                {selectedStore.is_main && (
                  <span className="inline-block px-2 py-1 mb-2 bg-mint-600 text-white text-[11px] font-semibold rounded-[6px]">
                    기본매장
                  </span>
                )}
                <h4 className="text-[15px] font-semibold text-text-900 mb-2">{selectedStore.store_name}</h4>
                <div className="space-y-1 text-[13px] text-text-700">
                  <p>위치: {selectedStore.address} {selectedStore.address_detail || ''}</p>
                  <p>전화번호: {selectedStore.phone}</p>
                  <p>업종: {selectedStore.industry}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedStore(null)}
                  className="mt-3 text-[12px] text-mint-600 hover:text-mint-700"
                >
                  다른 매장 선택하기
                </button>
              </div>

              {/* 공고 제목 */}
              <div>
                <label className="block text-[14px] font-medium text-text-900 mb-2">
                  공고 제목 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="예: 카페 바리스타 구합니다"
                  className="w-full h-[48px] px-4 bg-background rounded-[12px] border border-line-200
                           text-[14px] text-text-900 placeholder:text-text-500
                           focus:outline-none focus:ring-2 focus:ring-mint-600"
                />
              </div>
            </div>
          )}
        </div>

        {/* Work Conditions Section */}
        <div className="bg-white rounded-[16px] p-5 shadow-card">
          <h3 className="text-[16px] font-bold text-text-900 mb-4">근무 조건</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-[14px] font-medium text-text-900 mb-2">
                급여 <span className="text-red-500">*</span>
              </label>
              
              {/* 급여 타입 선택 버튼 */}
              <div className="flex gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => {
                    handleChange('wageType', 'hourly');
                    if (formData.wageType !== 'hourly' && (!formData.wage || parseFloat(formData.wage) < 10320)) {
                      handleChange('wage', '10320');
                    }
                  }}
                  className={`flex-1 px-4 py-2 rounded-[12px] text-[14px] font-medium transition-colors ${
                    formData.wageType === 'hourly'
                      ? 'bg-mint-600 text-white border-2 border-mint-600'
                      : 'bg-white text-text-700 border-2 border-gray-300 hover:border-mint-400'
                  }`}
                >
                  시급
                </button>
                <button
                  type="button"
                  onClick={() => handleChange('wageType', 'weekly')}
                  className={`flex-1 px-4 py-2 rounded-[12px] text-[14px] font-medium transition-colors ${
                    formData.wageType === 'weekly'
                      ? 'bg-mint-600 text-white border-2 border-mint-600'
                      : 'bg-white text-text-700 border-2 border-gray-300 hover:border-mint-400'
                  }`}
                >
                  주급
                </button>
                <button
                  type="button"
                  onClick={() => handleChange('wageType', 'monthly')}
                  className={`flex-1 px-4 py-2 rounded-[12px] text-[14px] font-medium transition-colors ${
                    formData.wageType === 'monthly'
                      ? 'bg-mint-600 text-white border-2 border-mint-600'
                      : 'bg-white text-text-700 border-2 border-gray-300 hover:border-mint-400'
                  }`}
                >
                  월급
                </button>
              </div>

              {/* 급여 입력 필드 */}
              <div className="relative">
                <input
                  type="number"
                  value={formData.wage}
                  onChange={(e) => handleChange('wage', e.target.value)}
                  placeholder={formData.wageType === 'hourly' ? '10320' : formData.wageType === 'weekly' ? '500000' : '2000000'}
                  className="w-full h-[48px] pl-4 pr-12 bg-background rounded-[12px] border border-line-200
                           text-[14px] text-text-900 placeholder:text-text-500
                           focus:outline-none focus:ring-2 focus:ring-mint-600"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[14px] text-text-700">
                  원
                </span>
              </div>
              
              {/* 최저시급 경고 (시급인 경우만) */}
              {formData.wageType === 'hourly' && formData.wage && parseFloat(formData.wage) < 10320 && (
                <p className="mt-1 text-[12px] text-red-500">최저시급(10,320원) 이상이어야 합니다</p>
              )}
            </div>

            <div>
              <label className="block text-[14px] font-medium text-text-900 mb-2">
                근무 요일 (복수 선택 가능)
              </label>
              <div className="flex gap-2 flex-wrap">
                {DAYS_OF_WEEK.map((day, index) => {
                  const isSelected = formData.workDays.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(day)}
                      className={`px-4 py-2 rounded-[12px] text-[14px] font-medium transition-colors ${
                        isSelected
                          ? 'bg-mint-600 text-white border-2 border-mint-600'
                          : 'bg-white text-text-700 border-2 border-gray-300 hover:border-mint-400'
                      }`}
                    >
                      {DAYS_KOREAN[index]}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-[14px] font-medium text-text-900 mb-2">
                근무 시간
              </label>
              <div className="flex items-center gap-2">
                <select
                  value={formData.workStartTime}
                  onChange={(e) => handleChange('workStartTime', e.target.value)}
                  disabled={formData.workHoursNegotiable}
                  className="flex-1 h-[48px] px-4 bg-background rounded-[12px] border border-line-200
                           text-[14px] text-text-900 focus:outline-none focus:ring-2 focus:ring-mint-600
                           disabled:bg-gray-100 disabled:text-gray-400"
                >
                  {timeOptions.map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
                <span className="text-text-700">~</span>
                <select
                  value={formData.workEndTime}
                  onChange={(e) => handleChange('workEndTime', e.target.value)}
                  disabled={formData.workHoursNegotiable}
                  className="flex-1 h-[48px] px-4 bg-background rounded-[12px] border border-line-200
                           text-[14px] text-text-900 focus:outline-none focus:ring-2 focus:ring-mint-600
                           disabled:bg-gray-100 disabled:text-gray-400"
                >
                  {timeOptions.map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>
              <div className="mt-2 flex items-center">
                <input
                  type="checkbox"
                  id="workHoursNegotiable"
                  checked={formData.workHoursNegotiable}
                  onChange={(e) => handleChange('workHoursNegotiable', e.target.checked)}
                  className="h-5 w-5 rounded border-gray-300 text-mint-600 focus:ring-mint-600"
                />
                <label htmlFor="workHoursNegotiable" className="ml-2 text-[14px] text-text-700">
                  시간 협의
                </label>
              </div>
            </div>

            <div>
              <label className="block text-[14px] font-medium text-text-900 mb-2">
                근무 기간
              </label>
              <input
                type="text"
                value={formData.workPeriod}
                onChange={(e) => handleChange('workPeriod', e.target.value)}
                placeholder="예: 3개월 이상"
                className="w-full h-[48px] px-4 bg-background rounded-[12px] border border-line-200
                         text-[14px] text-text-900 placeholder:text-text-500
                         focus:outline-none focus:ring-2 focus:ring-mint-600"
              />
            </div>
          </div>
        </div>

        {/* Requirements Section */}
        <div className="bg-white rounded-[16px] p-5 shadow-card">
          <h3 className="text-[16px] font-bold text-text-900 mb-4">지원 조건</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-[14px] font-medium text-text-900 mb-2">
                언어 능력
              </label>
              <select
                value={formData.requiredLanguage}
                onChange={(e) => handleChange('requiredLanguage', e.target.value)}
                className="w-full h-[48px] px-4 bg-background rounded-[12px] border border-line-200
                         text-[14px] text-text-900 focus:outline-none focus:ring-2 focus:ring-mint-600"
              >
                {languageOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="flex items-center text-[14px] font-medium text-text-900 mb-2">
                <span>근무 가능 비자 (복수 선택)</span>
                {/* Info popover next to label */}
                <InfoPopover content={(
                  <div>
                    <p className="font-bold mb-2">근무 가능 비자 안내</p>
                    <div className="text-[13px] text-text-700">
                      <p className="font-semibold">E-9 — 비전문취업</p>
                      <ul className="list-inside list-disc pl-3 mb-2">
                        <li>제조, 건설, 농축산업 등 가능</li>
                        <li>일부 서비스업 가능</li>
                        <li>사무직 불가</li>
                      </ul>

                      <p className="font-semibold">H-2 — 방문취업</p>
                      <ul className="list-inside list-disc pl-3 mb-2">
                        <li>대부분의 서비스업 근무 가능</li>
                        <li>음식점, 카페, 편의점 등 가능</li>
                        <li>사무직 일부 가능</li>
                      </ul>

                      <p className="font-semibold">F-4 — 재외동포</p>
                      <ul className="list-inside list-disc pl-3 mb-2">
                        <li>근로 제한 없음</li>
                        <li>내국인과 동일하게 근무 가능</li>
                      </ul>

                      <p className="font-semibold">F-5 — 영주권</p>
                      <p className="mb-2">· 근로 제한 없음</p>

                      <p className="font-semibold">F-6 — 결혼이민</p>
                      <p className="mb-2">· 근로 제한 없음</p>

                      <p className="font-semibold">D-10 — 구직비자</p>
                      <ul className="list-inside list-disc pl-3">
                        <li>근로 불가</li>
                        <li>인턴/연수만 가능</li>
                      </ul>
                    </div>
                  </div>
                )} />
              </label>
              <div className="flex flex-wrap gap-2">
                {visaOptions.map(visa => (
                  <button
                    key={visa}
                    type="button"
                    onClick={() => toggleVisa(visa)}
                    className={`px-4 py-2 rounded-full text-[13px] font-medium transition-colors ${
                      formData.requiredVisa.includes(visa)
                        ? 'bg-mint-600 text-white'
                        : 'bg-background border border-line-200 text-text-700 hover:border-mint-600'
                    }`}
                  >
                    {visa}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[14px] font-medium text-text-900 mb-2">
                우대사항
              </label>
              <input
                type="text"
                value={formData.preferredSkills}
                onChange={(e) => handleChange('preferredSkills', e.target.value)}
                placeholder="예: 인근 거주 우대, 영어 가능자 우대"
                className="w-full h-[48px] px-4 bg-background rounded-[12px] border border-line-200
                         text-[14px] text-text-900 placeholder:text-text-500
                         focus:outline-none focus:ring-2 focus:ring-mint-600"
              />
            </div>
          </div>
        </div>

        {/* Recruitment Info Section */}
        <div className="bg-white rounded-[16px] p-5 shadow-card">
          <h3 className="text-[16px] font-bold text-text-900 mb-4">모집 정보</h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[14px] font-medium text-text-900 mb-2">
                  모집 인원
                </label>
                <input
                  type="number"
                  value={formData.positions}
                  onChange={(e) => handleChange('positions', e.target.value)}
                  placeholder="1"
                  min="1"
                  className="w-full h-[48px] px-4 bg-background rounded-[12px] border border-line-200
                           text-[14px] text-text-900 placeholder:text-text-500
                           focus:outline-none focus:ring-2 focus:ring-mint-600"
                />
              </div>

              <div>
                <label className="block text-[14px] font-medium text-text-900 mb-2">
                  마감일 <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => handleChange('deadline', e.target.value)}
                  className="w-full h-[48px] px-4 bg-background rounded-[12px] border border-line-200
                           text-[14px] text-text-900 focus:outline-none focus:ring-2 focus:ring-mint-600"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Employer Message Section */}
        <div className="bg-white rounded-[16px] p-5 shadow-card">
          <h3 className="text-[16px] font-bold text-text-900 mb-4">사장님의 한마디</h3>
          
          <textarea
            value={formData.employerMessage}
            onChange={(e) => handleChange('employerMessage', e.target.value)}
            placeholder="지원자들에게 전하고 싶은 메시지를 작성해주세요"
            rows={4}
            className="w-full px-4 py-3 bg-background rounded-[12px] border border-line-200
                     text-[14px] text-text-900 placeholder:text-text-500 resize-none
                     focus:outline-none focus:ring-2 focus:ring-mint-600"
          />
        </div>

        {/* Button Section - placed at the end of scrollable content */}
        <div className="bg-white rounded-[16px] p-5 shadow-card mb-6">
          <div className="flex gap-3">
            {/* 임시저장하기 버튼 - 회색 */}
            <button
              onClick={() => handleSubmit(true)}
              disabled={submitting}
              className="flex-1 h-[52px] bg-gray-200 text-gray-700 rounded-[12px] text-[16px] 
                       font-semibold hover:bg-gray-300 transition-colors disabled:opacity-50
                       active:scale-[0.98]"
            >
              임시저장하기
            </button>

            {/* 공고등록하기 버튼 - 민트색 */}
            <button
              onClick={() => handleSubmit(false)}
              disabled={submitting}
              className="flex-1 h-[52px] bg-mint-600 text-white rounded-[12px] text-[16px] 
                       font-semibold hover:bg-mint-700 transition-colors disabled:opacity-50
                       active:scale-[0.98]"
            >
              {submitting ? '등록 중...' : '공고등록하기'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

