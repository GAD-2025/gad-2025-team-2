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
    limit?: number;
    offset?: number;
  }) => apiClient.get<Job[]>('/jobs', { params }),
  get: (id: string) => apiClient.get<Job>(`/jobs/${id}`),
};

// Applications
export const applicationsAPI = {
  create: (seekerId: string, jobId: string) =>
    apiClient.post<Application>('/applications', { seekerId, jobId }),
  list: (seekerId?: string, jobId?: string) =>
    apiClient.get<Application[]>('/applications', { params: { seekerId, jobId } }),
  update: (id: string, status: string) =>
    apiClient.patch<Application>(`/applications/${id}`, { status }),
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

export async function getSignupUser(userId: string): Promise<SignupUserData> {
  const response = await fetch(`${API_BASE_URL}/auth/signup-user/${userId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch user data');
  }
  return response.json();
}

export async function getJobSeekerProfile(userId: string): Promise<JobSeekerProfileData> {
  const response = await fetch(`${API_BASE_URL}/job-seeker/profile/${userId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch profile data');
  }
  return response.json();
}

export interface JobSeekerListItem {
  id: string;
  user_id: string;
  name: string;
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

export async function listJobSeekers(limit: number = 50, params?: { visa_type?: string }): Promise<JobSeekerListItem[]> {
  const qs = new URLSearchParams();
  qs.set('limit', String(limit));
  if (params?.visa_type) qs.set('visa_type', params.visa_type);
  const response = await fetch(`${API_BASE_URL}/job-seeker/profiles?${qs.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch job seekers');
  }
  return response.json();
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
