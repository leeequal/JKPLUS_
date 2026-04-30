
import React from 'react';

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
      return `${currentUser.name} 반장님 환영합니다.`;
    }
    return `${formatPhoneNumber(currentUser.phone)}님 환영합니다.`;
  };

  return (
    <header className="bg-slate-900/80 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-amber-500 to-orange-600 rounded-lg flex items-center justify-center shadow-md">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                 <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.125-1.273-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.125-1.273.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
               </svg>
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-slate-100">
                인력 관리 시스템
              </h1>
              {isAuthenticated && currentUser && (
                <p className="text-sm text-amber-400 mt-1">{getWelcomeMessage()}</p>
              )}
            </div>
          </div>
          {isAuthenticated && (
            <div className="flex items-center space-x-4">
              <button 
                onClick={onLogout}
                className="px-4 py-2 text-sm font-medium bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-md transition"
              >
                로그아웃
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
