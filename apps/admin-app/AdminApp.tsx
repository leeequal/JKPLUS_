import React, { useState, useEffect } from 'react';
import { AdminLogin } from './components/AdminLogin';
import { MainLayout } from './components/MainLayout';
import { SiteManagement } from './components/SiteManagement';
import { DailyWorkManagement } from './components/DailyWorkManagement';
import { PermissionManagement } from './components/PermissionManagement';
import { WageManagement } from './components/WageManagement';
import { MemberManagement } from './components/MemberManagement';
import { MemberDetail } from './components/MemberDetail';
import { NoticeManagement } from './components/NoticeManagement';
import { AdminUser } from './types';
import { ADMIN_USERS_DATA } from './data/adminUsers';
import { UserProfile } from '../user-app/components/UserInfoView';

export type AdminView = 'members' | 'sites' | 'daily-work' | 'permissions' | 'wage-management' | 'notices';

const AdminApp: React.FC = () => {
    const [adminUsers, setAdminUsers] = useState<AdminUser[]>(() => {
        const savedUsers = localStorage.getItem('adminUsers');
        return savedUsers ? JSON.parse(savedUsers) : ADMIN_USERS_DATA;
    });

    useEffect(() => {
        try {
          // Initialize a single test user if not present.
          const registeredUsersRaw = localStorage.getItem('registeredUsers');
          if (!registeredUsersRaw) {
            const TEST_USER_PHONE = '01011112222';
            const initialUsers = [{ phone: TEST_USER_PHONE, name: '김테스트' }];
            localStorage.setItem('registeredUsers', JSON.stringify(initialUsers));
            
            const userProfiles: Record<string, UserProfile> = {
                [TEST_USER_PHONE]: {
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
                    registrationDate: '2024-07-20',
                }
            };
            localStorage.setItem('userProfiles', JSON.stringify(userProfiles));
          }
        } catch (error) {
          console.error("Failed to seed data in localStorage", error);
        }
    }, []);
    
    useEffect(() => {
        localStorage.setItem('adminUsers', JSON.stringify(adminUsers));
    }, [adminUsers]);

    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [currentView, setCurrentView] = useState<AdminView>('members');
    const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
    const [selectedUserProfile, setSelectedUserProfile] = useState<UserProfile | null>(null);


    const handleLogin = (user: AdminUser) => {
        setCurrentUser(user);
        setIsAuthenticated(true);

        if (user.role === 'master' || user.permissions?.canManageMembers) {
            setCurrentView('members');
        } else if (user.permissions?.canManageSites) {
            setCurrentView('sites');
        } else if (user.permissions?.canManageDailyWork) {
            setCurrentView('daily-work');
        } else if (user.permissions?.canManageWages) {
            setCurrentView('wage-management');
        } else if (user.permissions?.canManageNotices) {
            setCurrentView('notices');
        } else {
            setCurrentView('members'); // Fallback
        }
    };
    
    const handleLogout = () => {
        setCurrentUser(null);
        setIsAuthenticated(false);
        setSelectedUserProfile(null);
    };

    const handleSelectUser = (userProfile: UserProfile) => {
        setSelectedUserProfile(userProfile);
    };

    const handleBackToUserList = () => {
        setSelectedUserProfile(null);
    };

    const renderView = () => {
        if (!currentUser) return null;

        if (selectedUserProfile) {
            return <MemberDetail userProfile={selectedUserProfile} onBack={handleBackToUserList} />;
        }

        const permissions = currentUser.permissions;
        const isMaster = currentUser.role === 'master';

        switch (currentView) {
            case 'members':
                 return (isMaster || permissions?.canManageMembers) ? <MemberManagement onSelectUser={handleSelectUser} /> : <div>접근 권한이 없습니다.</div>;
            case 'sites':
                return (isMaster || permissions?.canManageSites) ? <SiteManagement /> : <div>접근 권한이 없습니다.</div>;
            case 'daily-work':
                return (isMaster || permissions?.canManageDailyWork) ? <DailyWorkManagement /> : <div>접근 권한이 없습니다.</div>;
            case 'wage-management':
                return (isMaster || permissions?.canManageWages) ? <WageManagement /> : <div>접근 권한이 없습니다.</div>;
            case 'notices':
                return (isMaster || permissions?.canManageNotices) ? <NoticeManagement currentUser={currentUser} /> : <div>접근 권한이 없습니다.</div>;
            case 'permissions':
                return isMaster ? <PermissionManagement users={adminUsers} setUsers={setAdminUsers} /> : <div>접근 권한이 없습니다.</div>;
            default:
                return (isMaster || permissions?.canManageMembers) ? <MemberManagement onSelectUser={handleSelectUser} /> : <SiteManagement />;
        }
    };

    if (!isAuthenticated) {
        return <AdminLogin users={adminUsers} onLogin={handleLogin} />;
    }

    return (
        <MainLayout 
            currentView={currentView} 
            setCurrentView={(view) => {
                setSelectedUserProfile(null);
                setCurrentView(view);
            }} 
            currentUser={currentUser!}
            onLogout={handleLogout}
        >
            {renderView()}
        </MainLayout>
    );
};

export default AdminApp;