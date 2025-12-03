// 고용주 회원가입 API 함수들

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export interface EmployerSignupPayload {
  role: 'employer';
  name: string;
  email: string;
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
        // 고용주는 phone, birthdate 등이 필요 없을 수 있으므로
        // 백엔드에서 선택적으로 처리하도록 함
        phone: '',
        birthdate: new Date().toISOString().split('T')[0], // 오늘 날짜
        gender: 'male', // 기본값
        nationality_code: null, // 고용주는 국적 코드 불필요
        terms: {
          tos_required: true,
          privacy_required: true,
          sms_optional: false,
          marketing_optional: false,
        },
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



