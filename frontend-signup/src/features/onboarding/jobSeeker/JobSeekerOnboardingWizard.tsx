'use client';

import { ProfileOverviewStep } from './components/ProfileOverviewStep';
import { BasicInfoUploadStep } from './components/BasicInfoUploadStep';
import { PreferredRegionStep } from './components/PreferredRegionStep';
import { PreferredJobStep } from './components/PreferredJobStep';
import { WorkScheduleCalendarStep } from './components/WorkScheduleCalendarStep';
import { WorkScheduleDetailStep } from './components/WorkScheduleDetailStep';
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
  } = useJobSeekerOnboarding();

  return (
    <div className="min-h-screen bg-white">
      {step === 1 && (
        <ProfileOverviewStep
          onStart={() => {
            closeStepIntroSheet();
            goNext();
          }}
        />
      )}
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
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      )}

      {error && (
        <div className="fixed bottom-4 left-4 right-4 mx-auto max-w-[420px] rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {step === 1 && (
        <>
          <StartInfoModal
            open={showStartInfoModal}
            onClose={handleStartInfoModalClose}
          />
          <StepIntroBottomSheet
            open={showStepIntroSheet}
            onStart={handleStepIntroStart}
            onClose={closeStepIntroSheet}
          />
        </>
      )}
    </div>
  );
}

