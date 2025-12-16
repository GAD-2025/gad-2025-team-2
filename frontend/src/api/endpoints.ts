import apiClient from './client';
import type {
  Job,
  Application,
  JobSeeker,
  Employer,
  Message,
  Conversation,
  LearningProgress,
  User,
} from '@/types';

// Read Vite env safely — cast import.meta to any if types are missing in the project
const API_BASE_URL = ((import.meta as any).env?.VITE_API_BASE_URL as string) || 'http://localhost:8000';

// Auth
export const authAPI = {
  signin: (email: string, password: string) =>
    apiClient.post<{ user: User; token: string }>('/auth/signin', { email, password }),
  signIn: (data: { identifier: string; password: string; role: string }) =>
    apiClient.post<{ user_id: string; token: string; profile_photo?: string; role: string; name: string }>('/auth/signin/new', data),
  signup: (email: string, password: string, role: string) =>
    apiClient.post<{ user: User; token: string }>('/auth/signup', { email, password, role }),
};

// Jobs
export const jobsAPI = {
  list: (params?: {
    query?: string;
    location?: string;
    industry?: string;
    languageLevel?: string;
    visaType?: string;
    store_id?: string;
    user_id?: string;
    sort?: string;
    limit?: number;
    offset?: number;
  }) => apiClient.get<Job[]>('/jobs', { params }),
  get: (id: string) => apiClient.get<Job>(`/jobs/${id}`),
};

// Applications
export const applicationsAPI = {
  create: (seekerId: string, jobId: string) =>
    apiClient.post<Application>('/applications', { seekerId, jobId }),
  list: (seekerId?: string, jobId?: string, employerId?: string, userId?: string) =>
    apiClient.get<Application[]>('/applications', { params: { seekerId, jobId, employerId, userId } }),
  update: (id: string, status: string) =>
    apiClient.patch<Application>(`/applications/${id}`, { status }),
  updateInterviewProposal: (id: string, data: {
    selectedDates: string[];
    time?: string;
    duration?: number;
    message?: string;
    allDatesSame: boolean;
    allDatesTimeSlots?: Array<{ time: string; duration: number }>;
    dateSpecificTimes?: Record<string, Array<{ time: string; duration: number }>>;
    isConfirmed: boolean;
  }) =>
    apiClient.post(`/applications/${id}/interview-proposal`, data),
  updateAcceptanceGuide: (id: string, data: {
    documents: string[];
    workAttire: string[];
    workNotes: string[];
    firstWorkDate?: string;
    firstWorkTime?: string;
    coordinationMessage?: string;
  }) =>
    apiClient.post(`/applications/${id}/acceptance-guide`, data),
  updateFirstWorkDate: (id: string, data: {
    firstWorkDate: string;
    firstWorkTime?: string;
    coordinationMessage?: string;
  }) =>
    apiClient.post(`/applications/${id}/first-work-date`, data),
  addCoordinationMessage: (id: string, data: {
    message: string;
    type?: string;
  }) =>
    apiClient.post(`/applications/${id}/coordination-message`, data),
  confirmWorkDate: (id: string, confirmed: boolean) =>
    apiClient.post(`/applications/${id}/confirm-work-date`, { confirmed }),
};

// Users
export const usersAPI = {
  getJobSeeker: (id: string) => apiClient.get<JobSeeker>(`/jobseekers/${id}`),
  getEmployer: (id: string) => apiClient.get<Employer>(`/employers/${id}`),
};

// Conversations
export const conversationsAPI = {
  list: (userId: string) => apiClient.get<Conversation[]>(`/conversations/${userId}`),
};

// Messages
export const messagesAPI = {
  list: (conversationId: string, cursor?: string, limit?: number) =>
    apiClient.get<{ messages: Message[]; nextCursor?: string }>(
      `/conversations/${conversationId}/messages`,
      { params: { cursor, limit } }
    ),
  send: (conversationId: string, senderId: string, text: string) =>
    apiClient.post<Message>('/messages', { conversationId, senderId, text }),
  markRead: (messageId: string) =>
    apiClient.post('/messages/read', { messageId }),
};

// Translate
export const translateAPI = {
  translate: (messageId: string, text: string, targetLang: string) =>
    apiClient.post<{ translatedText: string }>('/translate', { messageId, text, targetLang }),
};

