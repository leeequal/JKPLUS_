
import React, { useState, useEffect, useMemo } from 'react';
import { PlusCircle, ClipboardList, Calendar as LucideCalendar, Sparkles, Bell, Settings } from 'lucide-react';
import { Authentication } from '../user-app/components/Authentication';
import { Login } from '../user-app/components/Login';
import { LoadingSpinner } from '../user-app/components/icons/LoadingSpinner';
import { SITES_DATA } from '../user-app/data/sites';
import { Notice, NOTICES_DATA } from '../user-app/data/notices';
import { SettingsView } from '../user-app/components/SettingsView';
import { CalendarView } from './components/CalendarView';
import { GameCenter } from '../user-app/components/GameCenter';
import { WeatherWidget } from '../shared/components/WeatherWidget';

const formatPhoneNumber = (value: string): string => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.startsWith('02')) {
        if (cleaned.length <= 2) return cleaned;
        if (cleaned.length <= 5) return `${cleaned.slice(0, 2)}-${cleaned.slice(2)}`;
        if (cleaned.length <= 9) return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 5)}-${cleaned.slice(5)}`;
        return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 6)}-${cleaned.slice(6, 10)}`;
    } else {
        if (cleaned.length <= 3) return cleaned;
        if (cleaned.length <= 6) return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
        if (cleaned.length <= 10) {
            return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
        }
        return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7, 11)}`;
    }
};

// Define styles here to avoid dependency issues with relative imports of components that might not exist in employer app yet
const Header = ({ currentUser, onLogout }: any) => (
    <header className="bg-white/80 dark:bg-slate-950/60 backdrop-blur-md border-b border-slate-200 dark:border-slate-900 sticky top-0 z-50 transition-colors duration-300">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between max-w-lg">
            <div className="flex items-center space-x-3.5">
                <div className="w-11 h-11 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/10 border border-white/10 shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5.5 w-5.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5h1.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293h3.172a1 1 0 00.707-.293l2.414-2.414a1 1 0 01.707-.293H21" />
                    </svg>
                </div>
                <div>
                    <h1 className="text-base font-black text-slate-900 dark:text-white tracking-tight leading-none">구인자 스마트 파트너</h1>
                    {currentUser && (
                        <div className="flex items-center space-x-1.5 mt-1.5">
                            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
                            <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 leading-none">{currentUser.name || formatPhoneNumber(currentUser.phone)} 소장님 <span className="text-slate-500 dark:text-slate-400 font-normal">환영합니다</span></p>
                        </div>
                    )}
                </div>
            </div>
            {currentUser && (
                <div className="flex items-center">
                    <div className="hidden md:block mr-3">
                        <WeatherWidget tone="cool" />
                    </div>
                    <button 
                        onClick={onLogout} 
                        className="px-3 py-1.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-300 rounded-xl transition-all border border-slate-250 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm"
                    >
                        로그아웃
                    </button>
                </div>
            )}
        </div>
        {currentUser && (
            <div className="container mx-auto px-4 pb-3 md:hidden max-w-lg">
                <WeatherWidget tone="cool" />
            </div>
        )}
    </header>
);

const Footer = () => (
    <footer className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-900 mt-auto transition-colors duration-300">
        <div className="container mx-auto px-4 py-6 text-center text-slate-500 dark:text-slate-600 text-xs tracking-wider">
            <p>© 2026 Construction Workforce Matching Platform. Partner App.</p>
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
    const [view, setView] = useState<'login' | 'auth' | 'register' | 'dashboard' | 'site-register' | 'job-request' | 'attendance' | 'notices' | 'settings' | 'calendar' | 'lounge'>('login');
    const [currentUser, setCurrentUser] = useState<EmployerUser | null>(null);
    const [phoneToVerify, setPhoneToVerify] = useState<string | null>(null);
    const [sites, setSites] = useState<SiteRequest[]>([]);
    const [selectedSite, setSelectedSite] = useState<SiteRequest | null>(null);
    const [jobRequests, setJobRequests] = useState<JobRequest[]>([]);

    // Theme state
    const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(() => {
        return (localStorage.getItem('employer-app-theme') as 'light' | 'dark' | 'system') || 'system';
    });

    // Apply and listen to theme changes
    useEffect(() => {
        const root = document.documentElement;
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        
        const applyTheme = () => {
            const systemDark = mediaQuery.matches;
            const isDark = theme === 'dark' || (theme === 'system' && systemDark);
            
            if (isDark) {
                root.classList.add('dark');
                root.classList.remove('light');
            } else {
                root.classList.add('light');
                root.classList.remove('dark');
            }
        };

        applyTheme();
        localStorage.setItem('employer-app-theme', theme);

        if (theme === 'system') {
            mediaQuery.addEventListener('change', applyTheme);
            return () => mediaQuery.removeEventListener('change', applyTheme);
        }
    }, [theme]);
    
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
            setView('job-request');
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
            setView('job-request');
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
        setView('job-request');
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
        alert('신규 현장 등록이 요청되었습니다. 관리자 승인 후 구인 요청이 가능합니다.');
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
    };

    // --- Sub-components for views ---

    const RegisterView = () => {
        const [name, setName] = useState('');
        const [company, setCompany] = useState('');
        
        return (
            <div className="p-6 md:p-8 bg-white dark:bg-slate-900/40 backdrop-blur-md rounded-3xl border border-slate-200 dark:border-slate-800/80 shadow-md dark:shadow-2xl max-w-md mx-auto animate-fadeIn transition-colors duration-300">
                <div className="flex flex-col items-center mb-6">
                    <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-black mb-1.5 text-center text-slate-900 dark:text-white tracking-tight">구인 파트너 신규 가입</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm text-center font-medium leading-relaxed">최초 1회 정보를 등록하면 즉시 인력 구인을 시작하실 수 있습니다.</p>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">이름 / 담당 소장님 성함</label>
                        <input 
                            value={name} 
                            onChange={e => setName(e.target.value)} 
                            className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-850 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition shadow-inner" 
                            placeholder="예: 홍길동 소장" 
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">상호명 (소속 회사/파트너/팀명)</label>
                        <input 
                            value={company} 
                            onChange={e => setCompany(e.target.value)} 
                            className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-850 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition shadow-inner" 
                            placeholder="예: 한길종합건설" 
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">명함 및 증빙서류 첨부 (선택)</label>
                        <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-6 text-center text-slate-400 dark:text-slate-500 hover:border-indigo-500 hover:text-indigo-500 dark:hover:text-indigo-400 transition cursor-pointer bg-slate-50 dark:bg-slate-950/20">
                            <span className="text-xl mb-1 block">📸</span>
                            <span className="text-xs font-bold block">명함 촬영 또는 업로드</span>
                            <span className="text-[10px] text-slate-400 dark:text-slate-600 block mt-0.5">사업자 신원 검증 시 우선 승인 대상이 됩니다.</span>
                        </div>
                    </div>
                    <button 
                        onClick={() => handleRegister(name, company)}
                        disabled={!name || !company}
                        className="w-full px-6 py-3.5 font-extrabold bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-2xl transition-all shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 disabled:from-slate-200 disabled:to-slate-200 dark:disabled:from-slate-800 dark:disabled:to-slate-800 disabled:text-slate-400 dark:disabled:text-slate-500 disabled:border-transparent disabled:shadow-none text-sm border border-indigo-500/10 mt-2"
                    >
                        가입 완료 및 서비스 시작
                    </button>
                </div>
            </div>
        );
    };

    const SiteRegisterView = () => {
        const [form, setForm] = useState({ name: '', address: '', supervisorName: currentUser!.name, supervisorPhone: formatPhoneNumber(currentUser!.phone), jobType: '보통인부' });
        const mySites = sites.filter(s => s.ownerId === currentUser!.phone).sort((a, b) => 
            new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        );

        const handleFormSubmit = () => {
            if (!form.name || !form.address) {
                alert('현장명과 현장 주소를 모두 입력해주세요.');
                return;
            }
            handleSiteRegister(form);
            // Reset form (except supervisor details)
            setForm({
                name: '',
                address: '',
                supervisorName: currentUser!.name,
                supervisorPhone: formatPhoneNumber(currentUser!.phone),
                jobType: '보통인부'
            });
        };

        return (
            <div className="space-y-6 animate-fadeIn">
                {/* Form Card */}
                <div className="bg-white dark:bg-slate-900/80 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-md transition-colors duration-300">
                    <h2 className="text-lg font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <PlusCircle className="h-5 w-5 text-indigo-500" />
                        신규 현장 등록 신청
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-450 mb-5 leading-relaxed">
                        새로운 건설 현장을 등록하고 관리자 승인을 받으면 구인 요청을 시작하실 수 있습니다.
                    </p>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">현장명</label>
                            <input 
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 p-3 rounded-xl text-slate-900 dark:text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition font-semibold text-sm" 
                                placeholder="예: 서초동 아파트 신축공사" 
                                value={form.name} 
                                onChange={e => setForm({...form, name: e.target.value})} 
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">현장 주소</label>
                            <input 
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 p-3 rounded-xl text-slate-900 dark:text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition font-semibold text-sm" 
                                placeholder="예: 서울 서초구 서초대로 123" 
                                value={form.address} 
                                onChange={e => setForm({...form, address: e.target.value})} 
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">담당자 이름</label>
                                <input 
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 p-3 rounded-xl text-slate-900 dark:text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition font-semibold text-sm" 
                                    value={form.supervisorName} 
                                    onChange={e => setForm({...form, supervisorName: e.target.value})} 
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">담당자 연락처</label>
                                <input 
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 p-3 rounded-xl text-slate-900 dark:text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition font-semibold text-sm" 
                                    value={form.supervisorPhone} 
                                    onChange={e => setForm({...form, supervisorPhone: formatPhoneNumber(e.target.value)})} 
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">기본 직종</label>
                            <select 
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 p-3 rounded-xl text-slate-900 dark:text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition font-bold text-sm" 
                                value={form.jobType} 
                                onChange={e => setForm({...form, jobType: e.target.value})}
                            >
                                <option>보통인부</option>
                                <option>조공</option>
                                <option>기공</option>
                                <option>철근</option>
                                <option>타설</option>
                            </select>
                        </div>
                        <button 
                            onClick={handleFormSubmit} 
                            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3.5 rounded-xl font-extrabold text-sm transition-all shadow-md shadow-indigo-600/15 hover:shadow-indigo-600/25 mt-2"
                        >
                            현장 등록 신청 (관리자 승인 필요)
                        </button>
                    </div>
                </div>

                {/* Registered Sites List Card */}
                <div className="bg-white dark:bg-slate-900/80 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-md transition-colors duration-300">
                    <h3 className="text-base font-black text-slate-900 dark:text-white mb-4">내 등록 현장 현황</h3>
                    {mySites.length === 0 ? (
                        <div className="text-center py-10 bg-slate-50 dark:bg-slate-950/20 rounded-xl border border-dashed border-slate-200 dark:border-slate-800/80">
                            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">등록 신청된 현장이 없습니다.</p>
                            <p className="text-[10px] text-slate-400 dark:text-slate-600 mt-1">상단의 폼을 채워 신규 현장을 등록해보세요.</p>
                        </div>
                    ) : (
                        <div className="space-y-3.5">
                            {mySites.map(site => (
                                <div key={site.id} className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-xl border border-slate-200/80 dark:border-slate-850/80">
                                    <div className="flex justify-between items-start gap-2">
                                        <h4 className="text-sm font-black text-slate-850 dark:text-slate-100">{site.name}</h4>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                            site.status === 'approved' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' : 
                                            site.status === 'rejected' ? 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20' : 
                                            'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                                        }`}>
                                            {site.status === 'approved' ? '승인완료' : site.status === 'rejected' ? '반려됨' : '승인대기'}
                                        </span>
                                    </div>
                                    <div className="mt-3 text-xs text-slate-500 dark:text-slate-400 space-y-1.5">
                                        <p className="flex items-start gap-1"><span className="text-slate-400 dark:text-slate-500 font-bold w-14 shrink-0">📍 주소</span> <span className="text-slate-750 dark:text-slate-300">{site.address}</span></p>
                                        <p className="flex items-center gap-1"><span className="text-slate-400 dark:text-slate-500 font-bold w-14 shrink-0">👤 담당자</span> <span className="text-slate-750 dark:text-slate-300">{site.supervisorName} ({formatPhoneNumber(site.supervisorPhone)})</span></p>
                                        <p className="flex items-center gap-1"><span className="text-slate-400 dark:text-slate-500 font-bold w-14 shrink-0">🛠️ 직종</span> <span className="text-slate-750 dark:text-slate-300">{site.jobType}</span></p>
                                        {site.createdAt && <p className="text-[10px] text-slate-400 dark:text-slate-600 pt-1 border-t border-slate-100 dark:border-slate-850 mt-1.5">등록신청일자: {formatDateTime(site.createdAt)}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const JobRequestView = () => {
        const approvedSites = useMemo(() => sites.filter(s => s.ownerId === currentUser!.phone && s.status === 'approved'), [sites, currentUser]);
        
        // Default selectedSite to first approved site if none selected
        useEffect(() => {
            if (approvedSites.length > 0 && (!selectedSite || !approvedSites.some(s => s.id === selectedSite.id))) {
                setSelectedSite(approvedSites[0]);
            }
        }, [approvedSites, selectedSite]);

        const [request, setRequest] = useState({ 
            date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Default to tomorrow
            workerCount: 1, 
            dailyRate: 150000, 
            jobType: selectedSite?.jobType || '보통인부', 
            notes: '' 
        });

        // Whenever selectedSite changes, update jobType default
        useEffect(() => {
            if (selectedSite) {
                setRequest(prev => ({ ...prev, jobType: selectedSite.jobType || '보통인부' }));
            }
        }, [selectedSite]);
        
        // Filter jobs for selected site
        const siteJobs = useMemo(() => {
            if (!selectedSite) return [];
            return jobRequests
                .filter(j => j.siteId === selectedSite.id)
                .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        }, [jobRequests, selectedSite]);

        if (approvedSites.length === 0) {
            return (
                <div className="bg-white dark:bg-slate-900/80 p-6 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-md animate-fadeIn text-center space-y-4 max-w-md mx-auto transition-colors duration-300">
                    <div className="w-12 h-12 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
                        ⚠️
                    </div>
                    <div>
                        <h3 className="text-base font-black text-slate-800 dark:text-slate-100">승인 완료된 현장이 없습니다</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-450 mt-2 leading-relaxed">
                            구인 요청을 시작하시려면 먼저 현장 승인을 받으셔야 합니다.<br/>
                            [새 현장 등록] 메뉴에서 현장을 먼저 신청해주세요.
                        </p>
                    </div>
                    <button 
                        onClick={() => setView('site-register')}
                        className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black transition-all shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20"
                    >
                        새 현장 등록하러 가기
                    </button>
                </div>
            );
        }

        return (
            <div className="space-y-6 animate-fadeIn text-slate-700 dark:text-slate-300">
                {/* Site Selection & Request Form Card */}
                <div className="bg-white dark:bg-slate-900/80 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-md transition-colors duration-300">
                    <h2 className="text-lg font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <ClipboardList className="h-5 w-5 text-indigo-500" />
                        인력 구인 요청
                    </h2>

                    {/* Site Selector Dropdown */}
                    <div className="mb-5 bg-slate-50 dark:bg-slate-950/40 p-4 rounded-xl border border-slate-200/80 dark:border-slate-850/80 space-y-2">
                        <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">대상 현장 선택</label>
                        <select 
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl text-slate-900 dark:text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition font-bold text-sm shadow-sm"
                            value={selectedSite?.id || ''}
                            onChange={e => {
                                const site = approvedSites.find(s => s.id === e.target.value);
                                if (site) setSelectedSite(site);
                            }}
                        >
                            {approvedSites.map(site => (
                                <option key={site.id} value={site.id}>{site.name}</option>
                            ))}
                        </select>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">📍 {selectedSite?.address}</p>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800/60">
                        <h3 className="text-sm font-black text-slate-800 dark:text-slate-200">구인 조건 입력</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">작업 일자</label>
                                <input 
                                    type="date" 
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 rounded-xl text-slate-900 dark:text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition font-medium text-sm" 
                                    value={request.date} 
                                    onChange={e => setRequest({...request, date: e.target.value})} 
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">필요 직종</label>
                                <select 
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 rounded-xl text-slate-900 dark:text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition font-bold text-sm" 
                                    value={request.jobType} 
                                    onChange={e => setRequest({...request, jobType: e.target.value})}
                                >
                                    <option>보통인부</option> <option>조공</option> <option>기공</option> <option>철근</option> <option>타설</option>
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">요청 인원 (명)</label>
                                <input 
                                    type="number" 
                                    min="1"
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 rounded-xl text-slate-900 dark:text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition font-semibold text-sm" 
                                    value={request.workerCount} 
                                    onChange={e => setRequest({...request, workerCount: Math.max(1, parseInt(e.target.value) || 1)})} 
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">일당 단가 (원)</label>
                                <input 
                                    type="number" 
                                    step="10000"
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 rounded-xl text-slate-900 dark:text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition font-semibold text-sm" 
                                    value={request.dailyRate} 
                                    onChange={e => setRequest({...request, dailyRate: Math.max(0, parseInt(e.target.value) || 0)})} 
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">특별 요청 사항</label>
                            <textarea 
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 rounded-xl text-slate-900 dark:text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition font-medium text-sm" 
                                placeholder="예: 안전화 및 안전모 필수 지참, 경력자 우대 등" 
                                rows={2} 
                                value={request.notes} 
                                onChange={e => setRequest({...request, notes: e.target.value})}
                            />
                        </div>
                        
                        <button 
                            onClick={() => {
                                handleJobRequest(request);
                                setRequest(prev => ({ ...prev, workerCount: 1, notes: '' }));
                            }} 
                            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3.5 rounded-xl font-extrabold text-sm transition shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 mt-2"
                        >
                            구인 요청 등록하기
                        </button>
                    </div>
                </div>

                {/* Assignment Status List Card */}
                <div className="bg-white dark:bg-slate-900/80 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-md transition-colors duration-300">
                    <h3 className="text-base font-black text-slate-900 dark:text-white mb-4">구인 요청 및 배정 현황</h3>
                    
                    {siteJobs.length === 0 ? (
                        <div className="text-center py-10 bg-slate-50 dark:bg-slate-950/20 rounded-xl border border-dashed border-slate-200 dark:border-slate-800/80">
                            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">이 현장에 등록된 구인 요청 내역이 없습니다.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {siteJobs.map(job => (
                                <div key={job.id} className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-xl border border-slate-200/60 dark:border-slate-850 flex flex-col gap-2 shadow-sm">
                                    <div className="flex justify-between items-start gap-2">
                                        <div>
                                            <p className="font-extrabold text-slate-800 dark:text-slate-100 text-sm">
                                                📅 {job.date}
                                                <span className="text-xs text-indigo-600 dark:text-indigo-400 ml-2 font-black">
                                                    [{job.jobType} {job.workerCount}명]
                                                </span>
                                            </p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-semibold">단가: {job.dailyRate.toLocaleString()}원</p>
                                            {job.notes && <p className="text-xs text-slate-500 dark:text-slate-450 mt-1.5 bg-white dark:bg-slate-900/60 p-2.5 rounded-lg border border-slate-100 dark:border-slate-850/60 leading-relaxed">💬 {job.notes}</p>}
                                            {job.createdAt && <p className="text-[10px] text-slate-400 dark:text-slate-600 mt-2">요청일시: {formatDateTime(job.createdAt)}</p>}
                                        </div>
                                        <div className="text-right shrink-0">
                                            {job.status === 'assigned' && (
                                                <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs px-2.5 py-1 rounded-full font-black border border-emerald-500/20">배정 완료</span>
                                            )}
                                            {job.status === 'requested' && (
                                                <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs px-2.5 py-1 rounded-full font-black border border-amber-500/20">승인 대기</span>
                                            )}
                                            {job.status === 'published' && (
                                                <span className="bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs px-2.5 py-1 rounded-full font-black border border-blue-500/20">공고 게시중</span>
                                            )}
                                            {job.status === 'rejected' && (
                                                <span className="bg-red-500/10 text-red-600 dark:text-red-400 text-xs px-2.5 py-1 rounded-full font-black border border-red-500/20">반려됨</span>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {/* Rejection Reason Display */}
                                    {job.status === 'rejected' && job.rejectReason && (
                                        <div className="mt-2 bg-red-500/5 border border-red-500/15 p-3 rounded-lg text-xs text-red-600 dark:text-red-400 font-semibold leading-relaxed">
                                            <span className="font-extrabold mr-1">🚫 반려 사유:</span>
                                            {job.rejectReason}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
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
                <button onClick={() => setView('job-request')} className="text-slate-400 text-sm mb-4">← 뒤로가기</button>
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
                                <div key={notice.id} className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm dark:shadow-none transition-colors duration-300">
                                    <button
                                        onClick={() => handleToggleNotice(notice.id)}
                                        className="w-full p-4 text-left flex justify-between items-center hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                {notice.isPinned && <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded font-bold">중요</span>}
                                                <p className="font-semibold text-slate-900 dark:text-slate-100">{notice.title}</p>
                                            </div>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">{notice.createdAt} · {notice.authorName}</p>
                                        </div>
                                        <span className="text-slate-400 dark:text-slate-400 transition-transform">
                                            {isExpanded ? '▲' : '▼'}
                                        </span>
                                    </button>
                                    {isExpanded && (
                                        <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/30">
                                            <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line">{notice.content}</p>
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
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 flex flex-col font-sans relative overflow-hidden transition-colors duration-300">
            {/* Ambient bg glow for employer app */}
            <div className="absolute top-[20%] left-[-20%] w-[50%] h-[50%] rounded-full bg-indigo-500/5 dark:bg-indigo-500/5 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[20%] right-[-20%] w-[50%] h-[50%] rounded-full bg-purple-500/5 dark:bg-purple-500/5 blur-[120px] pointer-events-none" />

            <Header currentUser={currentUser} onLogout={() => { setCurrentUser(null); setView('login'); localStorage.removeItem('currentEmployer'); }} />
            <main className="container mx-auto px-3 sm:px-4 py-4 md:py-8 flex-grow max-w-lg relative z-10">
                {currentUser && view !== 'login' && view !== 'auth' && view !== 'register' && (
                    <div className="mb-6 bg-slate-100 dark:bg-slate-900/40 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200 dark:border-slate-900 grid grid-cols-3 sm:grid-cols-6 gap-2 shadow-sm dark:shadow-none transition-all">
                        <button
                            onClick={() => setView('site-register')}
                            className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-xl text-[11px] sm:text-xs font-black transition-all border ${
                                view === 'site-register'
                                    ? 'bg-indigo-500/10 dark:bg-indigo-600/10 border-indigo-500/30 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400 shadow-md dark:shadow-lg'
                                    : 'bg-white dark:bg-slate-950/40 border-slate-200 dark:border-slate-900/40 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                            }`}
                        >
                            <PlusCircle className="h-4.5 w-4.5 mb-1.5 text-indigo-500" />
                            <span>새현장 등록</span>
                        </button>
                        <button
                            onClick={() => setView('job-request')}
                            className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-xl text-[11px] sm:text-xs font-black transition-all border ${
                                view === 'job-request'
                                    ? 'bg-indigo-500/10 dark:bg-indigo-600/10 border-indigo-500/30 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400 shadow-md dark:shadow-lg'
                                    : 'bg-white dark:bg-slate-950/40 border-slate-200 dark:border-slate-900/40 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                            }`}
                        >
                            <ClipboardList className="h-4.5 w-4.5 mb-1.5 text-purple-500" />
                            <span>구인요청</span>
                        </button>
                        <button
                            onClick={() => setView('calendar')}
                            className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-xl text-[11px] sm:text-xs font-black transition-all border ${
                                view === 'calendar'
                                    ? 'bg-indigo-500/10 dark:bg-indigo-600/10 border-indigo-500/30 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400 shadow-md dark:shadow-lg'
                                    : 'bg-white dark:bg-slate-950/40 border-slate-200 dark:border-slate-900/40 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                            }`}
                        >
                            <LucideCalendar className="h-4.5 w-4.5 mb-1.5 text-emerald-500" />
                            <span>지출 달력</span>
                        </button>
                        <button
                            onClick={() => setView('lounge')}
                            className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-xl text-[11px] sm:text-xs font-black transition-all border ${
                                view === 'lounge'
                                    ? 'bg-indigo-500/10 dark:bg-indigo-600/10 border-indigo-500/30 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400 shadow-md dark:shadow-lg'
                                    : 'bg-white dark:bg-slate-950/40 border-slate-200 dark:border-slate-900/40 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                            }`}
                        >
                            <Sparkles className="h-4.5 w-4.5 mb-1.5 text-pink-500" />
                            <span>휴게실 게임</span>
                        </button>
                        <button
                            onClick={() => setView('notices')}
                            className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-xl text-[11px] sm:text-xs font-black transition-all border relative ${
                                view === 'notices'
                                    ? 'bg-indigo-500/10 dark:bg-indigo-600/10 border-indigo-500/30 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400 shadow-md dark:shadow-lg'
                                    : 'bg-white dark:bg-slate-950/40 border-slate-200 dark:border-slate-900/40 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                            }`}
                        >
                            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
                            <Bell className="h-4.5 w-4.5 mb-1.5 text-orange-500" />
                            <span>공지사항</span>
                        </button>
                        <button
                            onClick={() => setView('settings')}
                            className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-xl text-[11px] sm:text-xs font-black transition-all border ${
                                view === 'settings'
                                    ? 'bg-indigo-500/10 dark:bg-indigo-600/10 border-indigo-500/30 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400 shadow-md dark:shadow-lg'
                                    : 'bg-white dark:bg-slate-950/40 border-slate-200 dark:border-slate-900/40 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                            }`}
                        >
                            <Settings className="h-4.5 w-4.5 mb-1.5 text-slate-400 dark:text-slate-500" />
                            <span>설정</span>
                        </button>
                    </div>
                )}
                {view === 'login' && (
                    <div className="flex flex-col gap-6">
                        <Login 
                            title="구인자 로그인" 
                            description="현장 관리자 및 대표자용 파트너 전용 앱입니다." 
                            isEmployer={true} 
                            onLogin={(phone) => handleLogin(phone)} 
                        />
                        <div className="text-center bg-white dark:bg-slate-900/40 backdrop-blur-md p-4 rounded-3xl border border-slate-200 dark:border-slate-800/80 shadow-md dark:shadow-2xl max-w-md mx-auto w-full transition-colors duration-300">
                            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase">Demo Credentials</p>
                            <p className="text-xs text-indigo-600 dark:text-indigo-400 font-extrabold mt-1">테스트 휴대폰: 010-9999-8888</p>
                        </div>
                    </div>
                )}
                {view === 'auth' && <Authentication phone={phoneToVerify!} onVerify={handleAuthSuccess} onBack={() => setView('login')} rememberMe={true} />}
                {view === 'register' && <RegisterView />}
                {view === 'site-register' && <SiteRegisterView />}
                {view === 'job-request' && <JobRequestView />}
                {view === 'calendar' && <CalendarView sites={sites} jobRequests={jobRequests} currentUser={currentUser!} />}
                {view === 'lounge' && (
                    <div className="bg-slate-900/40 p-4 rounded-3xl border border-slate-800/80 shadow-2xl backdrop-blur-md animate-fadeIn">
                        <GameCenter />
                    </div>
                )}
                {view === 'notices' && <EmployerNoticeView />}
                {view === 'settings' && <SettingsView theme={theme} onThemeChange={setTheme} isEmployer={true} />}
            </main>
            <Footer />
        </div>
    );
};

export default EmployerApp;
