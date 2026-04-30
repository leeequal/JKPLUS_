
import React, { useState, useEffect, useMemo } from 'react';
import { UserProfile } from '../../user-app/components/UserInfoView';

interface MemberManagementProps {
    onSelectUser: (userProfile: UserProfile) => void;
}

// Type for Employer Data
interface EmployerUser {
    phone: string;
    name: string;
    companyName: string;
    isRegistered: boolean;
}

const calculateAge = (rrn: string): number | null => {
    const cleanedRrn = rrn.replace(/\D/g, '');
    if (cleanedRrn.length < 7) return null;
    const yearStr = cleanedRrn.substring(0, 2);
    const genderDigit = cleanedRrn.charAt(6);
    let birthYear = (['1', '2', '5', '6'].includes(genderDigit)) ? 1900 + parseInt(yearStr, 10) : 2000 + parseInt(yearStr, 10);
    const today = new Date();
    let age = today.getFullYear() - birthYear;
    const m = today.getMonth() - new Date(birthYear, parseInt(cleanedRrn.substring(2, 4)) - 1, parseInt(cleanedRrn.substring(4, 6))).getMonth();
    if (m < 0 || (m === 0 && today.getDate() < parseInt(cleanedRrn.substring(4, 6)))) {
        age--;
    }
    return age;
};

const formatPhoneNumber = (phone: string | null | undefined): string => {
    if (!phone) return '-';
    const cleaned = ('' + phone).replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3,4})(\d{4})$/);
    if (match) {
        return [match[1], match[2], match[3]].join('-');
    }
    return phone;
};

const formatDateTime = (isoString?: string) => {
    if (!isoString) return '-';
    try {
        const date = new Date(isoString);
        if (isNaN(date.getTime())) return isoString;
        return date.toLocaleString('ko-KR', {
            year: '2-digit', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit', hour12: false
        });
    } catch {
        return isoString;
    }
};

export const MemberManagement: React.FC<MemberManagementProps> = ({ onSelectUser }) => {
    const [activeTab, setActiveTab] = useState<'workers' | 'employers'>('workers');
    const [userProfiles, setUserProfiles] = useState<Record<string, UserProfile>>({});
    const [employers, setEmployers] = useState<EmployerUser[]>([]);
    
    useEffect(() => {
        try {
            // Load Workers
            const profilesRaw = localStorage.getItem('userProfiles');
            setUserProfiles(profilesRaw ? JSON.parse(profilesRaw) : {});

            // Load Employers
            const employersRaw = localStorage.getItem('employers');
            setEmployers(employersRaw ? JSON.parse(employersRaw) : []);
        } catch (error) {
            console.error("Failed to parse data from localStorage", error);
        }
    }, []);

    const workerList = useMemo(() => {
        return (Object.values(userProfiles) as UserProfile[]).sort((a, b) => {
            const dateA = new Date(a.registrationDate || 0).getTime();
            const dateB = new Date(b.registrationDate || 0).getTime();
            return dateB - dateA;
        }).map((user, index) => ({
            ...user,
            age: calculateAge(user.rrn),
            uniqueId: `${user.registrationDate?.substring(2, 10).replace(/-/g, '') || '240101'}-${String(index + 1).padStart(4, '0')}`,
        }));
    }, [userProfiles]);

    const renderWorkersTable = () => (
        <table className="w-full text-sm text-left text-slate-400">
            <thead className="text-xs text-slate-300 uppercase bg-slate-700/50">
                <tr>
                    <th className="px-6 py-3">고유번호</th>
                    <th className="px-3 py-3">사진</th>
                    <th className="px-6 py-3">이름</th>
                    <th className="px-6 py-3">가입일시</th>
                    <th className="px-6 py-3">성별</th>
                    <th className="px-6 py-3">나이</th>
                    <th className="px-6 py-3">연락처</th>
                    <th className="px-6 py-3">국적</th>
                </tr>
            </thead>
            <tbody>
                {workerList.length > 0 ? workerList.map(user => (
                    <tr key={user.phone} className="bg-slate-800/50 border-b border-slate-700 hover:bg-slate-800 cursor-pointer transition-colors" onClick={() => onSelectUser(user)}>
                        <td className="px-6 py-4 font-medium text-slate-300">{user.uniqueId}</td>
                        <td className="px-3 py-2">
                            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-slate-500 overflow-hidden">
                                {user.profilePictureFileName ? (
                                    <span className="text-xs">IMG</span> 
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                )}
                            </div>
                        </td>
                        <td className="px-6 py-4 text-amber-400 font-semibold">{user.name}</td>
                        <td className="px-6 py-4 text-xs font-mono text-slate-300">{formatDateTime(user.registrationDate)}</td>
                        <td className="px-6 py-4">{user.gender === 'male' ? '남' : '여'}</td>
                        <td className="px-6 py-4">{user.age !== null ? `만 ${user.age}세` : '-'}</td>
                        <td className="px-6 py-4">{formatPhoneNumber(user.phone)}</td>
                        <td className="px-6 py-4">{user.nationality === 'korean' ? '내국인' : '외국인'}</td>
                    </tr>
                )) : (
                    <tr>
                        <td colSpan={8} className="text-center py-10 text-slate-500">등록된 근로자가 없습니다.</td>
                    </tr>
                )}
            </tbody>
        </table>
    );

    const renderEmployersTable = () => (
        <table className="w-full text-sm text-left text-slate-400">
            <thead className="text-xs text-slate-300 uppercase bg-slate-700/50">
                <tr>
                    <th className="px-6 py-3">상호명 (건설사)</th>
                    <th className="px-6 py-3">대표자/담당자</th>
                    <th className="px-6 py-3">연락처</th>
                    <th className="px-6 py-3">상태</th>
                    <th className="px-6 py-3 text-center">관리</th>
                </tr>
            </thead>
            <tbody>
                {employers.length > 0 ? employers.map((employer, idx) => (
                    <tr key={idx} className="bg-slate-800/50 border-b border-slate-700 hover:bg-slate-800">
                        <td className="px-6 py-4 font-bold text-slate-100">{employer.companyName}</td>
                        <td className="px-6 py-4">{employer.name}</td>
                        <td className="px-6 py-4">{formatPhoneNumber(employer.phone)}</td>
                        <td className="px-6 py-4">
                            <span className="bg-green-900 text-green-300 text-xs px-2 py-1 rounded">정상</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                            <button className="text-sky-400 hover:underline text-xs mr-3">수정</button>
                            <button className="text-red-400 hover:underline text-xs">삭제</button>
                        </td>
                    </tr>
                )) : (
                    <tr>
                        <td colSpan={5} className="text-center py-10 text-slate-500">등록된 구인자가 없습니다.</td>
                    </tr>
                )}
            </tbody>
        </table>
    );

    return (
        <div className="animate-fadeIn">
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-100">회원 관리</h2>
                    <p className="text-slate-400 mt-1">플랫폼에 가입한 근로자와 구인자 정보를 관리합니다.</p>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex space-x-1 bg-slate-800 p-1 rounded-lg w-fit mb-4">
                <button
                    onClick={() => setActiveTab('workers')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                        activeTab === 'workers' ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-white'
                    }`}
                >
                    근로자 (User)
                </button>
                <button
                    onClick={() => setActiveTab('employers')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                        activeTab === 'employers' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                    }`}
                >
                    구인자 (Employer)
                </button>
            </div>
            
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden min-h-[400px]">
                <div className="overflow-x-auto">
                    {activeTab === 'workers' ? renderWorkersTable() : renderEmployersTable()}
                </div>
            </div>
        </div>
    );
};
