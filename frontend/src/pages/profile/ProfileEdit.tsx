import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Header } from '@/components/Header';
import { profileAPI, ProfileData } from '@/api/endpoints';

export const ProfileEdit = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [newSkill, setNewSkill] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await profileAPI.get();
        setProfile(response.data);
      } catch (err: any) {
        setError(err.message);
        toast.error('프로필을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const languageOptions = ['Lv.1 기초', 'Lv.2 초급', 'Lv.3 중급', 'Lv.4 상급'];
  const visaOptions = ['E-9', 'H-2', 'F-4', 'F-5', 'F-6', 'D-10'];
  const locationOptions = ['종로구', '중구', '용산구', '성동구', '광진구', '동대문구', '중랑구', '성북구'];

  const handleChange = (field: keyof ProfileData, value: string | string[]) => {
    if (profile) {
      setProfile({ ...profile, [field]: value });
    }
  };

  const addSkill = () => {
    if (profile && newSkill.trim() && !profile.skills.includes(newSkill.trim())) {
      setProfile({
        ...profile,
        skills: [...profile.skills, newSkill.trim()]
      });
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    if (profile) {
      setProfile({
        ...profile,
        skills: profile.skills.filter(s => s !== skill)
      });
    }
  };

  const handleSubmit = async () => {
    if (!profile) return;

    if (!profile.name.trim()) {
      toast.error('이름을 입력해주세요');
      return;
    }

    try {
      setSubmitting(true);
      await profileAPI.update(profile);
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
    return <div className="min-h-screen bg-background flex items-center justify-center text-red-500">오류: {error || '프로필을 찾을 수 없습니다.'}</div>;
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header title="프로필 수정" showBack />

      <div className="p-4 space-y-5">
        {/* Profile Photo */}
        <div className="bg-white rounded-[16px] p-5 shadow-card">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-gradient-to-br from-mint-100 to-mint-200 rounded-full
                          flex items-center justify-center text-[32px]">
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
                이름 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full h-[48px] px-4 bg-background rounded-[12px] border border-line-200
                         text-[14px] text-text-900 focus:outline-none focus:ring-2 focus:ring-mint-600"
              />
            </div>

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
          </div>
        </div>

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
                onChange={(e) => handleChange('visaType', e.target.value)}
                className="w-full h-[48px] px-4 bg-background rounded-[12px] border border-line-200
                         text-[14px] text-text-900 focus:outline-none focus:ring-2 focus:ring-mint-600"
              >
                {visaOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[14px] font-medium text-text-900 mb-2">
                한국어 능력
              </label>
              <select
                value={profile.languageLevel || ''}
                onChange={(e) => handleChange('languageLevel', e.target.value)}
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
                거주 지역
              </label>
              <select
                value={profile.location || ''}
                onChange={(e) => handleChange('location', e.target.value)}
                className="w-full h-[48px] px-4 bg-background rounded-[12px] border border-line-200
                         text-[14px] text-text-900 focus:outline-none focus:ring-2 focus:ring-mint-600"
              >
                {locationOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
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
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-line-200 p-4">
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
  );
};

