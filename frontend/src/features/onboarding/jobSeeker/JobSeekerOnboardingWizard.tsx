import { ProfileOverviewStep } from './components/ProfileOverviewStep';
import { BasicInfoUploadStep } from './components/BasicInfoUploadStep';
import { PreferredRegionStep } from './components/PreferredRegionStep';
import { PreferredJobStep } from './components/PreferredJobStep';
import { WorkScheduleCalendarStep } from './components/WorkScheduleCalendarStep';
import { WorkScheduleDetailStep } from './components/WorkScheduleDetailStep';
import { ExperienceStep } from './components/ExperienceStep';
import { ExperienceDetailStep } from './components/ExperienceDetailStep';
import { StartInfoModal } from './components/StartInfoModal';
import { StepIntroBottomSheet } from './components/StepIntroBottomSheet';
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
    handleToggleExperienceSection,
    handleChangeExperienceData,
  } = useJobSeekerOnboarding();

  return (
    <div className="min-h-screen bg-white">
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
          onPrev={goPrev}
        />
      )}
      {step === 4 && (
        <PreferredJobStep
          selectedJobs={values.preferredJobs}
          onJobToggle={handleJobToggle}
          onPrev={goPrev}
          onNext={goNext}
        />
      )}
      {step === 5 && (
        <WorkScheduleCalendarStep
          availableDates={values.workSchedule.availableDates}
          onToggleDate={handleToggleDate}
          onConfirm={handleConfirmCalendar}
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
          isSubmitting={false}
        />
      )}
      {step === 7 && (
        <ExperienceStep
          selectedSections={values.selectedExperienceSections}
          onToggleSection={handleToggleExperienceSection}
          onNext={goNext}
          onSkip={handleSubmit}
          onPrev={goPrev}
        />
      )}
      {step === 8 && (
        <ExperienceDetailStep
          selectedSections={values.selectedExperienceSections}
          experienceData={values.experienceData}
          onChangeData={handleChangeExperienceData}
          onNext={handleSubmit}
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

