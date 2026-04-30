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

    const commonInputClass = "w-full bg-slate-700/50 border border-slate-600 rounded-md px-3 py-3 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition";

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                 <div className="flex items-center justify-center space-x-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-tr from-sky-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                         <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 20.944a11.955 11.955 0 0118-8.618c0-3.37-1.343-6.425-3.544-8.618z" />
                       </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-slate-100">관리자 시스템</h1>
                  </div>

                <section className="bg-slate-800/50 p-8 rounded-xl shadow-2xl border border-slate-700">
                    <h2 className="text-xl font-bold mb-6 text-center text-slate-100">관리자 로그인</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-slate-300 mb-1">아이디</label>
                            <input
                                type="text"
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className={commonInputClass}
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-1">비밀번호</label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={commonInputClass}
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full px-6 py-3 font-semibold bg-amber-600 hover:bg-amber-500 text-white rounded-md transition disabled:bg-slate-700 flex items-center justify-center"
                            disabled={isLoading}
                        >
                           {isLoading ? '로그인 중...' : '로그인'}
                        </button>
                    </form>
                    {error && <p className="mt-4 text-center text-red-400 text-sm">{error}</p>}
                </section>
            </div>
        </div>
    );
};
