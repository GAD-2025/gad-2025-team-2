// 고용주 회원가입 API 함수들

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export interface EmployerSignupPayload {
  role: 'employer';
  name: string;
  email: string;
  password: string;
  business_type?: string;
  company_name?: string;
  address?: string;
  address_detail?: string;
}

export interface EmployerSignupResponse {
  id: string;
  role: string;
  name: string;
  email: string;
  message?: string;
}

export async function signupEmployer(
  payload: EmployerSignupPayload,
): Promise<EmployerSignupResponse> {
  console.log('고용주 회원가입 API 호출:', `${API_BASE_URL}/auth/signup`, payload);

  try {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        role: payload.role,
        name: payload.name,
        email: payload.email,
        password: payload.password,
        phone: '',
        birthdate: new Date().toISOString().split('T')[0],
        gender: 'male',
        nationality_code: null,
        terms: {
          tos_required: true,
          privacy_required: true,
          sms_optional: false,
          marketing_optional: false,
        },
        business_type: payload.business_type || '',
        company_name: payload.company_name || '',
        address: payload.address || '',
        address_detail: payload.address_detail || '',
      }),
    });

    console.log('API 응답 상태:', response.status, response.statusText);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: '회원가입에 실패했습니다.' }));
      console.error('API 에러 상세:', JSON.stringify(error, null, 2));
      const errorMessage =
        error.detail ||
        (Array.isArray(error)
          ? error.map((e: any) => e.msg || e.message).join(', ')
          : '회원가입에 실패했습니다.');
      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log('API 성공:', result);
    return result;
  } catch (error) {
    console.error('고용주 회원가입 에러:', error);
    throw error;
  }
}



