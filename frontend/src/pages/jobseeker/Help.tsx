import { useNavigate } from "react-router-dom";

export const JobSeekerHelp = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-line-200 px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center">
          <button onClick={() => navigate(-1)} className="mr-4">
            <svg
              className="w-6 h-6 text-text-900"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <h1 className="text-[20px] font-bold text-text-900">도움말</h1>
        </div>
      </header>

      {/* Content */}
      <div className="px-4 py-6">
        <div className="bg-white rounded-[16px] border border-line-200 p-5">
          <h2 className="text-[18px] font-bold text-text-900 mb-4">
            고객센터
          </h2>
          <p className="text-text-700">
            문의사항이 있으시면 아래 이메일로 문의해주세요.
          </p>
          <div className="mt-4 space-y-2">
            <p className="text-text-800">
              <span className="font-semibold">이메일:</span> support@workfair.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
