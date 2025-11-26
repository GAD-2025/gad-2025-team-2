import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Header } from '@/components/Header';

interface JobFormData {
  title: string;
  wage: string;
  workDays: string;
  workHours: string;
  workPeriod: string;
  industry: string;
  requiredLanguage: string;
  requiredVisa: string[];
  positions: string;
  deadline: string;
  employerMessage: string;
  preferredSkills: string;
}

export const JobCreate = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [employerProfileId, setEmployerProfileId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState<JobFormData>({
    title: '',
    wage: '',
    workDays: '',
    workHours: '',
    workPeriod: '',
    industry: '',
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
        const userId = localStorage.getItem('signup_user_id');
        if (!userId) {
          toast.error('고용주 정보를 찾을 수 없습니다');
          navigate('/signup');
          return;
        }

        // Fetch employer profile
        const response = await fetch(`http://localhost:8000/employer/profile/${userId}`);
        if (!response.ok) {
          throw new Error('프로필 정보를 가져올 수 없습니다');
        }

        const profile = await response.json();
        setEmployerProfileId(profile.id);
      } catch (error) {
        console.error('프로필 로드 실패:', error);
        toast.error('프로필 정보를 불러오는데 실패했습니다');
      } finally {
        setLoading(false);
      }
    };

    loadEmployerProfile();
  }, [navigate]);

  const languageOptions = ['제한없음', 'Lv.1 기초', 'Lv.2 초급', 'Lv.3 중급', 'Lv.4 상급'];
  const visaOptions = ['E-9', 'H-2', 'F-4', 'F-5', 'F-6', 'D-10'];

  const handleChange = (field: keyof JobFormData, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleVisa = (visa: string) => {
    setFormData(prev => ({
      ...prev,
      requiredVisa: prev.requiredVisa.includes(visa)
        ? prev.requiredVisa.filter(v => v !== visa)
        : [...prev.requiredVisa, visa]
    }));
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.title.trim()) {
      toast.error('공고 제목을 입력해주세요');
      return;
    }
    if (!formData.wage || parseFloat(formData.wage) <= 0) {
      toast.error('시급을 입력해주세요');
      return;
    }
    if (!formData.deadline) {
      toast.error('마감일을 선택해주세요');
      return;
    }
    if (!formData.industry.trim()) {
      toast.error('업직종을 입력해주세요');
      return;
    }

    try {
      setSubmitting(true);
      
      // Prepare job data
      const jobData = {
        employer_profile_id: employerProfileId,
        title: formData.title,
        description: formData.employerMessage || '자세한 내용은 문의 바랍니다.',
        category: formData.industry,
        wage: parseInt(formData.wage),
        work_days: formData.workDays || '협의',
        work_hours: formData.workHours || '협의',
        deadline: new Date(formData.deadline).toISOString(),
        positions: parseInt(formData.positions),
        required_language: formData.requiredLanguage,
        required_visa: formData.requiredVisa,
        benefits: formData.preferredSkills || null,
        employer_message: formData.employerMessage || null,
      };

      // API call to create job posting
      const response = await fetch('http://localhost:8000/jobs', {
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
      navigate('/employer/home');
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
        {/* Basic Info Section */}
        <div className="bg-white rounded-[16px] p-5 shadow-card">
          <h3 className="text-[16px] font-bold text-text-900 mb-4">기본 정보</h3>
          
          <div className="space-y-4">
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

            <div>
              <label className="block text-[14px] font-medium text-text-900 mb-2">
                업직종 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.industry}
                onChange={(e) => handleChange('industry', e.target.value)}
                placeholder="예: 카페/커피전문점"
                className="w-full h-[48px] px-4 bg-background rounded-[12px] border border-line-200
                         text-[14px] text-text-900 placeholder:text-text-500
                         focus:outline-none focus:ring-2 focus:ring-mint-600"
              />
            </div>
          </div>
        </div>

        {/* Work Conditions Section */}
        <div className="bg-white rounded-[16px] p-5 shadow-card">
          <h3 className="text-[16px] font-bold text-text-900 mb-4">근무 조건</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-[14px] font-medium text-text-900 mb-2">
                시급 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={formData.wage}
                  onChange={(e) => handleChange('wage', e.target.value)}
                  placeholder="10000"
                  className="w-full h-[48px] pl-4 pr-12 bg-background rounded-[12px] border border-line-200
                           text-[14px] text-text-900 placeholder:text-text-500
                           focus:outline-none focus:ring-2 focus:ring-mint-600"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[14px] text-text-700">
                  원
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[14px] font-medium text-text-900 mb-2">
                  근무 요일
                </label>
                <input
                  type="text"
                  value={formData.workDays}
                  onChange={(e) => handleChange('workDays', e.target.value)}
                  placeholder="주 2일"
                  className="w-full h-[48px] px-4 bg-background rounded-[12px] border border-line-200
                           text-[14px] text-text-900 placeholder:text-text-500
                           focus:outline-none focus:ring-2 focus:ring-mint-600"
                />
              </div>

              <div>
                <label className="block text-[14px] font-medium text-text-900 mb-2">
                  근무 시간
                </label>
                <input
                  type="text"
                  value={formData.workHours}
                  onChange={(e) => handleChange('workHours', e.target.value)}
                  placeholder="6시간"
                  className="w-full h-[48px] px-4 bg-background rounded-[12px] border border-line-200
                           text-[14px] text-text-900 placeholder:text-text-500
                           focus:outline-none focus:ring-2 focus:ring-mint-600"
                />
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
              <label className="block text-[14px] font-medium text-text-900 mb-2">
                근무 가능 비자 (복수 선택)
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
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-line-200 p-4">
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full h-[52px] bg-mint-600 text-white rounded-[12px] text-[16px] 
                   font-semibold hover:bg-mint-700 transition-colors disabled:opacity-50"
        >
          {submitting ? '등록 중...' : '공고 등록하기'}
        </button>
      </div>
    </div>
  );
};

