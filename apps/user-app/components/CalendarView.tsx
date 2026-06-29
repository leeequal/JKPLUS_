import React, { useState, useMemo } from 'react';
import { WorkHistory } from '../data/workHistory';

interface CalendarViewProps {
  workHistory: WorkHistory[];
  onDayClick: (date: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ workHistory, onDayClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };
  
  const handleToday = () => {
    setCurrentDate(new Date());
  }

  const { calendarGrid, monthSummary } = useMemo(() => {
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    const startingDayOfWeek = firstDayOfMonth.getDay();

    const grid: ({ day: number; work: WorkHistory | undefined; dateStr: string } | null)[] = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      grid.push(null);
    }

    const monthHistory = workHistory.filter(wh => {
      const workDate = new Date(wh.date);
      return workDate.getFullYear() === year && workDate.getMonth() === month;
    });

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const work = monthHistory.find(wh => wh.date === dateStr);
      grid.push({ day, work, dateStr });
    }

    const summary = {
        totalDays: monthHistory.length,
        totalPay: monthHistory.reduce((sum, wh) => sum + wh.dailyRate, 0)
    };

    return { calendarGrid: grid, monthSummary: summary };
  }, [year, month, workHistory]);

  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

  return (
    <div className="bg-white dark:bg-slate-800/50 p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm dark:shadow-none transition-colors duration-300">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <h3 className="text-xl font-bold w-32 text-center text-slate-900 dark:text-white">{`${year}년 ${month + 1}월`}</h3>
          <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
         <button onClick={handleToday} className="mt-2 sm:mt-0 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-600 hover:bg-slate-200 dark:hover:bg-slate-500 rounded-md transition-colors border border-slate-250 dark:border-transparent shadow-sm">
            오늘
         </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-sm">
        {weekDays.map(day => (
          <div key={day} className="font-semibold text-slate-500 dark:text-slate-400 py-2">{day}</div>
        ))}
        {calendarGrid.map((cell, index) => (
          <div 
            key={index} 
            className={`relative aspect-square rounded-lg flex flex-col justify-start items-center p-1.5 transition 
              ${cell ? 'bg-slate-50 dark:bg-slate-850' : 'bg-transparent'}
              ${cell?.work ? 'cursor-pointer hover:bg-amber-500/5 dark:hover:bg-slate-700 border-2 border-amber-500 shadow-sm' : 'border border-transparent'}`}
            onClick={() => cell?.work && onDayClick(cell.dateStr)}
          >
            {cell && (
              <>
                <span className={`font-medium ${new Date().toDateString() === new Date(year, month, cell.day).toDateString() ? 'bg-amber-500 text-white rounded-full flex items-center justify-center w-6 h-6' : 'text-slate-800 dark:text-slate-300'}`}>
                  {cell.day}
                </span>
                {cell.work && (
                  <div className="absolute bottom-1.5 left-0 right-0 text-center text-amber-600 dark:text-amber-300 text-[10px] sm:text-xs font-bold truncate px-1">
                    {(cell.work.dailyRate / 10000).toFixed(1)}만
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-around items-center text-center bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-transparent transition-colors duration-300">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">총 근무일수</p>
          <p className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mt-1">{monthSummary.totalDays}일</p>
        </div>
        <div className="border-l border-slate-300 dark:border-slate-600 h-10"></div>
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">월 예상 총급여</p>
          <p className="text-lg sm:text-xl font-bold text-amber-600 dark:text-amber-400 mt-1">{monthSummary.totalPay.toLocaleString()}원</p>
        </div>
      </div>
    </div>
  );
};