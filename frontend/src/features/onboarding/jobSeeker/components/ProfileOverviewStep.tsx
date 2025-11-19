import { useNavigate } from 'react-router-dom';

interface ProfileOverviewStepProps {
  onStart: () => void;
  onPrev?: () => void;
}

export function ProfileOverviewStep({ onStart, onPrev }: ProfileOverviewStepProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onPrev) {
      onPrev();
    } else {
      // 온보딩 첫 화면에서 뒤로가면 회원가입 페이지로 이동
      navigate('/signup');
    }
  };
  const profileSections = [
    { id: 'basic', label: '프로필 기본 정보', active: true },
    { id: 'career', label: '경력', active: false },
    { id: 'license', label: '면허/자격증', active: false },
    { id: 'skill', label: '재능/스킬', active: false },
    { id: 'intro', label: '자기소개', active: false },
  ];

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[420px] flex-col bg-white px-4 pb-10 pt-8">
      <header className="mb-6 flex items-center gap-2">
        <button type="button" onClick={handleBack} className="text-[26px] text-gray-700">
          ←
        </button>
        <span className="flex-1 text-center text-[19px] font-semibold text-gray-900">
          프로필 작성
        </span>
      </header>

      <div className="mb-6 flex items-center gap-3">
        <div className="h-16 w-16 rounded-full bg-gray-200" />
        <div>
          <p className="text-[17px] font-semibold text-gray-900">박00</p>
          <p className="text-[15px] text-gray-500">24세 여</p>
        </div>
      </div>

      <div className="mb-8 space-y-3">
        {profileSections.map((section) => (
          <div
            key={section.id}
            className={`rounded-2xl border px-4 py-4 ${
              section.active
                ? 'border-primary-mint bg-mint-50'
                : 'border-gray-200 bg-white'
            }`}
          >
            <div className="flex items-center gap-2">
              {section.active && (
                <span className="text-primary-mint">✓</span>
              )}
              <span
                className={`text-[15px] font-medium ${
                  section.active ? 'text-primary-mint' : 'text-gray-400'
                }`}
              >
                {section.label}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-auto rounded-2xl bg-gray-50 px-4 py-6">
        <p className="mb-2 text-[13px] text-gray-500">Step 1 (1/3)</p>
        <p className="mb-4 text-[15px] text-gray-700">
          프로필 기본 정보
          <br />
          나만의 프로필을 완성하고 더 많은 근무 제안과 합격 소식을 받아보세요.
        </p>
        <button
          type="button"
          onClick={onStart}
          className="h-12 w-full rounded-full bg-primary-mint text-[17px] font-semibold text-white"
        >
          시작
        </button>
      </div>
    </div>
  );
}

