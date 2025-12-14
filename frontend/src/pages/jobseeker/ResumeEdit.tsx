import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Header } from '@/components/Header';
import { applicationsAPI } from '@/api/endpoints';
import { useAuthStore } from '@/store/useAuth';

export const ResumeEdit = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const jobId = location.state?.jobId as string | undefined;

  const [formData, setFormData] = useState({
    name: '홍길동',
    phone: '010-1234-5678',
    email: 'hong@example.com',
    birthYear: '1995',
    nationality: '베트남',
    visaType: 'C-4',
    languageLevel: 'TOPIK 3급',
    intro: '성실하고 책임감 있는 근무 태도를 가지고 있습니다.',
    experience: '카페 알바 1년 경력',
  });

  const handleSubmit = async () => {
    if (!jobId) {
      toast.error('공고 정보를 찾을 수 없습니다');
      navigate('/jobs');
      return;
    }

    // Get user ID from auth store (migrated) or localStorage fallback
    const signupUserId = useAuthStore.getState().signupUserId;
    const userId = signupUserId || localStorage.getItem('signup_user_id');
    if (!userId) {
      toast.error('로그인이 필요합니다');
      navigate('/auth/signin');
      return;
    }

    try {
      // 이력서 수정 후 지원
      await applicationsAPI.create(userId, jobId);
      toast.success('이력서가 수정되고 지원이 완료되었습니다');
      navigate('/jobseeker/apply-done');
    } catch (error: any) {
      console.error('지원 실패:', error);
      if (error.response?.status === 409) {
        toast.warning('이미 지원한 공고입니다');
      } else {
        toast.error('지원에 실패했습니다');
      }
    }
  };

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
          className="w-full h-[52px] bg-mint-600 text-white rounded-[12px] text-[16px] 
                   font-semibold hover:bg-mint-700 transition-colors disabled:opacity-50"
        >
          저장 후 제출하기
        </button>
      </div>
    </div>
  );
};

