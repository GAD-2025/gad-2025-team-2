import { useNavigate } from 'react-router-dom';

export function OnboardingCompleteStep() {
  const navigate = useNavigate();

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[420px] flex-col items-center justify-center bg-white px-4 pb-10 text-center">
      <div className="mb-8">
        <span className="text-6xl">🎉</span>
      </div>
      <h1 className="mb-4 text-2xl font-bold text-gray-900">
        프로필 작성이 완료되었습니다!
      </h1>
      <p className="mb-8 text-gray-600">
        이제 WorkFair의 모든 기능을 이용할 수 있습니다.
        <br />
        맞춤형 일자리를 찾아보세요!
      </p>
      <button
        type="button"
        onClick={() => navigate('/jobseeker/home')}
        className="w-full rounded-full bg-primary-mint px-4 py-3 text-[17px] font-semibold text-white"
      >
        홈으로 이동
      </button>
    </div>
  );
}
