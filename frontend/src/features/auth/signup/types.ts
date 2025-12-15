export type SignupStep = 1 | 2 | 3 | 4;

export type UserRole = 'job_seeker' | 'employer';

export type Gender = 'male' | 'female';

export interface TermsState {
  all: boolean;
  tosRequired: boolean;
  privacyRequired: boolean;
  smsOptional: boolean;
  marketingOptional: boolean;
}

export interface SignupFormValues {
  role: UserRole | null;
  name: string;
  phone: string;
  password: string;
  birthdate: string; // YYYY-MM-DD
  gender: Gender | null;
  nationalityCode: string | null;
  visaType: string;
  visaExpiry: string; // YYYY-MM-DD
  visaImageBase64?: string | null;
  terms: TermsState;
}

export interface BirthdateSelection {
  year: number;
  month: number;
  day: number;
}

export interface NationalityOption {
  code: string;
  label: string;
  phone_code: string;
}

