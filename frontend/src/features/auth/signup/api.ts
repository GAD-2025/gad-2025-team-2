import { SignupFormValues, NationalityOption } from './types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

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
  try {
    const response = await fetch(`${API_BASE_URL}/meta/nationalities`);
    if (!response.ok) {
      throw new Error('Failed to fetch nationalities');
    }
    const data = await response.json();
    return data.map((item: { code: string; name: string; phone_code: string }) => ({
      code: item.code,
      label: item.name,
      phone_code: item.phone_code,
    }));
  } catch (error) {
    console.error('국적 목록 로드 실패:', error);
    // 백엔드가 실행되지 않았을 때 기본값 반환
    return [
      { code: 'US', label: 'United States / Canada', phone_code: '+1' },
      { code: 'KR', label: '대한민국 (South Korea)', phone_code: '+82' },
      { code: 'JP', label: '日本 (Japan)', phone_code: '+81' },
      { code: 'CN', label: '中国 (China)', phone_code: '+86' },
      { code: 'VN', label: 'Việt Nam (Vietnam)', phone_code: '+84' },
    ];
  }
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

  console.log('API 호출:', `${API_BASE_URL}/auth/signup`, signupPayload);

  const response = await fetch(`${API_BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(signupPayload),
  });

  console.log('API 응답 상태:', response.status, response.statusText);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Signup failed' }));
    console.error('API 에러 상세:', JSON.stringify(error, null, 2));
    const errorMessage = error.detail || (Array.isArray(error) ? error.map((e: any) => e.msg || e.message).join(', ') : 'Signup failed');
    throw new Error(errorMessage);
  }

  const result = await response.json();
  console.log('API 성공:', result);
  return result;
}

