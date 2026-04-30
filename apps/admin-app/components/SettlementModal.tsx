
import React, { useState, useEffect, useMemo } from 'react';
import { WorkHistory } from '../../user-app/data/workHistory';
import { UserProfile } from '../../user-app/components/UserInfoView';
import { Settlement } from '../data/settlementData';

interface SettlementModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (settlementData: Settlement) => void;
    workItem: WorkHistory & { userName: string; settlement?: Settlement; };
    userProfile: UserProfile | null;
    currentDate: string;
}

const initialDeductions = { incomeTax: 0, localIncomeTax: 0, employmentInsurance: 0, serviceFee: 0, other: 0 };

export const SettlementModal: React.FC<SettlementModalProps> = ({ isOpen, onClose, onSubmit, workItem, userProfile, currentDate }) => {
    const [additionalPay, setAdditionalPay] = useState(workItem.settlement?.additionalPay || 0);
    const [deductions, setDeductions] = useState(workItem.settlement?.deductions || initialDeductions);
    const [memo, setMemo] = useState(workItem.settlement?.memo || '');
    
    const isReadOnly = workItem.status === '지급완료';

    const { totalPay, totalDeductions, netPay } = useMemo(() => {
        const totalPay = workItem.dailyRate + additionalPay;
        const totalDeductions = (Object.values(deductions) as number[]).reduce((sum, val) => sum + val, 0);
        const netPay = totalPay - totalDeductions;
        return { totalPay, totalDeductions, netPay };
    }, [workItem.dailyRate, additionalPay, deductions]);

    useEffect(() => {
        // Automatically calculate service fee as 10% of gross pay when the modal opens for a new/pending settlement.
        if (!isReadOnly) {
            const calculatedServiceFee = Math.floor(workItem.dailyRate * 0.1);
            setDeductions(prev => ({ ...prev, serviceFee: calculatedServiceFee }));
        }
    }, [workItem.dailyRate, isReadOnly]);
    
    // Auto-calculate taxes based on total pay
    const handleAutoCalculateTaxes = () => {
        const incomeTax = Math.floor((totalPay * 0.03) / 10) * 10; // 3%
        const localIncomeTax = Math.floor((incomeTax * 0.1) / 10) * 10; // 10% of income tax
        setDeductions(prev => ({ ...prev, incomeTax, localIncomeTax }));
    };

    const handleDeductionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setDeductions(prev => ({ ...prev, [name]: Number(value) || 0 }));
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const settlementData: Settlement = {
            workHistoryId: workItem.id,
            grossPay: workItem.dailyRate,
            additionalPay,
            totalPay,
            deductions,
            totalDeductions,
            netPay,
            settlementDate: currentDate,
            memo,
        };
        onSubmit(settlementData);
    };

    if (!isOpen) return null;
    
    const commonInputClass = "w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-amber-500 transition disabled:bg-slate-800 disabled:cursor-not-allowed";
    const readOnlyInputClass = `${commonInputClass} bg-slate-800 text-slate-400`;
    
    const Row: React.FC<{ label: string; children: React.ReactNode; isTotal?: boolean }> = ({label, children, isTotal}) => (
        <div className={`flex items-center justify-between py-2 ${isTotal ? 'font-bold text-lg border-t border-slate-600 pt-3' : 'text-sm'}`}>
            <span className={isTotal ? 'text-amber-400' : 'text-slate-400'}>{label}</span>
            <div>{children}</div>
        </div>
    );
    
    return (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-start pt-24 z-50 p-4 animate-fadeIn" onClick={onClose}>
            <div className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg border border-slate-700" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b border-slate-700">
                        <h3 className="text-lg font-semibold text-white">임금 정산 상세</h3>
                        <p className="text-sm text-slate-400">{workItem.userName} - {workItem.date}</p>
                    </div>
                    
                    <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                        <div className="bg-slate-900/50 p-4 rounded-lg">
                           <h4 className="text-base font-semibold text-slate-200 mb-2">기본 정보</h4>
                           <Row label="근로자명"><span>{workItem.userName}</span></Row>
                           <Row label="현장명"><span>{workItem.siteName}</span></Row>
                           <Row label="계좌정보"><span>{userProfile ? `${userProfile.bank} ${userProfile.accountNumber}`: '정보 없음'}</span></Row>
                        </div>
                        
                        <div className="bg-slate-900/50 p-4 rounded-lg">
                            <h4 className="text-base font-semibold text-slate-200 mb-2">지급 내역</h4>
                            <Row label="기본 일급"><span>{workItem.dailyRate.toLocaleString()}원</span></Row>
                             <Row label="추가 수당">
                                <input type="text" inputMode="numeric" value={additionalPay} onChange={e => setAdditionalPay(Number(e.target.value) || 0)} className={commonInputClass} style={{maxWidth: '120px'}} readOnly={isReadOnly}/>
                            </Row>
                            <Row label="총 지급액" isTotal>
                                <span className="text-white">{totalPay.toLocaleString()}원</span>
                            </Row>
                        </div>
                        
                        <div className="bg-slate-900/50 p-4 rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="text-base font-semibold text-slate-200">공제 내역</h4>
                                {!isReadOnly && <button type="button" onClick={handleAutoCalculateTaxes} className="text-xs bg-slate-600 px-2 py-1 rounded hover:bg-slate-500">3.3% 자동계산</button>}
                            </div>
                            <Row label="수수료 (10%)"><input type="text" inputMode="numeric" name="serviceFee" value={deductions.serviceFee} className={readOnlyInputClass} style={{maxWidth: '120px'}} readOnly/></Row>
                            <Row label="소득세 (3%)"><input type="text" inputMode="numeric" name="incomeTax" value={deductions.incomeTax} onChange={handleDeductionChange} className={commonInputClass} style={{maxWidth: '120px'}} readOnly={isReadOnly}/></Row>
                            <Row label="지방소득세 (0.3%)"><input type="text" inputMode="numeric" name="localIncomeTax" value={deductions.localIncomeTax} onChange={handleDeductionChange} className={commonInputClass} style={{maxWidth: '120px'}} readOnly={isReadOnly}/></Row>
                            <Row label="고용보험"><input type="text" inputMode="numeric" name="employmentInsurance" value={deductions.employmentInsurance} onChange={handleDeductionChange} className={commonInputClass} style={{maxWidth: '120px'}} readOnly={isReadOnly}/></Row>
                            <Row label="기타 공제"><input type="text" inputMode="numeric" name="other" value={deductions.other} onChange={handleDeductionChange} className={commonInputClass} style={{maxWidth: '120px'}} readOnly={isReadOnly}/></Row>
                            <Row label="공제 총액" isTotal>
                                <span className="text-red-400">{totalDeductions.toLocaleString()}원</span>
                            </Row>
                        </div>
                        
                        <div className="bg-slate-900/50 p-4 rounded-lg text-lg font-bold flex justify-between items-center">
                            <span className="text-slate-100">최종 실 지급액</span>
                            <span className="text-green-400 text-xl">{netPay.toLocaleString()}원</span>
                        </div>
                         <div>
                            <label htmlFor="memo" className="block text-sm font-medium text-slate-300 mb-1">메모</label>
                            <textarea id="memo" value={memo} onChange={e => setMemo(e.target.value)} className={commonInputClass} rows={2} placeholder="정산 관련 메모를 남겨주세요." readOnly={isReadOnly} />
                        </div>
                    </div>
                    
                    <div className="flex justify-end gap-3 p-4 bg-slate-800/50 rounded-b-xl border-t border-slate-700">
                        <button type="button" onClick={onClose} className="px-5 py-2 text-sm font-medium text-slate-300 bg-slate-600 hover:bg-slate-500 rounded-md">
                           {isReadOnly ? '닫기' : '취소'}
                        </button>
                        {!isReadOnly && 
                            <button type="submit" className="px-5 py-2 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-500 rounded-md">
                                정산 완료 및 저장
                            </button>
                        }
                    </div>
                </form>
            </div>
        </div>
    );
};
