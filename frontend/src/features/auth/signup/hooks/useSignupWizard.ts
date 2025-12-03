import { useMemo, useState, useEffect } from 'react';

import {
  BirthdateSelection,
  Gender,
  NationalityOption,
  SignupFormValues,
  SignupStep,
  TermsState,
  UserRole,
} from '../types';
import { fetchNationalities, signup } from '../api';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuth';

// Default nationalities list (from schema.sql)
const getDefaultNationalities = (): NationalityOption[] => [
  { code: 'KR', label: '대한민국 (South Korea)', phone_code: '+82' },
  { code: 'US', label: 'United States', phone_code: '+1' },
  { code: 'CA', label: 'Canada', phone_code: '+1' },
  { code: 'JP', label: '日本 (Japan)', phone_code: '+81' },
  { code: 'CN', label: '中国 (China)', phone_code: '+86' },
  { code: 'VN', label: 'Việt Nam (Vietnam)', phone_code: '+84' },
  { code: 'TH', label: 'ประเทศไทย (Thailand)', phone_code: '+66' },
  { code: 'PH', label: 'Philippines', phone_code: '+63' },
  { code: 'ID', label: 'Indonesia', phone_code: '+62' },
  { code: 'MY', label: 'Malaysia', phone_code: '+60' },
  { code: 'SG', label: 'Singapore', phone_code: '+65' },
  { code: 'TW', label: '台灣 (Taiwan)', phone_code: '+886' },
  { code: 'HK', label: '香港 (Hong Kong)', phone_code: '+852' },
  { code: 'MO', label: '澳門 (Macau)', phone_code: '+853' },
  { code: 'IN', label: 'India', phone_code: '+91' },
  { code: 'BD', label: 'Bangladesh', phone_code: '+880' },
  { code: 'PK', label: 'Pakistan', phone_code: '+92' },
  { code: 'NP', label: 'Nepal', phone_code: '+977' },
  { code: 'LK', label: 'Sri Lanka', phone_code: '+94' },
  { code: 'MM', label: 'Myanmar', phone_code: '+95' },
  { code: 'KH', label: 'Cambodia', phone_code: '+855' },
  { code: 'LA', label: 'Laos', phone_code: '+856' },
  { code: 'MN', label: 'Mongolia', phone_code: '+976' },
  { code: 'KZ', label: 'Kazakhstan', phone_code: '+7' },
  { code: 'UZ', label: 'Uzbekistan', phone_code: '+998' },
  { code: 'RU', label: 'Russia', phone_code: '+7' },
  { code: 'AU', label: 'Australia', phone_code: '+61' },
  { code: 'NZ', label: 'New Zealand', phone_code: '+64' },
  { code: 'GB', label: 'United Kingdom', phone_code: '+44' },
  { code: 'FR', label: 'France', phone_code: '+33' },
  { code: 'DE', label: 'Germany', phone_code: '+49' },
];

const INITIAL_TERMS: TermsState = {
  all: false,
  tosRequired: false,
  privacyRequired: false,
  smsOptional: false,
  marketingOptional: false,
};

const INITIAL_VALUES: SignupFormValues = {
  role: null,
  name: '',
  phone: '',
  password: '',
  birthdate: '',
  gender: null,
  nationalityCode: null,
  terms: INITIAL_TERMS,
};

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: currentYear - 1950 + 1 }, (_, idx) => 1950 + idx); // 1950 - 현재
const MONTHS = Array.from({ length: 12 }, (_, idx) => idx + 1);

const getDays = (year: number, month: number) => {
  const lastDay = new Date(year, month, 0).getDate();
  return Array.from({ length: lastDay }, (_, idx) => idx + 1);
};

