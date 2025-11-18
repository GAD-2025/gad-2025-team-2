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
  birthdate: '',
  gender: null,
  nationalityCode: null,
  terms: INITIAL_TERMS,
};

const YEARS = Array.from({ length: 31 }, (_, idx) => 1990 + idx); // 1990-2020
const MONTHS = Array.from({ length: 12 }, (_, idx) => idx + 1);

const getDays = (year: number, month: number) => {
  const lastDay = new Date(year, month, 0).getDate();
  return Array.from({ length: lastDay }, (_, idx) => idx + 1);
};

export function useSignupWizard() {
  const [step, setStep] = useState<SignupStep>(1);
  const [values, setValues] = useState<SignupFormValues>(INITIAL_VALUES);
  const [birthdateSheetOpen, setBirthdateSheetOpen] = useState(false);
  const [nationalities, setNationalities] = useState<NationalityOption[]>([]);
  const [loadingNationalities, setLoadingNationalities] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const today = new Date();
  const [birthdateSelection, setBirthdateSelection] = useState<BirthdateSelection>({
    year: YEARS.includes(2000) ? 2000 : YEARS[Math.floor(YEARS.length / 2)],
    month: today.getMonth() + 1,
    day: today.getDate(),
  });

  // Load nationalities on mount
  useEffect(() => {
    const loadNationalities = async () => {
      setLoadingNationalities(true);
      try {
        const data = await fetchNationalities();
        setNationalities(data);
      } catch (error) {
        console.error('Failed to load nationalities:', error);
        // Fallback to default nationalities
        setNationalities([
          { code: 'KR', label: '대한민국' },
          { code: 'JP', label: '일본' },
          { code: 'US', label: 'United States' },
        ]);
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
    if (step === 1 && isStep1Complete) {
      setStep(2);
    } else if (step === 2 && isStep2Complete) {
      setStep(4);
    } else if (step === 4 && isStep4Complete) {
      setSubmitting(true);
      try {
        const response = await signup(values);
        alert(`${response.name}님, ${response.message}`);
        // Optionally redirect to success page or home
        window.location.href = '/';
      } catch (error) {
        alert(error instanceof Error ? error.message : '회원가입에 실패했습니다.');
      } finally {
        setSubmitting(false);
      }
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

