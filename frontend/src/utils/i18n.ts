import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  ko: {
    translation: {
      // Navigation
      "nav.home": "홈",
      "nav.jobs": "공고",
      "nav.learning": "학습",
      "nav.network": "네트워킹",
      "nav.mypage": "마이",

      // Search
      "search.placeholder": "직종, 지역으로 검색...",

      // Filters
  "filter.title": "검색 조건 설정",
      "filter.apply": "적용하기",
      "filter.languageLevel": "언어 능력",
  "filter.location": "지역 설정",
      "filter.experience": "경력사항",
      "filter.workConditions": "근무 조건",
      "filter.noExperience": "경력 없음",

      // Job card
      "job.apply": "지원하기",
      "job.hourly": "시급",
      "job.monthly": "월급",
      "job.positions": "명",
      "job.deadline": "D-",

      // Job detail
      "detail.employerMessage": "사장님의 한마디",
      "detail.workConditions": "근무 조건",
      "detail.recruitmentConditions": "모집 조건",
      "detail.wage": "급여",
      "detail.period": "근무기간",
      "detail.schedule": "근무요일 시간",
      "detail.industry": "업직종",
      "detail.languageReq": "언어요구사항",
      "detail.visaReq": "근무가능비자",
      "detail.deadline": "모집 마감",
      "detail.positions": "모집 인원",
      "detail.benefits": "우대사항",
      "detail.chat": "채팅",
      "detail.call": "전화",

      // Home sections
      "home.recommendedFilters": "수정님께 추천하는 맞춤 필터",
      "home.applicationStatus": "수정님의 지원 현황",
      "home.applicationStatusQuestion": "수정님의 지원 현황을 알아볼까요?",
      "home.directApplication": "지원 완료",
      "home.screening": "스크린",
      "home.documentPass": "서류 컴플중",
      "home.aiRecommendations": "수정님을 위한 맞춤 공고",
      "home.newJobs": "새로 올라온 공고",
      "home.quickMenu": "빠른 메뉴",
      "home.guideTitle": "생활 꿀팁 & 필수 가이드",

      // Progress card
      "progress.currentLearning": "현재 학습 내역",
      "progress.completed": "완료",

      // Quick menu
      "menu.highWage": "높은 시급",
      "menu.nearLocation": "가까운 거리",
      "menu.newCompany": "신뢰 기업",
      "menu.urgent": "단기 알바",

      // Guide cards
      "guide.scamWarning": "구직자님!",
      "guide.scamWarningDesc": "최근 유행인 사기 수법 알아가세요",
      "guide.koreanLearning": "꼭 알아야 할",
      "guide.koreanLearningDesc": "오늘의 생활 한국어 표현",

      // Messages
      "message.translate": "번역",
      "message.original": "원문",

      // Auth
      "auth.signin": "로그인",
      "auth.signup": "회원가입",
      "auth.email": "이메일",
      "auth.password": "비밀번호",

      // Toasts
      "toast.applySuccess": "지원이 완료되었습니다",
      "toast.applyDuplicate": "이미 지원한 공고입니다",
      "toast.applyError": "지원 중 오류가 발생했습니다",
    },
  },
  en: {
    translation: {
      "nav.home": "Home",
      "nav.jobs": "Jobs",
      "nav.learning": "Learning",
      "nav.network": "Network",
      "nav.mypage": "My",
      "search.placeholder": "Search by job, location...",
  "filter.title": "Search Conditions",
      "filter.apply": "Apply",
      "filter.languageLevel": "Language Level",
  "filter.location": "Region",
      "filter.experience": "Experience",
      "filter.workConditions": "Work Conditions",
      "filter.noExperience": "No Experience",
      "job.apply": "Apply",
      "job.hourly": "Hourly",
      "job.monthly": "Monthly",
      "job.positions": "positions",
      "job.deadline": "D-",
      "detail.employerMessage": "Message from Employer",
      "detail.workConditions": "Work Conditions",
      "detail.recruitmentConditions": "Recruitment",
      "detail.wage": "Wage",
      "detail.period": "Period",
      "detail.schedule": "Schedule",
      "detail.industry": "Industry",
      "detail.languageReq": "Language",
      "detail.visaReq": "Visa",
      "detail.deadline": "Deadline",
      "detail.positions": "Positions",
      "detail.benefits": "Benefits",
      "detail.chat": "Chat",
      "detail.call": "Call",
      "home.recommendedFilters": "Recommended Filters",
      "home.applicationStatus": "Application Status",
      "home.applicationStatusQuestion": "Check your application status",
      "home.directApplication": "Applied",
      "home.screening": "Screening",
      "home.documentPass": "In Review",
      "home.aiRecommendations": "AI Recommended Jobs",
      "home.newJobs": "New Jobs",
      "home.quickMenu": "Quick Menu",
      "home.guideTitle": "Life Tips & Essential Guides",
      "progress.currentLearning": "Current Learning",
      "progress.completed": "Completed",
      "menu.highWage": "High Wage",
      "menu.nearLocation": "Near Location",
      "menu.newCompany": "Trusted Company",
      "menu.urgent": "Short-term",
      "guide.scamWarning": "Job Seekers!",
      "guide.scamWarningDesc": "Learn about recent scam methods",
      "guide.koreanLearning": "Must Know",
      "guide.koreanLearningDesc": "Daily Korean expressions",
      "message.translate": "Translate",
      "message.original": "Original",
      "auth.signin": "Sign In",
      "auth.signup": "Sign Up",
      "auth.email": "Email",
      "auth.password": "Password",
      "toast.applySuccess": "Application submitted successfully",
      "toast.applyDuplicate": "Already applied to this job",
      "toast.applyError": "Error occurred during application",
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "ko",
  fallbackLng: "ko",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