// Learning
export const learningAPI = {
  getSummary: (seekerId: string) =>
    apiClient.get<LearningProgress>('/learning/summary', { params: { seekerId } }),
  submitLevelTest: (seekerId: string, answers: any) =>
    apiClient.post('/leveltest', { seekerId, answers }),
};

// Signup User & Profile (for MyPage)
export interface SignupUserData {
  id: string;
  role: string;
  name: string;
  email: string | null;
  phone: string | null;  // Optional for employers
  birthdate: string | null;  // Optional for employers
  gender: string | null;  // Optional for employers
  nationality_code: string | null;  // Optional for employers
  nationality_name: string | null;
  created_at: string;
}

export interface JobSeekerProfileData {
  id: string;
  user_id: string;
  name?: string | null;
  phone?: string | null;
  nationality_code?: string | null;
  birthdate?: string | null;
  basic_info_file_name: string | null;
  preferred_regions: string[];
  preferred_jobs: string[];
  work_available_dates: string[];
  work_start_time: string | null;
  work_end_time: string | null;
  work_days_of_week: string[];
  experience_sections: string[];  // Added
  experience_career: string | null;  // Added
  experience_license: string | null;  // Added
  experience_skills: string | null;  // Added
  experience_introduction: string | null;  // Added
  created_at: string;
  updated_at: string;
}

export interface JobSeekerProfileUpsertPayload {
  user_id: string;
  basic_info_file_name?: string | null;
  preferred_regions: string[];
  preferred_jobs: string[];
  work_schedule?: {
    available_dates: string[];
    start_time?: string | null;
    end_time?: string | null;
    days_of_week: string[];
  } | null;
  experience?: {
    sections: string[];
    data: Record<string, any>;
  } | null;
  visa_type?: string | null;
}

export async function getSignupUser(userId: string): Promise<SignupUserData> {
  const response = await fetch(`${API_BASE_URL}/auth/signup-user/${userId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch user data');
  }
  return response.json();
}

export async function getJobSeekerProfile(userId: string): Promise<JobSeekerProfileData> {
  try {
    const response = await fetch(`${API_BASE_URL}/job-seeker/profile/${userId}`);
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Profile not found');
      }
      throw new Error(`Failed to fetch profile data: ${response.status} ${response.statusText}`);
    }
    return response.json();
  } catch (error) {
    console.error('[ERROR] getJobSeekerProfile failed:', error);
    throw error;
  }
}

export const jobSeekerProfileAPI = {
  upsert: (payload: JobSeekerProfileUpsertPayload) =>
    apiClient.post<JobSeekerProfileData>('/job-seeker/profile', payload),
};

// Employer profile (used by MyPage fallback when stores are not available)
export interface EmployerProfileData {
  id: string;
  user_id: string;
  business_type: string | null;
  company_name: string | null;
  address: string | null;
  address_detail: string | null;
  business_license?: string | null;
  is_verified?: boolean;
  created_at: string;
  updated_at: string;
}

export async function getEmployerProfile(userId: string): Promise<EmployerProfileData> {
  const response = await fetch(`${API_BASE_URL}/employer/profile/${userId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch employer profile');
  }
  return response.json();
}

export interface EmployerProfileCreatePayload {
  user_id: string;
  business_type: string;
  company_name: string;
  address: string;
  address_detail?: string;
  business_license?: string;
}

export const employerProfileAPI = {
  get: getEmployerProfile,
  update: (payload: EmployerProfileCreatePayload) =>
    apiClient.post<EmployerProfileData>('/employer/profile', payload),
};

export interface JobSeekerListItem {
  id: string;
  user_id: string;
  name: string;
  phone?: string | null;
  nationality: string;
  birthdate: string | null;
  preferred_regions: string[];
  preferred_jobs: string[];
  work_available_dates: string[];
  work_start_time: string | null;
  work_end_time: string | null;
  work_days_of_week: string[];
  experience_skills: string | null;
  experience_introduction: string | null;
  created_at: string;
}

export async function listJobSeekers(
  limit: number = 50,
  params?: { visa_type?: string },
): Promise<JobSeekerListItem[]> {
  const qs = new URLSearchParams();
  qs.set('limit', String(limit));
  if (params?.visa_type) qs.set('visa_type', params.visa_type);

  const response = await fetch(`${API_BASE_URL}/job-seeker/profiles?${qs.toString()}`);

  // 배포 서버에 해당 엔드포인트가 없거나 404인 경우, 빈 목록으로 처리해 UI가 깨지지 않도록 함
  if (response.status === 404) {
    console.warn('job-seeker/profiles endpoint not found, returning empty list.');
    return [];
  }

  if (!response.ok) {
    throw new Error('Failed to fetch job seekers');
  }
  return response.json();
}

// Store (매장) API
export interface StoreData {
  id: string;
  user_id: string;
  is_main: boolean;
  store_name: string;
  address: string;
  address_detail: string | null;
  phone: string;
  industry: string;
  business_license: string | null;
  management_role: string;
  store_type: string;
  created_at: string;
  updated_at: string;
}

export interface StoreCreatePayload {
  user_id: string;
  store_name: string;
  address: string;
  address_detail?: string;
  phone: string;
  industry: string;
  business_license?: string;
  management_role: string;
  store_type: string;
  is_main?: boolean;
}

export async function getStores(userId: string): Promise<StoreData[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/employer/stores/${userId}`);
    if (!response.ok) {
      // 404이거나 다른 에러인 경우 빈 배열 반환
      console.warn(`Failed to fetch stores for user ${userId}: ${response.status} ${response.statusText}`);
      return [];
    }
    const stores = await response.json();
    console.log(`Loaded ${stores.length} stores for user ${userId}:`, stores);
    return stores;
  } catch (error) {
    console.error(`Error fetching stores for user ${userId}:`, error);
    return [];
  }
}

export async function getStore(userId: string, storeId: string): Promise<StoreData> {
  const response = await fetch(`${API_BASE_URL}/employer/stores/${userId}/${storeId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch store');
  }
  return response.json();
}

export async function updateStore(userId: string, storeId: string, payload: StoreCreatePayload): Promise<StoreData> {
  try {
    const url = `${API_BASE_URL}/employer/stores/${userId}/${storeId}`;
    console.log('Updating store with payload:', payload);
    
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { detail: '매장 수정에 실패했습니다' };
      }
      const errorMessage = errorData.detail || '매장 수정에 실패했습니다';
      throw new Error(errorMessage);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Store update error:', error);
    throw error;
  }
}

