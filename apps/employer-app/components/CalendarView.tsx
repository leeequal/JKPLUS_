import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

interface SiteRequest {
    id: string;
    ownerId: string;
    name: string;
    address: string;
    supervisorName: string;
    supervisorPhone: string;
    jobType: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string;
}

interface JobRequest {
    id: string;
    siteId: string;
    date: string;
    workerCount: number;
    dailyRate: number;
    jobType: string;
    notes: string;
    status: 'requested' | 'assigned' | 'rejected' | 'published';
    assignedWorkerIds: string[];
    rejectReason?: string;
    createdAt: string;
}

interface EmployerUser {
    phone: string;
    name: string;
    companyName: string;
    isRegistered: boolean;
}

interface CalendarViewProps {
    sites: SiteRequest[];
    jobRequests: JobRequest[];
    currentUser: EmployerUser;
}

interface WorkerInfo {
    phone: string;
    name: string;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ sites, jobRequests, currentUser }) => {
    const [currentDate, setCurrentDate] = useState<Date>(new Date());
    const [selectedDateStr, setSelectedDateStr] = useState<string>(() => {
        const today = new Date();
        const y = today.getFullYear();
        const m = String(today.getMonth() + 1).padStart(2, '0');
        const d = String(today.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    });
    const [allWorkers, setAllWorkers] = useState<WorkerInfo[]>([]);

    // Fetch registered workers from localStorage to get their names
    useEffect(() => {
        try {
            const rawUsers = localStorage.getItem('registeredUsers');
            if (rawUsers) {
                setAllWorkers(JSON.parse(rawUsers));
            }
        } catch (e) {
            console.error('Failed to load registered users', e);
        }
    }, []);

    const mySites = useMemo(() => {
        return sites.filter(s => s.ownerId === currentUser.phone);
    }, [sites, currentUser.phone]);

    const mySiteIds = useMemo(() => {
        return mySites.map(s => s.id);
    }, [mySites]);

    const myJobs = useMemo(() => {
        return jobRequests.filter(jr => mySiteIds.includes(jr.siteId));
    }, [jobRequests, mySiteIds]);

    // Format currency Helper
    const formatWon = (value: number) => {
        return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' })
            .format(value)
            .replace('₩', '') + '원';
    };

    // Format phone helper
    const formatPhoneNumber = (phone: string) => {
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.length <= 3) return cleaned;
        if (cleaned.length <= 7) return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
        return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7, 11)}`;
    };

    // Calendar Year and Month
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth(); // 0-indexed

    const prevMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
    };

    const setToday = () => {
        const today = new Date();
        setCurrentDate(today);
        const y = today.getFullYear();
        const m = String(today.getMonth() + 1).padStart(2, '0');
        const d = String(today.getDate()).padStart(2, '0');
        setSelectedDateStr(`${y}-${m}-${d}`);
    };

    // Generate Calendar Days
    const calendarDays = useMemo(() => {
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
        
        const days: { dateStr: string; dayNum: number; isCurrentMonth: boolean }[] = [];

        // Previous month padding days
        const prevMonthTotalDays = new Date(year, month, 0).getDate();
        for (let i = firstDayOfMonth - 1; i >= 0; i--) {
            const prevYear = month === 0 ? year - 1 : year;
            const prevMon = month === 0 ? 11 : month - 1;
            const prevDay = prevMonthTotalDays - i;
            const dateStr = `${prevYear}-${String(prevMon + 1).padStart(2, '0')}-${String(prevDay).padStart(2, '0')}`;
            days.push({ dateStr, dayNum: prevDay, isCurrentMonth: false });
        }

        // Current month days
        for (let i = 1; i <= totalDaysInMonth; i++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            days.push({ dateStr, dayNum: i, isCurrentMonth: true });
        }

        // Next month padding days
        const remainingCells = 42 - days.length; // 6 rows * 7 days
        for (let i = 1; i <= remainingCells; i++) {
            const nextYear = month === 11 ? year + 1 : year;
            const nextMon = month === 11 ? 0 : month + 1;
            const dateStr = `${nextYear}-${String(nextMon + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            days.push({ dateStr, dayNum: i, isCurrentMonth: false });
        }

        return days;
    }, [year, month]);

    // Map jobs by date for fast lookup
    const jobsByDate = useMemo(() => {
        const map: { [dateStr: string]: JobRequest[] } = {};
        myJobs.forEach(job => {
            if (job.status !== 'rejected') {
                if (!map[job.date]) {
                    map[job.date] = [];
                }
                map[job.date].push(job);
            }
        });
        return map;
    }, [myJobs]);

    // Calculate spend statistics for the CURRENT display month
    const monthlyStats = useMemo(() => {
        let totalRequestedWorkers = 0;
        let totalAssignedWorkers = 0;
        let totalActualSpend = 0;
        let totalEstimatedSpend = 0;

        myJobs.forEach(job => {
            if (job.status !== 'rejected') {
                const jobDate = new Date(job.date);
                if (jobDate.getFullYear() === year && jobDate.getMonth() === month) {
                    totalRequestedWorkers += job.workerCount;
                    totalAssignedWorkers += job.assignedWorkerIds?.length || 0;
                    totalActualSpend += (job.assignedWorkerIds?.length || 0) * job.dailyRate;
                    totalEstimatedSpend += job.workerCount * job.dailyRate;
                }
            }
        });

        const matchingRate = totalRequestedWorkers > 0 
            ? Math.round((totalAssignedWorkers / totalRequestedWorkers) * 100) 
            : 0;

        return {
            totalRequestedWorkers,
            totalAssignedWorkers,
            totalActualSpend,
            totalEstimatedSpend,
            matchingRate
        };
    }, [myJobs, year, month]);

    // Selected Date's Job details
    const selectedDateJobs = useMemo(() => {
        return jobsByDate[selectedDateStr] || [];
    }, [jobsByDate, selectedDateStr]);

    // Total spend on selected date
    const selectedDateStats = useMemo(() => {
        let actual = 0;
        let estimated = 0;
        selectedDateJobs.forEach(job => {
            actual += (job.assignedWorkerIds?.length || 0) * job.dailyRate;
            estimated += job.workerCount * job.dailyRate;
        });
        return { actual, estimated };
    }, [selectedDateJobs]);

    const getWorkerName = (phone: string) => {
        const worker = allWorkers.find(w => w.phone === phone);
        return worker ? worker.name : '미지정 근로자';
    };

    return (
        <div className="space-y-6 animate-fadeIn text-slate-100">
            {/* Header / Monthly Navigator */}
            <div className="flex justify-between items-center bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
                <div className="flex items-center space-x-3">
                    <button 
                        onClick={prevMonth} 
                        className="p-2 hover:bg-slate-800 rounded-xl transition border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white"
                    >
                        <ChevronLeft className="h-5 w-5" strokeWidth={2.5} />
                    </button>
                    <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-indigo-400" />
                        {year}년 {month + 1}월 지출 달력
                    </h2>
                    <button 
                        onClick={nextMonth} 
                        className="p-2 hover:bg-slate-800 rounded-xl transition border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white"
                    >
                        <ChevronRight className="h-5 w-5" strokeWidth={2.5} />
                    </button>
                </div>
                <button 
                    onClick={setToday}
                    className="px-3.5 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20"
                >
                    오늘
                </button>
            </div>

            {/* Monthly Financial Stats Card */}
            <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800 flex flex-col justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">이달 총 실지출</span>
                    <span className="text-sm font-black text-emerald-400 mt-1 whitespace-nowrap">
                        {formatWon(monthlyStats.totalActualSpend)}
                    </span>
                </div>
                <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800 flex flex-col justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">이달 배정 인원</span>
                    <span className="text-sm font-black text-indigo-400 mt-1">
                        {monthlyStats.totalAssignedWorkers}명 <span className="text-[10px] font-medium text-slate-500">/ {monthlyStats.totalRequestedWorkers}명</span>
                    </span>
                </div>
                <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800 flex flex-col justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">이달 예상지출</span>
                    <span className="text-sm font-black text-amber-400 mt-1 whitespace-nowrap">
                        {formatWon(monthlyStats.totalEstimatedSpend)}
                    </span>
                </div>
            </div>

            {/* Calendar Grid Card */}
            <div className="bg-slate-900/60 p-4 rounded-3xl border border-slate-800/80 shadow-xl backdrop-blur-md">
                {/* Days of week */}
                <div className="grid grid-cols-7 gap-1 text-center mb-2">
                    {['일', '월', '화', '수', '목', '금', '토'].map((d, idx) => (
                        <span 
                            key={d} 
                            className={`text-xs font-bold py-1 ${
                                idx === 0 ? 'text-red-400/80' : idx === 6 ? 'text-blue-400/80' : 'text-slate-400'
                            }`}
                        >
                            {d}
                        </span>
                    ))}
                </div>

                {/* Days grid */}
                <div className="grid grid-cols-7 gap-1.5">
                    {calendarDays.map((cell) => {
                        const dayJobs = jobsByDate[cell.dateStr] || [];
                        const hasJobs = dayJobs.length > 0;
                        const isSelected = cell.dateStr === selectedDateStr;
                        
                        // Calculate day spent
                        let daySpent = 0;
                        let hasAssigned = false;
                        dayJobs.forEach(job => {
                            const count = job.assignedWorkerIds?.length || 0;
                            daySpent += count * job.dailyRate;
                            if (count > 0) hasAssigned = true;
                        });

                        // Determine date color class
                        const parsedDate = new Date(cell.dateStr);
                        const isSunday = parsedDate.getDay() === 0;
                        const isSaturday = parsedDate.getDay() === 6;

                        let textClass = 'text-slate-100';
                        if (!cell.isCurrentMonth) {
                            textClass = 'text-slate-600';
                        } else if (isSunday) {
                            textClass = 'text-red-400/90';
                        } else if (isSaturday) {
                            textClass = 'text-blue-400/90';
                        }

                        return (
                            <button
                                key={cell.dateStr}
                                onClick={() => setSelectedDateStr(cell.dateStr)}
                                className={`aspect-square p-1.5 rounded-xl flex flex-col justify-between items-start border transition-all ${
                                    isSelected 
                                        ? 'bg-indigo-600/20 border-indigo-500 text-white ring-2 ring-indigo-500/30' 
                                        : hasJobs 
                                            ? 'bg-slate-850/60 border-slate-800 hover:border-slate-700' 
                                            : 'bg-transparent border-transparent hover:bg-slate-850/30'
                                }`}
                            >
                                <span className={`text-[11px] font-extrabold ${textClass}`}>
                                    {cell.dayNum}
                                </span>
                                
                                {hasJobs && (
                                    <div className="w-full text-right mt-1">
                                        {daySpent > 0 ? (
                                            <span className="text-[8px] font-black text-emerald-400 leading-none block">
                                                {Math.round(daySpent / 10000)}만
                                            </span>
                                        ) : (
                                            <span className="text-[8px] font-bold text-amber-500 leading-none block">
                                                대기
                                            </span>
                                        )}
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Selected Date Details Panel */}
            <div className="bg-slate-900/60 p-5 rounded-3xl border border-slate-800/80 shadow-2xl backdrop-blur-md">
                <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-800/80">
                    <div>
                        <h3 className="text-sm font-black text-white">
                            📅 {selectedDateStr.slice(5).replace('-', '월 ')}일 지출 내역
                        </h3>
                        <p className="text-[11px] text-slate-400 mt-0.5">선택한 날짜의 인력 배정 및 지출 세부 정보</p>
                    </div>
                    {selectedDateJobs.length > 0 && (
                        <div className="text-right">
                            <span className="text-[10px] font-bold text-slate-400 block">이날 총 실지출</span>
                            <span className="text-sm font-black text-emerald-400 leading-none mt-0.5 block">
                                {formatWon(selectedDateStats.actual)}
                            </span>
                        </div>
                    )}
                </div>

                {selectedDateJobs.length === 0 ? (
                    <div className="text-center py-10 bg-slate-850/30 rounded-2xl border border-dashed border-slate-800">
                        <p className="text-xs text-slate-500 font-medium">이날 요청한 인력이 없습니다.</p>
                        <p className="text-[10px] text-slate-600 mt-1">달력에서 표시가 있는 날짜를 선택해보세요.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {selectedDateJobs.map((job) => {
                            const site = mySites.find(s => s.id === job.siteId);
                            const matchedCount = job.assignedWorkerIds?.length || 0;
                            const matchRatePercent = job.workerCount > 0 
                                ? Math.round((matchedCount / job.workerCount) * 100) 
                                : 0;
                            
                            return (
                                <div key={job.id} className="bg-slate-850/80 p-4 rounded-2xl border border-slate-800 space-y-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="text-xs font-black text-white flex items-center gap-1.5">
                                                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
                                                {site?.name || '알수없는 현장'}
                                            </h4>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="bg-slate-900 text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded border border-slate-800">
                                                    {job.jobType}
                                                </span>
                                                <span className="text-[10px] text-slate-400 font-medium">
                                                    단가: {formatWon(job.dailyRate)}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                                job.status === 'assigned' ? 'bg-emerald-950 text-emerald-300 border border-emerald-900' :
                                                job.status === 'published' ? 'bg-blue-950 text-blue-300 border border-blue-900' :
                                                'bg-yellow-950 text-amber-300 border border-yellow-900'
                                            }`}>
                                                {job.status === 'assigned' ? '배정완료' : job.status === 'published' ? '모집중' : '접수대기'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Stats for this job */}
                                    <div className="grid grid-cols-2 gap-3 bg-slate-900/40 p-2.5 rounded-xl border border-slate-800/60 text-xs">
                                        <div>
                                            <span className="text-[10px] text-slate-500 block">배정 인원</span>
                                            <span className="font-extrabold text-slate-300 mt-0.5 block">
                                                {matchedCount}명 / {job.workerCount}명
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-[10px] text-slate-500 block">실 지출 (예상 지출)</span>
                                            <span className="font-extrabold text-emerald-400 mt-0.5 block">
                                                {formatWon(matchedCount * job.dailyRate)} <span className="text-[10px] font-medium text-slate-500">({formatWon(job.workerCount * job.dailyRate)})</span>
                                            </span>
                                        </div>
                                    </div>

                                    {/* Assigned Workers list */}
                                    <div>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                                            👥 배정된 인력 목록 ({matchedCount}명)
                                        </span>
                                        {job.assignedWorkerIds?.length === 0 ? (
                                            <p className="text-[10px] text-slate-500 italic">현재 배정된 근로자가 없습니다.</p>
                                        ) : (
                                            <div className="grid grid-cols-1 gap-1.5">
                                                {job.assignedWorkerIds.map((phone) => {
                                                    const name = getWorkerName(phone);
                                                    return (
                                                        <div 
                                                            key={phone} 
                                                            className="flex justify-between items-center bg-slate-900/50 px-3 py-2 rounded-xl border border-slate-800 text-[11px]"
                                                        >
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="w-1 h-1 bg-emerald-500 rounded-full"></span>
                                                                <span className="font-bold text-slate-200">{name}</span>
                                                                <span className="text-[9px] text-slate-500 font-mono">({formatPhoneNumber(phone)})</span>
                                                            </div>
                                                            <a 
                                                                href={`tel:${phone}`}
                                                                className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 px-2 py-0.5 rounded transition"
                                                            >
                                                                전화
                                                            </a>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>

                                    {job.notes && (
                                        <div className="bg-slate-900/20 p-2 rounded-xl border border-slate-800/40 text-[10px] text-slate-400">
                                            <span className="font-bold text-slate-300 mr-1">📝 요청사항:</span>
                                            {job.notes}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};
