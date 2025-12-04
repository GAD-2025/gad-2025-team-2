const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export interface WorkSchedulePayload {
  available_dates?: string[]; // 'YYYY-MM-DD'
  start_time?: string | null; // 'HH:mm'
  end_time?: string | null; // 'HH:mm'
  days_of_week?: string[]; // ['MON', 'TUE', ...] or ['월', '화', ...]
}

export interface ExperiencePayload {
  sections: string[]; // ['career', 'license', 'skills', 'introduction']
  data: {
    career?: string;
    license?: string;
    skills?: string;
    introduction?: string;
  };
}

export interface JobSeekerProfileCreate {
  user_id: string;
  basic_info_file_name?: string | null;
  preferred_regions: string[];
  preferred_jobs: string[];
  work_schedule?: WorkSchedulePayload;
  experience?: ExperiencePayload;
}

export interface JobSeekerProfileResponse {
  id: string;
  user_id: string;
  basic_info_file_name: string | null;
  preferred_regions: string[];
  preferred_jobs: string[];
  work_available_dates: string[];
  work_start_time: string | null;
  work_end_time: string | null;
  work_days_of_week: string[];
  created_at: string;
  updated_at: string;
}

export async function createJobSeekerProfile(
  payload: JobSeekerProfileCreate
): Promise<JobSeekerProfileResponse> {
  const response = await fetch(`${API_BASE_URL}/job-seeker/profile`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      detail: '프로필 저장에 실패했습니다.',
    }));
    throw new Error(error.detail || '프로필 저장에 실패했습니다.');
  }

  return response.json();
}

export async function getJobSeekerProfile(
  userId: string
): Promise<JobSeekerProfileResponse> {
  const response = await fetch(`${API_BASE_URL}/job-seeker/profile/${userId}`);

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      detail: '프로필을 불러올 수 없습니다.',
    }));
    throw new Error(error.detail || '프로필을 불러올 수 없습니다.');
  }

  return response.json();
}

