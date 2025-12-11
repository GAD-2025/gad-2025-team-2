// Shared types for WorkFair application

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface Experience {
  role: string;
  years: number;
  tags: string[];
}

export interface Preferences {
  industries: string[];
  wageRange: {
    min: number;
    max: number;
  };
  area: string;
  radiusKm: number;
  preferDays: string[];
}

export interface JobSeeker {
  id: string; // profile id
  userId?: string; // signup_user id
  name: string;
  nationality: string;
  nationalityCode?: string;
  birthdate?: string | null;
  phone: string;
  languageLevel: string;
  visaType: string;
  availability: string;
  location?: GeoPoint;
  age?: number | null;
  experience: Experience[];
  preferences: Preferences;
}

export interface Employer {
  id: string;
  businessNo?: string;
  shopName: string;
  industry: string;
  address: string;
  location?: GeoPoint;
  openHours?: string;
  contact?: string;
  phone?: string;
  media?: string[];
  minLanguageLevel?: string;
  needVisa?: string[];
  baseWage?: number;
  schedule?: string;
  rating?: number;
}

export type ApplicationStatus = 'applied' | 'hired' | 'rejected';

export interface Application {
  applicationId: string;
  seekerId: string;
  jobId: string;
  status: ApplicationStatus;
  appliedAt: string;
  updatedAt: string;
  hiredAt?: string;
}

export interface Job {
  id: string;
  employerId?: string;
  title: string;
  employer: Employer;
  description: string;
  category?: string;
  wage: number;
  workDays: string | string[];
  workHours: string;
  deadline: string;
  positions: number;
  requiredLanguage: string;
  requiredVisa: string[];
  benefits?: string;
  employerMessage?: string;
  createdAt?: string;
  postedAt?: string;
  location?: string;
  status?: 'active' | 'paused' | 'closed';
  views?: number;
  applications?: number;
  applicationsCount?: number;
  isTrusted?: boolean;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  translatedText?: string;
  timestamp: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  participants: string[];
  lastMessage?: Message;
  updatedAt: string;
}

export interface LearningProgress {
  seekerId: string;
  currentLevel: string;
  completedLessons: number;
  totalLessons: number;
  progressPercent: number;
}

export interface User {
  id: string;
  email: string;
  phone?: string | null;
  role: 'jobseeker' | 'employer';
  profile: JobSeeker | Employer;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface FilterState {
  languageLevel: string[];
  location: string[];
  experience: string[];
  workConditions: string[];
}

