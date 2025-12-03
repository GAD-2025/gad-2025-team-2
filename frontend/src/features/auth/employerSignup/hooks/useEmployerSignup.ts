import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EmployerSignupStep, EmployerSignupState, EmployerCompanyInfo } from '../types';
import { signupEmployer } from '../api';

const INITIAL_COMPANY_INFO: EmployerCompanyInfo = {
  businessType: null,
  companyName: '',
  baseAddress: '',
  detailAddress: '',
  hasNoDetailAddress: false,
};

const INITIAL_STATE: EmployerSignupState = {
  name: '',
  email: '',
  hasAgreedRules: false,
  companyInfo: INITIAL_COMPANY_INFO,
};

export function useEmployerSignup() {
  const navigate = useNavigate();
  const [step, setStep] = useState<EmployerSignupStep>(1);
  const [state, setState] = useState<EmployerSignupState>(INITIAL_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const goNext = () => {
    if (step < 6) {
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

  const handleAgreeToRules = () => {
    // 규정 동의 후 회사 추가 단계로 이동 (Step 4)
    setStep(4);
  };

  // 회사 정보 핸들러들
  const setBusinessType = (type: 'business_owner' | 'not_business_owner' | null) => {
    setState((prev) => ({
      ...prev,
      companyInfo: { ...prev.companyInfo, businessType: type },
    }));
  };

  const setCompanyName = (name: string) => {
    setState((prev) => ({
      ...prev,
      companyInfo: { ...prev.companyInfo, companyName: name },
    }));
  };

  const setBaseAddress = (address: string) => {
    setState((prev) => ({
      ...prev,
      companyInfo: { ...prev.companyInfo, baseAddress: address },
    }));
  };

  const setDetailAddress = (address: string) => {
    setState((prev) => ({
      ...prev,
      companyInfo: { ...prev.companyInfo, detailAddress: address },
    }));
  };

  const toggleNoDetailAddress = () => {
    setState((prev) => ({
      ...prev,
      companyInfo: {
        ...prev.companyInfo,
        hasNoDetailAddress: !prev.companyInfo.hasNoDetailAddress,
        detailAddress: !prev.companyInfo.hasNoDetailAddress ? '' : prev.companyInfo.detailAddress,
      },
    }));
  };

  const handleSubmitCompanyInfo = async () => {
    setIsSubmitting(true);
    setError(null);

    // 검증
    if (!state.companyInfo.baseAddress.trim()) {
      setError('기본 주소를 입력해주세요.');
      setIsSubmitting(false);
      return;
    }

    if (!state.companyInfo.hasNoDetailAddress && !state.companyInfo.detailAddress.trim()) {
      setError('상세 주소를 입력해주세요.');
      setIsSubmitting(false);
      return;
    }

    try {
      // 먼저 고용주 계정 생성
      const signupResponse = await signupEmployer({
        role: 'employer',
        name: state.name,
        email: state.email,
      });

      console.log('고용주 회원가입 성공:', signupResponse);

      // TODO: 회사 정보 저장 API 호출 (나중에 구현)
      // await saveEmployerCompany({
      //   user_id: signupResponse.id,
      //   ...state.companyInfo,
      // });

      // 성공 시 고용주 홈으로 이동
      navigate('/employer/home?from=employerSignup');
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
    // 회사 정보 핸들러들
    setBusinessType,
    setCompanyName,
    setBaseAddress,
    setDetailAddress,
    toggleNoDetailAddress,
    handleSubmitCompanyInfo,
  };
}



