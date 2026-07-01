
import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Login } from './components/Login';
import { Authentication } from './components/Authentication';
import { RegistrationForm, SubmissionData } from './components/KeywordInput';
import { EditProfileForm, ProfileUpdateData } from './components/EditProfileForm';
import { ReportDisplay } from './components/ReportDisplay';
import { SiteList } from './components/SiteList';
import { SiteDetail } from './components/SiteDetail';
import { CalendarView } from './components/CalendarView';
import { HistoryDetailView } from './components/HistoryDetailView';
import { UserInfoView, UserProfile } from './components/UserInfoView';
import { NoticeView } from './components/NoticeView';
import { GameCenter } from './components/GameCenter';
import { SettingsView } from './components/SettingsView';
import { SITES_DATA, Site } from './data/sites';
import { WORK_HISTORY_DATA, WorkHistory } from './data/workHistory';

type View = 'login' | 'authenticate' | 'register' | 'register-success' | 'sites' | 'site-detail' | 'edit-profile';
type SiteViewTab = 'list' | 'calendar' | 'history' | 'userInfo' | 'notices' | 'games' | 'settings';

interface StoredUser {
  phone: string;
  name: string;
}

const readJsonFromStorage = <T,>(key: string, fallback: T): T => {
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;

  try {
    return JSON.parse(raw) as T;
  } catch (error) {
    // Keep the app running even when one storage key is corrupted.
    console.error(`[storage:${key}] JSON 파싱 실패, 기본값으로 복구합니다.`, error);
    return fallback;
  }
};

const readStorageArray = <T,>(key: string): T[] => {
  const parsed = readJsonFromStorage<unknown>(key, []);
  if (Array.isArray(parsed)) return parsed as T[];

  console.error(`[storage:${key}] 배열 형식이 아닙니다. 빈 배열로 복구합니다.`);
  return [];
};

