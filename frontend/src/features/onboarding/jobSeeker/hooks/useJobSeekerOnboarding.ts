import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { OnboardingStep, OnboardingFormValues } from '../types';
import { createJobSeekerProfile } from '../api';

const INITIAL_VALUES: OnboardingFormValues = {
  uploadedFiles: [],
  preferredRegions: [],
  preferredJobs: [],
  workSchedule: {
    availableDates: [],
    startTime: null,
    endTime: null,
    daysOfWeek: [],
  },
  experienceData: {
    career: '',
    license: '',
    skills: '',
    introduction: '',
  },
};

export function useJobSeekerOnboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState<OnboardingStep>(2); // Start from step 2 (profile photo upload)
  const [values, setValues] = useState<OnboardingFormValues>(INITIAL_VALUES);
  const [showStartInfoModal, setShowStartInfoModal] = useState(false); // Disable modal
  const [showStepIntroSheet, setShowStepIntroSheet] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const goNext = () => {
    if (step < 10) {
      setStep((prev) => (prev + 1) as OnboardingStep);
    }
  };

  const goPrev = () => {
    if (step > 2) { // Can't go back from step 2 (first step now)
      setStep((prev) => (prev - 1) as OnboardingStep);
    } else {
      // Go back to signup or home
      navigate('/signup');
    }
  };

  const handleFileUpload = async (files: File[]) => {
    setValues((prev) => ({ ...prev, uploadedFiles: files }));
    
    // 프로필 사진을 base64로 변환하여 localStorage에 저장
    if (files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        localStorage.setItem('profile_photo', base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRegionSelect = (regions: string[]) => {
    setValues((prev) => ({ ...prev, preferredRegions: regions }));
  };

  const handleJobToggle = (jobId: string) => {
    setValues((prev) => {
      const currentJobs = prev.preferredJobs;
      const isSelected = currentJobs.includes(jobId);
      return {
        ...prev,
        preferredJobs: isSelected
          ? currentJobs.filter((id) => id !== jobId)
          : [...currentJobs, jobId],
      };
    });
  };

  const handleStartInfoModalClose = (goToSettings: boolean) => {
    setShowStartInfoModal(false);
    if (goToSettings) {
      setShowStepIntroSheet(true);
    }
  };

  const handleStepIntroStart = () => {
    setShowStepIntroSheet(false);
    setStep(2);
  };

  // Work Schedule handlers
  const handleToggleDate = (dateString: string) => {
    setValues((prev) => {
      const currentDates = prev.workSchedule.availableDates;
      const isSelected = currentDates.includes(dateString);
      return {
        ...prev,
        workSchedule: {
          ...prev.workSchedule,
          availableDates: isSelected
            ? currentDates.filter((d) => d !== dateString)
            : [...currentDates, dateString],
        },
      };
    });
  };

  const handleConfirmCalendar = () => {
    // Step 5 → Step 6으로 이동
    goNext();
  };

  const handleChangeTime = (startTime: string | null, endTime: string | null) => {
    setValues((prev) => ({
      ...prev,
      workSchedule: {
        ...prev.workSchedule,
        startTime,
        endTime,
      },
    }));
  };

  const handleToggleDay = (dayCode: string) => {
    setValues((prev) => {
      const currentDays = prev.workSchedule.daysOfWeek;
      const isSelected = currentDays.includes(dayCode);
      return {
        ...prev,
        workSchedule: {
          ...prev.workSchedule,
          daysOfWeek: isSelected
            ? currentDays.filter((d) => d !== dayCode)
            : [...currentDays, dayCode],
        },
      };
    });
  };

  const handleToggleAllDays = () => {
    setValues((prev) => {
      const allDays = ['월', '화', '수', '목', '금', '토', '일'];
      const currentDays = prev.workSchedule.daysOfWeek;
      const isAllSelected = allDays.every((day) => currentDays.includes(day));
      return {
        ...prev,
        workSchedule: {
          ...prev.workSchedule,
          daysOfWeek: isAllSelected ? [] : allDays,
        },
      };
    });
  };

  const handleChangeExperienceData = (field: string, value: string) => {
    setValues((prev) => ({
      ...prev,
      experienceData: {
        ...prev.experienceData,
        [field]: value,
      },
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Get user_id from localStorage (set during signup)
      const userId = localStorage.getItem('signup_user_id');
      if (!userId) {
        throw new Error('사용자 정보를 찾을 수 없습니다. 다시 로그인해주세요.');
      }

      // Prepare payload with work schedule and experience
      // Build experience sections array based on filled data
      const experienceSections: string[] = [];
      if (values.experienceData.career) experienceSections.push('career');
      if (values.experienceData.license) experienceSections.push('license');
      if (values.experienceData.skills) experienceSections.push('skills');
      if (values.experienceData.introduction) experienceSections.push('introduction');

      // Check if work schedule has any data
      const hasWorkSchedule = values.workSchedule.startTime || 
                              values.workSchedule.endTime || 
                              values.workSchedule.daysOfWeek.length > 0 ||
                              values.workSchedule.availableDates.length > 0;

      // Check if experience has any data
      const hasExperience = experienceSections.length > 0;

      // 기본값 정의: 건너뛰기 시 무관/전체 선택 처리
      const ALL_REGIONS = ['서울', '경기', '인천', '부산', '대구', '광주', '대전', '울산', '세종'];
      const ALL_JOBS = ['store', 'service', 'serving', 'kitchen', 'labor', 'delivery', 'event', 'office', 'sales'];
      const DEFAULT_REGION = ['무관'];
      const DEFAULT_JOB = ['무관'];
      const DEFAULT_WORK_SCHEDULE = {
        available_dates: [] as string[],
        start_time: '00:00',
        end_time: '00:00',
        days_of_week: ['무관'],
      };

      // 모든 필드를 포함한 페이로드 (배포 서버 호환)
      const payload: any = {
        user_id: userId,
        basic_info_file_name:
          values.uploadedFiles.length > 0 ? values.uploadedFiles[0].name : '미입력',
        // 빈 배열이면 무관 값으로 처리 (나중에 수정 가능)
        preferred_regions:
          values.preferredRegions && values.preferredRegions.length > 0
            ? values.preferredRegions
            : DEFAULT_REGION,
        preferred_jobs:
          values.preferredJobs && values.preferredJobs.length > 0
            ? values.preferredJobs
            : DEFAULT_JOB,
        experience: {
          sections: experienceSections,
          data: values.experienceData || {},
        },
      };

      // work_schedule은 반드시 포함 (배포 서버 필수). 값이 없으면 기본값 채움.
      payload.work_schedule =
        hasWorkSchedule &&
        values.workSchedule.startTime &&
        values.workSchedule.endTime
          ? {
              available_dates: values.workSchedule.availableDates || [],
              start_time: values.workSchedule.startTime,
              end_time: values.workSchedule.endTime,
              days_of_week:
                values.workSchedule.daysOfWeek && values.workSchedule.daysOfWeek.length > 0
                  ? values.workSchedule.daysOfWeek
                  : ['무관'],
            }
          : DEFAULT_WORK_SCHEDULE;

      console.log('Sending profile data:', payload);

      await createJobSeekerProfile(payload);
      navigate('/jobseeker/home');
    } catch (err: any) {
      console.error('프로필 저장 실패:', err);
      const errorMessage =
        err?.response?.data?.detail || 
        err?.message || 
        '프로필 저장에 실패했습니다.';
      setError(errorMessage);
      alert(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage));
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    step,
    values,
    setValues,
    goNext,
    goPrev,
    handleFileUpload,
    handleRegionSelect,
    handleJobToggle,
    showStartInfoModal,
    showStepIntroSheet,
    handleStartInfoModalClose,
    handleStepIntroStart,
    closeStepIntroSheet: () => setShowStepIntroSheet(false),
    handleSubmit,
    isSubmitting,
    error,
    // Work Schedule handlers
    handleToggleDate,
    handleConfirmCalendar,
    handleChangeTime,
    handleToggleDay,
    handleToggleAllDays,
    // Experience handlers
    handleChangeExperienceData,
  };
}

