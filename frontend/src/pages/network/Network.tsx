export const Network = () => {
  return (
    <div className="min-h-screen bg-background pb-20 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-line-200 px-4 py-4 sticky top-0 z-10">
        <h1 className="text-[20px] font-bold text-text-900">네트워킹</h1>
      </header>

      {/* Coming Soon Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="text-center">
          {/* Icon */}
          <div className="w-24 h-24 mx-auto mb-6 bg-mint-100 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-mint-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>

          {/* Coming Soon Text */}
          <h2 className="text-[32px] font-bold text-text-900 mb-3">
            Coming Soon
          </h2>
          
          <p className="text-[16px] text-text-700 leading-relaxed">
            한국인·외국인 모두가 편하게 소통하고<br />
            언어 교환·문화 교류를 통해 성장할 수 있는<br />
            안전한 커뮤니티 공간을 준비 중이에요.
          </p>
        </div>
      </div>
    </div>
  );
};
