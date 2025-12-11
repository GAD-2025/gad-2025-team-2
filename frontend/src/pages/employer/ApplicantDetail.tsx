import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Header } from '@/components/Header';
import { Tag } from '@/components/Tag';
import { BottomCTA, CTAButton } from '@/components/BottomCTA';
import { getJobSeekerProfile, type JobSeekerProfileData } from '@/api/endpoints';

export const ApplicantDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [applicant, setApplicant] = useState<JobSeekerProfileData | null>(null);
  const [hiring, setHiring] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplicant = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const data = await getJobSeekerProfile(id);
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

  const skills = applicant.experience_skills ? [applicant.experience_skills] : [];
  const introduction = applicant.experience_introduction || '자기소개가 없습니다.';
  const birth = applicant.birthdate ? new Date(applicant.birthdate) : null;
  const age = birth ? Math.max(0, Math.floor((Date.now() - birth.getTime()) / (1000 * 60 * 60 * 24 * 365.25))) : null;
  const flagEmoji = (codeOrName?: string | null) => {
    if (!codeOrName) return '🌏';
    const nameMap: Record<string, string> = {
      '우즈베키스탄': 'UZ',
      '필리핀': 'PH',
      '베트남': 'VN',
      '태국': 'TH',
      '몽골': 'MN',
      '중국': 'CN',
      '한국': 'KR',
    };
    const code = (codeOrName.length === 2 ? codeOrName : nameMap[codeOrName]) || codeOrName;
    const upper = code.toUpperCase();
    if (upper.length === 2) {
      const cp = (c: string) => c.codePointAt(0)! - 0x41 + 0x1F1E6;
      return String.fromCodePoint(cp(upper[0]), cp(upper[1]));
    }
    return '🌏';
  };

  // Parse skills if JSON string
  const parsedSkills = (() => {
    if (!applicant.experience_skills) return [];
    try {
      const parsed = JSON.parse(applicant.experience_skills);
      if (Array.isArray(parsed)) return parsed;
      if (typeof parsed === 'object') {
        return Object.values(parsed).flatMap((v) => (Array.isArray(v) ? v : [String(v)]));
      }
    } catch (_e) {
      /* ignore */
    }
    return [applicant.experience_skills];
  })();

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
            <h1 className="text-[20px] font-bold text-text-primary">{applicant.name}{age ? `, ${age}세` : ''}</h1>
              <div className="flex items-center gap-1 text-[14px] text-text-secondary">
              <span>{flagEmoji(applicant.nationality_code)}</span>
              <span>{applicant.nationality_code || '국적 미상'}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2 mb-3">
            <p className="text-[14px] text-text-primary">
            언어 능력: {parsedSkills.length ? parsedSkills.join(', ') : '미입력'}
            </p>
            <p className="text-[14px] text-text-primary">
            비자: {(applicant as any).visa_type ?? (applicant as any).visaType ?? '미입력'}
            </p>
            {applicant.experience_career && (
              <p className="text-[14px] text-primary-mint font-medium">
                경력: {applicant.experience_career}
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
        {parsedSkills.length > 0 && (
          <div className="mb-5">
            <h2 className="text-[17px] font-bold text-text-primary mb-3">언어/스킬</h2>
            <div className="flex flex-wrap gap-2">
              {parsedSkills.map((skill, idx) => (
                <Tag key={idx} variant="mint" size="sm">
                  {skill}
                </Tag>
              ))}
            </div>
          </div>
        )}

        {/* Work Availability */}
        <div className="mb-5">
          <h2 className="text-[17px] font-bold text-text-primary mb-3">근무 가능 시간</h2>
          <div className="space-y-1 text-[14px] text-text-primary">
            <p>요일: {applicant.work_days_of_week?.length ? applicant.work_days_of_week.join(', ') : '미입력'}</p>
            <p>시간: {applicant.work_start_time && applicant.work_end_time ? `${applicant.work_start_time} ~ ${applicant.work_end_time}` : '미입력'}</p>
            {applicant.work_available_dates?.length ? (
              <p>가능 날짜: {applicant.work_available_dates.slice(0, 3).join(', ')}{applicant.work_available_dates.length > 3 ? ' 외' : ''}</p>
            ) : null}
          </div>
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

