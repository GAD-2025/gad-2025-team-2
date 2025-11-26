import { useRef } from 'react';

interface BasicInfoUploadStepProps {
  uploadedFiles: File[];
  onFileUpload: (files: File[]) => void;
  onNext: () => void;
  onSkip: () => void;
  onPrev: () => void;
}

export function BasicInfoUploadStep({
  uploadedFiles,
  onFileUpload,
  onNext,
  onSkip,
  onPrev,
}: BasicInfoUploadStepProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    // 프로필 사진은 1개만
    if (files.length > 0) {
      onFileUpload([files[0]]);
    }
  };

  const handleBoxClick = () => {
    fileInputRef.current?.click();
  };

  const hasFiles = uploadedFiles.length > 0;

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[420px] flex-col bg-white px-4 pb-10">
      <header className="mb-6 flex items-center gap-2">
        <button type="button" onClick={onPrev} className="text-[26px]">
          ←
        </button>
        <span className="flex-1 text-center text-[19px] font-semibold text-gray-900">
          프로필 사진
        </span>
      </header>

      <h1 className="mb-2 text-[22px] font-semibold text-gray-900">
        프로필 사진을 등록해주세요
      </h1>
      <p className="mb-6 text-[15px] text-gray-500">
        사진은 자유롭게 선택하실 수 있어요.
      </p>

      <div
        onClick={handleBoxClick}
        className="mb-6 flex min-h-[280px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 p-8"
      >
        {hasFiles ? (
          <div className="text-center">
            <div className="mb-4 mx-auto h-32 w-32 rounded-full bg-primary-mint/10 flex items-center justify-center">
              <svg className="w-16 h-16 text-primary-mint" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="mb-2 text-[17px] font-medium text-gray-900">
              사진이 선택되었습니다
            </p>
            <p className="text-[13px] text-gray-500">
              {uploadedFiles[0].name}
            </p>
          </div>
        ) : (
          <>
            <div className="mb-4 h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <p className="text-[17px] font-medium text-gray-700 mb-2">
              사진을 선택해주세요
            </p>
            <p className="text-[13px] text-gray-500">
              여기를 눌러 갤러리에서 선택
            </p>
          </>
        )}
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileSelect}
          accept="image/*"
        />
      </div>

      <div className="mb-6 space-y-2 text-[13px] text-gray-500">
        <p>• 얼굴이 잘 보이는 사진을 권장합니다</p>
        <p>• jpg, png 형식의 이미지 파일만 가능합니다</p>
        <p>• 프로필 사진은 나중에 변경할 수 있습니다</p>
      </div>

      <div className="mt-auto space-y-3">
        <button
          type="button"
          onClick={onSkip}
          className="w-full rounded-full border border-gray-300 bg-white px-4 py-3 text-[17px] font-semibold text-gray-700"
        >
          건너뛰기
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!hasFiles}
          className={`w-full rounded-full px-4 py-3 text-[17px] font-semibold ${
            hasFiles
              ? 'bg-primary-mint text-white'
              : 'bg-gray-200 text-gray-400'
          }`}
        >
          사진 등록
        </button>
      </div>
    </div>
  );
}

