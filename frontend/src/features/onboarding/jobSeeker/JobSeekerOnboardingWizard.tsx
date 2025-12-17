// @ts-nocheck
import { ProfileOverviewStep } from './components/ProfileOverviewStep';
import { BasicInfoUploadStep } from './components/BasicInfoUploadStep';
import { PreferredRegionStep } from './components/PreferredRegionStep';
import { PreferredJobStep } from './components/PreferredJobStep';
import { WorkScheduleCalendarStep } from './components/WorkScheduleCalendarStep';
import { WorkScheduleDetailStep } from './components/WorkScheduleDetailStep';
import { CareerStep } from './components/CareerStep';
import { LicenseStep } from './components/LicenseStep';
import { SkillsStep } from './components/SkillsStep';
import { IntroductionStep } from './components/IntroductionStep';
import { StartInfoModal } from './components/StartInfoModal';
import { StepIntroBottomSheet } from './components/StepIntroBottomSheet';
import { OnboardingProgressBar } from './components/OnboardingProgressBar';
import { useJobSeekerOnboarding } from './hooks/useJobSeekerOnboarding';

export default function JobSeekerOnboardingWizard() {
  const {
    step,
    values,
    goNext,
    goPrev,
    handleFileUpload,
    handleRegionSelect,
    handleJobToggle,
    showStartInfoModal,
    showStepIntroSheet,
    handleStartInfoModalClose,
    handleStepIntroStart,
    closeStepIntroSheet,
    handleSubmit,
    isSubmitting,
    error,
    handleToggleDate,
    handleConfirmCalendar,
    handleChangeTime,
    handleToggleDay,
    handleToggleAllDays,
    handleChangeExperienceData,
  } = useJobSeekerOnboarding();

  // 전체 프로그레스 계산 (회원가입 2단계 + 온보딩 9단계 = 총 11단계)
  const totalProgressStep = step; // Step 2부터 시작하므로 +2 (회원가입 2단계)

  return (
    <div className="min-h-screen bg-white">
      {/* Onboarding Progress Bar - 전체 11단계 중 현재 위치 표시 */}
      <OnboardingProgressBar currentStep={totalProgressStep} totalSteps={11} />
      
      {step === 2 && (
        <BasicInfoUploadStep
          uploadedFiles={values.uploadedFiles}
          onFileUpload={handleFileUpload}
          onNext={goNext}
          onSkip={goNext}
          onPrev={goPrev}
        />
      )}
      {step === 3 && (
        <PreferredRegionStep
          selectedRegions={values.preferredRegions}
          onRegionSelect={handleRegionSelect}
          onNext={goNext}
          onSkip={goNext}
          onPrev={goPrev}
        />
      )}
      {step === 4 && (
        <PreferredJobStep
          selectedJobs={values.preferredJobs}
          onJobToggle={handleJobToggle}
          onPrev={goPrev}
          onNext={goNext}
          onSkip={goNext}
        />
      )}
      {step === 5 && (
        <WorkScheduleCalendarStep
          availableDates={values.workSchedule.availableDates}
          onToggleDate={handleToggleDate}
          onConfirm={handleConfirmCalendar}
          onSkip={handleConfirmCalendar}
          onPrev={goPrev}
        />
      )}
      {step === 6 && (
        <WorkScheduleDetailStep
          workSchedule={values.workSchedule}
          onChangeTime={handleChangeTime}
          onToggleDay={handleToggleDay}
          onToggleAllDays={handleToggleAllDays}
          onPrev={goPrev}
          onSubmit={goNext}
          onSkip={goNext}
          isSubmitting={false}
        />
      )}
      {step === 7 && (
        <CareerStep
          careerData={values.experienceData.career}
          onChangeData={(value) => handleChangeExperienceData('career', value)}
          onNext={goNext}
          onSkip={goNext}
          onPrev={goPrev}
        />
      )}
      {step === 8 && (
        <LicenseStep
          licenseData={values.experienceData.license}
          onChangeData={(value) => handleChangeExperienceData('license', value)}
          onNext={goNext}
          onSkip={goNext}
          onPrev={goPrev}
        />
      )}
      {step === 9 && (
        <SkillsStep
          skillsData={values.experienceData.skills}
          onChangeData={(value) => handleChangeExperienceData('skills', value)}
          onNext={goNext}
          onSkip={goNext}
          onPrev={goPrev}
        />
      )}
      {step === 10 && (
        <IntroductionStep
          introductionData={values.experienceData.introduction}
          onChangeData={(value) => handleChangeExperienceData('introduction', value)}
          onNext={handleSubmit}
          onSkip={handleSubmit}
          onPrev={goPrev}
        />
      )}

      {error && (
        <div className="fixed bottom-4 left-4 right-4 mx-auto max-w-[420px] rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-[15px] text-red-700">
          {error}
        </div>
      )}
    </div>
  );
}

