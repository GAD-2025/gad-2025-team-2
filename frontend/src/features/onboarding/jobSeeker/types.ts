export type OnboardingStep = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export interface WorkSchedule {
  availableDates: string[]; // 'YYYY-MM-DD'
  startTime: string | null; // 'HH:mm'
  endTime: string | null; // 'HH:mm'
  daysOfWeek: string[]; // ['월', '화', ...] 또는 ['MON', 'TUE', ...]
}

export interface ExperienceData {
  career: string;
  license: string;
  skills: string;
  introduction: string;
}

export interface OnboardingFormValues {
  // Step 2: Basic Info Upload
  uploadedFiles: File[];
  // Step 3: Preferred Region
  preferredRegions: string[];
  // Step 4: Preferred Job
  preferredJobs: string[];
  // Step 5-6: Work Schedule
  workSchedule: WorkSchedule;
  // Step 7-10: Experience Details
  experienceData: ExperienceData;
}

export interface JobCategory {
  id: string;
  label: string;
  icon?: string;
}

