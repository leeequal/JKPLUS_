
import React, { useState, useEffect, useMemo } from 'react';
import { Authentication } from '../user-app/components/Authentication';
import { Login } from '../user-app/components/Login';
import { LoadingSpinner } from '../user-app/components/icons/LoadingSpinner';
import { SITES_DATA } from '../user-app/data/sites';
import { Notice, NOTICES_DATA } from '../user-app/data/notices';

// Define styles here to avoid dependency issues with relative imports of components that might not exist in employer app yet
const Header = ({ currentUser, onLogout }: any) => (
    <header className="bg-slate-900/80 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5h1.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293h3.172a1 1 0 00.707-.293l2.414-2.414a1 1 0 01.707-.293H21" />
                    </svg>
                </div>
                <div>
                    <h1 className="text-xl font-bold text-slate-100">구인자 파트너</h1>
                    {currentUser && <p className="text-xs text-indigo-400">{currentUser.name || currentUser.phone} 님</p>}
                </div>
            </div>
            {currentUser && (
                <button onClick={onLogout} className="px-3 py-1.5 text-xs font-medium bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-md transition">
                    로그아웃
                </button>
            )}
        </div>
    </header>
);

const Footer = () => (
    <footer className="bg-slate-900 border-t border-slate-800 mt-auto">
        <div className="container mx-auto px-4 py-4 text-center text-slate-500 text-sm">
            <p>© 2024 Construction Workforce Matching Platform. Partner App.</p>
        </div>
    </footer>
);

// Types
interface EmployerUser {
    phone: string;
    name: string;
    companyName: string;
    isRegistered: boolean;
}

interface SiteRequest {
    id: string;
    ownerId: string;
    name: string;
    address: string;
    supervisorName: string;
    supervisorPhone: string;
    jobType: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string; // ISO String
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
    createdAt: string; // ISO String
}

// Helper function to format date time
const formatDateTime = (isoString?: string) => {
    if (!isoString) return '';
    try {
        const date = new Date(isoString);
        if (isNaN(date.getTime())) return isoString;
        return date.toLocaleString('ko-KR', {
            year: '2-digit', month: 'numeric', day: 'numeric',
            hour: '2-digit', minute: '2-digit', hour12: false
        });
    } catch {
        return isoString;
    }
};

