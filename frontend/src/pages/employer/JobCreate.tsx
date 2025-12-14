import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Header } from '@/components/Header';

interface JobFormData {
  title: string;
  shopName: string;
  shopAddress: string;
  shopAddressDetail: string;
  shopPhone: string;
  businessLicense: File | null;
  wageType: 'hourly' | 'weekly' | 'monthly';
  wage: string;
  wageCalculationType: 'auto' | 'manual'; // 자동계산 또는 직접입력
  hourlyWage: string; // 자동계산용 시급
  daysPerWeek: number; // 자동계산용 주일수 (1~7)
  workHoursPerDay: number; // 자동계산용 근무시간 (1~24)
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
  description: string;
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
  const [showAddressSearch, setShowAddressSearch] = useState(false);
  const [showIndustryDropdown, setShowIndustryDropdown] = useState(false);
  
  const [formData, setFormData] = useState<JobFormData>({
    title: '',
    shopName: '',
    shopAddress: '',
    shopAddressDetail: '',
    shopPhone: '',
    businessLicense: null,
<<<<<<< HEAD
    wageType: 'hourly',
    wage: '10320',
    wageCalculationType: 'manual',
    hourlyWage: '10320',
    daysPerWeek: 5,
    workHoursPerDay: 8,
=======
    wage: '',
>>>>>>> e7a5e19 (WIP: save local changes before pulling origin/main)
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
    description: '', // employerMessage를 description으로 변경
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
        const response = await fetch(`http://localhost:8000/employer/profile/${userId}`);
        if (!response.ok) {
          if (response.status === 404) {
            toast.error('고용주 프로필을 찾을 수 없습니다. 테스트 데이터를 실행해주세요.');
          } else {
            toast.error('프로필 정보를 가져오는데 실패했습니다');
          }
          throw new Error('프로필 정보를 가져올 수 없습니다');
        }

        const profile = await response.json();
        setEmployerProfileId(profile.id);
        console.log('Loaded employer profile:', profile);
<<<<<<< HEAD

        // 매장 목록 가져오기
        try {
          const storesData = await getStores(userId);
          // 기본가게가 가장 위로 오도록 정렬 (백엔드에서 이미 정렬되지만, 프론트엔드에서도 확인)
          const sortedStores = [...storesData].sort((a, b) => {
            if (a.is_main && !b.is_main) return -1;
            if (!a.is_main && b.is_main) return 1;
            return 0;
          });
          setStores(sortedStores);
          // 대표가게가 있으면 자동 선택
          const mainStore = sortedStores.find(s => s.is_main);
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
=======
>>>>>>> e7a5e19 (WIP: save local changes before pulling origin/main)
      } catch (error) {
        console.error('프로필 로드 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    loadEmployerProfile();
  }, [navigate]);

  const languageOptions = ['제한없음', 'Lv.1 기초', 'Lv.2 초급', 'Lv.3 중급', 'Lv.4 상급'];
  const visaOptions = ['E-9', 'H-2', 'F-4', 'F-5', 'F-6', 'D-10'];
  const timeOptions = generateTimeOptions();

  const handleChange = (field: keyof JobFormData, value: string | string[] | boolean | File | null | number) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // 자동계산 모드이고 주급/월급인 경우 자동으로 계산
      if (updated.wageCalculationType === 'auto' && (updated.wageType === 'weekly' || updated.wageType === 'monthly')) {
        if (field === 'hourlyWage' || field === 'daysPerWeek' || field === 'workHoursPerDay') {
          const hourlyWage = parseFloat(updated.hourlyWage) || 0;
          const daysPerWeek = updated.daysPerWeek || 0;
          const workHoursPerDay = updated.workHoursPerDay || 0;
          
          if (updated.wageType === 'weekly') {
            // 주급 = 시급 × 주일수 × 근무시간
            updated.wage = Math.round(hourlyWage * daysPerWeek * workHoursPerDay).toString();
          } else if (updated.wageType === 'monthly') {
            // 월급 = 시급 × 주일수 × 근무시간 × 4주
            updated.wage = Math.round(hourlyWage * daysPerWeek * workHoursPerDay * 4).toString();
          }
        }
      }
      
      return updated;
    });
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
    // 최저시급 검증
    if (formData.wageType === 'hourly') {
      // 시급인 경우: 직접 입력한 시급 검증
      const wageAmount = parseFloat(formData.wage);
      if (wageAmount < 10320) {
        toast.error('시급은 최저시급(10,320원) 이상이어야 합니다');
        return;
      }
    } else if (formData.wageCalculationType === 'auto') {
      // 주급/월급 자동계산인 경우: 자동계산에 사용된 시급 검증
      const hourlyWageAmount = parseFloat(formData.hourlyWage);
      if (hourlyWageAmount < 10320) {
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
        store_id: selectedStore.id, // 매장 ID 추가
        location: selectedStore.address, // location 필드에도 주소 설정
        description: formData.description || '자세한 내용은 문의 바랍니다.',
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
      };

      // 디버깅: 선택한 매장 정보 확인
      console.log('=== 공고 등록 데이터 ===');
      console.log('선택한 매장:', selectedStore);
      console.log('전송할 jobData:', jobData);
      console.log('shop_name:', jobData.shop_name);
      console.log('shop_address:', jobData.shop_address);
      console.log('store_id:', jobData.store_id);

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
        const errorData = await response.json().catch(() => ({ detail: '알 수 없는 오류가 발생했습니다' }));
        console.error('공고 등록 실패 응답:', errorData);
        throw new Error(errorData.detail || '공고 등록에 실패했습니다');
      }

