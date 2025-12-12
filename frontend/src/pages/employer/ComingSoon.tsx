import { useNavigate, useLocation } from "react-router-dom";

export const ComingSoon = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { message, iconType } = location.state || { message: "이 페이지는 현재 준비 중입니다." }; // Default message and no iconType

  const renderIcon = () => {
    switch (iconType) {
      case "bell":
        return (
          <svg
            className="w-12 h-12 text-mint-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
        );
      case "language":
        return (
          <svg
            className="w-12 h-12 text-mint-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
            />
          </svg>
        );
      case "message":
        return (
          <svg
            className="w-12 h-12 text-mint-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        );
      default:
        // Default icon if none specified or unrecognized
        return (
          <svg
            className="w-12 h-12 text-mint-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center">
      {/* Header (added for consistency with other pages, if needed, otherwise remove) */}
      <header className="bg-white border-b border-line-200 px-4 py-4 sticky top-0 z-10 w-full">
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
          <h1 className="text-[20px] font-bold text-text-900">준비 중</h1>
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center text-center">
        {/* Icon */}
        <div className="w-24 h-24 mx-auto mb-6 bg-mint-100 rounded-full flex items-center justify-center">
          {renderIcon()}
        </div>

        {/* Coming Soon Text */}
        <h2 className="text-[32px] font-bold text-text-900 mb-3">
          Coming Soon
        </h2>

        <p className="text-[16px] text-text-700 leading-relaxed whitespace-pre-line">
          {message}
        </p>
        <button
          onClick={() => navigate(-1)}
          className="mt-8 px-6 py-3 bg-mint-600 text-white rounded-[12px] text-[16px] font-semibold hover:bg-mint-700 transition-colors"
        >
          돌아가기
        </button>
      </div>
    </div>
  );
};