const EmployerApp: React.FC = () => {
    const [view, setView] = useState<'login' | 'auth' | 'register' | 'dashboard' | 'site-register' | 'job-request' | 'attendance' | 'notices'>('login');
    const [currentUser, setCurrentUser] = useState<EmployerUser | null>(null);
    const [phoneToVerify, setPhoneToVerify] = useState<string | null>(null);
    const [sites, setSites] = useState<SiteRequest[]>([]);
    const [selectedSite, setSelectedSite] = useState<SiteRequest | null>(null);
    const [jobRequests, setJobRequests] = useState<JobRequest[]>([]);
    
    // Mock Data Load
    useEffect(() => {
        // 1. Initialize Sample Employer if not exists or if only the default one exists
        const employersRaw = localStorage.getItem('employers');
        let currentEmployers = employersRaw ? JSON.parse(employersRaw) : [];
        const TEST_EMPLOYER_PHONE = '01099998888';

        // Check if we need to seed data
        if (currentEmployers.length <= 1) {
            // Ensure Default Test Employer
            if (!currentEmployers.find((e: EmployerUser) => e.phone === TEST_EMPLOYER_PHONE)) {
                currentEmployers.push({
                    phone: TEST_EMPLOYER_PHONE,
                    name: '박소장',
                    companyName: '튼튼건설',
                    isRegistered: true
                });
            }

            // Generate 10 Mock Employers
            const MOCK_NAMES = ['김대표', '이팀장', '최부장', '정소장', '강실장', '조반장', '윤이사', '장사장', '임전무', '한상무'];
            const MOCK_COMPANIES = ['대박건설', '미래건축', '성실인테리어', '제일설비', '하늘공영', '바른시공', '태양전기', '푸른조경', '한마음종합', '우리디자인'];
            const MOCK_SITES_NAMES = ['강남 오피스텔', '판교 IT센터', '분당 아파트', '성수동 카페', '홍대 리모델링', '부산 해운대 호텔', '대구 복합단지', '광주 아파트', '대전 연구소', '인천 물류센터'];
            const MOCK_LOCATIONS = ['서울 강남구', '경기 성남시', '경기 성남시', '서울 성동구', '서울 마포구', '부산 해운대구', '대구 수성구', '광주 서구', '대전 유성구', '인천 중구'];

            const newSites: SiteRequest[] = [];

            // Load existing sites
            const existingSitesRaw = localStorage.getItem('employerSites');
            if (existingSitesRaw) {
                newSites.push(...JSON.parse(existingSitesRaw));
            } else {
                // Default site for default test user
                newSites.push({
                    id: 'site_req_sample_1',
                    ownerId: TEST_EMPLOYER_PHONE,
                    name: '서초 아파트 재건축',
                    address: '서울 서초구 반포동',
                    supervisorName: '박소장',
                    supervisorPhone: TEST_EMPLOYER_PHONE,
                    jobType: '조공',
                    status: 'approved',
                    createdAt: '2024-07-25T10:00:00.000Z'
                });
            }

            MOCK_NAMES.forEach((name, index) => {
                const phone = `0109000${String(index).padStart(4, '0')}`;
                if (!currentEmployers.find((e: EmployerUser) => e.phone === phone)) {
                    currentEmployers.push({
                        phone,
                        name,
                        companyName: MOCK_COMPANIES[index],
                        isRegistered: true
                    });

                    // Add a sample site for this employer
                    newSites.push({
                        id: `site_req_mock_${index}`,
                        ownerId: phone,
                        name: MOCK_SITES_NAMES[index],
                        address: MOCK_LOCATIONS[index],
                        supervisorName: name,
                        supervisorPhone: phone,
                        jobType: '보통인부',
                        status: 'approved',
                        createdAt: `2024-08-0${(index % 9) + 1}T09:${String(index*3).padStart(2,'0')}:00.000Z`
                    });
                }
            });

            localStorage.setItem('employers', JSON.stringify(currentEmployers));
            localStorage.setItem('employerSites', JSON.stringify(newSites));
        }

        // 3. Load Data
        const storedSites = localStorage.getItem('employerSites');
        if (storedSites) setSites(JSON.parse(storedSites));
        
        const storedJobs = localStorage.getItem('jobRequests');
        if (storedJobs) setJobRequests(JSON.parse(storedJobs));

        const savedUser = localStorage.getItem('currentEmployer');
        if (savedUser) {
            setCurrentUser(JSON.parse(savedUser));
            setView('dashboard');
        }
    }, []);

    const handleLogin = (phone: string) => {
        setPhoneToVerify(phone);
        setView('auth');
    };

    const handleAuthSuccess = () => {
        const employersRaw = localStorage.getItem('employers');
        const employers: EmployerUser[] = employersRaw ? JSON.parse(employersRaw) : [];
        const existing = employers.find(u => u.phone === phoneToVerify);

        if (existing) {
            setCurrentUser(existing);
            localStorage.setItem('currentEmployer', JSON.stringify(existing));
            setView('dashboard');
        } else {
            setView('register');
        }
    };

    const handleRegister = (name: string, companyName: string) => {
        const newUser: EmployerUser = {
            phone: phoneToVerify!,
            name,
            companyName,
            isRegistered: true
        };
        const employersRaw = localStorage.getItem('employers');
        const employers = employersRaw ? JSON.parse(employersRaw) : [];
        employers.push(newUser);
        localStorage.setItem('employers', JSON.stringify(employers));
        
        setCurrentUser(newUser);
        localStorage.setItem('currentEmployer', JSON.stringify(newUser));
        setView('dashboard');
    };

    const handleSiteRegister = (siteData: any) => {
        const newSite: SiteRequest = {
            id: `site_req_${Date.now()}`,
            ownerId: currentUser!.phone,
            ...siteData,
            status: 'pending', // Default status
            createdAt: new Date().toISOString()
        };
        const updatedSites = [...sites, newSite];
        setSites(updatedSites);
        localStorage.setItem('employerSites', JSON.stringify(updatedSites));
        setView('dashboard');
    };

    const handleJobRequest = (requestData: any) => {
        const newRequest: JobRequest = {
            id: `job_req_${Date.now()}`,
            siteId: selectedSite!.id,
            status: 'requested',
            assignedWorkerIds: [],
            ...requestData,
            createdAt: new Date().toISOString()
        };
        const updatedJobs = [...jobRequests, newRequest];
        setJobRequests(updatedJobs);
        localStorage.setItem('jobRequests', JSON.stringify(updatedJobs));
        alert('구인 요청이 등록되었습니다. 관리자가 확인 후 인력을 배정합니다.');
        setView('dashboard');
    };

    // --- Sub-components for views ---

    const RegisterView = () => {
        const [name, setName] = useState('');
        const [company, setCompany] = useState('');
        
        return (
            <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700 animate-fadeIn">
                <h2 className="text-2xl font-bold mb-6 text-white">구인자 회원가입</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm text-slate-400 mb-1">이름</label>
                        <input value={name} onChange={e => setName(e.target.value)} className="w-full bg-slate-700 p-3 rounded text-white" placeholder="이름 입력" />
                    </div>
                    <div>
                        <label className="block text-sm text-slate-400 mb-1">상호명 (건설사)</label>
                        <input value={company} onChange={e => setCompany(e.target.value)} className="w-full bg-slate-700 p-3 rounded text-white" placeholder="건설사 또는 팀명" />
                    </div>
                    <div>
                        <label className="block text-sm text-slate-400 mb-1">명함 첨부 (선택)</label>
                        <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center text-slate-500 hover:border-indigo-500 cursor-pointer">
                            📸 명함 촬영 또는 업로드
                        </div>
                    </div>
                    <button 
                        onClick={() => handleRegister(name, company)}
                        disabled={!name || !company}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-lg font-bold mt-4 disabled:opacity-50"
                    >
                        가입 완료
                    </button>
                </div>
            </div>
        );
    };

    const DashboardView = () => {
        const mySites = sites.filter(s => s.ownerId === currentUser!.phone).sort((a, b) => 
            new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        );

        return (
            <div className="animate-fadeIn">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white">내 현장 목록</h2>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => setView('notices')}
                            className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
                        >
                            🔔 공지사항
                        </button>
                        <button 
                            onClick={() => setView('site-register')}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg"
                        >
                            + 현장 등록
                        </button>
                    </div>
                </div>

                {mySites.length === 0 ? (
                    <div className="text-center py-12 bg-slate-800/30 rounded-xl border border-dashed border-slate-700">
                        <p className="text-slate-500">등록된 현장이 없습니다.<br/>새 현장을 등록하고 인력을 요청해보세요.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {mySites.map(site => (
                            <div key={site.id} className="bg-slate-800 p-5 rounded-xl border border-slate-700 hover:border-indigo-500 transition cursor-pointer" onClick={() => {
                                if (site.status === 'approved') {
                                    setSelectedSite(site);
                                    setView('job-request');
                                } else {
                                    alert('승인 대기 중이거나 반려된 현장입니다.');
                                }
                            }}>
                                <div className="flex justify-between items-start">
                                    <h3 className="text-lg font-bold text-white">{site.name}</h3>
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                                        site.status === 'approved' ? 'bg-green-900 text-green-300' : 
                                        site.status === 'rejected' ? 'bg-red-900 text-red-300' : 'bg-yellow-900 text-yellow-300'
                                    }`}>
                                        {site.status === 'approved' ? '승인됨' : site.status === 'rejected' ? '반려됨' : '승인 대기'}
                                    </span>
                                </div>
                                <p className="text-slate-400 text-sm mt-1">{site.address}</p>
                                <div className="mt-4 flex justify-between items-end">
                                    <div>
                                        <span className="text-slate-500 text-sm block">{site.jobType}</span>
                                        {site.createdAt && <span className="text-slate-600 text-xs">등록: {formatDateTime(site.createdAt)}</span>}
                                    </div>
                                    {site.status === 'approved' && <span className="text-indigo-400 text-sm font-semibold">구인 요청하기 &gt;</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    const SiteRegisterView = () => {
        const [form, setForm] = useState({ name: '', address: '', supervisorName: currentUser!.name, supervisorPhone: currentUser!.phone, jobType: '보통인부' });

        return (
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 animate-fadeIn">
                <button onClick={() => setView('dashboard')} className="text-slate-400 text-sm mb-4">← 뒤로가기</button>
                <h2 className="text-xl font-bold text-white mb-6">신규 현장 등록 요청</h2>
                <div className="space-y-4">
                    <input className="w-full bg-slate-700 p-3 rounded text-white" placeholder="현장명 (예: 강남 파이낸스 센터)" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                    <input className="w-full bg-slate-700 p-3 rounded text-white" placeholder="현장 주소" value={form.address} onChange={e => setForm({...form, address: e.target.value})} />
                    <div className="grid grid-cols-2 gap-4">
                        <input className="bg-slate-700 p-3 rounded text-white" placeholder="담당자 이름" value={form.supervisorName} onChange={e => setForm({...form, supervisorName: e.target.value})} />
                        <input className="bg-slate-700 p-3 rounded text-white" placeholder="담당자 연락처" value={form.supervisorPhone} onChange={e => setForm({...form, supervisorPhone: e.target.value})} />
                    </div>
                    <select className="w-full bg-slate-700 p-3 rounded text-white" value={form.jobType} onChange={e => setForm({...form, jobType: e.target.value})}>
                        <option>보통인부</option>
                        <option>조공</option>
                        <option>기공</option>
                        <option>철근</option>
                        <option>타설</option>
                    </select>
                    <button onClick={() => handleSiteRegister(form)} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-lg font-bold mt-2">
                        등록 요청 (관리자 승인 필요)
                    </button>
                </div>
            </div>
        );
    };

    const JobRequestView = () => {
        const [request, setRequest] = useState({ date: '', workerCount: 1, dailyRate: 150000, jobType: selectedSite?.jobType || '보통인부', notes: '' });
        
        // Filter jobs for this site
        const siteJobs = jobRequests
            .filter(j => j.siteId === selectedSite?.id)
            .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

        return (
            <div className="animate-fadeIn">
                <button onClick={() => setView('dashboard')} className="text-slate-400 text-sm mb-4">← 목록으로</button>
                
                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 mb-6">
                    <h2 className="text-xl font-bold text-white mb-2">{selectedSite?.name}</h2>
                    <p className="text-slate-400 text-sm mb-4">{selectedSite?.address}</p>
                    
                    {/* Mock Map */}
                    <div className="w-full h-32 bg-slate-700 rounded-lg flex items-center justify-center text-slate-500 text-sm mb-6">
                        지도 연동 화면 (네이버/카카오맵)
                    </div>

                    <h3 className="text-lg font-bold text-white mb-4">인력 요청 (내일/일주일)</h3>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <input type="date" className="bg-slate-700 p-3 rounded text-white" value={request.date} onChange={e => setRequest({...request, date: e.target.value})} />
                            <select className="bg-slate-700 p-3 rounded text-white" value={request.jobType} onChange={e => setRequest({...request, jobType: e.target.value})}>
                                <option>보통인부</option> <option>조공</option> <option>기공</option>
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center bg-slate-700 rounded px-3">
                                <span className="text-slate-400 text-sm mr-2">인원</span>
                                <input type="number" className="bg-transparent p-3 w-full text-white outline-none" value={request.workerCount} onChange={e => setRequest({...request, workerCount: parseInt(e.target.value)})} />
                            </div>
                            <div className="flex items-center bg-slate-700 rounded px-3">
                                <span className="text-slate-400 text-sm mr-2">단가</span>
                                <input type="number" className="bg-transparent p-3 w-full text-white outline-none" value={request.dailyRate} onChange={e => setRequest({...request, dailyRate: parseInt(e.target.value)})} />
                            </div>
                        </div>
                        <textarea className="w-full bg-slate-700 p-3 rounded text-white" placeholder="특별 요청사항 (예: 안전화 필수, 지참 공구 등)" rows={2} value={request.notes} onChange={e => setRequest({...request, notes: e.target.value})}></textarea>
                        
                        <button onClick={() => handleJobRequest(request)} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-lg font-bold">
                            구인 요청하기
                        </button>
                    </div>
                </div>

                <div className="space-y-3">
                    <h3 className="text-lg font-bold text-white">요청 내역 및 배정 현황</h3>
                    {siteJobs.map(job => (
                        <div key={job.id} className="bg-slate-800 p-4 rounded-lg border border-slate-700 flex flex-col gap-2">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="font-bold text-slate-200">{job.date} <span className="text-xs text-slate-400 ml-2">{job.jobType} {job.workerCount}명</span></p>
                                    <p className="text-xs text-slate-500 mt-1">{job.notes || '요청사항 없음'}</p>
                                    {job.createdAt && <p className="text-[10px] text-slate-600 mt-1">요청일시: {formatDateTime(job.createdAt)}</p>}
                                </div>
                                <div className="text-right">
                                    {job.status === 'assigned' && (
                                        <button onClick={() => alert('출석 체크 기능은 준비 중입니다. (관리자에게 자동 보고)')} className="bg-green-800 text-green-200 text-xs px-3 py-1.5 rounded font-bold">
                                            배정 완료
                                        </button>
                                    )}
                                    {job.status === 'requested' && (
                                        <span className="bg-yellow-900 text-yellow-300 text-xs px-3 py-1.5 rounded">승인 대기</span>
                                    )}
                                    {job.status === 'published' && (
                                        <span className="bg-blue-900 text-blue-300 text-xs px-3 py-1.5 rounded">공고 게시중</span>
                                    )}
                                    {job.status === 'rejected' && (
                                        <span className="bg-red-900 text-red-300 text-xs px-3 py-1.5 rounded">반려됨</span>
                                    )}
                                </div>
                            </div>
                            
                            {/* Rejection Reason Display */}
                            {job.status === 'rejected' && job.rejectReason && (
                                <div className="mt-2 bg-red-900/20 border border-red-900/50 p-3 rounded text-sm text-red-200">
                                    <span className="font-bold mr-2">반려 사유:</span>
                                    {job.rejectReason}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const EmployerNoticeView = () => {
        const [notices, setNotices] = useState<Notice[]>([]);
        const [expandedNoticeId, setExpandedNoticeId] = useState<string | null>(null);

        useEffect(() => {
            const storedNotices = localStorage.getItem('notices');
            const initialData = storedNotices ? JSON.parse(storedNotices) : NOTICES_DATA;
            // Filter for employer notices
            setNotices(initialData.filter((n: Notice) => n.target === 'employer'));
        }, []);

        const sortedNotices = useMemo(() => {
            return [...notices].sort((a, b) => {
                if (a.isPinned && !b.isPinned) return -1;
                if (!a.isPinned && b.isPinned) return 1;
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            });
        }, [notices]);

        const handleToggleNotice = (id: string) => {
            setExpandedNoticeId(prevId => (prevId === id ? null : id));
        };

        return (
            <div className="animate-fadeIn">
                <button onClick={() => setView('dashboard')} className="text-slate-400 text-sm mb-4">← 뒤로가기</button>
                <h2 className="text-xl font-bold text-white mb-6">파트너 공지사항</h2>
                
                {sortedNotices.length === 0 ? (
                    <div className="text-center py-16 px-6 bg-slate-800/50 border-2 border-dashed border-slate-700 rounded-xl">
                        <p className="text-slate-500">등록된 공지사항이 없습니다.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {sortedNotices.map((notice) => {
                            const isExpanded = expandedNoticeId === notice.id;
                            return (
                                <div key={notice.id} className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
                                    <button
                                        onClick={() => handleToggleNotice(notice.id)}
                                        className="w-full p-4 text-left flex justify-between items-center hover:bg-slate-800 transition-colors"
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                {notice.isPinned && <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded font-bold">중요</span>}
                                                <p className="font-semibold text-slate-100">{notice.title}</p>
                                            </div>
                                            <p className="text-xs text-slate-400">{notice.createdAt} · {notice.authorName}</p>
                                        </div>
                                        <span className={`text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
                                    </button>
                                    {isExpanded && (
                                        <div className="p-4 border-t border-slate-700 bg-slate-900/30">
                                            <p className="text-sm text-slate-300 whitespace-pre-line">{notice.content}</p>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-300 flex flex-col font-sans">
            <Header currentUser={currentUser} onLogout={() => { setCurrentUser(null); setView('login'); localStorage.removeItem('currentEmployer'); }} />
            <main className="container mx-auto px-4 py-8 flex-grow max-w-lg">
                {view === 'login' && (
                    <div className="bg-slate-800/50 p-8 rounded-xl border border-slate-700">
                        <h2 className="text-2xl font-bold text-center text-white mb-2">구인자 로그인</h2>
                        <p className="text-center text-slate-400 mb-8">현장 관리자 / 소장님 전용 앱입니다.</p>
                        <Login onLogin={(phone) => handleLogin(phone)} />
                        <div className="mt-4 text-center">
                            <p className="text-xs text-slate-500">테스트 계정: 01099998888</p>
                        </div>
                    </div>
                )}
                {view === 'auth' && <Authentication phone={phoneToVerify!} onVerify={handleAuthSuccess} onBack={() => setView('login')} rememberMe={true} />}
                {view === 'register' && <RegisterView />}
                {view === 'dashboard' && <DashboardView />}
                {view === 'site-register' && <SiteRegisterView />}
                {view === 'job-request' && <JobRequestView />}
                {view === 'notices' && <EmployerNoticeView />}
            </main>
            <Footer />
        </div>
    );
};

export default EmployerApp;
