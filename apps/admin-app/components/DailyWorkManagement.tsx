
import React, { useState, useEffect } from 'react';
import { WORK_HISTORY_DATA, WorkHistory } from '../../user-app/data/workHistory';
import { SITES_DATA, Site } from '../../user-app/data/sites';
import { SiteWorkDetail } from './SiteWorkDetail';

export interface User {
    phone: string;
    name: string;
}

// Types for Employer Job Requests
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
    createdAt?: string;
}

// Aggregated stats for Live Status
interface SiteStats {
    siteId: string;
    siteName: string;
    required: number;
    assigned: number;
    attended: number;
    workItems: WorkHistory[];
}

const formatDateTime = (isoString?: string) => {
    if (!isoString) return '';
    try {
        const date = new Date(isoString);
        if (isNaN(date.getTime())) return '';
        return date.toLocaleString('ko-KR', {
            month: 'numeric', day: 'numeric',
            hour: '2-digit', minute: '2-digit', hour12: false
        });
    } catch {
        return '';
    }
};

const formatPhoneNumber = (phone: string) => {
    const cleaned = ('' + phone).replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3,4})(\d{4})$/);
    if (match) {
      return `${match[1]}-${match[2]}-${match[3]}`;
    }
    return phone;
};

// Modal for Publishing Recruitment Notice
const RecruitmentPublishModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (siteData: Site) => void;
    request: JobRequest;
    siteInfo: any;
}> = ({ isOpen, onClose, onSubmit, request, siteInfo }) => {
    const [formData, setFormData] = useState<Partial<Site>>({
        name: siteInfo.name || '',
        location: siteInfo.location || '',
        description: `[${request.jobType}] 인원 모집합니다.\n${request.notes || ''}`,
        dailyRate: request.dailyRate,
        totalSlots: request.workerCount,
        supervisor: { name: siteInfo.supervisor?.name || '', phone: siteInfo.supervisor?.phone || '' },
        confirmationDetails: { startTime: '07:00', onArrival: ['안전장구 착용 필수'], contactInfo: siteInfo.supervisor?.phone || '', notes: '' }
    });

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name.startsWith('supervisor.')) {
            const field = name.split('.')[1];
            setFormData(prev => ({ ...prev, supervisor: { ...prev.supervisor!, [field]: value } }));
        } else {
            setFormData(prev => ({ ...prev, [name]: name === 'dailyRate' || name === 'totalSlots' ? Number(value) : value }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const publishData: Site = {
            id: `published_${request.id}`,
            name: formData.name!,
            location: formData.location!,
            description: formData.description!,
            mapUrl: siteInfo.mapUrl || '',
            supervisor: formData.supervisor!,
            dailyRate: formData.dailyRate!,
            totalSlots: formData.totalSlots!,
            filledSlots: 0,
            coords: siteInfo.coords || { lat: 0, lng: 0 },
            confirmationDetails: formData.confirmationDetails as any,
            createdAt: new Date().toISOString()
        };
        onSubmit(publishData);
    };

    const commonInputClass = "w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-amber-500 transition";

    return (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-start pt-24 z-50 p-4">
            <div className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg border border-slate-700 flex flex-col max-h-[85vh]">
                <form onSubmit={handleSubmit} className="flex flex-col h-full">
                    <div className="p-6 border-b border-slate-700 shrink-0">
                        <h3 className="text-lg font-semibold text-white">공고 내용 검수 및 게시</h3>
                        <p className="text-sm text-slate-400">사용자 앱에 노출될 정보를 편집하세요.</p>
                    </div>
                    <div className="p-6 space-y-4 overflow-y-auto">
                        <div><label className="text-xs text-slate-400">현장명 (제목)</label><input name="name" value={formData.name} onChange={handleChange} className={commonInputClass} /></div>
                        <div><label className="text-xs text-slate-400">위치</label><input name="location" value={formData.location} onChange={handleChange} className={commonInputClass} /></div>
                        <div><label className="text-xs text-slate-400">상세 내용</label><textarea name="description" value={formData.description} onChange={handleChange} className={commonInputClass} rows={4} /></div>
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="text-xs text-slate-400">일급</label><input name="dailyRate" type="number" value={formData.dailyRate} onChange={handleChange} className={commonInputClass} /></div>
                            <div><label className="text-xs text-slate-400">모집 인원</label><input name="totalSlots" type="number" value={formData.totalSlots} onChange={handleChange} className={commonInputClass} /></div>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 p-4 bg-slate-800/50 rounded-b-xl border-t border-slate-700 shrink-0">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-slate-300 hover:text-white">취소</button>
                        <button type="submit" className="px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-500 font-bold">게시 승인</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Modal for Rejection Reason
const RejectReasonModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (reason: string) => void;
}> = ({ isOpen, onClose, onSubmit }) => {
    const [reason, setReason] = useState('');

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-start pt-24 z-50 p-4">
            <div className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-sm border border-slate-700 p-6">
                <h3 className="text-lg font-bold text-white mb-4">반려 사유 입력</h3>
                <textarea 
                    className="w-full bg-slate-700 border border-slate-600 rounded p-3 text-white mb-4" 
                    rows={3} 
                    placeholder="반려 사유를 입력하세요 (구인자에게 전달됨)"
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                />
                <div className="flex justify-end gap-2">
                    <button onClick={onClose} className="px-3 py-2 text-slate-400 hover:text-white">취소</button>
                    <button onClick={() => onSubmit(reason)} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-500 font-bold">반려 확정</button>
                </div>
            </div>
        </div>
    );
};

// Modal for Job Request Detail & Applicant Management
const JobRequestDetailModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    request: JobRequest;
    siteName: string;
    allUsers: User[];
    onApproveWorker: (user: User) => void;
}> = ({ isOpen, onClose, request, siteName, allUsers, onApproveWorker }) => {
    const [prioritySearch, setPrioritySearch] = useState('');

    if (!isOpen) return null;

    // Assigned users
    const assignedUsers = allUsers.filter(u => request.assignedWorkerIds.includes(u.phone));
    
    // Unassigned users (Available pool)
    const availableUsers = allUsers.filter(u => !request.assignedWorkerIds.includes(u.phone));

    // Filtered list for Priority Hiring
    const priorityCandidates = prioritySearch 
        ? availableUsers.filter(u => u.name.includes(prioritySearch) || u.phone.includes(prioritySearch))
        : [];

    return (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-start pt-24 z-50 p-4" onClick={onClose}>
            <div className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-2xl border border-slate-700 flex flex-col max-h-[85vh]" onClick={e => e.stopPropagation()}>
                {/* Header - Shrink-0 prevents it from scrolling away */}
                <div className="p-6 border-b border-slate-700 flex justify-between items-start shrink-0">
                    <div>
                        <h3 className="text-xl font-bold text-slate-100">{siteName}</h3>
                        <p className="text-slate-400 text-sm mt-1">{request.date} · {request.jobType}</p>
                    </div>
                    <div className="text-right">
                        <span className={`px-3 py-1 rounded text-xs font-bold ${
                            request.status === 'assigned' ? 'bg-blue-900 text-blue-300' : 
                            request.status === 'published' ? 'bg-green-900 text-green-300' :
                            request.status === 'rejected' ? 'bg-red-900 text-red-300' : 'bg-yellow-900 text-yellow-300'
                        }`}>
                            {request.status === 'assigned' ? '배정 완료' : 
                            request.status === 'published' ? '공고 게시중' :
                            request.status === 'rejected' ? '반려됨' : '요청중'}
                        </span>
                        {request.createdAt && <p className="text-[10px] text-slate-500 mt-2">요청: {formatDateTime(request.createdAt)}</p>}
                    </div>
                </div>

                {/* Content - overflow-y-auto allows scrolling inside this area */}
                <div className="p-6 overflow-y-auto flex-1 space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-2 gap-4 bg-slate-900/30 p-4 rounded-lg">
                        <div>
                            <span className="text-xs text-slate-500 block mb-1">요청 인원</span>
                            <span className="text-white font-bold">{request.workerCount}명</span>
                        </div>
                        <div>
                            <span className="text-xs text-slate-500 block mb-1">책정 단가</span>
                            <span className="text-amber-400 font-bold">{request.dailyRate.toLocaleString()}원</span>
                        </div>
                        <div className="col-span-2">
                            <span className="text-xs text-slate-500 block mb-1">요청 사항</span>
                            <p className="text-slate-300 text-sm">{request.notes || '없음'}</p>
                        </div>
                    </div>

                    {/* Assigned Workers */}
                    <div>
                        <h4 className="text-sm font-bold text-slate-200 mb-3 flex items-center">
                            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                            확정된 인원 ({assignedUsers.length}/{request.workerCount})
                        </h4>
                        {assignedUsers.length > 0 ? (
                            <div className="bg-slate-900/50 rounded-lg overflow-hidden border border-slate-700">
                                {assignedUsers.map(user => (
                                    <div key={user.phone} className="p-3 flex justify-between items-center border-b border-slate-700 last:border-0">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs text-slate-300">
                                                {user.name[0]}
                                            </div>
                                            <div>
                                                <p className="text-sm text-slate-200 font-medium">{user.name}</p>
                                                <p className="text-xs text-slate-500">{formatPhoneNumber(user.phone)}</p>
                                            </div>
                                        </div>
                                        <span className="text-green-400 text-xs font-bold">확정됨</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-4 text-slate-500 text-sm bg-slate-900/30 rounded-lg">
                                아직 배정된 인원이 없습니다.
                            </div>
                        )}
                    </div>

                    <hr className="border-slate-700 my-4" />

                    {/* Priority Hiring Section */}
                    <div>
                        <h4 className="text-sm font-bold text-amber-400 mb-3 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            우선 채용 (관리자 직권 배정)
                        </h4>
                        <div className="bg-slate-900/30 p-3 rounded-lg border border-slate-700 mb-2">
                            <input 
                                type="text" 
                                placeholder="이름 또는 전화번호로 검색하여 배정" 
                                className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-white placeholder-slate-500 focus:ring-1 focus:ring-amber-500 mb-2"
                                value={prioritySearch}
                                onChange={e => setPrioritySearch(e.target.value)}
                            />
                            {prioritySearch && (
                                <div className="max-h-40 overflow-y-auto bg-slate-800 rounded border border-slate-600">
                                    {priorityCandidates.length > 0 ? priorityCandidates.map(user => (
                                        <div key={user.phone} className="p-2 hover:bg-slate-700 flex justify-between items-center border-b border-slate-700/50 last:border-0">
                                            <span className="text-sm text-slate-300">{user.name} ({formatPhoneNumber(user.phone)})</span>
                                            <button 
                                                onClick={() => {
                                                    onApproveWorker(user);
                                                    setPrioritySearch('');
                                                }}
                                                className="text-xs bg-amber-600 hover:bg-amber-500 text-white px-2 py-1 rounded"
                                            >
                                                배정
                                            </button>
                                        </div>
                                    )) : (
                                        <div className="p-2 text-xs text-slate-500 text-center">검색 결과가 없습니다.</div>
                                    )}
                                </div>
                            )}
                        </div>
                        <p className="text-xs text-slate-500">
                            * 검색된 인원을 클릭하여 즉시 배정 목록에 추가합니다.
                        </p>
                    </div>

                    {/* Applicant List */}
                    <div>
                        <h4 className="text-sm font-bold text-slate-200 mb-3 flex items-center">
                            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                            지원자 및 대기 인력 목록 ({availableUsers.length})
                        </h4>
                        <div className="bg-slate-900/50 rounded-lg overflow-hidden border border-slate-700">
                            {availableUsers.length > 0 ? availableUsers.map(user => (
                                <div key={user.phone} className="p-3 flex justify-between items-center border-b border-slate-700 last:border-0 hover:bg-slate-800 transition">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center text-xs text-slate-300">
                                            {user.name[0]}
                                        </div>
                                        <div>
                                            <p className="text-sm text-slate-200 font-medium">{user.name}</p>
                                            <p className="text-xs text-slate-500">{formatPhoneNumber(user.phone)}</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => onApproveWorker(user)}
                                        disabled={assignedUsers.length >= request.workerCount}
                                        className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white text-xs px-3 py-1.5 rounded transition"
                                    >
                                        승인 (배정)
                                    </button>
                                </div>
                            )) : (
                                <div className="text-center py-4 text-slate-500 text-sm">
                                    가용 인력이 없습니다.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer - Shrink-0 */}
                <div className="p-4 border-t border-slate-700 flex justify-end shrink-0">
                    <button onClick={onClose} className="bg-slate-700 hover:bg-slate-600 text-white px-5 py-2 rounded-md text-sm font-bold">
                        닫기
                    </button>
                </div>
            </div>
        </div>
    );
};

// Modal for Manual Job Request Registration (Telephone Booking)
const ManualJobRequestModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (newRequest: Omit<JobRequest, 'id' | 'assignedWorkerIds' | 'createdAt'>) => void;
    sites: Site[];
}> = ({ isOpen, onClose, onSubmit, sites }) => {
    const [siteId, setSiteId] = useState('');
    const [date, setDate] = useState('2024-08-05'); // default date consistent with MOCK_TODAY or tomorrow
    const [workerCount, setWorkerCount] = useState(1);
    const [dailyRate, setDailyRate] = useState(160000);
    const [jobType, setJobType] = useState('보통인부');
    const [notes, setNotes] = useState('');

    useEffect(() => {
        if (isOpen && sites.length > 0 && !siteId) {
            setSiteId(sites[0].id);
        }
    }, [isOpen, sites, siteId]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!siteId) {
            alert('현장을 선택해주세요.');
            return;
        }
        onSubmit({
            siteId,
            date,
            workerCount,
            dailyRate,
            jobType,
            notes,
            status: 'published' // Admin manually registers, so it goes straight to published/active status
        });
        // reset form
        setNotes('');
        setWorkerCount(1);
    };

    const commonInputClass = "w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-amber-500 transition";
    const labelClass = "block text-xs text-slate-400 mb-1 font-semibold";

    const jobTypes = ['보통인부', '조공', '기공', '타설', '비계', '철근', '목수', '직접 입력'];

    return (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-start pt-16 z-50 p-4" onClick={onClose}>
            <div className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg border border-slate-700 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit} className="flex flex-col h-full">
                    <div className="p-6 border-b border-slate-700 shrink-0">
                        <div className="flex items-center gap-2 text-indigo-400 mb-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            <span className="text-xs font-bold uppercase tracking-wider">인력사무소 전화/수동 접수</span>
                        </div>
                        <h3 className="text-lg font-bold text-white">현장 구인 요청 직접 등록</h3>
                        <p className="text-xs text-slate-400 mt-1">앱 사용이 어려운 구인자의 유선 요청을 시스템에 대리 등록합니다.</p>
                    </div>

                    <div className="p-6 space-y-4 overflow-y-auto">
                        <div>
                            <label className={labelClass}>현장 선택</label>
                            <select 
                                value={siteId} 
                                onChange={e => setSiteId(e.target.value)} 
                                className={commonInputClass}
                                required
                            >
                                <option value="" disabled>현장을 선택하세요</option>
                                {sites.map(s => (
                                    <option key={s.id} value={s.id}>{s.name} ({s.location})</option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>출역 요청 일자</label>
                                <input 
                                    type="date" 
                                    value={date} 
                                    onChange={e => setDate(e.target.value)} 
                                    className={commonInputClass}
                                    required
                                />
                            </div>
                            <div>
                                <label className={labelClass}>모집 직종</label>
                                {jobType !== '직접 입력' && !jobTypes.slice(0, -1).includes(jobType) ? (
                                    <div className="flex gap-2">
                                        <input 
                                            type="text" 
                                            value={jobType} 
                                            onChange={e => setJobType(e.target.value)} 
                                            className={commonInputClass}
                                            placeholder="직종 직접 입력"
                                        />
                                        <button 
                                            type="button" 
                                            onClick={() => setJobType('보통인부')} 
                                            className="px-2 bg-slate-700 border border-slate-600 hover:bg-slate-600 rounded text-xs text-slate-300"
                                        >
                                            선택형
                                        </button>
                                    </div>
                                ) : (
                                    <select 
                                        value={jobType} 
                                        onChange={e => setJobType(e.target.value)} 
                                        className={commonInputClass}
                                        required
                                    >
                                        {jobTypes.map(type => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                )}
                            </div>
                        </div>

                        {jobType === '직접 입력' && (
                            <div>
                                <label className={labelClass}>직종명 입력</label>
                                <input 
                                    type="text" 
                                    placeholder="예: 타일공, 용접공 등" 
                                    className={commonInputClass}
                                    onChange={e => setJobType(e.target.value)}
                                    required
                                />
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>요청 인원 (명)</label>
                                <input 
                                    type="number" 
                                    min="1" 
                                    value={workerCount} 
                                    onChange={e => setWorkerCount(Number(e.target.value))} 
                                    className={commonInputClass}
                                    required
                                />
                            </div>
                            <div>
                                <label className={labelClass}>책정 일급 (원)</label>
                                <input 
                                    type="number" 
                                    step="5000"
                                    min="50000"
                                    value={dailyRate} 
                                    onChange={e => setDailyRate(Number(e.target.value))} 
                                    className={commonInputClass}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className={labelClass}>특이사항 및 작업 설명</label>
                            <textarea 
                                value={notes} 
                                onChange={e => setNotes(e.target.value)} 
                                placeholder="예: 신분증 지참, 06:40분까지 도착 요망" 
                                className={commonInputClass} 
                                rows={3}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 p-4 bg-slate-800/50 rounded-b-xl border-t border-slate-700 shrink-0">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-slate-300 hover:text-white text-sm font-semibold">
                            취소
                        </button>
                        <button type="submit" className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-bold shadow-lg shadow-indigo-600/10">
                            대리 등록 완료
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const DEFAULT_JOB_REQUESTS: JobRequest[] = [
    {
        id: 'job_seed_today_1',
        siteId: 'site_req_sample_1',
        date: '2024-08-05',
        workerCount: 3,
        dailyRate: 170000,
        jobType: '조공',
        notes: '자재 정리 및 청소 작업입니다.',
        status: 'published',
        assignedWorkerIds: ['01080000000', '01080000001'],
        createdAt: '2024-08-04T09:00:00.000Z'
    },
    {
        id: 'job_seed_today_2',
        siteId: 'site_req_mock_0',
        date: '2024-08-05',
        workerCount: 2,
        dailyRate: 160000,
        jobType: '보통인부',
        notes: '현장 정리 정돈, 초보 가능.',
        status: 'published',
        assignedWorkerIds: ['01080000002'],
        createdAt: '2024-08-04T11:20:00.000Z'
    },
    {
        id: 'job_seed_tomorrow_1',
        siteId: 'site_req_sample_1',
        date: '2024-08-06',
        workerCount: 4,
        dailyRate: 170000,
        jobType: '조공',
        notes: '내일 아침 일찍 자재 반입 예정입니다. 시간 엄수.',
        status: 'published',
        assignedWorkerIds: ['01080000000', '01080000001'],
        createdAt: '2024-08-05T10:00:00.000Z'
    },
    {
        id: 'job_seed_tomorrow_2',
        siteId: 'site_req_mock_0',
        date: '2024-08-06',
        workerCount: 2,
        dailyRate: 160000,
        jobType: '보통인부',
        notes: '실내 인테리어 철거 보조 및 자재 정리.',
        status: 'published',
        assignedWorkerIds: ['01080000002'],
        createdAt: '2024-08-05T12:00:00.000Z'
    },
    {
        id: 'manual_seed_tomorrow_3',
        siteId: 'site_req_mock_1',
        date: '2024-08-06',
        workerCount: 3,
        dailyRate: 220000,
        jobType: '기공',
        notes: '유선 전화 접수 건: 용접 기공 3명 구인 요청.',
        status: 'published',
        assignedWorkerIds: ['01080000003'],
        createdAt: '2024-08-05T15:30:00.000Z'
    }
];

export const DailyWorkManagement: React.FC = () => {
    const MOCK_TODAY = '2024-08-05';
    const MOCK_TOMORROW = '2024-08-06';
    const [activeTab, setActiveTab] = useState<'live' | 'tomorrow' | 'recruitment' | 'history'>('live');
    const [jobRequests, setJobRequests] = useState<JobRequest[]>([]);
    const [sites, setSites] = useState<Site[]>([]);
    const [workHistory, setWorkHistory] = useState<WorkHistory[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    
    // Modals
    const [selectedRequest, setSelectedRequest] = useState<JobRequest | null>(null);
    const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [isManualModalOpen, setIsManualModalOpen] = useState(false);
    
    // State for History Detail View
    const [viewingRequest, setViewingRequest] = useState<JobRequest | null>(null);
    
    // For detail view (Live Tab)
    const [selectedSiteStats, setSelectedSiteStats] = useState<SiteStats | null>(null);

    useEffect(() => {
        // Load Data
        const storedEmployerSites = localStorage.getItem('employerSites');
        const employerSites = storedEmployerSites ? JSON.parse(storedEmployerSites) : [];
        const allSites = [...SITES_DATA, ...employerSites];
        setSites(allSites);

        const storedHistory = localStorage.getItem('workHistory');
        setWorkHistory(storedHistory ? JSON.parse(storedHistory) : WORK_HISTORY_DATA);

        const storedJobs = localStorage.getItem('jobRequests');
        if (storedJobs) {
            setJobRequests(JSON.parse(storedJobs));
        } else {
            setJobRequests(DEFAULT_JOB_REQUESTS);
            localStorage.setItem('jobRequests', JSON.stringify(DEFAULT_JOB_REQUESTS));
        }

        const usersRaw = localStorage.getItem('registeredUsers');
        if (usersRaw) setUsers(JSON.parse(usersRaw));
    }, []);

    const getSiteInfo = (siteId: string): Site => {
        const found = sites.find(s => s.id === siteId);
        if (found) return found;
        return {
            id: siteId,
            name: '알 수 없는 현장',
            location: '미지정 주소',
            description: '',
            mapUrl: '',
            supervisor: { name: '담당자 미지정', phone: '' },
            dailyRate: 0,
            totalSlots: 0,
            filledSlots: 0,
            coords: { lat: 37.5665, lng: 126.9780 },
            confirmationDetails: { startTime: '07:00', onArrival: [], contactInfo: '', notes: '' }
        };
    }

    // --- Recruitment Logic ---
    const handleOpenPublish = (req: JobRequest) => {
        setSelectedRequest(req);
        setIsPublishModalOpen(true);
    };

    const handleOpenReject = (req: JobRequest) => {
        setSelectedRequest(req);
        setIsRejectModalOpen(true);
    };

    const handlePublishSubmit = (siteData: Site) => {
        // 1. Save new recruitment notice (Site)
        const currentNoticesRaw = localStorage.getItem('recruitmentNotices');
        const currentNotices = currentNoticesRaw ? JSON.parse(currentNoticesRaw) : [];
        const updatedNotices = [siteData, ...currentNotices];
        localStorage.setItem('recruitmentNotices', JSON.stringify(updatedNotices));

        // 2. Update Request Status
        if (selectedRequest) {
            const updatedJobs = jobRequests.map(job => 
                job.id === selectedRequest.id ? { ...job, status: 'published' as const } : job
            );
            setJobRequests(updatedJobs);
            localStorage.setItem('jobRequests', JSON.stringify(updatedJobs));
        }

        setIsPublishModalOpen(false);
        setSelectedRequest(null);
        alert('사용자 앱에 공고가 게시되었습니다.');
    };

    const handleRejectSubmit = (reason: string) => {
        if (selectedRequest) {
            const updatedJobs = jobRequests.map(job => 
                job.id === selectedRequest.id ? { ...job, status: 'rejected' as const, rejectReason: reason } : job
            );
            setJobRequests(updatedJobs);
            localStorage.setItem('jobRequests', JSON.stringify(updatedJobs));
        }
        setIsRejectModalOpen(false);
        setSelectedRequest(null);
    };

    // --- Applicant Approval Logic ---
    const handleApproveWorker = (request: JobRequest, user: User) => {
        // 1. Update JobRequest with new assigned worker ID
        const updatedWorkerIds = [...request.assignedWorkerIds, user.phone];
        const isFull = updatedWorkerIds.length >= request.workerCount;
        
        const updatedJobs = jobRequests.map(job => 
            job.id === request.id ? { 
                ...job, 
                assignedWorkerIds: updatedWorkerIds,
                // If filled, change status to 'assigned', otherwise keep current status (e.g. 'published')
                status: isFull ? 'assigned' as const : job.status 
            } : job
        );
        setJobRequests(updatedJobs);
        localStorage.setItem('jobRequests', JSON.stringify(updatedJobs));
        
        // Update local viewingRequest state to reflect changes immediately in modal
        const updatedViewingRequest = updatedJobs.find(j => j.id === request.id) || null;
        setViewingRequest(updatedViewingRequest);

        // 2. Create WorkHistory entry (Confirmed status)
        const siteName = getSiteInfo(request.siteId).name;
        const newWork: WorkHistory = {
            id: `wh_${Date.now()}_${Math.floor(Math.random()*1000)}`,
            userId: user.phone,
            siteId: request.siteId,
            siteName: siteName,
            date: request.date,
            dailyRate: request.dailyRate,
            status: '확정'
        };

        const updatedHistory = [...workHistory, newWork];
        setWorkHistory(updatedHistory);
        localStorage.setItem('workHistory', JSON.stringify(updatedHistory));

        alert(`${user.name} 님이 배정(확정) 되었습니다.`);
    };


    // --- Live Status Logic ---
    const getLiveStats = (): SiteStats[] => {
        const todayWork = workHistory.filter(wh => wh.date === MOCK_TODAY);
        // Include published/assigned requests for today
        const todayRequests = jobRequests.filter(req => req.date === MOCK_TODAY && (req.status === 'published' || req.status === 'assigned'));
        
        const activeSiteIds = new Set([...todayWork.map(w => w.siteId), ...todayRequests.map(r => r.siteId)]);
        
        return Array.from(activeSiteIds).map(siteId => {
            const siteInfo = getSiteInfo(siteId);
            const siteWorkItems = todayWork.filter(w => w.siteId === siteId);
            const siteRequest = todayRequests.find(r => r.siteId === siteId);
            
            const required = siteRequest ? siteRequest.workerCount : (siteInfo as any).totalSlots || 0;
            const assigned = siteWorkItems.length;
            const attended = siteWorkItems.filter(w => ['출근', '완료', '지급완료'].includes(w.status)).length;

            return {
                siteId,
                siteName: siteInfo.name,
                required,
                assigned,
                attended,
                workItems: siteWorkItems
            };
        });
    };

    const handleManualJobRequestSubmit = (newReqData: Omit<JobRequest, 'id' | 'assignedWorkerIds' | 'createdAt'>) => {
        const newRequest: JobRequest = {
            ...newReqData,
            id: `manual_${Date.now()}`,
            assignedWorkerIds: [],
            createdAt: new Date().toISOString()
        };

        const updatedJobs = [newRequest, ...jobRequests];
        setJobRequests(updatedJobs);
        localStorage.setItem('jobRequests', JSON.stringify(updatedJobs));

        setIsManualModalOpen(false);
        alert(`전화 접수 구인 요청이 정상적으로 대리 등록되었습니다!\n등록된 공고로 인근 근로자들을 직권 배정할 수 있습니다.`);
    };

    const handleWorkerStatusChange = (workId: string, newStatus: WorkHistory['status']) => {
        const updatedHistory = workHistory.map(wh => wh.id === workId ? { ...wh, status: newStatus } : wh);
        setWorkHistory(updatedHistory);
        localStorage.setItem('workHistory', JSON.stringify(updatedHistory));
        
        if (selectedSiteStats) {
            const updatedItems = updatedHistory.filter(wh => wh.date === MOCK_TODAY && wh.siteId === selectedSiteStats.siteId);
            setSelectedSiteStats(prev => prev ? ({ ...prev, workItems: updatedItems }) : null);
        }
    };

    if (selectedSiteStats) {
        return (
            <SiteWorkDetail 
                siteName={selectedSiteStats.siteName}
                workItems={selectedSiteStats.workItems}
                users={users}
                onStatusChange={handleWorkerStatusChange}
                onBack={() => setSelectedSiteStats(null)}
                currentDate={MOCK_TODAY}
            />
        );
    }

    return (
        <div className="animate-fadeIn">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-100">일일 출역 관리</h2>
                <p className="text-xs text-slate-400 mt-1">현장 출역 현황을 모니터링하고 인력 구인 및 배정을 직접 조율합니다.</p>
            </div>

            <div className="flex flex-wrap gap-2 bg-slate-900/40 p-1.5 rounded-xl border border-slate-800 w-fit mb-6">
                <button 
                    onClick={() => setActiveTab('live')}
                    className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition flex items-center gap-1.5 ${activeTab === 'live' ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/10' : 'text-slate-400 hover:text-slate-200'}`}
                >
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                    실시간 출역 현황 (오늘)
                </button>

                {/* 현장별 모집 관리(직접등록) - Placed in-between and styled with emerald green */}
                <button 
                    onClick={() => setIsManualModalOpen(true)}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-sm rounded-lg shadow-lg shadow-emerald-900/40 flex items-center gap-1.5 transition border border-emerald-500/30"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    현장별 모집 관리(직접등록)
                </button>

                <button 
                    onClick={() => setActiveTab('recruitment')}
                    className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition flex items-center gap-1 ${activeTab === 'recruitment' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/10' : 'text-slate-400 hover:text-slate-200'}`}
                >
                    현장별 모집 관리 (승인)
                </button>

                <button 
                    onClick={() => setActiveTab('tomorrow')}
                    className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition flex items-center gap-1.5 ${activeTab === 'tomorrow' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/10' : 'text-slate-400 hover:text-slate-200'}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    내일 출역 현황판 (내일)
                </button>

                <button 
                    onClick={() => setActiveTab('history')}
                    className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition ${activeTab === 'history' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                >
                    구인 요청 내역
                </button>
            </div>

            {/* Tab 1: Live Status */}
            {activeTab === 'live' && (
                <div className="space-y-4">
                    <p className="text-sm text-slate-400 mb-2">
                        📅 <span className="font-bold text-white">{MOCK_TODAY}</span> 기준 현황입니다. 카드를 클릭하면 상세 인원 리스트를 볼 수 있습니다.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {getLiveStats().map(stat => (
                            <div 
                                key={stat.siteId} 
                                onClick={() => setSelectedSiteStats(stat)}
                                className="bg-slate-800 p-5 rounded-xl border border-slate-700 hover:border-amber-500 cursor-pointer transition group"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="font-bold text-lg text-white group-hover:text-amber-400 transition-colors truncate pr-2">{stat.siteName}</h3>
                                    <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded">상세보기 &gt;</span>
                                </div>
                                <div className="grid grid-cols-3 gap-2 text-center">
                                    <div className="bg-slate-900/50 rounded p-2">
                                        <div className="text-xs text-slate-500">모집</div>
                                        <div className="font-bold text-slate-200">{stat.required}명</div>
                                    </div>
                                    <div className="bg-slate-900/50 rounded p-2">
                                        <div className="text-xs text-slate-500">배정</div>
                                        <div className="font-bold text-blue-400">{stat.assigned}명</div>
                                    </div>
                                    <div className="bg-slate-900/50 rounded p-2">
                                        <div className="text-xs text-slate-500">출근</div>
                                        <div className="font-bold text-green-400">{stat.attended}명</div>
                                    </div>
                                </div>
                                <div className="mt-3 w-full bg-slate-700 rounded-full h-1.5">
                                    <div 
                                        className="bg-green-500 h-1.5 rounded-full transition-all duration-500" 
                                        style={{ width: `${stat.required > 0 ? (stat.attended / stat.required) * 100 : 0}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                    {getLiveStats().length === 0 && (
                        <div className="text-center py-12 text-slate-500 border border-dashed border-slate-700 rounded-xl">
                            오늘 예정된 출역 현장이 없습니다.
                        </div>
                    )}
                </div>
            )}

            {/* Tab 4: Tomorrow's Workforce Board */}
            {activeTab === 'tomorrow' && (
                <div className="space-y-6">
                    <div className="p-5 bg-blue-950/30 border border-blue-800/40 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <p className="text-sm font-bold text-blue-300 flex items-center gap-1.5">
                                <span>📅 내일 ({MOCK_TOMORROW}) 전체 출역 상황판</span>
                            </p>
                            <p className="text-xs text-slate-400 mt-1">
                                현장별 구인 신청(구인자 앱 등록 건) 및 수동 유선 직접 등록 건의 내역과 실시간 배정 현황을 점검합니다.
                            </p>
                        </div>
                        <div className="flex gap-4 text-center text-xs shrink-0 bg-slate-900/60 p-3 rounded-lg border border-slate-800/60">
                            <div>
                                <div className="text-slate-500">총 현장수</div>
                                <div className="text-sm font-bold text-slate-200">
                                    {jobRequests.filter(req => req.date === MOCK_TOMORROW).length}개소
                                </div>
                            </div>
                            <div className="border-l border-slate-800 pl-4">
                                <div className="text-slate-500">총 모집인원</div>
                                <div className="text-sm font-bold text-slate-200">
                                    {jobRequests.filter(req => req.date === MOCK_TOMORROW).reduce((acc, curr) => acc + curr.workerCount, 0)}명
                                </div>
                            </div>
                            <div className="border-l border-slate-800 pl-4">
                                <div className="text-slate-500">현재 배정인원</div>
                                <div className="text-sm font-bold text-blue-400 animate-pulse">
                                    {jobRequests.filter(req => req.date === MOCK_TOMORROW).reduce((acc, curr) => acc + curr.assignedWorkerIds.length, 0)}명
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                        {jobRequests.filter(req => req.date === MOCK_TOMORROW).map(job => {
                            const isManual = job.id.startsWith('manual');
                            const site = getSiteInfo(job.siteId);
                            const assignedPercent = job.workerCount > 0 ? (job.assignedWorkerIds.length / job.workerCount) * 100 : 0;
                            
                            return (
                                <div key={job.id} className="bg-slate-800/90 rounded-xl border border-slate-700/80 p-5 flex flex-col justify-between hover:border-blue-500 transition shadow-lg group">
                                    <div>
                                        <div className="flex items-start justify-between gap-2 mb-3.5">
                                            <div>
                                                <h4 className="font-bold text-white text-lg group-hover:text-blue-400 transition-colors truncate max-w-[240px]">{site.name}</h4>
                                                <span className="text-[11px] text-slate-500">{site.location}</span>
                                            </div>
                                            {isManual ? (
                                                <span className="shrink-0 text-[10px] bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 font-semibold px-2 py-1 rounded-md flex items-center gap-1">
                                                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                                                    지정 등록 (전화 접수)
                                                </span>
                                            ) : (
                                                <span className="shrink-0 text-[10px] bg-indigo-950/80 text-indigo-400 border border-indigo-800/60 font-semibold px-2 py-1 rounded-md flex items-center gap-1">
                                                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse"></span>
                                                    구인자 앱 신청
                                                </span>
                                            )}
                                        </div>

                                        <div className="space-y-2 text-sm text-slate-300 bg-slate-900/50 p-3 rounded-lg border border-slate-800/40 mb-4">
                                            <div className="flex justify-between">
                                                <span className="text-slate-500 text-xs">요청 구직</span>
                                                <span className="font-semibold text-slate-200">{job.jobType}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-500 text-xs">지정 단가</span>
                                                <span className="font-mono text-amber-400 text-xs font-semibold">{job.dailyRate.toLocaleString()} 원</span>
                                            </div>
                                            <div className="flex justify-between items-start">
                                                <span className="text-slate-500 text-xs shrink-0 mr-4">전달/특이사항</span>
                                                <span className="text-slate-400 text-xs text-right break-words">{job.notes || '전달 사항 없음'}</span>
                                            </div>
                                        </div>

                                        <div className="mb-4 bg-slate-900/20 p-2.5 rounded-lg border border-slate-700/30">
                                            <div className="flex justify-between items-center text-xs text-slate-400 mb-2">
                                                <span>배정 달성 현황</span>
                                                <span className="font-bold text-slate-200 font-mono">
                                                    {job.assignedWorkerIds.length} / {job.workerCount} 명 ({Math.round(assignedPercent)}%)
                                                </span>
                                            </div>
                                            <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                                                <div 
                                                    className={`h-full rounded-full transition-all duration-500 ${assignedPercent === 100 ? 'bg-blue-500' : 'bg-amber-500'}`} 
                                                    style={{ width: `${assignedPercent}%` }}
                                                ></div>
                                            </div>
                                        </div>

                                        {/* Assigned Workers list */}
                                        <div className="space-y-2">
                                            <div className="text-xs font-bold text-slate-400 flex items-center gap-1">
                                                <span>👥 배정 근로자 리스트</span>
                                            </div>
                                            {job.assignedWorkerIds.length === 0 ? (
                                                <div className="text-xs text-slate-500 italic py-2 bg-slate-900/10 rounded border border-dashed border-slate-800 text-center">
                                                    아직 배정된 근로자가 없습니다. 아래 버튼으로 직권 배정할 수 있습니다.
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-2 gap-1.5">
                                                    {job.assignedWorkerIds.map(phone => {
                                                        const name = users.find(u => u.phone === phone)?.name || '알수없음';
                                                        return (
                                                            <div key={phone} className="text-xs bg-slate-900/60 hover:bg-slate-900 text-slate-200 px-2.5 py-1.5 rounded-lg border border-slate-700/50 flex items-center justify-between gap-1">
                                                                <span className="font-semibold">{name}</span>
                                                                <span className="text-[10px] text-slate-500 font-mono">{formatPhoneNumber(phone)}</span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mt-5 pt-4 border-t border-slate-700/60 flex justify-end">
                                        <button 
                                            onClick={() => setViewingRequest(job)}
                                            className="px-3.5 py-2 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 border border-indigo-500/30 shadow-md"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                            </svg>
                                            인력 직권 배정관리
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {jobRequests.filter(req => req.date === MOCK_TOMORROW).length === 0 && (
                        <div className="text-center py-16 text-slate-500 border border-dashed border-slate-700 rounded-xl">
                            내일 예정된 출역 현장 및 구인 공고가 없습니다.
                        </div>
                    )}
                </div>
            )}

            {/* Tab 2: Recruitment Management (Publishing) */}
            {activeTab === 'recruitment' && (
                <div className="space-y-4">
                    {jobRequests.filter(req => req.status === 'requested').length === 0 ? (
                        <div className="text-center py-10 text-slate-500 border border-dashed border-slate-700 rounded-xl">승인 대기 중인 구인 요청이 없습니다.</div>
                    ) : (
                        jobRequests.filter(req => req.status === 'requested').map(job => (
                            <div key={job.id} className="bg-slate-800/50 p-5 rounded-xl border border-slate-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-amber-400 font-bold text-lg">{getSiteInfo(job.siteId).name}</span>
                                        <span className="bg-red-600 text-white text-[10px] px-2 py-0.5 rounded-full animate-pulse">승인 대기</span>
                                    </div>
                                    <p className="text-slate-300">
                                        {job.date} · {job.jobType} <span className="font-bold text-white">{job.workerCount}명</span> 필요
                                    </p>
                                    <p className="text-xs text-slate-500 mt-1">{job.notes || '특이사항 없음'}</p>
                                </div>
                                <div className="flex flex-col items-end gap-2 w-full md:w-auto">
                                    <div className="flex gap-2 w-full md:w-auto">
                                        <button onClick={() => handleOpenReject(job)} className="flex-1 md:flex-none px-4 py-2 border border-red-500 text-red-400 rounded hover:bg-red-900/20 text-sm">
                                            반려
                                        </button>
                                        <button onClick={() => handleOpenPublish(job)} className="flex-1 md:flex-none bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-lg text-sm font-bold shadow-lg">
                                            검토 및 공고 게시
                                        </button>
                                    </div>
                                    {job.createdAt && <p className="text-[10px] text-slate-600">요청일시: {formatDateTime(job.createdAt)}</p>}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Tab 3: Request History & Application Management */}
            {activeTab === 'history' && (
                <div className="space-y-4">
                    <p className="text-sm text-slate-400 mb-2">항목을 클릭하여 지원자를 확인하고 배정(승인)할 수 있습니다.</p>
                    {jobRequests.sort((a,b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()).map(job => (
                        <div 
                            key={job.id} 
                            onClick={() => setViewingRequest(job)}
                            className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 flex justify-between items-center cursor-pointer hover:bg-slate-800 hover:border-amber-500 transition group"
                        >
                            <div>
                                <span className="text-slate-200 font-bold group-hover:text-amber-400 transition-colors">{getSiteInfo(job.siteId).name}</span>
                                <span className="mx-2 text-slate-600">|</span>
                                <span className="text-sm text-slate-400">{job.date} {job.jobType} <span className="font-bold text-slate-300">{job.assignedWorkerIds.length}/{job.workerCount}명</span></span>
                            </div>
                            <div className="text-right">
                                <div className="flex items-center gap-2 justify-end">
                                    {job.status === 'requested' && <span className="text-yellow-500 text-xs border border-yellow-500 px-2 py-1 rounded">요청중</span>}
                                    {job.status === 'published' && <span className="text-green-400 text-xs border border-green-500 px-2 py-1 rounded">게시됨</span>}
                                    {job.status === 'assigned' && <span className="text-blue-400 text-xs border border-blue-500 px-2 py-1 rounded">배정완료</span>}
                                    {job.status === 'rejected' && <span className="text-red-400 text-xs border border-red-500 px-2 py-1 rounded">반려됨</span>}
                                    <span className="text-slate-500 text-lg">&gt;</span>
                                </div>
                                {job.createdAt && <p className="text-[10px] text-slate-500 mt-1">요청: {formatDateTime(job.createdAt)}</p>}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modals */}
            {selectedRequest && isPublishModalOpen && (
                <RecruitmentPublishModal 
                    isOpen={isPublishModalOpen}
                    onClose={() => setIsPublishModalOpen(false)}
                    onSubmit={handlePublishSubmit}
                    request={selectedRequest}
                    siteInfo={getSiteInfo(selectedRequest.siteId)}
                />
            )}
            {selectedRequest && isRejectModalOpen && (
                <RejectReasonModal 
                    isOpen={isRejectModalOpen}
                    onClose={() => setIsRejectModalOpen(false)}
                    onSubmit={handleRejectSubmit}
                />
            )}
            {viewingRequest && (
                <JobRequestDetailModal 
                    isOpen={!!viewingRequest}
                    onClose={() => setViewingRequest(null)}
                    request={viewingRequest}
                    siteName={getSiteInfo(viewingRequest.siteId).name}
                    allUsers={users}
                    onApproveWorker={(user) => handleApproveWorker(viewingRequest, user)}
                />
            )}
            <ManualJobRequestModal 
                isOpen={isManualModalOpen}
                onClose={() => setIsManualModalOpen(false)}
                onSubmit={handleManualJobRequestSubmit}
                sites={sites}
            />
        </div>
    );
};
