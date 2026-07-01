import React from 'react';
import { AdminView } from '../AdminApp';
import { AdminUser } from '../types';
import { getUserRoleLabel } from '../utils/roleLabels';

interface MainLayoutProps {
    children: React.ReactNode;
    currentView: AdminView;
    setCurrentView: (view: AdminView) => void;
    currentUser: AdminUser;
    onLogout: () => void;
}

const NavLink: React.FC<{
    isActive: boolean;
    onClick: () => void;
    children: React.ReactNode;
    icon: React.ReactNode;
}> = ({ isActive, onClick, children, icon }) => (
    <button
        onClick={onClick}
        className={`flex items-center w-full px-4 py-3 text-sm font-bold rounded-2xl transition-all border ${
            isActive
                ? 'bg-sky-500/10 border-sky-500/20 text-sky-400 shadow-lg shadow-sky-500/5'
                : 'bg-transparent border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
        }`}
    >
        <span className="mr-3 shrink-0">{icon}</span>
        <span>{children}</span>
    </button>
);

const IconMembers: React.FC<{className?:string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.125-1.273-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.125-1.273.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>);
const IconWork: React.FC<{className?:string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>);
const IconSite: React.FC<{className?:string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5h1.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293h3.172a1 1 0 00.707-.293l2.414-2.414a1 1 0 01.707-.293H21" /></svg>);
const IconPermission: React.FC<{className?:string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6.364-6.364l-1.414-1.414a9 9 0 1015.556 0L18.364 9.186M12 18.75h.008v.008H12v-.008z" /></svg>);
const IconWage: React.FC<{className?:string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>);
const IconNotice: React.FC<{className?:string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.136a1.76 1.76 0 011.176-2.311l8.65-3.071a1.76 1.76 0 012.311 1.176l2.147 6.136a1.76 1.76 0 01-.592 3.417l-9.23 3.322" /></svg>);

export const MainLayout: React.FC<MainLayoutProps> = ({ children, currentView, setCurrentView, currentUser, onLogout }) => {
    const isMaster = currentUser.role === 'master';

    return (
        <div className="min-h-screen bg-slate-950 text-slate-300 flex relative overflow-hidden">
            {/* Soft decorative background elements */}
            <div className="absolute top-[30%] left-[-10%] w-[30%] h-[30%] rounded-full bg-sky-500/5 blur-[120px] pointer-events-none" />

            {/* Sidebar */}
            <aside className="w-64 bg-slate-900/40 backdrop-blur-md border-r border-slate-900 flex flex-col p-5 relative z-10">
                <div className="flex items-center space-x-3 mb-10">
                     <div className="w-10 h-10 bg-gradient-to-tr from-sky-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg border border-white/10 shadow-sky-500/10 shrink-0">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-5.5 w-5.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                         <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 20.944a11.955 11.955 0 0118-8.618c0-3.37-1.343-6.425-3.544-8.618z" />
                       </svg>
                    </div>
                    <h1 className="text-lg font-black text-white tracking-tight">통합 관리 콘솔</h1>
                </div>
                <nav className="flex-1 space-y-2">
                    {(isMaster || currentUser.permissions?.canManageMembers) && (
                        <NavLink isActive={currentView === 'members'} onClick={() => setCurrentView('members')} icon={<IconMembers className="w-5 h-5" />}>
                            회원 승인/관리
                        </NavLink>
                    )}
                    {(isMaster || currentUser.permissions?.canManageSites) && (
                        <NavLink isActive={currentView === 'sites'} onClick={() => setCurrentView('sites')} icon={<IconSite className="w-5 h-5" />}>
                            현장 심사/배정
                        </NavLink>
                    )}
                    {(isMaster || currentUser.permissions?.canManageDailyWork) && (
                        <NavLink isActive={currentView === 'daily-work'} onClick={() => setCurrentView('daily-work')} icon={<IconWork className="w-5 h-5" />}>
                            일일 출역 통제
                        </NavLink>
                    )}
                    {(isMaster || currentUser.permissions?.canManageWages) && (
                        <NavLink isActive={currentView === 'wage-management'} onClick={() => setCurrentView('wage-management')} icon={<IconWage className="w-5 h-5" />}>
                            노임 정산 대장
                        </NavLink>
                    )}
                    {(isMaster || currentUser.permissions?.canManageNotices) && (
                        <NavLink isActive={currentView === 'notices'} onClick={() => setCurrentView('notices')} icon={<IconNotice className="w-5 h-5" />}>
                            시스템 공지사항
                        </NavLink>
                    )}
                     {isMaster && (
                        <NavLink isActive={currentView === 'permissions'} onClick={() => setCurrentView('permissions')} icon={<IconPermission className="w-5 h-5" />}>
                            운영자 권한 설정
                        </NavLink>
                    )}
                </nav>
                 <div className="mt-auto pt-6 border-t border-slate-900">
                    <button 
                        onClick={onLogout}
                        className="w-full px-4 py-3 text-xs font-bold bg-slate-950 hover:bg-slate-900 text-slate-300 hover:text-white rounded-2xl transition-all border border-slate-900 hover:border-slate-800 shadow-sm"
                    >
                        안전 로그아웃
                    </button>
                 </div>
            </aside>
            
            {/* Main Content */}
            <div className="flex-1 flex flex-col relative z-10">
                <header className="bg-slate-950/40 backdrop-blur-md border-b border-slate-900 p-5 flex items-center justify-between">
                     <span className="text-xs font-extrabold text-slate-500 uppercase tracking-widest">Platform Core Console v3.1</span>
                     <div>
                        <div className="flex items-center space-x-2 bg-slate-900/60 border border-slate-900 px-3 py-1.5 rounded-xl">
                            <span className="w-2 h-2 bg-sky-400 rounded-full animate-pulse" />
                            <span className="text-xs text-slate-300 font-bold">
                                <span className="text-slate-400">{currentUser.username}</span> ({getUserRoleLabel(currentUser)})
                            </span>
                        </div>
                     </div>
                </header>
                <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
};