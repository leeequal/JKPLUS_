import React, { useState, FormEvent, ChangeEvent } from 'react';

interface LoginProps {
    onLogin: (phone: string, rememberMe: boolean) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
    const [phone, setPhone] = useState('');
    const [error, setError] = useState('');
    const [rememberMe, setRememberMe] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    const handlePhoneChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, '');
        if(value.length <= 11) {
            setPhone(value);
        }
    };

    const handleLogin = () => {
        setError('');
        if (!/^\d{10,11}$/.test(phone)) {
            setError('올바른 휴대폰 번호를 입력해주세요.');
            return;
        }
        setIsLoading(true);
        // Add a short delay to make the loading state visible for better UX
        setTimeout(() => {
            onLogin(phone, rememberMe);
        }, 500);
    };
    
    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        handleLogin();
    }

    const commonInputClass = "w-full bg-slate-700/50 border border-slate-600 rounded-md px-3 py-3 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition disabled:bg-slate-800 disabled:cursor-not-allowed";

    return (
        <section className="bg-slate-800/50 p-6 md:p-8 rounded-xl shadow-2xl border border-slate-700 animate-fadeIn">
            <h2 className="text-2xl font-bold mb-2 text-center text-slate-100">로그인 / 회원가입</h2>
            <p className="text-slate-400 mb-6 text-center">비밀번호 없이 휴대폰 번호로 간편하게 시작하세요.</p>
            
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="phone" className="sr-only">휴대폰 번호</label>
                    <input
                        type="tel"
                        id="phone"
                        value={phone}
                        onChange={handlePhoneChange}
                        className={commonInputClass}
                        placeholder="'-' 없이 휴대폰 번호 입력"
                        autoComplete="tel"
                        required
                        aria-describedby="phone-error"
                    />
                </div>
                <div>
                    <div className="flex items-center">
                        <input
                            id="remember-me"
                            name="remember-me"
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="h-4 w-4 rounded border-slate-500 bg-slate-600 text-amber-500 focus:ring-amber-500"
                        />
                        <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-400">
                            로그인 상태 유지
                        </label>
                    </div>
                    <p className="mt-2 text-xs text-slate-500 px-1">
                        현재 사용 중인 브라우저에 로그인 정보가 저장됩니다. 앱을 다시 방문하실 때, 별도의 로그인 절차 없이 바로 접속할 수 있습니다.
                    </p>
                </div>
                <button
                    type="submit"
                    className="w-full px-6 py-3 font-semibold bg-amber-600 hover:bg-amber-500 text-white rounded-md transition disabled:bg-slate-700 flex items-center justify-center"
                    disabled={!/^\d{10,11}$/.test(phone) || isLoading}
                >
                    {isLoading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                               <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                               <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            로그인 중...
                         </>
                    ) : (
                        '로그인 / 가입하기'
                    )}
                </button>
            </form>

            {error && <p id="phone-error" className="mt-4 text-center text-red-400 text-sm">{error}</p>}
        </section>
    );
};