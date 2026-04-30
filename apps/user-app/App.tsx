
import React, { useState, useEffect } from 'react';
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
import { SITES_DATA, Site } from './data/sites';
import { WORK_HISTORY_DATA, WorkHistory } from './data/workHistory';

type View = 'login' | 'authenticate' | 'register' | 'register-success' | 'sites' | 'site-detail' | 'edit-profile';
type SiteViewTab = 'list' | 'calendar' | 'history' | 'userInfo' | 'notices' | 'games';

interface StoredUser {
  phone: string;
  name: string;
}

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
  
  // Dynamic Sites State
  const [allSites, setAllSites] = useState<Site[]>(SITES_DATA);

  const TEST_USER_PHONE = '01011112222';

  useEffect(() => {
    try {
      // Initialize test user and 10 mock workers
      const registeredUsersRaw = localStorage.getItem('registeredUsers');
      let currentUsers = registeredUsersRaw ? JSON.parse(registeredUsersRaw) : [];
      
      const userProfilesRaw = localStorage.getItem('userProfiles');
      let currentProfiles = userProfilesRaw ? JSON.parse(userProfilesRaw) : {};

      // Check if we need to seed data (if only the default test user exists or empty)
      if (currentUsers.length <= 1) {
        // 1. Ensure Default Test User
        if (!currentUsers.find((u: StoredUser) => u.phone === TEST_USER_PHONE)) {
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
            if (!currentUsers.find((u: StoredUser) => u.phone === phone)) {
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
                    registrationDate: `2024-08-${String(index + 1).padStart(2, '0')}T10:${String(index*5).padStart(2,'0')}:00.000Z`,
                };
            }
        });

        localStorage.setItem('registeredUsers', JSON.stringify(currentUsers));
        localStorage.setItem('userProfiles', JSON.stringify(currentProfiles));
      }
      
      const savedUser = localStorage.getItem('currentUser');
      if (savedUser) {
        const user = JSON.parse(savedUser);
        setIsAuthenticated(true);
        setCurrentUser(user);
        setCurrentView(user.isRegistered ? 'sites' : 'register');
        setUserWorkHistory(WORK_HISTORY_DATA.filter(wh => wh.userId === user.phone));

        const savedProfiles = localStorage.getItem('userProfiles');
        if (savedProfiles) {
            const profiles = JSON.parse(savedProfiles);
            setUserProfile(profiles[user.phone] || null);
        }
      }
      const savedAppliedSiteId = localStorage.getItem('appliedSiteId');
      if (savedAppliedSiteId) {
        setAppliedSiteId(savedAppliedSiteId);
      }

      // Load Published Notices (Dynamic Sites)
      const recruitmentNoticesRaw = localStorage.getItem('recruitmentNotices');
      const recruitmentNotices: Site[] = recruitmentNoticesRaw ? JSON.parse(recruitmentNoticesRaw) : [];
      // Merge with static data, prioritizing dynamic ones if needed, or just appending
      setAllSites([...SITES_DATA, ...recruitmentNotices]);

    } catch (error) {
      console.error("Failed to parse data from localStorage", error);
      localStorage.clear(); 
    }
  }, []);

  const handleLogin = (phone: string, rememberMe: boolean) => {
    setShouldRememberUser(rememberMe);
    setPhoneToVerify(phone);
    setCurrentView('authenticate');
  };
  
  const handleAuthSuccess = (rememberMe: boolean) => {
    if (!phoneToVerify) return;

    const registeredUsersRaw = localStorage.getItem('registeredUsers');
    const registeredUsers: StoredUser[] = registeredUsersRaw ? JSON.parse(registeredUsersRaw) : [];
    const existingUser = registeredUsers.find(u => u.phone === phoneToVerify);
    
    let user: { phone: string; name: string | null; isRegistered: boolean; };

    if (existingUser) {
        user = { phone: phoneToVerify, name: existingUser.name, isRegistered: true };
        setCurrentUser(user);
        setUserWorkHistory(WORK_HISTORY_DATA.filter(wh => wh.userId === phoneToVerify));
        
        const userProfilesRaw = localStorage.getItem('userProfiles');
        if (userProfilesRaw) {
            const profiles = JSON.parse(userProfilesRaw);
            setUserProfile(profiles[phoneToVerify] || null);
        }
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
    if (!currentUser) return;
    setIsLoading(true);
    
    setTimeout(() => {
        setSubmission(data);
        const updatedUser = { ...currentUser, name: data.name, isRegistered: true };
        setCurrentUser(updatedUser);

        const registeredUsersRaw = localStorage.getItem('registeredUsers');
        const registeredUsers: StoredUser[] = registeredUsersRaw ? JSON.parse(registeredUsersRaw) : [];
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

        const profilesRaw = localStorage.getItem('userProfiles');
        const profiles = profilesRaw ? JSON.parse(profilesRaw) : {};
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
    if (!currentUser || !userProfile) return;
    
    setIsLoading(true);
    
    setTimeout(() => {
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
        
        const profilesRaw = localStorage.getItem('userProfiles');
        const profiles = profilesRaw ? JSON.parse(profilesRaw) : {};
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
            {/* Scrollable Tab Container */}
            <div className="mb-6 border-b border-slate-700 bg-slate-800/50 rounded-t-lg">
              <div className="flex overflow-x-auto snap-x scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
                <TabButton active={siteViewTab === 'list'} onClick={() => setSiteViewTab('list')}>모집중인 현장</TabButton>
                <TabButton active={siteViewTab === 'calendar'} onClick={() => setSiteViewTab('calendar')}>출역 달력</TabButton>
                <TabButton active={siteViewTab === 'history'} onClick={() => { setSelectedDate(null); setSiteViewTab('history'); }}>상세 내역</TabButton>
                <TabButton active={siteViewTab === 'notices'} onClick={() => setSiteViewTab('notices')}>공지사항</TabButton>
                <TabButton active={siteViewTab === 'games'} onClick={() => setSiteViewTab('games')}>휴게실</TabButton>
                <TabButton active={siteViewTab === 'userInfo'} onClick={() => setSiteViewTab('userInfo')}>회원정보</TabButton>
              </div>
            </div>
            
            <div className="animate-fadeIn">
              {siteViewTab === 'list' && <SiteList sites={allSites} onSelectSite={handleSelectSite} appliedSiteId={appliedSiteId} />}
              {siteViewTab === 'calendar' && <CalendarView workHistory={userWorkHistory} onDayClick={handleNavigateToHistory} />}
              {siteViewTab === 'history' && <HistoryDetailView workHistory={userWorkHistory} selectedDate={selectedDate} />}
              {siteViewTab === 'notices' && <NoticeView />}
              {siteViewTab === 'games' && <GameCenter />}
              {siteViewTab === 'userInfo' && <UserInfoView userProfile={userProfile} onEdit={handleNavigateToEditProfile}/>}
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
    <div className="min-h-screen bg-slate-900 text-slate-300 flex flex-col font-sans">
      <Header isAuthenticated={isAuthenticated} currentUser={currentUser} onLogout={handleLogout}/>
      <main className="container mx-auto px-4 py-8 flex-grow">
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
