// @ts-nocheck
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Header } from '@/components/Header';
import {
  getSignupUser,
  getJobSeekerProfile,
  jobSeekerProfileAPI,
  employerProfileAPI,
  JobSeekerProfileData,
} from '@/api/endpoints';
import { useAuthStore } from '@/store/useAuth';
import { VISA_OPTIONS } from '@/constants/profile';
import { KOREA_REGIONS } from '@/constants/locations';

const JOB_CATEGORIES = [
  { id: 'store', label: '매장관리 · 판매' },
  { id: 'service', label: '서비스' },
  { id: 'serving', label: '서빙' },
  { id: 'kitchen', label: '주방' },
  { id: 'labor', label: '단순노무 · 분류 · 택배' },
  { id: 'delivery', label: '배달 · 운송 · 운전' },
  { id: 'event', label: '행사 · 스텝 · 미디어' },
  { id: 'office', label: '사무 · 회계 · 관리' },
  { id: 'sales', label: '영업 · 마케팅' },
];

interface ProfileEditData {
  name: string;
  email: string | null;
  phone: string | null;
  nationality_code: string | null;
  birthdate: string | null;
  visaType: string | null;
  preferredRegions: string[];
  preferredJobs: string[];
  skills: string[];
  bio: string | null;
}

export const ProfileEdit = () => {
  const navigate = useNavigate();
  const { userMode, signupUserId, user } = useAuthStore();

  const [profile, setProfile] = useState<ProfileEditData | null>(null);
  const [jobSeekerProfile, setJobSeekerProfile] = useState<JobSeekerProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [showRegionModal, setShowRegionModal] = useState(false);
  const [showJobModal, setShowJobModal] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const userId = signupUserId || user?.id || localStorage.getItem('signup_user_id');
        if (!userId) {
          throw new Error('User not found');
        }

        if (userMode === 'employer') {
          const empProfile = await employerProfileAPI.get(userId);
          // Adapt EmployerProfileData to ProfileData for the form
          setProfile({
            name: empProfile.company_name || '',
            email: null, // Employer profile doesn't have email directly
            phone: null, // Nor phone
            nationality_code: null,
            birthdate: null,
            visaType: null,
            languageLevel: null,
            preferredRegions: empProfile.address ? [empProfile.address] : [],
            skills: [],
            bio: null,
          });
        } else {
          const [signupUser, fetchedJobSeekerProfile] = await Promise.all([
            getSignupUser(userId),
            getJobSeekerProfile(userId).catch(() => null),
          ]);
          
          setJobSeekerProfile(fetchedJobSeekerProfile);

          const parseSkills = (skillsJson: string | null): string[] => {
            if (!skillsJson) return [];
            try {
              const parsed = JSON.parse(skillsJson);
              if (parsed.workSkills && Array.isArray(parsed.workSkills)) {
                return parsed.workSkills;
              }
              return [];
            } catch {
              return [];
            }
          };

          setProfile({
            name: signupUser.name,
            email: signupUser.email,
            phone: signupUser.phone,
            nationality_code: signupUser.nationality_code,
            birthdate: signupUser.birthdate,
            visaType: (fetchedJobSeekerProfile as any)?.visa_type || null,
            languageLevel: (fetchedJobSeekerProfile as any)?.languageLevel || (fetchedJobSeekerProfile as any)?.language_level || null,
            preferredRegions: fetchedJobSeekerProfile?.preferred_regions || [],
            preferredJobs: fetchedJobSeekerProfile?.preferred_jobs || [],
            skills: parseSkills(fetchedJobSeekerProfile?.experience_skills || null),
            bio: fetchedJobSeekerProfile?.experience_introduction || null,
          });
        }
      } catch (err: any) {
        setError(err.message);
        toast.error('프로필을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [userMode, signupUserId, user]);

  const locationOptions = KOREA_REGIONS['서울특별시'];

  const handleChange = (field: keyof Omit<ProfileEditData, 'preferredRegions'>, value: string | string[]) => {
    if (profile) {
      setProfile({ ...profile, [field]: value });
    }
  };

  const handleRegionToggle = (region: string) => {
    if (profile) {
      const newRegions = profile.preferredRegions.includes(region)
        ? profile.preferredRegions.filter((r) => r !== region)
        : [...profile.preferredRegions, region];
      setProfile({ ...profile, preferredRegions: newRegions });
    }
  };

  const handleJobToggle = (jobId: string) => {
    if (profile) {
      const newJobs = profile.preferredJobs.includes(jobId)
        ? profile.preferredJobs.filter((j) => j !== jobId)
        : [...profile.preferredJobs, jobId];
      setProfile({ ...profile, preferredJobs: newJobs });
    }
  };

  const addSkill = () => {
    if (profile && newSkill.trim() && !profile.skills.includes(newSkill.trim())) {
      setProfile({
        ...profile,
        skills: [...profile.skills, newSkill.trim()],
      });
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    if (profile) {
      setProfile({
        ...profile,
        skills: profile.skills.filter((s) => s !== skill),
      });
    }
  };

  const handleSubmit = async () => {
    if (!profile || !signupUserId) return;

    if (!profile.name.trim()) {
      toast.error('이름을 입력해주세요');
      return;
    }

    try {
      setSubmitting(true);
      if (userMode === 'employer') {
        // TODO: Implement employer profile update
        toast.info('고용주 프로필 수정은 현재 준비 중입니다.');
        return;
      }

      const payload = {
        user_id: signupUserId,
        preferred_regions: profile.preferredRegions,
        preferred_jobs: profile.preferredJobs,
        work_schedule: {
          available_dates: jobSeekerProfile?.work_available_dates || [],
          start_time: jobSeekerProfile?.work_start_time || null,
          end_time: jobSeekerProfile?.work_end_time || null,
          days_of_week: jobSeekerProfile?.work_days_of_week || [],
        },
        experience: {
          sections: ['skills', 'introduction', 'career', 'license'],
          data: {
            skills: JSON.stringify({ workSkills: profile.skills }),
            introduction: profile.bio,
            career: jobSeekerProfile?.experience_career || '',
            license: jobSeekerProfile?.experience_license || '',
          },
        },
        visa_type: profile.visaType,
      };

      await jobSeekerProfileAPI.upsert(payload);
      toast.success('프로필이 업데이트되었습니다');
      navigate(-1);
    } catch (error) {
      toast.error('프로필 업데이트에 실패했습니다');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">로딩 중...</div>;
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-red-500">
        오류: {error || '프로필을 찾을 수 없습니다.'}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header title="프로필 수정" showBack />

      <div className="p-4 space-y-5">
        {/* Profile Photo */}
        <div className="bg-white rounded-[16px] p-5 shadow-card">
          <div className="flex items-center gap-4">
            <div
              className="w-20 h-20 bg-gradient-to-br from-mint-100 to-mint-200 rounded-full
                          flex items-center justify-center text-[32px]"
            >
              👤
            </div>
            <div className="flex-1">
              <button
                onClick={() => {
                  // TODO: Implement photo upload
                  alert('사진 업로드 기능 (구현 예정)');
                }}
                className="px-4 py-2 bg-mint-600 text-white rounded-[12px] text-[14px] 
                         font-semibold hover:bg-mint-700 transition-colors"
              >
                사진 변경
              </button>
            </div>
          </div>
        </div>

        {/* Basic Info Section */}
        <div className="bg-white rounded-[16px] p-5 shadow-card">
          <h3 className="text-[16px] font-bold text-text-900 mb-4">기본 정보</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-[14px] font-medium text-text-900 mb-2">
                {userMode === 'employer' ? '회사명' : '이름'} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full h-[48px] px-4 bg-background rounded-[12px] border border-line-200
                         text-[14px] text-text-900 focus:outline-none focus:ring-2 focus:ring-mint-600"
              />
            </div>

            {userMode === 'jobseeker' && (
              <>
                <div>
                  <label className="block text-[14px] font-medium text-text-900 mb-2">
                    이메일 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={profile.email || ''}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className="w-full h-[48px] px-4 bg-background rounded-[12px] border border-line-200
                             text-[14px] text-text-900 focus:outline-none focus:ring-2 focus:ring-mint-600"
                  />
                </div>

                <div>
                  <label className="block text-[14px] font-medium text-text-900 mb-2">
                    전화번호 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={profile.phone || ''}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    className="w-full h-[48px] px-4 bg-background rounded-[12px] border border-line-200
                             text-[14px] text-text-900 focus:outline-none focus:ring-2 focus:ring-mint-600"
                  />
                </div>

                <div>
                  <label className="block text-[14px] font-medium text-text-900 mb-2">
                    국적
                  </label>
                  <input
                    type="text"
                    value={profile.nationality_code || ''}
                    onChange={(e) => handleChange('nationality_code', e.target.value)}
                    className="w-full h-[48px] px-4 bg-background rounded-[12px] border border-line-200
                             text-[14px] text-text-900 focus:outline-none focus:ring-2 focus:ring-mint-600"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {userMode === 'jobseeker' && (
          <>
            {/* Work Info Section */}
            <div className="bg-white rounded-[16px] p-5 shadow-card">
              <h3 className="text-[16px] font-bold text-text-900 mb-4">근무 관련 정보</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-[14px] font-medium text-text-900 mb-2">
                    비자 종류
                  </label>
                  <select
                    value={profile.visaType || ''}
                    onChange={(e) => handleChange('visaType' as any, e.target.value)}
                    className="w-full h-[48px] px-4 bg-background rounded-[12px] border border-line-200
                             text-[14px] text-text-900 focus:outline-none focus:ring-2 focus:ring-mint-600"
                  >
                    {VISA_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[14px] font-medium text-text-900 mb-2">
                    희망 근무 지역
                  </label>
                  <div className="w-full h-[48px] px-4 bg-background rounded-[12px] border border-line-200 flex items-center justify-between">
                    <span className="text-[14px] text-text-900 truncate">
                      {profile.preferredRegions.join(', ') || '지역을 선택해주세요'}
                    </span>
                    <button
                      onClick={() => setShowRegionModal(true)}
                      className="text-mint-600 font-semibold text-sm flex-shrink-0"
                    >
                      수정
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[14px] font-medium text-text-900 mb-2">
                    희망 직종
                  </label>
                  <div className="w-full h-[48px] px-4 bg-background rounded-[12px] border border-line-200 flex items-center justify-between">
                    <span className="text-[14px] text-text-900 truncate">
                      {profile.preferredJobs.map(jobId => JOB_CATEGORIES.find(j => j.id === jobId)?.label).join(', ') || '직종을 선택해주세요'}
                    </span>
                    <button
                      onClick={() => setShowJobModal(true)}
                      className="text-mint-600 font-semibold text-sm flex-shrink-0"
                    >
                      수정
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Skills Section */}
            <div className="bg-white rounded-[16px] p-5 shadow-card">
              <h3 className="text-[16px] font-bold text-text-900 mb-4">보유 기술/능력</h3>

              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                  placeholder="기술/능력 입력"
                  className="flex-1 h-[44px] px-4 bg-background rounded-[12px] border border-line-200
                           text-[14px] text-text-900 placeholder:text-text-500
                           focus:outline-none focus:ring-2 focus:ring-mint-600"
                />
                <button
                  onClick={addSkill}
                  className="px-4 h-[44px] bg-mint-600 text-white rounded-[12px] text-[14px] 
                           font-semibold hover:bg-mint-700 transition-colors"
                >
                  추가
                </button>
              </div>

              {profile.skills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 px-3 py-2 bg-mint-100 text-mint-600 
                               rounded-[12px] text-[13px] font-medium"
                    >
                      <span>{skill}</span>
                      <button
                        onClick={() => removeSkill(skill)}
                        className="hover:opacity-70 transition-opacity"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bio Section */}
            <div className="bg-white rounded-[16px] p-5 shadow-card">
              <h3 className="text-[16px] font-bold text-text-900 mb-4">자기소개</h3>

              <textarea
                value={profile.bio || ''}
                onChange={(e) => handleChange('bio', e.target.value)}
                placeholder="자신을 소개하는 글을 작성해주세요"
                rows={4}
                className="w-full px-4 py-3 bg-background rounded-[12px] border border-line-200
                         text-[14px] text-text-900 placeholder:text-text-500 resize-none
                         focus:outline-none focus:ring-2 focus:ring-mint-600"
              />
            </div>
          </>
        )}

        {/* Save Button */}
        <div className="p-4">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full h-[52px] bg-mint-600 text-white rounded-[12px] text-[16px] 
                     font-semibold hover:bg-mint-700 transition-colors disabled:opacity-50"
          >
            {submitting ? '저장 중...' : '저장하기'}
          </button>
        </div>
      </div>

      {showRegionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 relative">
            <h3 className="text-lg font-bold mb-4">희망 근무 지역</h3>
            <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto">
              {locationOptions.map((option) => {
                const isSelected = profile.preferredRegions.includes(option);
                return (
                  <button
                    key={option}
                    onClick={() => handleRegionToggle(option)}
                    className={`px-3 py-2 rounded-full text-sm ${
                      isSelected
                        ? 'bg-mint-600 text-white'
                        : 'bg-gray-200 text-gray-800'
                    }`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setShowRegionModal(false)}
              className="w-full mt-4 bg-mint-600 text-white py-3 rounded-lg font-semibold hover:bg-mint-700 transition-colors"
            >
              완료
            </button>
          </div>
        </div>
      )}

      {showJobModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 relative">
            <h3 className="text-lg font-bold mb-4">희망 직종</h3>
            <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto">
              {JOB_CATEGORIES.map((category) => {
                const isSelected = profile.preferredJobs.includes(category.id);
                return (
                  <button
                    key={category.id}
                    onClick={() => handleJobToggle(category.id)}
                    className={`px-3 py-2 rounded-full text-sm ${
                      isSelected
                        ? 'bg-mint-600 text-white'
                        : 'bg-gray-200 text-gray-800'
                    }`}
                  >
                    {category.label}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setShowJobModal(false)}
              className="w-full mt-4 bg-mint-600 text-white py-3 rounded-lg font-semibold hover:bg-mint-700 transition-colors"
            >
              완료
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