export function useSignupWizard() {
  const navigate = useNavigate();
  const { setUserMode } = useAuthStore();
  const [step, setStep] = useState<SignupStep>(1);
  const [values, setValues] = useState<SignupFormValues>(INITIAL_VALUES);
  const [birthdateSheetOpen, setBirthdateSheetOpen] = useState(false);
  const [nationalities, setNationalities] = useState<NationalityOption[]>([]);
  const [loadingNationalities, setLoadingNationalities] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const today = new Date();
  const [birthdateSelection, setBirthdateSelection] = useState<BirthdateSelection>({
    year: 2000, // 기본값 2000년
    month: today.getMonth() + 1,
    day: today.getDate(),
  });

  // Load nationalities on mount
  useEffect(() => {
    const loadNationalities = async () => {
      setLoadingNationalities(true);
      try {
        const data = await fetchNationalities();
        console.log('국적 목록 로드 성공:', data);
        if (data && data.length > 0) {
          setNationalities(data);
        } else {
          // 빈 배열이면 기본값 사용
          console.warn('국적 목록이 비어있습니다. 기본값을 사용합니다.');
          setNationalities(getDefaultNationalities());
        }
      } catch (error) {
        console.error('Failed to load nationalities:', error);
        // Fallback to default nationalities
        setNationalities(getDefaultNationalities());
      } finally {
        setLoadingNationalities(false);
      }
    };
    loadNationalities();
  }, []);

  const isStep1Complete = values.role !== null;
  const isStep2Complete =
    values.name.trim().length > 0 &&
    /^[0-9]{8,}$/.test(values.phone) &&
    values.password.length >= 6 &&
    Boolean(values.birthdate) &&
    values.gender !== null &&
    Boolean(values.nationalityCode);

  const isStep4Complete = values.terms.tosRequired && values.terms.privacyRequired;

  const selectRole = (role: UserRole) => {
    setValues((prev) => ({ ...prev, role }));
    setStep(2);
  };

  const handleInputChange = (
    field: Exclude<keyof SignupFormValues, 'terms'>,
    value: string,
  ) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const handlePhoneChange = (value: string) => {
    const digits = value.replace(/\D/g, '');
    handleInputChange('phone', digits);
  };

  const handleGenderSelect = (gender: Gender) => {
    setValues((prev) => ({ ...prev, gender }));
  };

  const handleNationalitySelect = (code: string) => {
    setValues((prev) => ({ ...prev, nationalityCode: code }));
  };

  const openBirthdateSheet = () => setBirthdateSheetOpen(true);
  const closeBirthdateSheet = () => setBirthdateSheetOpen(false);

  const handleBirthdatePick = (selection: BirthdateSelection) => {
    const availableDays = getDays(selection.year, selection.month);
    const adjustedDay = Math.min(selection.day, availableDays.length);
    setBirthdateSelection({ ...selection, day: adjustedDay });
  };

  const confirmBirthdate = () => {
    const { year, month, day } = birthdateSelection;
    const formatted = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setValues((prev) => ({ ...prev, birthdate: formatted }));
    closeBirthdateSheet();
  };

  const toggleTerms = (key: keyof TermsState) => {
    setValues((prev) => {
      let nextTerms: TermsState;
      if (key === 'all') {
        const nextValue = !prev.terms.all;
        nextTerms = {
          all: nextValue,
          tosRequired: nextValue,
          privacyRequired: nextValue,
          smsOptional: nextValue,
          marketingOptional: nextValue,
        };
      } else {
        nextTerms = { ...prev.terms, [key]: !prev.terms[key] };
        const allChecked =
          nextTerms.tosRequired &&
          nextTerms.privacyRequired &&
          nextTerms.smsOptional &&
          nextTerms.marketingOptional;
        nextTerms.all = allChecked;
      }
      return { ...prev, terms: nextTerms };
    });
  };

  const goNext = async () => {
    console.log('goNext 호출:', { step, isStep1Complete, isStep2Complete, isStep4Complete, values });
    
    if (step === 1 && isStep1Complete) {
      console.log('Step 1 → Step 2 이동');
      setStep(2);
    } else if (step === 2 && isStep2Complete) {
      console.log('Step 2 → Step 4 이동');
      setStep(4);
    } else if (step === 4 && isStep4Complete) {
      setSubmitting(true);
      try {
        console.log('회원가입 시작:', values);
        const response = await signup(values);
        console.log('회원가입 성공:', response);
        // 회원가입 완료 후 user_id와 이름을 localStorage에 저장
        localStorage.setItem('signup_user_id', response.id);
        localStorage.setItem('signup_user_name', values.name);
        
        // role에 따라 올바른 홈으로 리다이렉트 및 userMode 설정
        if (values.role === 'employer') {
          console.log('고용주 홈으로 이동합니다...');
          setUserMode('employer');
          navigate('/employer/home');
        } else {
          // 구직자는 온보딩 후 홈으로 이동
          console.log('온보딩 페이지로 이동합니다...');
          setUserMode('jobseeker');
          navigate('/onboarding');
        }
      } catch (error) {
        console.error('회원가입 에러:', error);
        const errorMessage = error instanceof Error ? error.message : '회원가입에 실패했습니다.';
        alert(errorMessage);
      } finally {
        setSubmitting(false);
      }
    } else {
      console.log('다음 단계로 이동할 수 없습니다:', { 
        step, 
        isStep1Complete, 
        isStep2Complete, 
        isStep4Complete,
        step2Details: {
          name: values.name,
          phone: values.phone,
          birthdate: values.birthdate,
          gender: values.gender,
          nationalityCode: values.nationalityCode,
        }
      });
    }
  };

  const goPrev = () => {
    if (step === 2) {
      setStep(1);
    } else if (step === 4) {
      setStep(2);
    }
  };

  const canProceed = useMemo(() => {
    if (step === 1) return isStep1Complete;
    if (step === 2) return isStep2Complete;
    if (step === 4) return isStep4Complete;
    return true;
  }, [isStep1Complete, isStep2Complete, isStep4Complete, step]);

  const birthdateDisplay = values.birthdate
    ? values.birthdate.replace(/-/g, '.')
    : '생년월일을 선택해 주세요';

  const days = useMemo(
    () => getDays(birthdateSelection.year, birthdateSelection.month),
    [birthdateSelection.year, birthdateSelection.month],
  );

  return {
    step,
    values,
    selectRole,
    handleInputChange,
    handlePhoneChange,
    handleGenderSelect,
    handleNationalitySelect,
    goNext,
    goPrev,
    canProceed,
    openBirthdateSheet,
    closeBirthdateSheet,
    birthdateSheetOpen,
    confirmBirthdate,
    birthdateSelection,
    handleBirthdatePick,
    birthdateDisplay,
    toggleTerms,
    nationalities,
    loadingNationalities,
    submitting,
    years: YEARS,
    months: MONTHS,
    days,
  };
}

