// @ts-nocheck
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listJobSeekers } from '@/api/endpoints';
import type { JobSeeker } from '@/types';
import { Header } from '@/components/Header';
import { useAuthStore } from '@/store/useAuth';

export const ApplicantsList = () => {
  const navigate = useNavigate();
  const { setUserMode } = useAuthStore();
  const [applicants, setApplicants] = useState<JobSeeker[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUserMode('employer');
  }, [setUserMode]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await listJobSeekers(50);
        const formatted = res.map((s: any) => ({
          id: s.id || s.user_id,
          userId: s.user_id,
          name: s.name || '이름 없음',
          nationality: s.nationality || '국적 미상',
          nationalityCode: s.nationality || s.nationality_code,
          birthdate: s.birthdate,
          phone: s.phone || '',
          languageLevel: s.language_level || '언어 능력 미입력',
          visaType: s.visa_type || '미입력',
          availability: s.availability || '즉시',
          location: undefined,
          experience: [],
          preferences: {
            industries: [],
            wageRange: { min: 0, max: 0 },
            area: s.preferred_regions?.[0] || '',
            radiusKm: 5,
            preferDays: s.work_days_of_week || [],
          },
          age: s.birthdate
            ? Math.max(
                0,
                Math.floor((Date.now() - new Date(s.birthdate).getTime()) / (1000 * 60 * 60 * 24 * 365.25))
              )
            : null,
          experience_skills: s.experience_skills || null,
        })) as JobSeeker[];
        setApplicants(formatted);
      } catch (_e) {
        setApplicants([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-background pb-4">
      <Header showBack title="추천 인재 목록" onBack={() => navigate(-1)} />
      <div className="p-4">
        {loading ? (
          <div className="text-text-500">불러오는 중...</div>
        ) : applicants.length === 0 ? (
          <div className="text-text-500">지원자가 없습니다.</div>
        ) : (
          <div className="flex flex-col gap-3">
            {applicants.map((a) => {
              const skillPreview = (() => {
                const tags: string[] = [];
                const raw = (a as any).experience_skills;
                try {
                  if (raw) {
                    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
                    if (Array.isArray(parsed)) tags.push(...parsed);
                    else if (parsed && typeof parsed === 'object') {
                      if (Array.isArray(parsed.workSkills)) tags.push(...parsed.workSkills);
                      if (Array.isArray(parsed.strengths)) tags.push(...parsed.strengths);
                      if (Array.isArray(parsed.mbti)) tags.push(...parsed.mbti);
                    }
                  }
                } catch (_e) {
                  if (typeof raw === 'string' && raw.trim()) tags.push(raw.trim());
                }
                return tags.filter(Boolean).slice(0, 2);
              })();

              const preferTags = (() => {
                const preferDays = a.preferences.preferDays || [];
                const tags: string[] = [];
                if (preferDays.length) {
                  tags.push(...preferDays.slice(0, 2).map((d) => `${d} 근무 가능`));
                  if (preferDays.length > 2) tags.push(`+${preferDays.length - 2}`);
                }
                if (a.preferences.area) tags.push(`${a.preferences.area} 거주`);
                return tags.slice(0, 2);
              })();

              const ageLabel = a.age ? `${a.age}세` : '';

              return (
                <div
                  key={a.id}
                  onClick={() => navigate(`/applicant/${a.userId || a.id}`)}
                  className="flex items-center gap-3 p-3 bg-white border border-line-200 rounded-[12px] hover:shadow-sm transition cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-mint-100 to-mint-200 flex items-center justify-center text-lg flex-shrink-0">
                    👤
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-[15px] font-semibold text-text-900 truncate">
                        {a.name} {ageLabel}
                      </p>
                      <span className="text-[12px] text-text-600 whitespace-nowrap">{a.nationalityCode || '국적 미상'}</span>
                    </div>
                    <p className="text-[12px] text-text-700">
                      비자: <span className="font-semibold">{a.visaType || '미입력'}</span>
                    </p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {skillPreview.length > 0 ? (
                        skillPreview.map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-mint-100 text-mint-700 rounded-[10px] text-[11px] font-medium"
                          >
                            {tag}
                          </span>
                        ))
                      ) : (
                        <span className="text-[11px] text-text-500">스킬 정보 없음</span>
                      )}
                      {preferTags.map((tag, idx) => (
                        <span
                          key={`pref-${idx}`}
                          className="px-2 py-1 bg-white border border-line-200 text-text-700 rounded-[10px] text-[11px] font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    className="px-3 py-2 bg-mint-600 text-white rounded-[10px] text-[12px] font-semibold flex-shrink-0 hover:bg-mint-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/applicant/${a.userId || a.id}`);
                    }}
                  >
                    상세보기
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
