import React, { useState, useEffect, useMemo } from 'react';
import { WORK_HISTORY_DATA, WorkHistory } from '../../user-app/data/workHistory';
import { UserProfile } from '../../user-app/components/UserInfoView';
import { Settlement } from '../data/settlementData';
import { SettlementModal } from './SettlementModal';

interface User {
    phone: string;
    name: string;
}

interface EnrichedWorkHistory extends WorkHistory {
    userName: string;
    settlement?: Settlement;
}

export const WageManagement: React.FC = () => {
    const MOCK_TODAY = '2024-08-05';
    const [workHistory, setWorkHistory] = useState<WorkHistory[]>([]);
    const [settlements, setSettlements] = useState<Settlement[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [userProfiles, setUserProfiles] = useState<Record<string, UserProfile>>({});

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedWorkItem, setSelectedWorkItem] = useState<EnrichedWorkHistory | null>(null);

    useEffect(() => {
        // Load data from localStorage on component mount
        const whRaw = localStorage.getItem('workHistory');
        setWorkHistory(whRaw ? JSON.parse(whRaw) : WORK_HISTORY_DATA);

        const settlementsRaw = localStorage.getItem('settlements');
        setSettlements(settlementsRaw ? JSON.parse(settlementsRaw) : []);
        
        const usersRaw = localStorage.getItem('registeredUsers');
        if (usersRaw) setUsers(JSON.parse(usersRaw));

        const profilesRaw = localStorage.getItem('userProfiles');
        if (profilesRaw) setUserProfiles(JSON.parse(profilesRaw));
        
    }, []);
    
    // Persist data to localStorage when it changes
    useEffect(() => {
        localStorage.setItem('workHistory', JSON.stringify(workHistory));
    }, [workHistory]);

    useEffect(() => {
        localStorage.setItem('settlements', JSON.stringify(settlements));
    }, [settlements]);


    const enrichedWorkHistory = useMemo((): EnrichedWorkHistory[] => {
        const targetWork = workHistory
            .filter(wh => wh.date === MOCK_TODAY && ['완료', '지급완료'].includes(wh.status))
            .sort((a,b) => a.siteName.localeCompare(b.siteName));

        return targetWork.map(wh => {
            const user = users.find(u => u.phone === wh.userId);
            const settlement = settlements.find(s => s.workHistoryId === wh.id);
            return {
                ...wh,
                userName: user?.name || '미등록',
                settlement,
            };
        });
    }, [workHistory, users, settlements]);

    const handleOpenModal = (item: EnrichedWorkHistory) => {
        setSelectedWorkItem(item);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedWorkItem(null);
    };

    const handleSettlementSubmit = (settlementData: Settlement) => {
        // Update or add settlement
        setSettlements(prev => {
            const existingIndex = prev.findIndex(s => s.workHistoryId === settlementData.workHistoryId);
            if (existingIndex > -1) {
                const updated = [...prev];
                updated[existingIndex] = settlementData;
                return updated;
            }
            return [...prev, settlementData];
        });

        // Update work history status
        setWorkHistory(prev => 
            prev.map(wh => wh.id === settlementData.workHistoryId ? { ...wh, status: '지급완료' } : wh)
        );
        
        handleCloseModal();
    };

    return (
        <div className="animate-fadeIn">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-100">임금 정산 관리</h2>
                <p className="text-slate-400 mt-1">
                    <span className="font-semibold text-amber-400">{MOCK_TODAY}</span> 기준, 정산이 필요한 인력 목록입니다.
                </p>
            </div>
            
             <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-400">
                        <thead className="text-xs text-slate-300 uppercase bg-slate-700/50">
                            <tr>
                                <th scope="col" className="px-6 py-3">근로자</th>
                                <th scope="col" className="px-6 py-3">현장명</th>
                                <th scope="col" className="px-6 py-3">기본 일급</th>
                                <th scope="col" className="px-6 py-3">실 지급액</th>
                                <th scope="col" className="px-6 py-3">정산 상태</th>
                                <th scope="col" className="px-6 py-3 text-center">관리</th>
                            </tr>
                        </thead>
                        <tbody>
                           {enrichedWorkHistory.length > 0 ? enrichedWorkHistory.map(item => (
                               <tr key={item.id} className="bg-slate-800/50 border-b border-slate-700 hover:bg-slate-800">
                                   <td className="px-6 py-4 font-medium text-slate-100">{item.userName}</td>
                                   <td className="px-6 py-4">{item.siteName}</td>
                                   <td className="px-6 py-4">{item.dailyRate.toLocaleString()}원</td>
                                   <td className="px-6 py-4 font-bold text-amber-400">
                                       {item.settlement ? `${item.settlement.netPay.toLocaleString()}원` : '-'}
                                   </td>
                                   <td className="px-6 py-4">
                                       <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                                           item.status === '지급완료' ? 'bg-blue-600 text-blue-100' : 'bg-green-600 text-green-100'
                                       }`}>
                                           {item.status === '지급완료' ? '정산 완료' : '정산 대기'}
                                       </span>
                                   </td>
                                   <td className="px-6 py-4 text-center">
                                       <button 
                                            onClick={() => handleOpenModal(item)} 
                                            className="font-medium text-sky-400 hover:underline"
                                        >
                                           {item.status === '지급완료' ? '내역 보기' : '정산하기'}
                                       </button>
                                   </td>
                               </tr>
                           )) : (
                               <tr>
                                   <td colSpan={6} className="text-center py-10">
                                       정산할 내역이 없습니다.
                                   </td>
                               </tr>
                           )}
                        </tbody>
                    </table>
                </div>
            </div>
            
            {isModalOpen && selectedWorkItem && (
                <SettlementModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onSubmit={handleSettlementSubmit}
                    workItem={selectedWorkItem}
                    userProfile={userProfiles[selectedWorkItem.userId] || null}
                    currentDate={MOCK_TODAY}
                />
            )}
        </div>
    );
};
