import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Header } from '@/components/Header';
import { Tag } from '@/components/Tag';
import { Badge } from '@/components/Badge';
import { BottomCTA, CTAButton } from '@/components/BottomCTA';
import type { JobSeeker } from '@/types';

export const ApplicantDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [applicant, setApplicant] = useState<JobSeeker | null>(null);
  const [hiring, setHiring] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplicant = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
        const response = await fetch(`${API_BASE_URL}/jobseekers/${id}`);
        
        if (!response.ok) {
          throw new Error('지원자 정보를 불러올 수 없습니다');
        }
        
        const data = await response.json();
        setApplicant(data);
      } catch (error) {
        console.error('지원자 정보 로딩 실패:', error);
        toast.error('지원자 정보를 불러오는데 실패했습니다');
        navigate('/employer/home');
      } finally {
        setLoading(false);
      }
    };

    fetchApplicant();
  }, [id, navigate]);

  const handleHire = async () => {
    if (!id) return;
    
    try {
      setHiring(true);
      // In real app: await applicationsAPI.update(applicationId, 'hired')
      await new Promise(resolve => setTimeout(resolve, 500));
      toast.success('채용이 확정되었습니다!');
      navigate('/employer/hire-done');
    } catch (error) {
      toast.error('채용 처리 중 오류가 발생했습니다');
    } finally {
      setHiring(false);
    }
  };

  const handleStartChat = () => {
    // 실제로는 conversation을 생성하거나 기존 conversation을 찾아서 이동
    // 임시로 conv-1로 이동 (Mock)
    const conversationId = `conv-${id}`;
    navigate(`/messages/${conversationId}`);
  };

  const handleCall = () => {
    if (!applicant?.phone) {
      toast.error('전화번호 정보가 없습니다');
      return;
    }
    // 전화 걸기
    window.location.href = `tel:${applicant.phone}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-mint-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!applicant) return null;

  // Parse experience and preferences
  const experience = typeof applicant.experience === 'string' 
    ? JSON.parse(applicant.experience) 
    : applicant.experience || [];
  
  const preferences = typeof applicant.preferences === 'string'
    ? JSON.parse(applicant.preferences)
    : applicant.preferences || {};

  const skills = preferences.skills || [];
  const introduction = preferences.introduction || '자기소개가 없습니다.';

  return (
    <div className="min-h-screen bg-white pb-24">
      <Header showBack title="지원자 상세 정보" />

      <div className="p-4">
        {/* Profile Card */}
        <div className="bg-white border-2 border-primary-mint rounded-card p-4 mb-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-2xl">
              👤
            </div>
            <div>
              <h1 className="text-[20px] font-bold text-text-primary">{applicant.name}, 28세</h1>
              <div className="flex items-center gap-1 text-[14px] text-text-secondary">
                <span>🇺🇿</span>
                <span>{applicant.nationality}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2 mb-3">
            <p className="text-[14px] text-text-primary">
              언어 능력: {applicant.languageLevel} (일상 소통 가능)
            </p>
            <p className="text-[14px] text-text-primary">
              비자: {applicant.visaType}
            </p>
            {experience.length > 0 && (
              <p className="text-[14px] text-primary-mint font-medium">
                경력: {experience[0].role} {experience[0].years}년 근무
              </p>
            )}
          </div>

          <div className="flex gap-2 flex-wrap">
            {skills.map((skill: string, index: number) => (
              <Tag key={index} variant={index === 0 ? "mint" : "outline-mint"} size="sm">
                {skill}
              </Tag>
            ))}
          </div>

          <button className="absolute top-4 right-4 w-10 h-10 bg-primary-mint rounded-full flex items-center justify-center text-white">
            🔖
          </button>
        </div>

        {/* Self Introduction */}
        <div className="mb-5">
          <h2 className="text-[17px] font-bold text-text-primary mb-3">자기소개</h2>
          <div className="bg-mint-50 rounded-xl p-4">
            <p className="text-[14px] text-text-primary leading-relaxed whitespace-pre-wrap">
              {introduction}
            </p>
          </div>
        </div>

        {/* Language Skills */}
        <div className="mb-5">
          <h2 className="text-[17px] font-bold text-text-primary mb-3">언어능력</h2>
          <div className="space-y-2">
            <LanguageRow language="한국어" level="L1-2" />
            <LanguageRow language="영어" level="IELTS 9.0" />
            <LanguageRow language="스페인어" level="DELE A1" />
          </div>
        </div>

        {/* Work Availability */}
        <div className="mb-5">
          <h2 className="text-[17px] font-bold text-text-primary mb-3">근무 가능 시간</h2>
          <p className="text-[14px] text-text-primary">
            주말 가능, 평일 오후 시간대 모두 가능
          </p>
        </div>
      </div>

      {/* Bottom CTA */}
      <BottomCTA>
        <div className="flex gap-2">
          <CTAButton variant="outline" onClick={handleStartChat}>
            <span className="text-xl">💬</span>
            채팅
          </CTAButton>
          <CTAButton variant="outline" onClick={handleCall}>
            <span className="text-xl">📞</span>
            연락하기
          </CTAButton>
          <CTAButton
            variant="primary"
            fullWidth
            onClick={handleHire}
            disabled={hiring}
          >
            면접 제안하기
          </CTAButton>
        </div>
      </BottomCTA>
    </div>
  );
};

const LanguageRow = ({ language, level }: { language: string; level: string }) => {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
      <span className="text-[14px] text-text-primary">{language}</span>
      <Badge variant="mint">{level}</Badge>
    </div>
  );
};



