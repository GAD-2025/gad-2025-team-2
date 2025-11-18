export type EmployerSignupStep = 1 | 2 | 3;

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
}

