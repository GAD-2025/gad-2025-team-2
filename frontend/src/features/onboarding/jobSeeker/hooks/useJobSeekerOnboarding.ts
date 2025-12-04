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

      // Validate work schedule
      if (!values.workSchedule.startTime || !values.workSchedule.endTime) {
        throw new Error('근무 시간을 선택해주세요.');
      }
      if (values.workSchedule.daysOfWeek.length === 0) {
        throw new Error('근무 가능 요일을 선택해주세요.');
      }

      // Prepare payload with work schedule and experience
      // Build experience sections array based on filled data
      const experienceSections: string[] = [];
      if (values.experienceData.career) experienceSections.push('career');
      if (values.experienceData.license) experienceSections.push('license');
      if (values.experienceData.skills) experienceSections.push('skills');
      if (values.experienceData.introduction) experienceSections.push('introduction');

      const payload = {
        user_id: userId,
        basic_info_file_name:
          values.uploadedFiles.length > 0
            ? values.uploadedFiles[0].name
            : null,
        preferred_regions: values.preferredRegions,
        preferred_jobs: values.preferredJobs,
        work_schedule: {
          available_dates: values.workSchedule.availableDates,
          start_time: values.workSchedule.startTime,
          end_time: values.workSchedule.endTime,
          days_of_week: values.workSchedule.daysOfWeek,
        },
        experience: {
          sections: experienceSections,
          data: values.experienceData,
        },
      };

      console.log('Sending profile data:', payload);

      await createJobSeekerProfile(payload);
      navigate('/jobseeker/home');
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : '프로필 저장에 실패했습니다.';
      setError(errorMessage);
      alert(errorMessage);
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

