
import React from 'react';
import { WeatherWidget } from '../../shared/components/WeatherWidget';

interface HeaderProps {
  isAuthenticated: boolean;
  currentUser: { phone: string; name: string | null } | null;
  onLogout: () => void;
}

const formatPhoneNumber = (phone: string) => {
    const cleaned = ('' + phone).replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3,4})(\d{4})$/);
    if (match) {
      return `${match[1]}-${match[2]}-${match[3]}`;
    }
    return phone;
};

export const Header: React.FC<HeaderProps> = ({ isAuthenticated, currentUser, onLogout }) => {
  const getWelcomeMessage = () => {
    if (!currentUser) return '';
    if (currentUser.name) {
      return `${currentUser.name} 반장님`;
    }
    return `${formatPhoneNumber(currentUser.phone)} 반장님`;
  };

  return (
    <header className="bg-white/80 dark:bg-slate-950/60 backdrop-blur-md border-b border-slate-200 dark:border-slate-900 sticky top-0 z-50 transition-colors duration-300">
      <div className="container mx-auto px-4 py-4 max-w-4xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 bg-gradient-to-tr from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/10 border border-white/10 shrink-0">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5.5 w-5.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                 <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.125-1.273-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.125-1.273.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
               </svg>
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-900 dark:text-white tracking-tight leading-none">
                근로자 스마트 앱
              </h1>
              {isAuthenticated && currentUser && (
                <div className="flex items-center space-x-1.5 mt-1.5">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  <p className="text-xs font-bold text-amber-600 dark:text-amber-400 leading-none">{getWelcomeMessage()} <span className="text-slate-500 dark:text-slate-400 font-normal">환영합니다</span></p>
                </div>
              )}
            </div>
          </div>
          {isAuthenticated && (
            <div className="flex items-center">
              <div className="hidden md:block mr-3">
                <WeatherWidget tone="warm" />
              </div>
              <button 
                onClick={onLogout}
                className="px-4 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-xl transition-all border border-slate-250 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm"
              >
                로그아웃
              </button>
            </div>
          )}
        </div>
        {isAuthenticated && (
          <div className="md:hidden mt-3">
            <WeatherWidget tone="warm" />
          </div>
        )}
      </div>
    </header>
  );
};
