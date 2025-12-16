import { useState } from 'react';
import { Header } from '@/components/Header';
import { CalendarGrid } from '@/components/schedule/CalendarGrid';
import { MonthPicker } from '@/components/schedule/MonthPicker';

export const EmployeeScheduleList = () => {
  const [selectedMonth, setSelectedMonth] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
  });

  const handleMonthChange = (year: number, month: number) => {
    setSelectedMonth({ year, month });
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="일정 관리" showBack />
      <MonthPicker value={selectedMonth} onChange={handleMonthChange} />
      <div className="px-4 py-6">
        <CalendarGrid
          year={selectedMonth.year}
          month={selectedMonth.month}
          days={[]}
        />
      </div>
    </div>
  );
};

