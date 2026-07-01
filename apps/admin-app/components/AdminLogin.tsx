import React, { useState, FormEvent } from 'react';
import { AdminUser } from '../types';

interface AdminLoginProps {
    users: AdminUser[];
    onLogin: (user: AdminUser) => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ users, onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        
        setTimeout(() => {
            const foundUser = users.find(u => u.username === username && u.password === password);
            if (foundUser) {
                onLogin(foundUser);
            } else {
                setError('아이디 또는 비밀번호가 올바르지 않습니다.');
                setIsLoading(false);
            }
        }, 1000);
    };

    const commonInputClass = "w-full bg-slate-950/80 border border-slate-900 rounded-2xl px-4 py-3.5 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition shadow-inner text-base font-medium";

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 sm:p-6 font-sans relative overflow-hidden">
            {/* Background ambient glow */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-sky-500/5 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />

            <div className="w-full max-w-md relative z-10 animate-fadeIn">
                 <div className="flex flex-col items-center justify-center mb-8">
                    <div className="w-14 h-14 bg-gradient-to-tr from-sky-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-sky-500/10 border border-white/10 mb-4">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                         <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 20.944a11.955 11.955 0 0118-8.618c0-3.37-1.343-6.425-3.544-8.618z" />
                       </svg>
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-tight">통합 관리 시스템</h1>
                    <p className="text-slate-400 text-sm font-medium mt-1.5">플랫폼의 모든 비즈니스와 핵심 노무 제어 콘솔</p>
                  </div>

                <section className="bg-slate-900/40 backdrop-blur-md p-6 sm:p-8 rounded-3xl shadow-2xl border border-slate-800/80">
                    <h2 className="text-xl font-bold mb-6 text-white tracking-tight">관리자 계정 로그인</h2>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label htmlFor="username" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 pl-1">ID (아이디)</label>
                            <input
                                type="text"
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className={commonInputClass}
                                placeholder="아이디 입력"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 pl-1">PASSWORD (비밀번호)</label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={commonInputClass}
                                placeholder="비밀번호 입력"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full px-6 py-4 font-extrabold bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-500 hover:to-sky-400 text-white rounded-2xl transition-all shadow-lg shadow-sky-500/10 hover:shadow-sky-500/20 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 flex items-center justify-center text-sm border border-sky-500/10"
                            disabled={isLoading}
                        >
                           {isLoading ? (
                               <>
                                   <svg className="animate-spin -ml-1 mr-2.5 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                   </svg>
                                   <span>인증하는 중...</span>
                               </>
                           ) : '보안 로그인'}
                        </button>
                    </form>
                    {error && <p className="mt-4 text-center text-red-400 text-xs font-bold bg-red-500/10 border border-red-500/20 py-2.5 rounded-xl">{error}</p>}
                </section>
            </div>
        </div>
    );
};
