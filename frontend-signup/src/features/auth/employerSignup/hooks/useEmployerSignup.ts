import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { EmployerSignupStep, EmployerSignupState } from '../types';
import { signupEmployer } from '../api';

const INITIAL_STATE: EmployerSignupState = {
  name: '',
  email: '',
  hasAgreedRules: false,
};

export function useEmployerSignup() {
  const router = useRouter();
  const [step, setStep] = useState<EmployerSignupStep>(1);
  const [state, setState] = useState<EmployerSignupState>(INITIAL_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const goNext = () => {
    if (step < 3) {
      setStep((prev) => (prev + 1) as EmployerSignupStep);
    }
  };

  const goPrev = () => {
    if (step > 1) {
      setStep((prev) => (prev - 1) as EmployerSignupStep);
    }
  };

  const handleNameChange = (name: string) => {
    setState((prev) => ({ ...prev, name }));
    setError(null);
  };

  const handleEmailChange = (email: string) => {
    setState((prev) => ({ ...prev, email }));
    setError(null);
  };

  const handleNextFromInfo = () => {
    // 이름과 이메일 유효성 검증
    if (!state.name.trim()) {
      setError('이름을 입력해주세요.');
      return;
    }
    if (!state.email.trim()) {
      setError('이메일을 입력해주세요.');
      return;
    }
    // 간단한 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(state.email)) {
      setError('올바른 이메일 형식을 입력해주세요.');
      return;
    }
    setError(null);
    goNext(); // Step 2로 이동
  };

  const handleConfirmGoRules = () => {
    // "설정으로 이동하기" 또는 "다음에 할게요" 모두 Step 3으로 이동
    goNext();
  };

  const handleAgreeToRules = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await signupEmployer({
        role: 'employer',
        name: state.name,
        email: state.email,
      });

      console.log('고용주 회원가입 성공:', response);

      // 성공 시 고용주 홈으로 이동
      router.push('/employer/home?from=employerSignup');
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : '회원가입에 실패했습니다.';
      setError(errorMessage);
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    step,
    state,
    isSubmitting,
    error,
    goNext,
    goPrev,
    handleNameChange,
    handleEmailChange,
    handleNextFromInfo,
    handleConfirmGoRules,
    handleAgreeToRules,
  };
}

