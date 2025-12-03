export type EmployerSignupStep = 1 | 2 | 3 | 4 | 5 | 6;

export interface EmployerSignupFormValues {
  name: string;
  email: string;
  hasSeenWarning: boolean;
  hasAgreedToRules: boolean;
}

export interface EmployerSignupState {
  name: string;
  email: string;
  hasAgreedRules: boolean;
  companyInfo: EmployerCompanyInfo;
}

export type BusinessType = 'business_owner' | 'not_business_owner';

export interface EmployerCompanyInfo {
  businessType: BusinessType | null;
  companyName: string;
  baseAddress: string; // 기본 주소
  detailAddress: string; // 상세 주소
  hasNoDetailAddress: boolean;
}



