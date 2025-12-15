import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Header } from '@/components/Header';
import {
  applicationsAPI,
  profileAPI,
  getSignupUser,
  getJobSeekerProfile,
  jobSeekerProfileAPI,
  type JobSeekerProfileData,
  type JobSeekerProfileUpsertPayload,
  type ProfileData,
} from '@/api/endpoints';
import { useAuthStore } from '@/store/useAuth';

export const ResumeEdit = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const jobId = location.state?.jobId as string | undefined;

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    birthYear: '',
    nationality: '',
    visaType: '',
    languageLevel: '',
    intro: '',
    experience: '',
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [profileBase, setProfileBase] = useState<ProfileData | null>(null);
  const [jobProfile, setJobProfile] = useState<JobSeekerProfileData | null>(null);

  // 기존 정보 불러오기
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const signupUserId = useAuthStore.getState().signupUserId || localStorage.getItem('signup_user_id');
        if (!signupUserId) {
          toast.error('로그인이 필요합니다');
          navigate('/auth/signin');
          return;
        }

        setLoading(true);

        const [signupUser, jobProfileRes] = await Promise.all([
          getSignupUser(signupUserId).catch(() => null),
          getJobSeekerProfile(signupUserId).catch(() => null),
        ]);

        // profileAPI.get 은 토큰 필요, 실패해도 주요 정보는 signup/jobProfile 로 채움
        const profileRes = await profileAPI.get().then((r) => r.data).catch(() => null);

        setProfileBase(profileRes);
        setJobProfile(jobProfileRes);

        const birthYear =
          profileRes?.birthdate?.slice(0, 4) ||
          signupUser?.birthdate?.slice(0, 4) ||
          '';

        setFormData({
          name: signupUser?.name || profileRes?.name || '',
          phone: signupUser?.phone || profileRes?.phone || '',
          email: signupUser?.email || profileRes?.email || '',
          birthYear,
          nationality:
            signupUser?.nationality_name ||
            signupUser?.nationality_code ||
            profileRes?.nationality_code ||
            '',
          visaType: jobProfileRes?.visa_type || profileRes?.visaType || '',
          languageLevel: profileRes?.languageLevel || '',
          intro: jobProfileRes?.experience_introduction || profileRes?.bio || '',
          experience:
            jobProfileRes?.experience_career ||
            jobProfileRes?.experience_skills ||
            '',
        });
      } catch (error) {
        console.error('[ERROR] Failed to load resume:', error);
        toast.error('이력서를 불러오지 못했습니다');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [navigate]);

  const handleSubmit = async () => {
    // Get user ID
    const signupUserId = useAuthStore.getState().signupUserId || localStorage.getItem('signup_user_id');
    if (!signupUserId) {
      toast.error('로그인이 필요합니다');
      navigate('/auth/signin');
      return;
    }

    const birthdate =
      formData.birthYear && formData.birthYear.length === 4
        ? `${formData.birthYear}-01-01`
        : profileBase?.birthdate || null;

    const updatePayload: ProfileData = {
      name: formData.name || profileBase?.name || '',
      email: formData.email || profileBase?.email || null,
      phone: formData.phone ? formData.phone.replace(/-/g, '') : profileBase?.phone || null,
      nationality_code: formData.nationality || profileBase?.nationality_code || null,
      birthdate,
      visaType: formData.visaType || jobProfile?.visa_type || profileBase?.visaType || null,
      languageLevel: formData.languageLevel || profileBase?.languageLevel || null,
      location: profileBase?.location || null,
      skills: profileBase?.skills || [],
      bio: formData.intro || profileBase?.bio || null,
    };

    const workSchedule: JobSeekerProfileUpsertPayload['work_schedule'] = jobProfile
      ? {
          available_dates: jobProfile.work_available_dates || [],
          start_time: jobProfile.work_start_time,
          end_time: jobProfile.work_end_time,
          days_of_week: jobProfile.work_days_of_week || [],
        }
      : {
          available_dates: [],
          start_time: null,
          end_time: null,
          days_of_week: [],
        };

    const experienceSections =
      (jobProfile?.experience_sections?.length ?? 0) > 0
        ? jobProfile?.experience_sections
        : formData.experience || formData.intro
        ? ['career', 'introduction']
        : [];

    const experienceData = {
      career: formData.experience || jobProfile?.experience_career || '',
      license: jobProfile?.experience_license || '',
      skills: jobProfile?.experience_skills || '',
      introduction: formData.intro || jobProfile?.experience_introduction || '',
    };

    const upsertPayload: JobSeekerProfileUpsertPayload = {
      user_id: signupUserId,
      basic_info_file_name: jobProfile?.basic_info_file_name ?? null,
      preferred_regions: jobProfile?.preferred_regions || [],
      preferred_jobs: jobProfile?.preferred_jobs || [],
      work_schedule: workSchedule,
      experience: experienceSections.length > 0 ? { sections: experienceSections, data: experienceData } : undefined,
      visa_type: updatePayload.visaType,
    };

    try {
      setSubmitting(true);

      // 1) 기본 프로필 저장
      await profileAPI.update(updatePayload);

      // 2) 상세 프로필(경력/선호) 업데이트
      await jobSeekerProfileAPI.upsert(upsertPayload);

      // 3) 지원 (jobId가 있는 경우)
      if (jobId) {
        await applicationsAPI.create(signupUserId, jobId);
        toast.success('이력서가 저장되고 지원이 완료되었습니다');
        navigate('/jobseeker/apply-done');
      } else {
        toast.success('이력서가 저장되었습니다');
        navigate('/mypage');
      }
    } catch (error: any) {
      console.error('저장/지원 실패:', error);
      if (error?.response?.status === 409) {
        toast.warning('이미 지원한 공고입니다');
      } else {
        toast.error(error?.response?.data?.detail || '저장/지원에 실패했습니다');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-text-700">이력서를 불러오는 중입니다...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-[84px]">
      <Header showBack title="이력서 수정" />

      <div className="p-4 space-y-6">
        {/* 기본 정보 */}
        <div className="bg-white rounded-[16px] p-5 shadow-card">
          <h3 className="text-[18px] font-bold text-text-900 mb-4">기본 정보</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-[14px] text-text-700 mb-2">이름</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full h-[48px] px-4 border border-line-200 rounded-[12px] text-[15px] focus:border-mint-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[14px] text-text-700 mb-2">전화번호</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full h-[48px] px-4 border border-line-200 rounded-[12px] text-[15px] focus:border-mint-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[14px] text-text-700 mb-2">이메일</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full h-[48px] px-4 border border-line-200 rounded-[12px] text-[15px] focus:border-mint-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[14px] text-text-700 mb-2">출생 연도</label>
              <input
                type="text"
                value={formData.birthYear}
                onChange={(e) => setFormData({ ...formData, birthYear: e.target.value })}
                className="w-full h-[48px] px-4 border border-line-200 rounded-[12px] text-[15px] focus:border-mint-600 focus:outline-none"
                placeholder="예: 1995"
              />
            </div>
            <div>
              <label className="block text-[14px] text-text-700 mb-2">국적</label>
              <input
                type="text"
                value={formData.nationality}
                onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                className="w-full h-[48px] px-4 border border-line-200 rounded-[12px] text-[15px] focus:border-mint-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[14px] text-text-700 mb-2">비자 유형</label>
              <input
                type="text"
                value={formData.visaType}
                onChange={(e) => setFormData({ ...formData, visaType: e.target.value })}
                className="w-full h-[48px] px-4 border border-line-200 rounded-[12px] text-[15px] focus:border-mint-600 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* 언어 능력 */}
        <div className="bg-white rounded-[16px] p-5 shadow-card">
          <h3 className="text-[18px] font-bold text-text-900 mb-4">언어 능력</h3>
          <div>
            <label className="block text-[14px] text-text-700 mb-2">한국어 수준</label>
            <input
              type="text"
              value={formData.languageLevel}
              onChange={(e) => setFormData({ ...formData, languageLevel: e.target.value })}
              className="w-full h-[48px] px-4 border border-line-200 rounded-[12px] text-[15px] focus:border-mint-600 focus:outline-none"
            />
          </div>
        </div>

        {/* 경력 */}
        <div className="bg-white rounded-[16px] p-5 shadow-card">
          <h3 className="text-[18px] font-bold text-text-900 mb-4">경력</h3>
          <div>
            <label className="block text-[14px] text-text-700 mb-2">경력 사항</label>
            <textarea
              value={formData.experience}
              onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 border border-line-200 rounded-[12px] text-[15px] focus:border-mint-600 focus:outline-none resize-none"
              placeholder="경력 사항을 입력해주세요"
            />
          </div>
        </div>

        {/* 자기소개 */}
        <div className="bg-white rounded-[16px] p-5 shadow-card">
          <h3 className="text-[18px] font-bold text-text-900 mb-4">자기소개</h3>
          <div>
            <label className="block text-[14px] text-text-700 mb-2">자기소개</label>
            <textarea
              value={formData.intro}
              onChange={(e) => setFormData({ ...formData, intro: e.target.value })}
              rows={6}
              className="w-full px-4 py-3 border border-line-200 rounded-[12px] text-[15px] focus:border-mint-600 focus:outline-none resize-none"
              placeholder="자기소개를 입력해주세요"
            />
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-line-200 p-4 safe-area-bottom z-50">
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full h-[52px] bg-mint-600 text-white rounded-[12px] text-[16px] 
                   font-semibold hover:bg-mint-700 transition-colors disabled:opacity-50"
        >
          {submitting ? '처리 중...' : jobId ? '저장 후 제출하기' : '저장하기'}
        </button>
      </div>
    </div>
  );
};

