import { useEffect, useRef } from 'react';
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
      <div className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-white px-6 pb-8 pt-6 shadow-xl max-w-sm mx-auto">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-[19px] font-semibold text-text-900">생년월일을 선택해 주세요</p>
          <button type="button" onClick={onClose} className="text-[31px] text-text-400 hover:text-text-600">
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
          className="mt-6 h-12 w-full rounded-input bg-primary-mint hover:bg-mint-600 text-[17px] font-semibold text-white transition"
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
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // 선택된 항목으로 스크롤
    if (selectedRef.current && containerRef.current) {
      const container = containerRef.current;
      const selected = selectedRef.current;
      const containerHeight = container.clientHeight;
      const selectedTop = selected.offsetTop;
      const selectedHeight = selected.clientHeight;
      
      // 선택된 항목이 중간에 오도록 스크롤
      container.scrollTop = selectedTop - containerHeight / 2 + selectedHeight / 2;
    }
  }, [value]);

  return (
    <div className="flex-1 text-center">
      <p className="mb-2 text-[15px] text-text-600">{label}</p>
      <div 
        ref={containerRef}
        className="max-h-48 overflow-y-auto rounded-2xl border border-border bg-background"
      >
        {options.map((option) => {
          const active = option === value;
          return (
            <button
              key={option}
              ref={active ? selectedRef : null}
              type="button"
              onClick={() => onChange(option)}
              className={`block w-full px-4 py-2 text-[17px] transition ${
                active ? 'bg-white font-semibold text-primary-mint' : 'text-text-700 hover:bg-white/50'
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

