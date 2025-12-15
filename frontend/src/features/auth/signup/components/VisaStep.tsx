import type { SignupFormValues } from '../types';
import { useMemo, useState } from 'react';

interface VisaStepProps {
  values: SignupFormValues;
  onVisaTypeSelect(visa: string): void;
  onVisaExpiryChange(expiry: string): void;
  onVisaImageChange(file: File | null): void;
  onNext(): void;
  onPrev(): void;
  canProceed: boolean;
}

const VISA_OPTIONS = ['F-4', 'F-5', 'F-6', 'D-10', 'H-2', 'H-1', 'E-9', 'D-2', 'D-4', 'G-1'];

export function VisaStep({
  values,
  onVisaTypeSelect,
  onVisaExpiryChange,
  onVisaImageChange,
  onNext,
  onPrev,
  canProceed,
}: VisaStepProps) {
  const [preview, setPreview] = useState<string | null>(values.visaImageBase64 || null);

  const handleFile = (file: File | null) => {
    if (!file) {
      setPreview(null);
      onVisaImageChange(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = (reader.result as string) || null;
      setPreview(result);
      onVisaImageChange(file);
    };
    reader.readAsDataURL(file);
  };

  const isMissingRequired = useMemo(() => {
    return !(values.visaType && values.visaExpiry);
  }, [values.visaType, values.visaExpiry]);

  return (
    <div className="mx-auto flex h-screen w-full max-w-sm flex-col bg-white px-6 pb-24">
      <header className="mb-3 flex items-center gap-2 pt-4">
        <button type="button" onClick={onPrev} className="text-[26px] text-text-600 hover:text-text-900">
          ←
        </button>
        <span className="flex-1 text-center text-base font-semibold text-gray-900">비자 정보</span>
      </header>

      <h1 className="mb-1 text-xl font-semibold text-gray-900">비자 정보를 입력해 주세요</h1>
      <p className="mb-4 text-[13px] text-text-500">비자 이미지는 나중에 업로드해도 됩니다.</p>

      <div className="flex-1 overflow-y-auto space-y-4 pb-2">
        <div>
          <label className="text-sm font-medium text-gray-900">비자 유형</label>
          <div className="relative">
            <select
              className="mt-1.5 w-full rounded-2xl border border-gray-200 px-4 py-2.5 text-base transition focus:border-emerald-500 focus:outline-none appearance-none pr-10"
              value={values.visaType}
              onChange={(e) => onVisaTypeSelect(e.target.value)}
            >
              <option value="">비자 유형을 선택해 주세요</option>
              {VISA_OPTIONS.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-gray-400">⌄</span>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-900">비자 만료일</label>
          <input
            type="date"
            className="mt-1.5 w-full rounded-2xl border border-gray-200 px-4 py-2.5 text-base transition focus:border-emerald-500 focus:outline-none"
            value={values.visaExpiry}
            onChange={(e) => onVisaExpiryChange(e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-900">비자 이미지 (선택)</label>
          <div className="mt-1.5 flex items-center gap-3">
            <label className="cursor-pointer rounded-2xl border border-gray-200 px-4 py-2.5 text-base font-medium text-mint-700 bg-mint-50 hover:bg-mint-100">
              이미지 선택
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0] || null)}
              />
            </label>
            {preview && (
              <img src={preview} alt="visa preview" className="h-16 w-16 rounded-lg object-cover border border-line-200" />
            )}
            {!preview && <span className="text-[13px] text-text-500">선택 안 함</span>}
          </div>
          <p className="mt-1 text-[12px] text-text-500">이미지 미선택 시 나중에 업로드할 수 있습니다.</p>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-4 max-w-sm mx-auto">
        <button
          type="button"
          onClick={onNext}
          disabled={isMissingRequired || !canProceed}
          className={`h-12 w-full rounded-full text-base font-semibold text-white transition ${
            !isMissingRequired && canProceed ? 'bg-emerald-500' : 'bg-gray-300'
          }`}
        >
          다음
        </button>
      </div>
    </div>
  );
}
