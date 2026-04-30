
import React from 'react';
import { WorkHistory } from '../../user-app/data/workHistory';
import { User } from './DailyWorkManagement';

interface SiteWorkDetailProps {
    siteName: string;
    workItems: WorkHistory[];
    users: User[];
    onStatusChange: (workId: string, newStatus: WorkHistory['status']) => void;
    onBack: () => void;
    currentDate: string;
}

const STATUS_CONFIG: Record<WorkHistory['status'], { label: string; color: string; }> = {
    '확정': { label: '출역 확정', color: 'bg-yellow-600 text-yellow-100' },
    '출근': { label: '근무 중', color: 'bg-teal-600 text-teal-100' },
    '완료': { label: '정산 대기', color: 'bg-green-600 text-green-100' },
    '지급완료': { label: '지급 완료', color: 'bg-blue-600 text-blue-100' }
};

export const SiteWorkDetail: React.FC<SiteWorkDetailProps> = ({ siteName, workItems, users, onStatusChange, onBack, currentDate }) => {
    
    const getUserInfo = (userId: string) => {
        return users.find(u => u.phone === userId) || { name: '미등록', phone: userId };
    };
    
    return (
        <div className="animate-fadeIn">
            <div className="mb-6">
                <button 
                    onClick={onBack}
                    className="flex items-center gap-2 text-sm text-slate-400 hover:text-amber-400 transition mb-4"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                    전체 현장 목록으로
                </button>
                <h2 className="text-2xl font-bold text-slate-100">{siteName}</h2>
                <p className="text-slate-400 mt-1">
                    <span className="font-semibold text-amber-400">{currentDate}</span> 출역 인력 상세 현황
                </p>
            </div>
            
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-400">
                        <thead className="text-xs text-slate-300 uppercase bg-slate-700/50">
                            <tr>
                                <th scope="col" className="px-6 py-3">인력명</th>
                                <th scope="col" className="px-6 py-3">연락처</th>
                                <th scope="col" className="px-6 py-3">현재 상태</th>
                                <th scope="col" className="px-6 py-3 text-center">상태 변경</th>
                            </tr>
                        </thead>
                        <tbody>
                            {workItems.length > 0 ? (
                                workItems.map(work => {
                                    const userInfo = getUserInfo(work.userId);
                                    const config = STATUS_CONFIG[work.status];
                                    return (
                                        <tr key={work.id} className="bg-slate-800/50 border-b border-slate-700 hover:bg-slate-800">
                                            <td className="px-6 py-4 font-medium text-slate-100">{userInfo.name}</td>
                                            <td className="px-6 py-4">{userInfo.phone}</td>
                                            <td className="px-6 py-4">
                                                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${config.color}`}>
                                                    {config.label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <select
                                                    value={work.status}
                                                    onChange={(e) => onStatusChange(work.id, e.target.value as WorkHistory['status'])}
                                                    className="w-full max-w-[120px] bg-slate-700 border border-slate-600 rounded-md px-3 py-1.5 text-slate-100 text-xs focus:ring-2 focus:ring-amber-500 transition"
                                                    aria-label={`${userInfo.name}의 근무 상태 변경`}
                                                >
                                                    {Object.entries(STATUS_CONFIG).map(([statusKey, statusInfo]) => (
                                                        <option key={statusKey} value={statusKey}>
                                                            {statusInfo.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={4} className="text-center py-10">
                                        이 현장에 배정된 인력이 없습니다.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
