import type { Resume } from '@/types/profile';

interface ResumeSectionProps {
  resume: Resume;
  onEdit: () => void;
}

export const ResumeSection = ({ resume, onEdit }: ResumeSectionProps) => {
  const getLanguageLevelLabel = (level: string) => {
    const labels: Record<string, string> = {
      'A1': '초급 A1',
      'A2': '초급 A2',
      'B1': '중급 B1',
      'B2': '중급 B2',
      'C1': '고급 C1',
      'C2': '고급 C2',
      'Native': '원어민'
    };
    return labels[level] || level;
  };

  return (
    <div className="space-y-4">
      {/* Basic Info */}
      <div className="bg-white rounded-[16px] border border-line-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[17px] font-bold text-text-900">기본 정보</h3>
          <button
            onClick={onEdit}
            className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-[8px] 
                     text-[13px] font-medium text-text-900 transition-colors"
          >
            수정
          </button>
        </div>

        <div className="space-y-3">
          {resume.birthYear && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-mint-100 rounded-full flex items-center justify-center flex-shrink-0">
                🎂
              </div>
              <div className="flex-1">
                <p className="text-[13px] text-text-500">출생 연도</p>
                <p className="text-[15px] font-medium text-text-900">{resume.birthYear}년생</p>
              </div>
            </div>
          )}

          {(resume.country || resume.city) && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-mint-100 rounded-full flex items-center justify-center flex-shrink-0">
                📍
              </div>
              <div className="flex-1">
                <p className="text-[13px] text-text-500">거주지</p>
                <p className="text-[15px] font-medium text-text-900">
                  {resume.city && resume.country ? `${resume.city}, ${resume.country}` : resume.city || resume.country}
                </p>
              </div>
            </div>
          )}

          {resume.nationality && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-mint-100 rounded-full flex items-center justify-center flex-shrink-0">
                🌍
              </div>
              <div className="flex-1">
                <p className="text-[13px] text-text-500">국적</p>
                <p className="text-[15px] font-medium text-text-900">{resume.nationality}</p>
              </div>
            </div>
          )}

          {resume.visaType && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-mint-100 rounded-full flex items-center justify-center flex-shrink-0">
                📋
              </div>
              <div className="flex-1">
                <p className="text-[13px] text-text-500">비자 유형</p>
                <p className="text-[15px] font-medium text-text-900">
                  {resume.visaType}
                  {resume.visaExpiryISO && (
                    <span className="text-[13px] text-text-500 ml-1">
                      (만료: {new Date(resume.visaExpiryISO).toLocaleDateString('ko-KR')})
                    </span>
                  )}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

