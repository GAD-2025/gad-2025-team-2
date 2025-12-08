import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuth';
import { signupEmployer } from '@/features/auth/employerSignup/api';

export interface EmployerSignupData {
  name: string;
  email: string;
  password: string;
  businessType: 'business' | 'individual' | '';
  companyName: string;
  address: string;
  addressDetail: string;
  noDetailAddress: boolean;
}

export function useEmployerSignupWizard() {
  const navigate = useNavigate();
  const { setUserMode } = useAuthStore();
  const [step, setStep] = useState(1);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(false);

  const [formData, setFormData] = useState<EmployerSignupData>({
    name: '',
    email: '',
    password: '',
    businessType: '',
    companyName: '',
    address: '',
    addressDetail: '',
    noDetailAddress: false,
  });

  const updateFormData = (updates: Partial<EmployerSignupData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const goNext = () => {
    // Step 1: 이름, 이메일 입력 후 알림 권한 팝업 표시
    if (step === 1 && !termsAgreed) {
      setShowNotificationModal(true);
      return;
    }
    
    if (step < 3) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  // Skip 기능 (개발자용) - 유효성 검사 우회
  const skipToNext = () => {
    if (step === 1 && !termsAgreed) {
      // 임시로 기본값 설정
      if (!formData.name) updateFormData({ name: 'Test' });
      if (!formData.email) updateFormData({ email: 'test@test.com' });
      setShowNotificationModal(true);
      return;
    }
    
    if (step === 2 && !formData.businessType) {
      updateFormData({ businessType: 'business' });
    }
    if (step === 3 && !formData.companyName) {
      updateFormData({ 
        companyName: 'Test Company',
        address: '서울특별시 강남구 테헤란로 123',
        addressDetail: '1층',
      });
    }
    
    if (step < 3) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const goPrev = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      navigate('/signup');
    }
  };

  // 알림 권한 팝업에서 "다음에 할게요" 클릭 시
  const handleNotificationSkip = () => {
    setShowNotificationModal(false);
    setShowTermsModal(true);
  };

  // 알림 권한 팝업에서 "설정으로 이동하기" 클릭 시
  const handleGoToSettings = () => {
    setShowNotificationModal(false);
    setShowTermsModal(true);
    // 실제로는 여기서 앱 설정으로 이동하는 로직이 들어갈 수 있음
  };

  // 약관 동의 팝업에서 "규정에 동의합니다" 클릭 시
  const handleTermsAgree = () => {
    setTermsAgreed(true);
    setShowTermsModal(false);
    setStep(2);
  };

  const handleSubmit = async () => {
    try {
      // addressDetail이 빈 문자열이면 undefined로 변환 (백엔드에서 None으로 처리)
      const addressDetail = formData.addressDetail && formData.addressDetail.trim() 
        ? formData.addressDetail 
        : undefined;
      
      // 회원가입 데이터 확인
      const signupPayload = {
        role: 'employer',
        name: formData.name,
        email: formData.email,
        password: formData.password,
        business_type: formData.businessType || 'business',
        company_name: formData.companyName,
        address: formData.address,
        address_detail: addressDetail,
      };
      console.log('회원가입 데이터:', signupPayload);
      
      const data = await signupEmployer(signupPayload);
      console.log('고용주 회원가입 성공:', data);
      
      // Store user ID for later use
      if (data?.id) {
        localStorage.setItem('signup_user_id', data.id);
        console.log('User ID saved to localStorage:', data.id);
      }
      
      // 고용주 모드로 설정
      setUserMode('employer');
      
      // 회원가입 완료 후 마이페이지로 이동하여 기본매장 확인
      navigate('/mypage');
    } catch (error) {
      console.error('고용주 회원가입 실패:', error);
      alert('회원가입에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.name.length >= 2 && formData.email.includes('@') && formData.password.length >= 6;
      case 2:
        // 사업자 등록증이 등록되어야 함 (businessType이 'business'여야 함)
        return formData.businessType === 'business';
      case 3:
        return formData.companyName.length > 0 && formData.address.length > 0 && (formData.addressDetail.length > 0 || formData.noDetailAddress);
      default:
        return false;
    }
  };

  return {
    step,
    formData,
    updateFormData,
    goNext,
    goPrev,
    skipToNext,
    canProceed,
    showNotificationModal,
    setShowNotificationModal,
    showTermsModal,
    setShowTermsModal,
    handleNotificationSkip,
    handleGoToSettings,
    handleTermsAgree,
  };
}

