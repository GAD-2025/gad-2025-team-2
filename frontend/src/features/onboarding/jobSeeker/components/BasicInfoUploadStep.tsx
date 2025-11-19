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
    onFileUpload(files);
  };

  const handleBoxClick = () => {
    fileInputRef.current?.click();
  };

  const hasFiles = uploadedFiles.length > 0;

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[420px] flex-col bg-white px-4 pb-10 pt-8">
      <header className="mb-6 flex items-center gap-2">
        <button type="button" onClick={onPrev} className="text-[26px]">
          ←
        </button>
        <span className="flex-1 text-center text-[19px] font-semibold text-gray-900">
          내역 입력
        </span>
      </header>

      <h1 className="mb-2 text-[22px] font-semibold text-gray-900">
        자신을 보여줄 수 있는 자료를 등록해주세요
      </h1>
      <p className="mb-6 text-[15px] text-gray-500">
        프로필에 표시될 정보를 입력해주세요.
      </p>

      <div
        onClick={handleBoxClick}
        className="mb-6 flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 p-8"
      >
        {hasFiles ? (
          <div className="text-center">
            <p className="mb-2 text-[15px] font-medium text-gray-900">
              {uploadedFiles.length}개 파일 선택됨
            </p>
            <p className="text-[13px] text-gray-500">
              {uploadedFiles.map((f) => f.name).join(', ')}
            </p>
          </div>
        ) : (
          <>
            <div className="mb-3 h-12 w-12 rounded-full bg-gray-200" />
            <p className="text-[15px] text-gray-600">
              파일을 업로드하거나 여기를 눌러 선택
            </p>
          </>
        )}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileSelect}
          accept="image/*,.pdf"
        />
      </div>

      <div className="mb-6 space-y-2 text-[13px] text-gray-500">
        <p>• 양식에 맞지 않는 파일은 등록이 어려울 수 있어요</p>
        <p>• 최대 3개까지 등록할 수 있어요</p>
        <p>• 정확히 찍힌 사진을 올려주세요</p>
      </div>

      <div className="mt-auto flex gap-3">
        <button
          type="button"
          onClick={onSkip}
          className="flex-1 rounded-full border border-gray-300 bg-white px-4 py-3 text-[17px] font-semibold text-gray-700"
        >
          건너뛰기
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!hasFiles}
          className={`flex-1 rounded-full px-4 py-3 text-[17px] font-semibold ${
            hasFiles
              ? 'bg-primary-mint text-white'
              : 'bg-gray-200 text-gray-400'
          }`}
        >
          내역 등록
        </button>
      </div>
    </div>
  );
}