export async function createStore(payload: StoreCreatePayload): Promise<StoreData> {
  try {
    const url = `${API_BASE_URL}/employer/stores`;
    console.log('Creating store with payload:', payload);
    console.log('API URL:', url);
    console.log('API_BASE_URL:', API_BASE_URL);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    
    console.log('Response status:', response.status, response.statusText);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      let errorData;
      try {
        const text = await response.text();
        console.error('Response body (text):', text);
        errorData = JSON.parse(text);
      } catch (e) {
        errorData = { detail: `매장 등록에 실패했습니다 (${response.status} ${response.statusText})` };
      }
      
      const errorMessage = errorData.detail || errorData.message || `매장 등록 실패 (${response.status})`;
      console.error('Store creation failed:', {
        status: response.status,
        statusText: response.statusText,
        errorMessage,
        errorData,
        url,
      });
      
      // 404 에러인 경우 특별한 메시지 제공
      if (response.status === 404) {
        throw new Error('매장 등록 API 엔드포인트를 찾을 수 없습니다. 서버 관리자에게 문의하세요.');
      }
      
      throw new Error(errorMessage);
    }
    
    const result = await response.json();
    console.log('Store created successfully:', result);
    return result;
  } catch (error) {
    console.error('Error in createStore:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('매장 등록 중 알 수 없는 오류가 발생했습니다.');
  }
}

export default {
  auth: authAPI,
  jobs: jobsAPI,
  applications: applicationsAPI,
  users: usersAPI,
  conversations: conversationsAPI,
  messages: messagesAPI,
  translate: translateAPI,
  learning: learningAPI,
};

// Profile API
export interface ProfileData {
  name: string;
  email: string | null;
  phone: string | null;
  nationality_code: string | null;
  birthdate: string | null;
  visaType: string | null;
  languageLevel: string | null;
  location: string | null;
  skills: string[];
  bio: string | null;
}

export const profileAPI = {
  get: () => apiClient.get<ProfileData>('/profile/me'),
  update: (data: ProfileData) => apiClient.put<ProfileData>('/profile/me', data),
};