import { UserRole } from '../types';

interface RoleSelectStepProps {
  selectedRole: UserRole | null;
  onSelect(role: UserRole): void;
}

const ROLE_CARDS: Array<{ role: UserRole; title: string; description: string }> = [
  {
    role: 'job_seeker',
    title: '나는 구직자',
    description: '새로운 기회를 찾는 외국인 근로자를 위한 워크페어',
  },
  {
    role: 'employer',
    title: '나는 고용주',
    description: '전 세계 인재를 찾는 고용주를 위한 워크페어',
  },
];

export function RoleSelectStep({ selectedRole, onSelect }: RoleSelectStepProps) {
  return (
    <div className="flex min-h-screen flex-col items-center bg-slate-900 px-4 pb-12 pt-16">
      <div className="w-full max-w-[420px] rounded-3xl bg-white px-6 pb-10 pt-14 text-left text-gray-900 shadow-lg">
        <div className="mb-8 flex flex-col items-center text-center text-gray-900">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <span className="text-3xl text-emerald-500">⚡️</span>
          </div>
          <p className="text-lg font-semibold">WorkFair 워크페어</p>
          <p className="mt-2 text-sm text-gray-500">
            워크페어와 함께 일 찾기 여정을 시작해 보세요.
          </p>
        </div>
        <div className="space-y-3">
          {ROLE_CARDS.map(({ role, title, description }) => {
            const active = selectedRole === role;
            return (
              <button
                key={role}
                type="button"
                onClick={() => onSelect(role)}
                className={`w-full rounded-[28px] border p-5 text-left transition ${
                  active ? 'border-emerald-500 bg-emerald-50 shadow' : 'border-gray-200 bg-white'
                }`}
              >
                <p className="text-base font-semibold text-gray-900">{title}</p>
                <p className="mt-1 text-sm text-gray-500">{description}</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

