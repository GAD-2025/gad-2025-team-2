import { SignupFormValues, NationalityOption } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

export interface SignupPayload {
  role: string;
  name: string;
  phone: string;
  birthdate: string;
  gender: string;
  nationality_code: string;
  terms: {
    tos_required: boolean;
    privacy_required: boolean;
    sms_optional: boolean;
    marketing_optional: boolean;
  };
}

export interface SignupResponse {
  id: string;
  role: string;
  name: string;
  message: string;
}

export async function fetchNationalities(): Promise<NationalityOption[]> {
  const response = await fetch(`${API_BASE_URL}/meta/nationalities`);
  if (!response.ok) {
    throw new Error('Failed to fetch nationalities');
  }
  const data = await response.json();
  return data.map((item: { code: string; name: string }) => ({
    code: item.code,
    label: item.name,
  }));
}

export async function signup(payload: SignupFormValues): Promise<SignupResponse> {
  const signupPayload: SignupPayload = {
    role: payload.role!,
    name: payload.name,
    phone: payload.phone,
    birthdate: payload.birthdate,
    gender: payload.gender!,
    nationality_code: payload.nationalityCode!,
    terms: {
      tos_required: payload.terms.tosRequired,
      privacy_required: payload.terms.privacyRequired,
      sms_optional: payload.terms.smsOptional,
      marketing_optional: payload.terms.marketingOptional,
    },
  };

  const response = await fetch(`${API_BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(signupPayload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Signup failed' }));
    throw new Error(error.detail || 'Signup failed');
  }

  return response.json();
}
