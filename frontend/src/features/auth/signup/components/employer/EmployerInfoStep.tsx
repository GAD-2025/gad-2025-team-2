import { useState } from 'react';
import { EmployerSignupData } from '../../hooks/useEmployerSignupWizard';

interface EmployerInfoStepProps {
  formData: EmployerSignupData;
  updateFormData: (updates: Partial<EmployerSignupData>) => void;
}

export function EmployerInfoStep({ formData, updateFormData }: EmployerInfoStepProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="mx-auto flex h-full w-full max-w-[420px] flex-col bg-white px-6 pt-20 pb-32">
      <h1 className="mb-6 text-[26px] font-bold text-gray-900">
        정보를 입력해 주세요
      </h1>

      <div className="flex-1 space-y-5">
        {/* 이름 입력 */}
        <div>
          <label className="mb-2 flex items-center text-[15px] font-medium text-gray-700">
            이름 <span className="ml-1 text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => updateFormData({ name: e.target.value })}
            placeholder="입력하세요"
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-[17px] text-gray-900 placeholder-gray-400 focus:border-primary-mint focus:outline-none focus:ring-1 focus:ring-primary-mint"
          />
          <p className="mt-1.5 text-[13px] text-gray-500">최소 2자 이상 입력해 주세요</p>
        </div>

        {/* 이메일 입력 */}
        <div>
          <label className="mb-2 flex items-center text-[15px] font-medium text-gray-700">
            이메일 <span className="ml-1 text-red-500">*</span>
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => updateFormData({ email: e.target.value })}
            placeholder="입력하세요"
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-[17px] text-gray-900 placeholder-gray-400 focus:border-primary-mint focus:outline-none focus:ring-1 focus:ring-primary-mint"
          />
        </div>

        {/* 비밀번호 입력 */}
        <div>
          <label className="mb-2 flex items-center text-[15px] font-medium text-gray-700">
            비밀번호 <span className="ml-1 text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={formData.password || ''}
              onChange={(e) => updateFormData({ password: e.target.value })}
              placeholder="비밀번호를 입력하세요"
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3.5 pr-12 text-[17px] text-gray-900 placeholder-gray-400 focus:border-primary-mint focus:outline-none focus:ring-1 focus:ring-primary-mint"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              )}
            </button>
          </div>
          <p className="mt-1.5 text-[13px] text-gray-500">최소 6자 이상 입력해 주세요</p>
        </div>
      </div>
    </div>
  );
}

