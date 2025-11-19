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

const LABEL_CLASS = 'text-[15px] font-medium text-text-900';
const INPUT_CLASS =
  'mt-2 w-full h-12 rounded-input border border-border px-4 text-[17px] transition focus:outline-none focus:ring-2 focus:ring-primary-mint/20';

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
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-sm flex-col bg-white px-6 pb-10 pt-8">
      <header className="mb-6 flex items-center gap-2">
        <button type="button" onClick={onPrev} className="text-[26px] text-text-600 hover:text-text-900">
          ←
        </button>
        <span className="flex-1 text-center text-[19px] font-semibold text-text-900">
          구직자 가입
        </span>
      </header>
      <h1 className="mb-6 text-[26px] font-bold text-text-900">회원정보를 입력해 주세요</h1>

      <div className="space-y-5">
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
            className={INPUT_CLASS}
            inputMode="numeric"
            value={values.phone}
            onChange={(e) => onPhoneChange(e.target.value)}
            placeholder="휴대전화 번호를 입력하세요"
          />
        </div>

        <div>
          <label className={LABEL_CLASS}>생년월일</label>
          <button
            type="button"
            className={`${INPUT_CLASS} flex items-center justify-between text-left`}
            onClick={onOpenBirthdate}
          >
            <span className={values.birthdate ? 'text-text-900' : 'text-text-500'}>
              {birthdateLabel}
            </span>
            <span className="text-text-400">⌄</span>
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
                  className={`h-12 rounded-input border px-4 text-[17px] font-medium transition ${
                    active
                      ? 'border-primary-mint bg-mint-50 text-primary-mint'
                      : 'border-border text-text-600 hover:border-primary-mint/30'
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
              {nationalities
                .sort((a, b) => {
                  // 한국(KR)을 맨 위에
                  if (a.code === 'KR') return -1;
                  if (b.code === 'KR') return 1;
                  return 0;
                })
                .map((option) => (
                  <option key={option.code} value={option.code}>
                    ({option.phone_code}) {option.label}
                  </option>
                ))}
            </select>
            <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-text-400">
              ⌄
            </span>
          </div>
        </div>
      </div>

      <div className="mt-auto pt-10">
        <button
          type="button"
          onClick={() => {
            console.log('다음 버튼 클릭:', { canProceed, values });
            onNext();
          }}
          disabled={!canProceed}
          className={`h-12 w-full rounded-input text-[17px] font-semibold text-white transition ${
            canProceed ? 'bg-primary-mint hover:bg-mint-600' : 'bg-text-300 cursor-not-allowed'
          }`}
        >
          {canProceed ? '다음' : '모든 항목을 입력해주세요'}
        </button>
      </div>
    </div>
  );
}

