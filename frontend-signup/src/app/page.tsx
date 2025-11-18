'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from "next/image";
import { SafetyNoticeModal } from '@/components/SafetyNoticeModal';

function HomeContent() {
  const searchParams = useSearchParams();
  const [showSafetyNotice, setShowSafetyNotice] = useState(false);

  useEffect(() => {
    // 클라이언트 사이드에서만 실행
    if (typeof window === 'undefined') return;

    const checkAndShowModal = () => {
      // 여러 방법으로 URL 확인
      const currentUrl = window.location.href;
      const search = window.location.search;
      const urlParams = new URLSearchParams(search);
      const fromOnboarding = 
        urlParams.get('from') === 'onboarding' ||
        currentUrl.includes('from=onboarding');
      const hideFlag = localStorage.getItem('hideSafetyNotice') === 'true';

      console.log('🔍 Safety Notice Check:', { 
        currentUrl,
        search,
        fromOnboarding, 
        hideFlag, 
        shouldShow: fromOnboarding && !hideFlag
      });

      if (fromOnboarding && !hideFlag) {
        console.log('✅ Showing safety notice modal');
        setShowSafetyNotice(true);
      } else {
        console.log('❌ Not showing modal:', { fromOnboarding, hideFlag });
      }
    };

    // 즉시 확인
    checkAndShowModal();

    // 짧은 딜레이 후 다시 확인 (Next.js 라우팅 완료 대기)
    const timeout1 = setTimeout(checkAndShowModal, 100);
    const timeout2 = setTimeout(checkAndShowModal, 500);

    return () => {
      clearTimeout(timeout1);
      clearTimeout(timeout2);
    };
  }, [searchParams]);

  const handleClose = () => {
    setShowSafetyNotice(false);
  };

  const handleNeverShowAgain = () => {
    setShowSafetyNotice(false);
  };

  console.log('🏠 HomeContent render - showSafetyNotice:', showSafetyNotice);

  return (
    <>
      {showSafetyNotice && (
        <SafetyNoticeModal
          onClose={handleClose}
          onNeverShowAgain={handleNeverShowAgain}
        />
      )}
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
        <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
          <Image
            className="dark:invert"
            src="/next.svg"
            alt="Next.js logo"
            width={100}
            height={20}
            priority
          />
          <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
            <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
              To get started, edit the page.tsx file.
            </h1>
            <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
              Looking for a starting point or more instructions? Head over to{" "}
              <a
                href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
                className="font-medium text-zinc-950 dark:text-zinc-50"
              >
                Templates
              </a>{" "}
              or the{" "}
              <a
                href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
                className="font-medium text-zinc-950 dark:text-zinc-50"
              >
                Learning
              </a>{" "}
              center.
            </p>
          </div>
          <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
            <a
              className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] md:w-[158px]"
              href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                className="dark:invert"
                src="/vercel.svg"
                alt="Vercel logomark"
                width={16}
                height={16}
              />
              Deploy Now
            </a>
            <a
              className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-[158px]"
              href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              target="_blank"
              rel="noopener noreferrer"
            >
              Documentation
            </a>
          </div>
        </main>
      </div>
    </>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
        <div className="text-center">Loading...</div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