const readStorageRecord = <T,>(key: string): Record<string, T> => {
  const parsed = readJsonFromStorage<unknown>(key, {});
  if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
    return parsed as Record<string, T>;
  }

  console.error(`[storage:${key}] 객체 형식이 아닙니다. 빈 객체로 복구합니다.`);
  return {};
};

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ phone: string; name: string | null; isRegistered?: boolean } | null>(null);
  const [currentView, setCurrentView] = useState<View>('login');
  const [submission, setSubmission] = useState<SubmissionData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const [appliedSiteId, setAppliedSiteId] = useState<string | null>(null);
  const [siteViewTab, setSiteViewTab] = useState<SiteViewTab>('list');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [userWorkHistory, setUserWorkHistory] = useState<WorkHistory[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [phoneToVerify, setPhoneToVerify] = useState<string | null>(null);
  const [shouldRememberUser, setShouldRememberUser] = useState(true);
  const registrationTimeoutRef = useRef<number | null>(null);
  const profileUpdateTimeoutRef = useRef<number | null>(null);
  
  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(() => {
    const storedTheme = localStorage.getItem('user-app-theme');
    return storedTheme === 'light' || storedTheme === 'dark' || storedTheme === 'system'
      ? storedTheme
      : 'system';
  });

  // Dynamic Sites State
  const [allSites, setAllSites] = useState<Site[]>(SITES_DATA);

  const TEST_USER_PHONE = '01011112222';

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
    localStorage.setItem('user-app-theme', theme);

    if (theme === 'system') {
      mediaQuery.addEventListener('change', applyTheme);
      return () => mediaQuery.removeEventListener('change', applyTheme);
    }
  }, [theme]);

  useEffect(() => {
    // Initialize test user and 10 mock workers
    const currentUsers = readStorageArray<StoredUser>('registeredUsers');
    const currentProfiles = readStorageRecord<UserProfile>('userProfiles');

    // Check if we need to seed data (if only the default test user exists or empty)
    if (currentUsers.length <= 1) {
      // 1. Ensure Default Test User
      if (!currentUsers.find((u) => u.phone === TEST_USER_PHONE)) {
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
      const MOCK_NAMES = ['이철수', '박지영', '최민호', '정수빈', '강현우', '조은지', '윤성민', '장미란', '임재범', '한예슬'];
      const AREAS = ['서울 강남구', '서울 마포구', '경기 성남시', '경기 수원시', '인천 부평구'];

      MOCK_NAMES.forEach((name, index) => {
        const phone = `0108000${String(index).padStart(4, '0')}`;
        if (!currentUsers.find((u) => u.phone === phone)) {
          const isMale = index % 2 === 0;
          const birthYear = 80 + index; // 1980~1989
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
            registrationDate: `2024-08-${String(index + 1).padStart(2, '0')}T10:${String(index * 5).padStart(2, '0')}:00.000Z`,
          };
        }
      });

      localStorage.setItem('registeredUsers', JSON.stringify(currentUsers));
      localStorage.setItem('userProfiles', JSON.stringify(currentProfiles));
    }

    const savedUser = readJsonFromStorage<{ phone: string; name: string | null; isRegistered?: boolean } | null>('currentUser', null);
    if (savedUser) {
      setIsAuthenticated(true);
      setCurrentUser(savedUser);
      setCurrentView(savedUser.isRegistered ? 'sites' : 'register');
      setUserWorkHistory(WORK_HISTORY_DATA.filter(wh => wh.userId === savedUser.phone));

      const profiles = readStorageRecord<UserProfile>('userProfiles');
      setUserProfile(profiles[savedUser.phone] || null);
    }

    const savedAppliedSiteId = localStorage.getItem('appliedSiteId');
    if (savedAppliedSiteId) {
      setAppliedSiteId(savedAppliedSiteId);
    }

    // Merge published notices with static site data.
    const recruitmentNotices = readStorageArray<Site>('recruitmentNotices');
    setAllSites([...SITES_DATA, ...recruitmentNotices]);
  }, []);

  useEffect(() => {
    return () => {
      if (registrationTimeoutRef.current !== null) {
        window.clearTimeout(registrationTimeoutRef.current);
      }
      if (profileUpdateTimeoutRef.current !== null) {
        window.clearTimeout(profileUpdateTimeoutRef.current);
      }
    };
  }, []);

  const handleLogin = (phone: string, rememberMe: boolean) => {
    setShouldRememberUser(rememberMe);
    setPhoneToVerify(phone);
    setCurrentView('authenticate');
  };
  
  const handleAuthSuccess = (rememberMe: boolean) => {
    if (!phoneToVerify) return;

    const registeredUsers = readStorageArray<StoredUser>('registeredUsers');
    const existingUser = registeredUsers.find(u => u.phone === phoneToVerify);
    
    let user: { phone: string; name: string | null; isRegistered: boolean; };

    if (existingUser) {
        user = { phone: phoneToVerify, name: existingUser.name, isRegistered: true };
        setCurrentUser(user);
        setUserWorkHistory(WORK_HISTORY_DATA.filter(wh => wh.userId === phoneToVerify));
        
        const profiles = readStorageRecord<UserProfile>('userProfiles');
        setUserProfile(profiles[phoneToVerify] || null);
        setCurrentView('sites');
    } else {
        user = { phone: phoneToVerify, name: null, isRegistered: false };
        setCurrentUser(user);
        setCurrentView('register');
    }
    
    setIsAuthenticated(true);

    if (rememberMe) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    }
    
    setPhoneToVerify(null);
  };
  
  const handleBackToLogin = () => {
    setPhoneToVerify(null);
    setCurrentView('login');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setCurrentView('login');
    setPhoneToVerify(null);
    localStorage.removeItem('currentUser');
    setUserWorkHistory([]);
    setUserProfile(null);
  };

  const handleRegistrationSubmit = (data: SubmissionData) => {
    if (!currentUser || isLoading) return;
    setIsLoading(true);

    if (registrationTimeoutRef.current !== null) {
      window.clearTimeout(registrationTimeoutRef.current);
    }

    registrationTimeoutRef.current = window.setTimeout(() => {
        registrationTimeoutRef.current = null;
        setSubmission(data);
        const updatedUser = { ...currentUser, name: data.name, isRegistered: true };
        setCurrentUser(updatedUser);

        const registeredUsers = readStorageArray<StoredUser>('registeredUsers');
        const newUser: StoredUser = { phone: currentUser.phone, name: data.name };
        if (!registeredUsers.find(u => u.phone === newUser.phone)) {
            registeredUsers.push(newUser);
        }
        localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));

        const userProfileData: UserProfile = {
            ...data,
            bankAccountFileName: data.bankAccountFile.name,
            idCardFileName: data.idCardFile.name,
            safetyCertFileName: data.safetyCertFile.name,
            registrationDate: new Date().toISOString(),
        };
        if (data.profilePictureFile) {
            userProfileData.profilePictureFileName = data.profilePictureFile.name;
        }

        const profiles = readStorageRecord<UserProfile>('userProfiles');
        profiles[currentUser.phone] = userProfileData;
        localStorage.setItem('userProfiles', JSON.stringify(profiles));
        setUserProfile(userProfileData);
        
        if (shouldRememberUser || localStorage.getItem('currentUser')) {
          localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        }

        setIsLoading(false);
        setCurrentView('register-success');
    }, 2000);
  };

  const handleProceedToSites = () => {
    setCurrentView('sites');
  };

  const handleSelectSite = (site: Site) => {
    setSelectedSite(site);
    setCurrentView('site-detail');
  };

  const handleBackToList = () => {
    setSelectedSite(null);
    setCurrentView('sites');
    setSiteViewTab('list');
  };
  
  const handleApplyForSite = (siteId: string) => {
    setAppliedSiteId(siteId);
    localStorage.setItem('appliedSiteId', siteId);
  };

  const handleNavigateToHistory = (date: string) => {
    setSelectedDate(date);
    setSiteViewTab('history');
  };

  const handleNavigateToEditProfile = () => {
    setCurrentView('edit-profile');
  };

  const handleBackToUserInfo = () => {
    setCurrentView('sites');
    setSiteViewTab('userInfo');
  };

  const handleProfileUpdate = (data: ProfileUpdateData) => {
    if (!currentUser || !userProfile || isLoading) return;
    
    setIsLoading(true);

    if (profileUpdateTimeoutRef.current !== null) {
      window.clearTimeout(profileUpdateTimeoutRef.current);
    }

    profileUpdateTimeoutRef.current = window.setTimeout(() => {
        profileUpdateTimeoutRef.current = null;
        const updatedProfile: UserProfile = { ...userProfile };
        
        Object.assign(updatedProfile, {
            name: data.name,
            gender: data.gender,
            nationality: data.nationality,
            country: data.country,
            countryOther: data.countryOther,
            visaType: data.visaType,
            visaTypeOther: data.visaTypeOther,
            preferredAreas: data.preferredAreas,
            bank: data.bank,
            accountNumber: data.accountNumber,
            accountHolder: data.accountHolder,
        });

        if (data.profilePictureFile) updatedProfile.profilePictureFileName = data.profilePictureFile.name;
        if (data.idCardFile) updatedProfile.idCardFileName = data.idCardFile.name;
        if (data.safetyCertFile) updatedProfile.safetyCertFileName = data.safetyCertFile.name;
        if (data.bankAccountFile) updatedProfile.bankAccountFileName = data.bankAccountFile.name;
        
        const profiles = readStorageRecord<UserProfile>('userProfiles');
        profiles[currentUser.phone] = updatedProfile;
        localStorage.setItem('userProfiles', JSON.stringify(profiles));
        setUserProfile(updatedProfile);

        if (updatedProfile.name !== currentUser.name) {
            const updatedCurrentUser = { ...currentUser, name: updatedProfile.name, isRegistered: true };
            setCurrentUser(updatedCurrentUser);
            if (localStorage.getItem('currentUser')) {
                localStorage.setItem('currentUser', JSON.stringify(updatedCurrentUser));
            }
        }
        
        setIsLoading(false);
        handleBackToUserInfo();
    }, 1500);
  };

  const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => {
    return (
      <button
        onClick={onClick}
        className={`px-4 py-3 text-sm font-semibold transition-colors duration-200 text-center whitespace-nowrap min-w-fit snap-center
          ${active 
            ? 'border-b-2 border-amber-500 text-amber-400' 
            : 'border-b-2 border-transparent text-slate-400 hover:text-slate-200'
          }`}
      >
        {children}
      </button>
    );
  };

  const renderContent = () => {
    if (currentView === 'authenticate') {
      return <Authentication phone={phoneToVerify!} onVerify={handleAuthSuccess} onBack={handleBackToLogin} rememberMe={shouldRememberUser} />;
    }
    
    if (!isAuthenticated || currentView === 'login') {
      return <Login onLogin={handleLogin} />;
    }

    switch (currentView) {
      case 'register':
        return <RegistrationForm onSubmit={handleRegistrationSubmit} isLoading={isLoading} currentUserPhone={currentUser!.phone}/>;
      case 'register-success':
        return <ReportDisplay submission={submission} isLoading={isLoading} onProceed={handleProceedToSites}/>;
      case 'edit-profile':
          return userProfile ? (
            <EditProfileForm 
                initialProfile={userProfile} 
                onSubmit={handleProfileUpdate} 
                onCancel={handleBackToUserInfo}
                isLoading={isLoading} 
            />
          ) : ( <div>사용자 프로필을 로드할 수 없습니다.</div> );
      case 'sites':
        return (
          <div className="animate-fadeIn">
            {/* Responsive Navigation Container */}
            <div className="mb-6 bg-slate-100 dark:bg-slate-900/40 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-900/80 transition-all shadow-sm dark:shadow-none">
              {/* Desktop/Tablet view: Classic tab buttons with horizontal flow */}
              <div className="hidden sm:flex overflow-x-auto gap-1">
                <TabButton active={siteViewTab === 'list'} onClick={() => setSiteViewTab('list')}>모집중인 현장</TabButton>
                <TabButton active={siteViewTab === 'calendar'} onClick={() => setSiteViewTab('calendar')}>출역 달력</TabButton>
                <TabButton active={siteViewTab === 'history'} onClick={() => { setSelectedDate(null); setSiteViewTab('history'); }}>상세 내역</TabButton>
                <TabButton active={siteViewTab === 'notices'} onClick={() => setSiteViewTab('notices')}>공지사항</TabButton>
                <TabButton active={siteViewTab === 'games'} onClick={() => setSiteViewTab('games')}>휴게실</TabButton>
                <TabButton active={siteViewTab === 'userInfo'} onClick={() => setSiteViewTab('userInfo')}>회원정보</TabButton>
                <TabButton active={siteViewTab === 'settings'} onClick={() => setSiteViewTab('settings')}>설정</TabButton>
              </div>

              {/* Mobile view: Beautiful, clear, touch-friendly 4-column Grid Menu with Colored Icons */}
              <div className="grid grid-cols-4 gap-2 sm:hidden">
                <button
                  onClick={() => setSiteViewTab('list')}
                  className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-xl text-xs font-bold transition-all border ${
                    siteViewTab === 'list'
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-500 shadow-md shadow-amber-500/5'
                      : 'bg-white dark:bg-slate-950/40 border-slate-200 dark:border-slate-900 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-1.5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  모집 현장
                </button>
                <button
                  onClick={() => setSiteViewTab('calendar')}
                  className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-xl text-xs font-bold transition-all border ${
                    siteViewTab === 'calendar'
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-500 shadow-md shadow-amber-500/5'
                      : 'bg-white dark:bg-slate-950/40 border-slate-200 dark:border-slate-900 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-1.5 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  출역 달력
                </button>
                <button
                  onClick={() => { setSelectedDate(null); setSiteViewTab('history'); }}
                  className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-xl text-xs font-bold transition-all border ${
                    siteViewTab === 'history'
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-500 shadow-md shadow-amber-500/5'
                      : 'bg-white dark:bg-slate-950/40 border-slate-200 dark:border-slate-900 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-1.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  상세 내역
                </button>
                <button
                  onClick={() => setSiteViewTab('notices')}
                  className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-xl text-xs font-bold transition-all border relative ${
                    siteViewTab === 'notices'
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-500 shadow-md shadow-amber-500/5'
                      : 'bg-white dark:bg-slate-950/40 border-slate-200 dark:border-slate-900 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
                >
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-1.5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  공지사항
                </button>
                <button
                  onClick={() => setSiteViewTab('games')}
                  className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-xl text-xs font-bold transition-all border relative ${
                    siteViewTab === 'games'
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-500 shadow-md shadow-amber-500/5'
                      : 'bg-white dark:bg-slate-950/40 border-slate-200 dark:border-slate-900 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
                >
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse"></span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-1.5 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  휴게실
                </button>
                <button
                  onClick={() => setSiteViewTab('userInfo')}
                  className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-xl text-xs font-bold transition-all border ${
                    siteViewTab === 'userInfo'
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-500 shadow-md shadow-amber-500/5'
                      : 'bg-white dark:bg-slate-950/40 border-slate-200 dark:border-slate-900 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-1.5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  회원정보
                </button>
                <button
                  onClick={() => setSiteViewTab('settings')}
                  className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-xl text-xs font-bold transition-all border ${
                    siteViewTab === 'settings'
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-500 shadow-md shadow-amber-500/5'
                      : 'bg-white dark:bg-slate-950/40 border-slate-200 dark:border-slate-900 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-1.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  설정
                </button>
              </div>
            </div>
            
            <div className="animate-fadeIn">
              {siteViewTab === 'list' && <SiteList sites={allSites} onSelectSite={handleSelectSite} appliedSiteId={appliedSiteId} />}
              {siteViewTab === 'calendar' && <CalendarView workHistory={userWorkHistory} onDayClick={handleNavigateToHistory} />}
              {siteViewTab === 'history' && <HistoryDetailView workHistory={userWorkHistory} selectedDate={selectedDate} />}
              {siteViewTab === 'notices' && <NoticeView />}
              {siteViewTab === 'games' && <GameCenter />}
              {siteViewTab === 'userInfo' && <UserInfoView userProfile={userProfile} onEdit={handleNavigateToEditProfile}/>}
              {siteViewTab === 'settings' && <SettingsView theme={theme} onThemeChange={setTheme} />}
            </div>
          </div>
        );
      case 'site-detail':
        return selectedSite ? 
            <SiteDetail site={selectedSite} onBack={handleBackToList} appliedSiteId={appliedSiteId} onApply={handleApplyForSite} currentUser={currentUser}/> 
            : <SiteList sites={allSites} onSelectSite={handleSelectSite} appliedSiteId={appliedSiteId} />;
      default:
        return <Login onLogin={handleLogin} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 flex flex-col font-sans transition-colors duration-300 relative overflow-hidden">
      {/* Decorative ambient background glows */}
      <div className="absolute top-[20%] left-[-20%] w-[50%] h-[50%] rounded-full bg-indigo-500/5 dark:bg-indigo-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-20%] w-[50%] h-[50%] rounded-full bg-amber-500/5 dark:bg-amber-500/5 blur-[120px] pointer-events-none" />

      <Header isAuthenticated={isAuthenticated} currentUser={currentUser} onLogout={handleLogout}/>
      <main className="container mx-auto px-3 sm:px-4 py-4 md:py-8 flex-grow">
        <div className="max-w-4xl mx-auto">
          {renderContent()}
        </div>
      </main>
      <Footer />
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
        .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default App;
