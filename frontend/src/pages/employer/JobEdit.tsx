import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Header } from '@/components/Header';
import InfoPopover from '@/components/InfoPopover';
import { jobsAPI } from '@/api/endpoints';

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

export const JobEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [employerProfileId, setEmployerProfileId] = useState<string>('');
  
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

  // Load existing job data
  useEffect(() => {
    const loadJobData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        
        // Load job data
        const jobRes = await jobsAPI.get(id);
        const job = jobRes.data;
        
        // Fill form with existing data
        setFormData({
          title: job.title || '',
          wage: job.wage?.toString() || '',
          workDays: job.workDays || '',
          workHours: job.workHours || '',
          workPeriod: '',
          industry: job.category || '',
          requiredLanguage: job.requiredLanguage || 'Lv.2 초급',
          requiredVisa: job.requiredVisa || [],
          positions: job.positions?.toString() || '1',
          deadline: job.deadline ? job.deadline.split('T')[0] : '',
          employerMessage: job.employerMessage || '',
          preferredSkills: job.benefits || '',
        });

        // Get employer profile ID
        const userId = localStorage.getItem('signup_user_id');
        if (userId) {
          const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
          const response = await fetch(`${API_BASE_URL}/employer/profile/${userId}`);
          if (response.ok) {
            const profile = await response.json();
            setEmployerProfileId(profile.id);
          }
        }
      } catch (error) {
        console.error('공고 로딩 실패:', error);
        toast.error('공고를 불러오는데 실패했습니다');
        navigate('/job-management');
      } finally {
        setLoading(false);
      }
    };

    loadJobData();
  }, [id, navigate]);

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
    if (!id) return;

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
      
      const jobData = {
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
      };

      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
      const response = await fetch(`${API_BASE_URL}/jobs/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jobData),
      });

      if (!response.ok) {
        throw new Error('공고 수정에 실패했습니다');
      }

      toast.success('공고가 수정되었습니다');
      navigate(`/employer/job/${id}`);
    } catch (error) {
      console.error('공고 수정 실패:', error);
      toast.error('공고 수정에 실패했습니다');
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
      <Header title="공고 수정" showBack />

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

        {/* Recruitment Conditions Section */}
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
                         text-[14px] text-text-900
                         focus:outline-none focus:ring-2 focus:ring-mint-600"
              >
                {languageOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="flex items-center text-[14px] font-medium text-text-900 mb-2">
                <span>근무 가능 비자 (복수 선택)</span>
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
                    className={`px-4 py-2 rounded-full text-[14px] font-medium transition-colors ${
                      formData.requiredVisa.includes(visa)
                        ? 'bg-mint-600 text-white'
                        : 'bg-gray-100 text-text-700 hover:bg-gray-200'
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
                placeholder="인근 거주 우대, 영어 가능자 우대"
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
                  min="1"
                  className="w-full h-[48px] px-4 bg-background rounded-[12px] border border-line-200
                           text-[14px] text-text-900
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
                           text-[14px] text-text-900
                           focus:outline-none focus:ring-2 focus:ring-mint-600"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Job Description Section */}
        <div className="bg-white rounded-[16px] p-5 shadow-card">
          <h3 className="text-[16px] font-bold text-text-900 mb-4">공고설명</h3>
          
          <textarea
            value={formData.employerMessage}
            onChange={(e) => handleChange('employerMessage', e.target.value)}
            placeholder="공고에 대한 상세 설명을 작성해주세요"
            rows={4}
            className="w-full px-4 py-3 bg-background rounded-[12px] border border-line-200
                     text-[14px] text-text-900 placeholder:text-text-500 resize-none
                     focus:outline-none focus:ring-2 focus:ring-mint-600"
          />
        </div>

        {/* Button Section */}
        <div className="bg-transparent p-0 mb-6">
          <div className="flex gap-3">
            {/* 취소 버튼 */}
            <button
              onClick={() => navigate(`/employer/job/${id}`)}
              disabled={submitting}
              className="flex-1 h-[52px] bg-gray-200 text-gray-700 rounded-[12px] text-[16px] 
                       font-semibold hover:bg-gray-300 transition-colors disabled:opacity-50"
            >
              취소
            </button>

            {/* 수정 완료 버튼 */}
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 h-[52px] bg-mint-600 text-white rounded-[12px] text-[16px] 
                       font-semibold hover:bg-mint-700 transition-colors disabled:opacity-50"
            >
              {submitting ? '수정 중...' : '수정 완료'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

