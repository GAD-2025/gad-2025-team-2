import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export interface EmployerSignupData {
  name: string;
  email: string;
  businessType: 'business' | 'individual' | '';
  companyName: string;
  address: string;
  addressDetail: string;
  noDetailAddress: boolean;
}

export function useEmployerSignupWizard() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(false);

  const [formData, setFormData] = useState<EmployerSignupData>({
    name: '',
    email: '',
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
    
    if (step < 4) {
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
      updateFormData({ companyName: 'Test Company' });
    }
    if (step === 4 && !formData.address) {
      updateFormData({ 
        address: '서울특별시 강남구 테헤란로 123',
        addressDetail: '1층',
      });
    }
    
    if (step < 4) {
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
      const response = await fetch('http://localhost:8000/auth/signup/employer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          business_type: formData.businessType,
          company_name: formData.companyName,
          address: formData.address,
          address_detail: formData.addressDetail,
        }),
      });

      if (!response.ok) {
        throw new Error('회원가입에 실패했습니다.');
      }

      const data = await response.json();
      console.log('고용주 회원가입 성공:', data);
      
      // Store user ID for later use
      localStorage.setItem('signup_user_id', data.id);
      
      // 회원가입 완료 후 홈으로 이동
      navigate('/employer/home');
    } catch (error) {
      console.error('고용주 회원가입 실패:', error);
      alert('회원가입에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.name.length >= 2 && formData.email.includes('@');
      case 2:
        return formData.businessType !== '';
      case 3:
        return formData.companyName.length > 0;
      case 4:
        return formData.address.length > 0 && (formData.addressDetail.length > 0 || formData.noDetailAddress);
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

