import { useState } from 'react';
import { NationalityOption, SignupFormValues } from '../types';

interface UserInfoStepProps {
  values: SignupFormValues;
  birthdateLabel: string;
  onChange(field: Exclude<keyof SignupFormValues, 'terms'>, value: string): void;
  onPhoneChange(value: string): void;
  onOpenBirthdate(): void;
  onGenderSelect(gender: 'male' | 'female'): void;
  onNationalitySelect(code: string): void;
  nationalities: NationalityOption[];
  onNext(): void;
  onPrev(): void;
  canProceed: boolean;
}

const LABEL_CLASS = 'text-sm font-medium text-gray-900';
const INPUT_CLASS =
  'mt-1.5 w-full rounded-2xl border border-gray-200 px-4 py-2.5 text-base transition focus:border-emerald-500 focus:outline-none';

export function UserInfoStep({
  values,
  birthdateLabel,
  onChange,
  onPhoneChange,
  onOpenBirthdate,
  onGenderSelect,
  onNationalitySelect,
  nationalities,
  onNext,
  onPrev,
  canProceed,
}: UserInfoStepProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="mx-auto flex h-screen w-full max-w-sm flex-col bg-white px-6 pb-24">
      <header className="mb-3 flex items-center gap-2 pt-4">
        <button type="button" onClick={onPrev} className="text-[26px] text-text-600 hover:text-text-900">
          ←
        </button>
        <span className="flex-1 text-center text-base font-semibold text-gray-900">
          구직자 가입
        </span>
      </header>
      <h1 className="mb-3 text-xl font-semibold text-gray-900">회원정보를 입력해 주세요</h1>

      <div className="flex-1 overflow-y-auto space-y-3.5 pb-2">
        <div>
          <label className={LABEL_CLASS} htmlFor="name">
            이름
          </label>
          <input
            id="name"
            className={INPUT_CLASS}
            value={values.name}
            onChange={(e) => onChange('name', e.target.value)}
            placeholder="이름을 입력해 주세요"
          />
        </div>

        <div>
          <label className={LABEL_CLASS} htmlFor="phone">
            전화번호
          </label>
          <input
            id="phone"
            type="tel"
            className={INPUT_CLASS}
            inputMode="numeric"
            value={values.phone}
            onChange={(e) => {
              // 숫자만 입력 가능
              const value = e.target.value.replace(/[^0-9]/g, '');
              onPhoneChange(value);
            }}
            placeholder="01012345678"
            maxLength={11}
          />
        </div>

        <div>
          <label className={LABEL_CLASS} htmlFor="password">
            비밀번호
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              className={`${INPUT_CLASS} pr-10`}
              value={values.password || ''}
              onChange={(e) => onChange('password', e.target.value)}
              placeholder="비밀번호를 입력하세요 (최소 6자)"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 mt-0.5"
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
        </div>

        <div>
          <label className={LABEL_CLASS}>생년월일</label>
          <button
            type="button"
            className={`${INPUT_CLASS} flex items-center justify-between text-left`}
            onClick={onOpenBirthdate}
          >
            <span className={values.birthdate ? 'text-gray-900' : 'text-gray-400'}>
              {birthdateLabel}
            </span>
            <span className="text-gray-400">⌄</span>
          </button>
        </div>

        <div>
          <label className={LABEL_CLASS}>성별</label>
          <div className="mt-2 grid grid-cols-2 gap-3">
            {[
              { key: 'male', label: '남' },
              { key: 'female', label: '여' },
            ].map(({ key, label }) => {
              const active = values.gender === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => onGenderSelect(key as 'male' | 'female')}
                  className={`rounded-2xl border px-4 py-3 text-base font-medium transition ${
                    active
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                      : 'border-gray-200 text-gray-600'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className={LABEL_CLASS}>국적</label>
          <div className="relative">
            <select
              className={`${INPUT_CLASS} appearance-none pr-10`}
              value={values.nationalityCode ?? ''}
              onChange={(e) => onNationalitySelect(e.target.value)}
            >
              <option value="">국적을 선택해 주세요</option>
              {nationalities.map((option) => (
                <option key={option.code} value={option.code}>
                  {option.label}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-gray-400">
              ⌄
            </span>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-4 max-w-sm mx-auto">
        <button
          type="button"
          onClick={() => {
            console.log('다음 버튼 클릭:', { canProceed, values });
            onNext();
          }}
          disabled={!canProceed}
          className={`h-12 w-full rounded-full text-base font-semibold text-white transition ${
            canProceed ? 'bg-emerald-500' : 'bg-gray-300'
          }`}
        >
          {canProceed ? '다음' : '모든 항목을 입력해주세요'}
        </button>
      </div>
    </div>
  );
}