      const result = await response.json();
      console.log('공고 등록 성공:', result);
      
      toast.success('공고가 등록되었습니다');
      navigate('/job-management');
    } catch (error: any) {
      console.error('공고 등록 실패:', error);
      const errorMessage = error.message || '공고 등록에 실패했습니다';
      toast.error(errorMessage);
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
                    className="relative w-full bg-white rounded-[12px] border border-line-200 p-4 hover:border-mint-600 transition-all text-left"
                  >
                    {/* 기본 매장 태그 - 오른쪽 상단 */}
                    {store.is_main && (
                      <span className="absolute top-4 right-4 px-2.5 py-1 bg-emerald-100 text-emerald-700 text-[11px] font-semibold rounded-full">
                        기본가게
                      </span>
                    )}
                    {/* 가게 이름 - 위에 표시 */}
                    <h4 className="text-[16px] font-bold text-text-900 mb-2 pr-20">
                      {store.store_name}
                    </h4>
                    {/* 가게 위치 - 아래에 표시 */}
                    <p className="text-[13px] text-text-700">
                      {store.address}
                      {store.address_detail && ` ${store.address_detail}`}
                    </p>
                  </button>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-[14px] text-text-500 mb-4">등록된 매장이 없습니다</p>
                  <p className="text-[12px] text-text-400">마이페이지에서 매장을 먼저 등록해주세요</p>
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
                  className="mt-3 w-full px-4 py-2.5 bg-white border-2 border-mint-600 text-mint-600 rounded-[12px] text-[14px] font-medium hover:bg-mint-50 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
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
                    handleChange('wageCalculationType', 'manual');
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
                  onClick={() => {
                    setFormData(prev => {
                      const updated = { ...prev, wageType: 'weekly', wageCalculationType: 'auto' };
                      // 자동계산 초기값으로 계산
                      const hourlyWage = parseFloat(updated.hourlyWage) || 0;
                      const daysPerWeek = updated.daysPerWeek || 0;
                      const workHoursPerDay = updated.workHoursPerDay || 0;
                      updated.wage = Math.round(hourlyWage * daysPerWeek * workHoursPerDay).toString();
                      return updated;
                    });
                  }}
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
                  onClick={() => {
                    setFormData(prev => {
                      const updated = { ...prev, wageType: 'monthly', wageCalculationType: 'auto' };
                      // 자동계산 초기값으로 계산 (4주 기준)
                      const hourlyWage = parseFloat(updated.hourlyWage) || 0;
                      const daysPerWeek = updated.daysPerWeek || 0;
                      const workHoursPerDay = updated.workHoursPerDay || 0;
                      updated.wage = Math.round(hourlyWage * daysPerWeek * workHoursPerDay * 4).toString();
                      return updated;
                    });
                  }}
                  className={`flex-1 px-4 py-2 rounded-[12px] text-[14px] font-medium transition-colors ${
                    formData.wageType === 'monthly'
                      ? 'bg-mint-600 text-white border-2 border-mint-600'
                      : 'bg-white text-text-700 border-2 border-gray-300 hover:border-mint-400'
                  }`}
                >
                  월급
                </button>
              </div>

              {/* 주급/월급인 경우 자동계산/직접입력 선택 */}
              {(formData.wageType === 'weekly' || formData.wageType === 'monthly') && (
                <div className="mb-3">
                  <label className="block text-[13px] font-medium text-text-700 mb-2">
                    계산 방식
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleChange('wageCalculationType', 'auto')}
                      className={`flex-1 px-3 py-2 rounded-lg text-[13px] font-medium transition-all ${
                        formData.wageCalculationType === 'auto'
                          ? 'bg-blue-50 text-blue-600 border-2 border-blue-400 shadow-sm'
                          : 'bg-gray-50 text-gray-600 border-2 border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="flex items-center justify-center gap-1.5">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        자동계산
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleChange('wageCalculationType', 'manual')}
                      className={`flex-1 px-3 py-2 rounded-lg text-[13px] font-medium transition-all ${
                        formData.wageCalculationType === 'manual'
                          ? 'bg-blue-50 text-blue-600 border-2 border-blue-400 shadow-sm'
                          : 'bg-gray-50 text-gray-600 border-2 border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="flex items-center justify-center gap-1.5">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        직접 입력
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {/* 자동계산 모드 (주급/월급) */}
              {(formData.wageType === 'weekly' || formData.wageType === 'monthly') && formData.wageCalculationType === 'auto' && (
                <div className="space-y-3 mb-3">
                  {/* 시급 입력 */}
                  <div>
                    <label className="block text-[13px] font-medium text-text-700 mb-1.5">
                      시급
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={formData.hourlyWage}
                        onChange={(e) => handleChange('hourlyWage', e.target.value)}
                        placeholder="10320"
                        className="w-full h-[44px] pl-4 pr-12 bg-background rounded-[12px] border border-line-200
                                 text-[14px] text-text-900 placeholder:text-text-500
                                 focus:outline-none focus:ring-2 focus:ring-mint-600"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[14px] text-text-700">
                        원
                      </span>
                    </div>
                    {/* 최저시급 경고 (주급/월급 자동계산 시) */}
                    {formData.hourlyWage && parseFloat(formData.hourlyWage) < 10320 && (
                      <p className="mt-1 text-[12px] text-red-500">최저시급(10,320원) 이상이어야 합니다</p>
                    )}
                  </div>

                  {/* 주일수 드롭다운 */}
                  <div>
                    <label className="block text-[13px] font-medium text-text-700 mb-1.5">
                      주
                    </label>
                    <div className="relative">
                      <select
                        value={formData.daysPerWeek}
                        onChange={(e) => handleChange('daysPerWeek', parseInt(e.target.value))}
                        className="w-full h-[44px] pl-4 pr-10 bg-background rounded-[12px] border border-line-200
                                 text-[14px] text-text-900
                                 focus:outline-none focus:ring-2 focus:ring-mint-600 appearance-none cursor-pointer"
                      >
                        {Array.from({ length: 7 }, (_, i) => i + 1).map((day) => (
                          <option key={day} value={day}>
                            {day}일
                          </option>
                        ))}
                      </select>
                      <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-500 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  {/* 근무시간 드롭다운 */}
                  <div>
                    <label className="block text-[13px] font-medium text-text-700 mb-1.5">
                      근무시간
                    </label>
                    <div className="relative">
                      <select
                        value={formData.workHoursPerDay}
                        onChange={(e) => handleChange('workHoursPerDay', parseInt(e.target.value))}
                        className="w-full h-[44px] pl-4 pr-10 bg-background rounded-[12px] border border-line-200
                                 text-[14px] text-text-900
                                 focus:outline-none focus:ring-2 focus:ring-mint-600 appearance-none cursor-pointer"
                      >
                        {Array.from({ length: 24 }, (_, i) => i + 1).map((hour) => (
                          <option key={hour} value={hour}>
                            {hour}시간
                          </option>
                        ))}
                      </select>
                      <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-500 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  {/* 최종 급여 표시 */}
                  <div className="bg-mint-50 border border-mint-200 rounded-[12px] p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] font-medium text-text-700">
                        최종 {formData.wageType === 'weekly' ? '주급' : '월급'}
                      </span>
                      <span className="text-[16px] font-semibold text-mint-600">
                        {parseInt(formData.wage || '0').toLocaleString()}원
                      </span>
                    </div>
                    {formData.wageType === 'monthly' && (
                      <p className="mt-1.5 text-[11px] text-text-500">
                        4주 기준 급여입니다
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* 직접 입력 모드 또는 시급 */}
              {(formData.wageType === 'hourly' || formData.wageCalculationType === 'manual') && (
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
              )}
              
              {/* 최저시급 경고 (시급 직접 입력인 경우만) */}
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

        {/* Job Description Section */}
        <div className="bg-white rounded-[16px] p-5 shadow-card">
          <h3 className="text-[16px] font-bold text-text-900 mb-4">공고설명</h3>
          
          <textarea
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="공고에 대한 상세 설명을 작성해주세요"
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

