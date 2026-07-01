
import React, { useState, useEffect } from 'react';
import UserApp from './apps/user-app/App';
import AdminApp from './apps/admin-app/AdminApp';
import EmployerApp from './apps/employer-app/App';
import { initDocsAuth, googleSignIn, googleSignOut, createSpecificationDoc } from './apps/docsHelper';

const Router: React.FC = () => {
    const [view, setView] = useState<'landing' | 'user' | 'admin' | 'employer'>('landing');

    const [googleUser, setGoogleUser] = useState<any>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [isCreatingDoc, setIsCreatingDoc] = useState(false);
    const [createdDocId, setCreatedDocId] = useState<string | null>(null);
    const [docError, setDocError] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribe = initDocsAuth(
            (user, token) => {
                setGoogleUser(user);
                setAccessToken(token);
            },
            () => {
                setGoogleUser(null);
                setAccessToken(null);
            }
        );
        return () => unsubscribe();
    }, []);

    const handleGoogleLogin = async () => {
        try {
            setDocError(null);
            const result = await googleSignIn();
            if (result) {
                setGoogleUser(result.user);
                setAccessToken(result.accessToken);
            }
        } catch (err: any) {
            setDocError(err.message || 'Google 로그인에 실패했습니다.');
        }
    };

    const handleGoogleLogout = async () => {
        try {
            await googleSignOut();
            setGoogleUser(null);
            setAccessToken(null);
            setCreatedDocId(null);
        } catch (err: any) {
            console.error(err);
        }
    };

    const handleCreateDoc = async () => {
        if (!accessToken) return;
        setIsCreatingDoc(true);
        setDocError(null);
        try {
            const title = '건설 인력 매칭 플랫폼 상세 구현 설명서 및 워킹 플로우';
            const docId = await createSpecificationDoc(accessToken, title);
            setCreatedDocId(docId);
        } catch (err: any) {
            console.error(err);
            setDocError('구글 문서 생성 및 상세 명세서 작성에 실패했습니다. 권한 확인이 필요합니다.');
        } finally {
            setIsCreatingDoc(false);
        }
    };

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

    const modeCards: Array<{
        view: 'user' | 'employer' | 'admin';
        badge: string;
        title: string;
        description: string;
        actionText: string;
        accent: string;
        hoverBorder: string;
        hoverText: string;
        icon: React.ReactNode;
    }> = [
        {
            view: 'user',
            badge: 'Worker Interface',
            title: '근로자용 앱',
            description: '주변 현장을 빠르게 탐색하고 지원하며, 출퇴근 인증과 급여 현황을 한 번에 확인할 수 있습니다.',
            actionText: '시작하기',
            accent: 'text-amber-400',
            hoverBorder: 'hover:border-amber-400/40',
            hoverText: 'group-hover:text-amber-300',
            icon: <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        },
        {
            view: 'employer',
            badge: 'Employer Portal',
            title: '구인자용 앱',
            description: '현장 공고부터 인력 선발, 진행 상황 관리까지 실시간으로 운영하는 구인 전용 워크플로우입니다.',
            actionText: '시작하기',
            accent: 'text-indigo-300',
            hoverBorder: 'hover:border-indigo-400/40',
            hoverText: 'group-hover:text-indigo-300',
            icon: <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5h1.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293h3.172a1 1 0 00.707-.293l2.414-2.414a1 1 0 01.707-.293H21" />
        },
        {
            view: 'admin',
            badge: 'Admin Operations',
            title: '관리자용 시스템',
            description: '회원 승인, 권한 관리, 출역 통제, 정산 검토를 담당하는 통합 운영 콘솔입니다.',
            actionText: '접속하기',
            accent: 'text-sky-300',
            hoverBorder: 'hover:border-sky-400/40',
            hoverText: 'group-hover:text-sky-300',
            icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        }
    ];

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 flex items-center justify-center p-4 sm:p-6 font-sans relative overflow-hidden">
            <div className="absolute top-[-15%] left-[-10%] w-[34rem] h-[34rem] rounded-full bg-amber-500/10 blur-[140px] pointer-events-none" />
            <div className="absolute top-[20%] right-[-12%] w-[32rem] h-[32rem] rounded-full bg-indigo-500/10 blur-[140px] pointer-events-none" />
            <div className="absolute bottom-[-18%] left-[35%] w-[30rem] h-[30rem] rounded-full bg-cyan-500/10 blur-[140px] pointer-events-none" />

            <div className="max-w-6xl w-full animate-fadeIn relative z-10">
                <section className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 mb-5 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold tracking-wide text-slate-300 backdrop-blur-md">
                        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                        SMART FIELD MATCHING SUITE
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-400 mb-4 tracking-tight">
                        건설 인력 매칭 플랫폼
                    </h1>
                    <p className="text-sm md:text-base text-slate-400 max-w-3xl mx-auto font-medium leading-relaxed">
                        최근 앱 트렌드를 반영한 카드형 워크플로우 UI로
                        <br className="hidden md:block" />
                        근로자 · 구인자 · 관리자 운영을 빠르게 시작하세요.
                    </p>
                    <div className="mt-7 grid grid-cols-2 md:grid-cols-4 gap-2.5 max-w-2xl mx-auto text-xs">
                        <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">모바일 우선 UX</div>
                        <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">글래스 카드 인터랙션</div>
                        <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">빠른 진입 동선</div>
                        <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">역할 기반 분리</div>
                    </div>
                </section>

                <section className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto">
                    {modeCards.map((card) => (
                        <button
                            key={card.view}
                            onClick={() => setView(card.view)}
                            className={`group relative rounded-3xl p-[1px] bg-gradient-to-b from-white/15 to-white/0 ${card.hoverBorder} transition-all duration-300`}
                        >
                            <div className="h-full rounded-[calc(1.5rem-1px)] bg-slate-900/75 backdrop-blur-xl border border-white/5 p-7 text-left transition-all duration-300 group-hover:bg-slate-900/90 group-hover:-translate-y-1 group-hover:shadow-2xl">
                                <div className="mb-5 inline-flex rounded-2xl border border-white/10 bg-white/5 p-3.5 transition-transform duration-300 group-hover:scale-105">
                                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${card.accent}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                                        {card.icon}
                                    </svg>
                                </div>
                                <span className={`text-[10px] uppercase tracking-wider font-extrabold ${card.accent}`}>{card.badge}</span>
                                <h2 className={`mt-1 text-2xl font-bold text-white ${card.hoverText} transition-colors`}>{card.title}</h2>
                                <p className="mt-3 text-slate-400 text-sm leading-relaxed min-h-[84px]">{card.description}</p>
                                <div className={`mt-6 inline-flex items-center gap-1 text-sm font-bold ${card.accent}`}>
                                    <span>{card.actionText}</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </div>
                            </div>
                        </button>
                    ))}
                </section>
 
                {/* Google Docs 상세 구현 설명서 내보내기 카드 */}
                <div className="mt-14 max-w-5xl mx-auto bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-3xl p-6 md:p-8 transition-all duration-300 shadow-xl relative overflow-hidden">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div className="flex items-start space-x-4">
                            <div className="p-3 bg-indigo-900/40 rounded-xl text-indigo-400 mt-1">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white mb-2">상세 구현 설명서 & 워킹 플로우 구글 문서로 저장</h3>
                                <p className="text-slate-400 text-sm leading-relaxed max-w-2xl">
                                    지금까지 설계 및 구현된 <strong>3종 프로그램(근로자/구인자/관리자)의 동작 프로세스, 데이터 스키마(localStorage), 모바일 앱 출시 준비 사항 및 비용 산정표</strong>를 한눈에 볼 수 있는 상세 문서를 회원님의 구글 드라이브(Google Docs)에 생성하여 영구 보관할 수 있습니다.
                                </p>
                            </div>
                        </div>

                        {!googleUser ? (
                            <button
                                onClick={handleGoogleLogin}
                                className="w-full md:w-auto shrink-0 flex items-center justify-center space-x-2.5 bg-white hover:bg-slate-100 text-slate-800 font-semibold px-5 py-3 rounded-xl shadow transition duration-200"
                            >
                                <svg className="h-5 w-5" viewBox="0 0 24 24">
                                    <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.578-7.859-8s3.53-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l3.227-3.103C18.228 1.834 15.468 1 12.24 1 5.48 1 0 6.48 0 13.24s5.48 12.24 12.24 12.24c7.05 0 11.75-4.962 11.75-11.94 0-.805-.085-1.415-.19-1.933H12.24z"></path>
                                </svg>
                                <span>Google 문서 연동 시작</span>
                            </button>
                        ) : (
                            <div className="w-full md:w-auto shrink-0 flex flex-col items-stretch md:items-end space-y-3">
                                <div className="text-xs text-slate-400 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-700/50 flex items-center justify-between md:justify-end space-x-2">
                                    <span className="font-medium text-slate-300">{googleUser.displayName || googleUser.email} 연동 중</span>
                                    <button onClick={handleGoogleLogout} className="text-rose-400 hover:underline hover:text-rose-300 text-[10px]">로그아웃</button>
                                </div>
                                {!createdDocId ? (
                                    <button
                                        onClick={handleCreateDoc}
                                        disabled={isCreatingDoc}
                                        className="w-full md:w-auto bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold px-6 py-3 rounded-xl shadow-lg hover:shadow-indigo-500/20 transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50"
                                    >
                                        {isCreatingDoc ? (
                                            <>
                                                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                </svg>
                                                <span>문서 생성 및 작성 중...</span>
                                            </>
                                        ) : (
                                            <span>상세 명세서 문서 생성하기</span>
                                        )}
                                    </button>
                                ) : (
                                    <a
                                        href={`https://docs.google.com/document/d/${createdDocId}/edit`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full md:w-auto bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold px-6 py-3 rounded-xl shadow-lg hover:shadow-emerald-500/20 transition-all duration-200 flex items-center justify-center space-x-2 animate-fadeIn"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <span>내 구글 문서 열기 ↗</span>
                                    </a>
                                )}
                            </div>
                        )}
                    </div>

                    {docError && (
                        <div className="mt-4 p-3 bg-rose-900/30 border border-rose-700/50 rounded-xl text-rose-300 text-xs flex items-center space-x-2 animate-fadeIn">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5 text-rose-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <span>{docError}</span>
                        </div>
                    )}

                    {createdDocId && (
                        <div className="mt-4 p-4 bg-emerald-950/40 border border-emerald-700/50 rounded-xl text-emerald-300 text-sm animate-fadeIn">
                            <p className="font-bold flex items-center text-white mb-1">
                                <span className="mr-1.5">🎉</span> 구글 문서 생성에 성공했습니다!
                            </p>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                '건설 인력 매칭 플랫폼 상세 구현 설명서 및 워킹 플로우' 문서가 회원님의 구글 계정에 성공적으로 생성되어 내용 작성이 완료되었습니다. 위 초록색 버튼을 클릭해 실시간 검토가 가능합니다.
                            </p>
                        </div>
                    )}
                </div>

                <footer className="mt-16 text-center text-slate-600 text-xs tracking-wider">
                    <p>© 2026 Construction Workforce Matching Platform. All rights reserved.</p>
                </footer>
            </div>
        </div>
    );
};

export default Router;
