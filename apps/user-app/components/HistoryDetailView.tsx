import React, { useRef, useEffect } from 'react';
import { WorkHistory } from '../data/workHistory';
import { Tooltip } from './Tooltip';

interface HistoryDetailViewProps {
  workHistory: WorkHistory[];
  selectedDate: string | null;
}

const STATUS_INFO: Record<WorkHistory['status'], { label: string; description: string; color: string; }> = {
    '지급완료': {
        label: '지급 완료',
        description: '급여가 등록된 계좌로 지급 완료되었습니다.',
        color: 'bg-blue-600 text-blue-100'
    },
    '완료': {
        label: '정산 대기',
        description: '근무가 정상적으로 완료되어 급여 정산을 기다리는 중입니다.',
        color: 'bg-green-600 text-green-100'
    },
    '출근': {
        label: '근무 중',
        description: '현장에 출근하여 근무 중인 상태입니다.',
        color: 'bg-teal-600 text-teal-100'
    },
    '확정': {
        label: '출역 확정',
        description: '현장 출역이 확정된 상태입니다. 지정된 날짜에 근무해주세요.',
        color: 'bg-yellow-600 text-yellow-100'
    }
};


export const HistoryDetailView: React.FC<HistoryDetailViewProps> = ({ workHistory, selectedDate }) => {
  const historyRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (selectedDate && historyRefs.current[selectedDate]) {
      historyRefs.current[selectedDate]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [selectedDate, workHistory]);

  const sortedHistory = [...workHistory].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  if (sortedHistory.length === 0) {
      return (
        <div className="text-center py-16 px-6 bg-slate-800/50 border-2 border-dashed border-slate-700 rounded-xl">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-slate-300">근무 기록 없음</h3>
            <p className="mt-1 text-sm text-slate-500">
                아직 완료된 근무 기록이 없습니다.
            </p>
        </div>
      );
  }

  return (
    <div className="space-y-4">
      {sortedHistory.map(item => {
        const isSelected = item.date === selectedDate;
        const statusInfo = STATUS_INFO[item.status] || { label: item.status, description: '', color: 'bg-slate-600 text-slate-200' };
        
        return (
          <div
            key={item.id}
            ref={el => { historyRefs.current[item.date] = el; }}
            className={`bg-slate-800/50 p-4 rounded-xl border transition-all duration-500
                ${isSelected ? 'border-amber-500 shadow-lg' : 'border-slate-700'}`}
          >
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
              <p className="font-bold text-slate-200">{item.date}</p>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusInfo.color}`}>
                  {statusInfo.label}
                </span>
                <Tooltip text={statusInfo.description}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </Tooltip>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-700 flex justify-between items-center">
                <div>
                    <p className="text-sm text-slate-400">현장명</p>
                    <p className="font-medium text-slate-100">{item.siteName}</p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-slate-400">일급</p>
                    <p className="font-bold text-amber-400 text-lg">{item.dailyRate.toLocaleString()}원</p>
                </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};