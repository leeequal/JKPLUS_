
import React, { useState, useEffect } from 'react';
import UserApp from './apps/user-app/App';
import AdminApp from './apps/admin-app/AdminApp';
import EmployerApp from './apps/employer-app/App';

const Router: React.FC = () => {
    const [view, setView] = useState<'landing' | 'user' | 'admin' | 'employer'>('landing');

    useEffect(() => {
        try {
            // --- SEED WORKERS (USERS) ---
            const registeredUsersRaw = localStorage.getItem('registeredUsers');
            let currentUsers = registeredUsersRaw ? JSON.parse(registeredUsersRaw) : [];
            const userProfilesRaw = localStorage.getItem('userProfiles');
            let currentProfiles = userProfilesRaw ? JSON.parse(userProfilesRaw) : {};
            const TEST_USER_PHONE = '01011112222';

            // Seed if only default user or fewer exists
            if (currentUsers.length <= 1) {
                // 1. Ensure Default Test User
                if (!currentUsers.find((u: any) => u.phone === TEST_USER_PHONE)) {
                    currentUsers.push({ phone: TEST_USER_PHONE, name: '김테스트' });
                    currentProfiles[TEST_USER_PHONE] = {
                        name: '김테스트',
                        rrn: '900101-1234567',
                        gender: 'male',
                        nationality: 'korean',
                        phone: TEST_USER_PHONE,
                        preferredAreas: ['서울 강남구'],
                        bank: 'KB국민은행',
                        accountNumber: '111-222-333444',
                        accountHolder: '김테스트',
                        signatureDataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 
                        bankAccountFileName: '통장사본.jpg',
                        idCardFileName: '신분증.jpg',
                        safetyCertFileName: '이수증.jpg',
                        profilePictureFileName: '프로필사진.jpg',
                        registrationDate: '2024-07-20T09:00:00.000Z',
                    };
                }

                // 2. Generate 10 Mock Workers
                const WORKER_NAMES = ['이철수', '박지영', '최민호', '정수빈', '강현우', '조은지', '윤성민', '장미란', '임재범', '한예슬'];
                const AREAS = ['서울 강남구', '서울 마포구', '경기 성남시', '경기 수원시', '인천 부평구'];
                
                WORKER_NAMES.forEach((name, index) => {
                    const phone = `0108000${String(index).padStart(4, '0')}`;
                    if (!currentUsers.find((u: any) => u.phone === phone)) {
                        const isMale = index % 2 === 0;
                        const birthYear = 80 + index; 
                        const genderDigit = isMale ? '1' : '2';
                        
                        currentUsers.push({ phone, name });
                        currentProfiles[phone] = {
                            name,
                            rrn: `${birthYear}0101-${genderDigit}******`,
                            gender: isMale ? 'male' : 'female',
                            nationality: 'korean',
                            phone,
                            preferredAreas: [AREAS[index % AREAS.length]],
                            bank: '신한은행',
                            accountNumber: `110-${index}${index}${index}-123456`,
                            accountHolder: name,
                            signatureDataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
                            bankAccountFileName: 'sample_bank.jpg',
                            idCardFileName: 'sample_id.jpg',
                            safetyCertFileName: 'sample_cert.jpg',
                            registrationDate: `2024-08-${String(index + 1).padStart(2, '0')}T10:${String(index*5).padStart(2,'0')}:00.000Z`,
                        };
                    }
                });
                localStorage.setItem('registeredUsers', JSON.stringify(currentUsers));
                localStorage.setItem('userProfiles', JSON.stringify(currentProfiles));
            }

            // --- SEED EMPLOYERS ---
            const employersRaw = localStorage.getItem('employers');
            let currentEmployers = employersRaw ? JSON.parse(employersRaw) : [];
            const TEST_EMPLOYER_PHONE = '01099998888';

            if (currentEmployers.length <= 1) {
                if (!currentEmployers.find((e: any) => e.phone === TEST_EMPLOYER_PHONE)) {
                    currentEmployers.push({
                        phone: TEST_EMPLOYER_PHONE,
                        name: '박소장',
                        companyName: '튼튼건설',
                        isRegistered: true
                    });
                }

                const EMPLOYER_NAMES = ['김대표', '이팀장', '최부장', '정소장', '강실장', '조반장', '윤이사', '장사장', '임전무', '한상무'];
                const COMPANIES = ['대박건설', '미래건축', '성실인테리어', '제일설비', '하늘공영', '바른시공', '태양전기', '푸른조경', '한마음종합', '우리디자인'];
                const SITES_NAMES = ['강남 오피스텔', '판교 IT센터', '분당 아파트', '성수동 카페', '홍대 리모델링', '부산 해운대 호텔', '대구 복합단지', '광주 아파트', '대전 연구소', '인천 물류센터'];
                const SITE_LOCATIONS = ['서울 강남구', '경기 성남시', '경기 성남시', '서울 성동구', '서울 마포구', '부산 해운대구', '대구 수성구', '광주 서구', '대전 유성구', '인천 중구'];

                const newSites: any[] = [];
                const existingSitesRaw = localStorage.getItem('employerSites');
                if (existingSitesRaw) {
                    newSites.push(...JSON.parse(existingSitesRaw));
                } else {
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

                EMPLOYER_NAMES.forEach((name, index) => {
                    const phone = `0109000${String(index).padStart(4, '0')}`;
                    if (!currentEmployers.find((e: any) => e.phone === phone)) {
                        currentEmployers.push({
                            phone,
                            name,
                            companyName: COMPANIES[index],
                            isRegistered: true
                        });
                        newSites.push({
                            id: `site_req_mock_${index}`,
                            ownerId: phone,
                            name: SITES_NAMES[index],
                            address: SITE_LOCATIONS[index],
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
        } catch (error) {
            console.error("Failed to seed mock data in Router:", error);
        }
    }, []);

    if (view === 'user') {
        return (
            <div className="relative">
                <UserApp />
                <button 
                    onClick={() => setView('landing')}
                    className="fixed bottom-4 right-4 z-50 bg-slate-800 text-slate-400 px-3 py-1 rounded-full text-xs opacity-50 hover:opacity-100 transition border border-slate-700"
                >
                    모드 변경
                </button>
            </div>
        );
    }

    if (view === 'employer') {
        return (
            <div className="relative">
                <EmployerApp />
                <button 
                    onClick={() => setView('landing')}
                    className="fixed bottom-4 right-4 z-50 bg-slate-800 text-slate-400 px-3 py-1 rounded-full text-xs opacity-50 hover:opacity-100 transition border border-slate-700"
                >
                    모드 변경
                </button>
            </div>
        );
    }

    if (view === 'admin') {
        return (
            <div className="relative">
                <AdminApp />
                <button 
                    onClick={() => setView('landing')}
                    className="fixed bottom-4 right-4 z-50 bg-slate-800 text-slate-400 px-3 py-1 rounded-full text-xs opacity-50 hover:opacity-100 transition border border-slate-700"
                >
                    모드 변경
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-900 text-slate-300 flex items-center justify-center p-4 font-sans">
            <div className="max-w-6xl w-full animate-fadeIn">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center p-4 bg-gradient-to-tr from-amber-500 to-orange-600 rounded-2xl shadow-lg mb-6">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5h1.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293h3.172a1 1 0 00.707-.293l2.414-2.414a1 1 0 01.707-.293H21" />
                        </svg>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight">건설 인력 매칭 플랫폼</h1>
                    <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                        현장과 인력을 잇는 스마트한 솔루션. <br className="hidden md:block"/>
                        채용부터 급여 정산까지, 하나의 플랫폼에서 관리하세요.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                    {/* User App Card */}
                    <button 
                        onClick={() => setView('user')}
                        className="group relative bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-amber-500 rounded-2xl p-8 text-left transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/10 flex flex-col h-full"
                    >
                        <div className="mb-6 inline-block p-3 bg-slate-900 rounded-xl group-hover:scale-110 transition-transform duration-300">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-amber-400 transition-colors">근로자용 앱</h2>
                        <p className="text-slate-400 text-sm leading-relaxed mb-6 flex-grow">
                            내 주변 현장을 찾고 간편하게 지원하세요.<br/>
                            전자 근로계약, 출퇴근 인증, 급여 관리.
                        </p>
                        <div className="flex items-center text-amber-500 font-semibold text-sm mt-auto">
                            시작하기 
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </div>
                    </button>

                    {/* Employer App Card */}
                    <button 
                        onClick={() => setView('employer')}
                        className="group relative bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-indigo-500 rounded-2xl p-8 text-left transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/10 flex flex-col h-full"
                    >
                        <div className="mb-6 inline-block p-3 bg-slate-900 rounded-xl group-hover:scale-110 transition-transform duration-300">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5h1.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293h3.172a1 1 0 00.707-.293l2.414-2.414a1 1 0 01.707-.293H21" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors">구인자용 앱</h2>
                        <p className="text-slate-400 text-sm leading-relaxed mb-6 flex-grow">
                            현장을 등록하고 필요한 인력을 요청하세요.<br/>
                            배정된 인력 확인 및 출석 관리.
                        </p>
                        <div className="flex items-center text-indigo-500 font-semibold text-sm mt-auto">
                            시작하기
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </div>
                    </button>

                    {/* Admin App Card */}
                    <button 
                        onClick={() => setView('admin')}
                        className="group relative bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-sky-500 rounded-2xl p-8 text-left transition-all duration-300 hover:shadow-xl hover:shadow-sky-500/10 flex flex-col h-full"
                    >
                        <div className="mb-6 inline-block p-3 bg-slate-900 rounded-xl group-hover:scale-110 transition-transform duration-300">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-sky-400 transition-colors">관리자용 시스템</h2>
                        <p className="text-slate-400 text-sm leading-relaxed mb-6 flex-grow">
                            현장 인력 배정부터 노무 관리, 급여 정산까지.<br/>
                            PC 웹 환경에 최적화된 통합 관리 시스템입니다.
                        </p>
                        <div className="flex items-center text-sky-500 font-semibold text-sm mt-auto">
                            접속하기
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </div>
                    </button>
                </div>

                <footer className="mt-16 text-center text-slate-500 text-xs">
                    <p>© 2024 Construction Workforce Matching Platform. All rights reserved.</p>
                </footer>
            </div>
        </div>
    );
};

export default Router;
