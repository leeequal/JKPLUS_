import React, { useState, FormEvent, ChangeEvent, useEffect, useRef } from 'react';

interface AuthenticationProps {
    phone: string;
    onVerify: (rememberMe: boolean) => void;
    onBack: () => void;
    rememberMe: boolean;
}

const MOCK_OTP = '123456';

export const Authentication: React.FC<AuthenticationProps> = ({ phone, onVerify, onBack, rememberMe }) => {
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);
    
    const handleOtpChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, '');
        if(value.length <= 6) {
            setOtp(value);
            if (error) setError('');
        }
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        // Simulate API call
        setTimeout(() => {
            if (otp === MOCK_OTP) {
                onVerify(rememberMe);
            } else {
                setError('인증번호가 올바르지 않습니다. 다시 시도해주세요.');
                setIsLoading(false);
                setOtp('');
                inputRef.current?.focus();
            }
        }, 1000);
    };
    
    const cleanedPhone = phone.replace(/\D/g, '');
    const maskedPhone = cleanedPhone.replace(/(\d{3})(\d{3,4})(\d{4})/, (match, p1, p2, p3) => {
        return `${p1}-${'*'.repeat(p2.length)}-${p3}`;
    });

    const commonInputClass = "w-full bg-white dark:bg-slate-700/50 border border-slate-250 dark:border-slate-600 rounded-md px-3 py-3 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-500 disabled:cursor-not-allowed shadow-inner";

    return (
        <section className="bg-white dark:bg-slate-800/50 p-6 md:p-8 rounded-xl shadow-md dark:shadow-2xl border border-slate-200 dark:border-slate-700 animate-fadeIn transition-colors duration-300">
            <button onClick={onBack} className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 transition mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                번호 다시 입력
            </button>
            <h2 className="text-2xl font-bold mb-2 text-center text-slate-900 dark:text-slate-100">인증번호 입력</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6 text-center">
                <span className="font-semibold text-amber-600 dark:text-amber-400">{maskedPhone}</span>(으)로 전송된<br/>6자리 인증번호를 입력해주세요.
            </p>
            <p className="text-center text-xs text-slate-400 dark:text-slate-500 mb-4">(테스트용 인증번호는 <span className="font-bold text-slate-700 dark:text-slate-300">{MOCK_OTP}</span> 입니다)</p>
            
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="otp" className="sr-only">인증번호 6자리</label>
                    <input
                        ref={inputRef}
                        type="tel"
                        id="otp"
                        value={otp}
                        onChange={handleOtpChange}
                        className={`${commonInputClass} text-center text-lg tracking-[0.5em]`}
                        placeholder="_ _ _ _ _ _"
                        autoComplete="one-time-code"
                        required
                        aria-describedby="otp-error"
                        maxLength={6}
                    />
                </div>

                <button
                    type="submit"
                    className="w-full px-6 py-3 font-semibold bg-amber-600 hover:bg-amber-500 text-white rounded-md transition disabled:bg-slate-100 dark:disabled:bg-slate-700 disabled:text-slate-400 dark:disabled:text-slate-500 flex items-center justify-center"
                    disabled={otp.length !== 6 || isLoading}
                >
                    {isLoading ? (
                         <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                               <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                               <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            인증 중...
                         </>
                    ) : (
                        '인증하고 계속하기'
                    )}
                </button>
            </form>

            {error && <p id="otp-error" className="mt-4 text-center text-red-400 text-sm">{error}</p>}
        </section>
    );
};