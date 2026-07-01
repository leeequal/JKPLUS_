import React, { useState, FormEvent, ChangeEvent, useEffect, useRef } from 'react';

interface LoginProps {
    onLogin: (phone: string, rememberMe: boolean) => void;
    title?: string;
    description?: string;
    isEmployer?: boolean;
}

export const Login: React.FC<LoginProps> = ({ 
    onLogin, 
    title = "근로자 로그인", 
    description = "비밀번호 입력 없이 휴대폰 번호로 신속히 로그인하세요.",
    isEmployer = false 
}) => {
    const [phone, setPhone] = useState('');
    const [error, setError] = useState('');
    const [rememberMe, setRememberMe] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const loginTimeoutRef = useRef<number | null>(null);

    useEffect(() => {
        return () => {
            if (loginTimeoutRef.current !== null) {
                window.clearTimeout(loginTimeoutRef.current);
            }
        };
    }, []);

    const formatPhone = (val: string): string => {
        const cleaned = val.replace(/\D/g, '');
        if (cleaned.length <= 3) return cleaned;
        if (cleaned.length <= 7) return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
        return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7, 11)}`;
    };

    const handlePhoneChange = (e: ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value;
        const cleaned = rawValue.replace(/\D/g, '');
        if(cleaned.length <= 11) {
            setPhone(formatPhone(cleaned));
        }
    };

    const handleLogin = () => {
        if (isLoading) return;
        setError('');
        const rawPhone = phone.replace(/\D/g, '');
        if (!/^\d{10,11}$/.test(rawPhone)) {
            setError('올바른 휴대폰 번호를 입력해주세요.');
            return;
        }
        setIsLoading(true);
        // Keep a short delay for UX while ensuring pending timer is cleaned up on unmount.
        if (loginTimeoutRef.current !== null) {
            window.clearTimeout(loginTimeoutRef.current);
        }
        loginTimeoutRef.current = window.setTimeout(() => {
            loginTimeoutRef.current = null;
            onLogin(rawPhone, rememberMe);
        }, 500);
    };
    
    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        handleLogin();
    }

    const focusRingClass = isEmployer 
        ? "focus:ring-indigo-500/20 focus:border-indigo-500" 
        : "focus:ring-amber-500/20 focus:border-amber-500";

    const commonInputClass = `w-full bg-white dark:bg-slate-900/80 border border-slate-250 dark:border-slate-800 rounded-2xl px-4 py-3.5 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 ${focusRingClass} transition disabled:bg-slate-100 dark:disabled:bg-slate-900/40 disabled:cursor-not-allowed text-base font-medium shadow-inner`;

    const themeGradient = isEmployer
        ? "from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 shadow-indigo-500/10 hover:shadow-indigo-500/20 border-indigo-500/10 focus:ring-indigo-500/20"
        : "from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 shadow-amber-500/10 hover:shadow-amber-500/20 border-amber-500/10 focus:ring-amber-500/20";

    const checkboxThemeClass = isEmployer ? "text-indigo-500 focus:ring-indigo-500/20" : "text-amber-500 focus:ring-amber-500/20";

    return (
        <section className="bg-white dark:bg-slate-900/40 backdrop-blur-md p-6 md:p-8 rounded-3xl shadow-md dark:shadow-2xl border border-slate-200 dark:border-slate-800/80 animate-fadeIn max-w-md mx-auto transition-colors duration-300">
            <div className="flex flex-col items-center mb-6">
                <div className={`w-12 h-12 ${isEmployer ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20' : 'bg-amber-500/10 text-amber-600 dark:text-amber-500 border-amber-500/20'} rounded-2xl flex items-center justify-center border mb-4`}>
                    {isEmployer ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5h1.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293h3.172a1 1 0 00.707-.293l2.414-2.414a1 1 0 01.707-.293H21" />
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 009 11.571V9a4 4 0 00-4-4V3m12 11c0 3.517 1.009 6.799 2.753 9.571m3.44-2.04l-.054-.09A13.916 13.916 0 0015 11.571V9a4 4 0 014-4V3M6 9h12" />
                        </svg>
                    )}
                </div>
                <h2 className="text-2xl font-black mb-1.5 text-center text-slate-900 dark:text-white tracking-tight">{title}</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm text-center font-medium leading-relaxed">{description}</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label htmlFor="phone" className="sr-only">휴대폰 번호</label>
                    <input
                        type="tel"
                        id="phone"
                        value={phone}
                        onChange={handlePhoneChange}
                        className={commonInputClass}
                        placeholder="휴대폰 번호 입력 (- 제외)"
                        autoComplete="tel"
                        required
                        aria-describedby="phone-error"
                    />
                </div>
                <div className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-900 transition-colors duration-300">
                    <div className="flex items-start">
                        <div className="flex items-center h-5">
                            <input
                                id="remember-me"
                                name="remember-me"
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className={`h-4.5 w-4.5 rounded-lg border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 ${checkboxThemeClass} focus:ring-offset-slate-50 dark:focus:ring-offset-slate-900 focus:ring-2`}
                            />
                        </div>
                        <label htmlFor="remember-me" className="ml-2.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                            로그인 상태 유지
                        </label>
                    </div>
                    <p className="mt-1.5 text-[10px] text-slate-400 dark:text-slate-500 leading-normal pl-7">
                        다음 방문 시 인증 절차 없이 즉시 메인 페이지로 진입할 수 있도록 쿠키에 안전하게 기억합니다.
                    </p>
                </div>
                
                <button
                    type="submit"
                    className={`w-full px-6 py-4 font-extrabold bg-gradient-to-r ${themeGradient} text-white rounded-2xl transition-all disabled:from-slate-200 disabled:to-slate-200 dark:disabled:from-slate-800 dark:disabled:to-slate-800 disabled:text-slate-400 dark:disabled:text-slate-500 disabled:border-transparent disabled:shadow-none flex items-center justify-center text-sm border`}
                    disabled={!/^\d{10,11}$/.test(phone.replace(/\D/g, '')) || isLoading}
                >
                    {isLoading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-2.5 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                               <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                               <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>안전하게 진입 중...</span>
                         </>
                    ) : (
                        '로그인 및 간편 가입'
                    )}
                </button>
            </form>

            <div className="mt-4 p-3 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-2xl border border-indigo-100 dark:border-indigo-900/30 text-center">
                <p className="text-[11px] font-semibold text-indigo-700 dark:text-indigo-400 leading-relaxed">
                    💡 최초 회원가입 안내: 아직 등록되지 않은 휴대폰 번호로 로그인을 진행하시면, 본인 인증(OTP) 후 자동으로 가입 폼으로 이동하여 즉시 구인 회원 등록을 완료하실 수 있습니다.
                </p>
            </div>

            {error && <p id="phone-error" className="mt-4 text-center text-red-500 dark:text-red-400 text-xs font-bold bg-red-500/10 border border-red-500/20 py-2.5 rounded-xl">{error}</p>}
        </section>
    );
};