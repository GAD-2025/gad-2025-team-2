import { BirthdateSelection } from '../types';

interface BirthdateBottomSheetProps {
  open: boolean;
  selection: BirthdateSelection;
  years: number[];
  months: number[];
  days: number[];
  onChange(selection: BirthdateSelection): void;
  onClose(): void;
  onConfirm(): void;
}

export function BirthdateBottomSheet({
  open,
  selection,
  years,
  months,
  days,
  onChange,
  onClose,
  onConfirm,
}: BirthdateBottomSheetProps) {
  const handleSelect = (key: keyof BirthdateSelection, value: number) => {
    onChange({ ...selection, [key]: value });
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40" onClick={onClose} />
      <div className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-white px-6 pb-8 pt-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-base font-semibold text-gray-900">생년월일을 선택해 주세요</p>
          <button type="button" onClick={onClose} className="text-lg text-gray-400">
            ×
          </button>
        </div>
        <div className="flex justify-between gap-3">
          <Picker
            label="년"
            options={years}
            value={selection.year}
            onChange={(value) => handleSelect('year', value)}
          />
          <Picker
            label="월"
            options={months}
            value={selection.month}
            onChange={(value) => handleSelect('month', value)}
          />
          <Picker
            label="일"
            options={days}
            value={selection.day}
            onChange={(value) => handleSelect('day', value)}
          />
        </div>
        <button
          type="button"
          className="mt-6 h-12 w-full rounded-full bg-emerald-500 text-base font-semibold text-white"
          onClick={onConfirm}
        >
          선택하기
        </button>
      </div>
    </>
  );
}

interface PickerProps {
  label: string;
  options: number[];
  value: number;
  onChange(value: number): void;
}

function Picker({ label, options, value, onChange }: PickerProps) {
  return (
    <div className="flex-1 text-center">
      <p className="mb-2 text-sm text-gray-500">{label}</p>
      <div className="max-h-48 overflow-y-auto rounded-2xl border border-gray-100 bg-gray-50">
        {options.map((option) => {
          const active = option === value;
          return (
            <button
              key={option}
              type="button"
              onClick={() => onChange(option)}
              className={`block w-full px-4 py-2 text-base ${
                active ? 'bg-white font-semibold text-emerald-600' : 'text-gray-600'
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}

