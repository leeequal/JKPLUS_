import React from 'react';
import { UserProfile } from '../../user-app/components/UserInfoView';

interface MemberDetailProps {
    userProfile: UserProfile & { uniqueId?: string };
    onBack: () => void;
}

const InfoRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4">
        <dt className="text-sm font-medium text-slate-400">{label}</dt>
        <dd className="mt-1 text-sm text-slate-200 sm:mt-0 sm:col-span-2 break-words">{value || '-'}</dd>
    </div>
);

const DocumentPlaceholder: React.FC<{ label: string; fileName?: string }> = ({ label, fileName }) => (
    <div className="py-3">
        <p className="text-sm font-medium text-slate-300 mb-2">{label}</p>
        {fileName ? (
            <div className="flex items-center gap-3 bg-slate-700/50 p-3 rounded-md border border-slate-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                <div className="flex-grow">
                    <p className="text-sm text-green-400 font-semibold">{fileName}</p>
                    <p className="text-xs text-slate-400 mt-1">실제 이미지 파일은 연동된 스토리지에서 불러옵니다.</p>
                </div>
            </div>
        ) : (
             <div className="flex items-center gap-3 bg-slate-700/50 p-3 rounded-md border border-slate-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                <p className="text-sm text-slate-500">제출된 파일 없음</p>
             </div>
        )}
    </div>
);

const formatPhoneNumber = (phone: string | null | undefined): string => {
    if (!phone) return '-';
    const cleaned = ('' + phone).replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3,4})(\d{4})$/);
    if (match) {
        return [match[1], match[2], match[3]].join('-');
    }
    return phone;
};


export const MemberDetail: React.FC<MemberDetailProps> = ({ userProfile, onBack }) => {
    
  const getMaskedRrn = (rrn: string) => {
    if (rrn && rrn.includes('-')) {
        const parts = rrn.split('-');
        if(parts.length === 2 && parts[0].length === 6 && parts[1].length > 0) {
            return `${parts[0]}-${parts[1].charAt(0)}******`;
        }
    }
    return rrn;
  };

  const displayCountry = userProfile.country === '기타' ? userProfile.countryOther : userProfile.country;
  const displayVisaType = userProfile.visaType?.startsWith('기타') ? userProfile.visaTypeOther : userProfile.visaType;
  const nationalityDisplay = userProfile.nationality === 'korean'
    ? '내국인'
    : `외국인(${displayCountry || '정보 없음'})`;

    return (
      <div className="animate-fadeIn space-y-8">
            <div>
                <button 
                    onClick={onBack}
                    className="flex items-center gap-2 text-sm text-slate-400 hover:text-amber-400 transition mb-4"
                >
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                    회원 목록으로 돌아가기
                </button>
                <h2 className="text-2xl font-bold text-slate-100">{userProfile.name} 님 상세 정보</h2>
                <p className="text-slate-400 mt-1">등록된 회원의 전체 정보입니다.</p>
            </div>
            
            {/* Basic Info */}
            <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                <h3 className="text-lg font-semibold text-amber-400 border-b border-slate-600 pb-3 mb-3">기본 정보</h3>
                <dl className="divide-y divide-slate-700">
                {userProfile.uniqueId && <InfoRow label="고유번호" value={userProfile.uniqueId} />}
                <InfoRow label="이름" value={userProfile.name} />
                <InfoRow label="가입일" value={userProfile.registrationDate} />
                <InfoRow label="주민/외국인등록번호" value={getMaskedRrn(userProfile.rrn)} />
                <InfoRow label="성별" value={userProfile.gender === 'male' ? '남성' : '여성'} />
                <InfoRow label="국적" value={nationalityDisplay} />
                {userProfile.nationality === 'foreign' && (
                    <InfoRow label="비자 종류" value={displayVisaType} />
                )}
                </dl>
            </div>

            {/* Contact & Area */}
            <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                <h3 className="text-lg font-semibold text-amber-400 border-b border-slate-600 pb-3 mb-3">연락처 및 선호 지역</h3>
                <dl className="divide-y divide-slate-700">
                <InfoRow label="연락처" value={formatPhoneNumber(userProfile.phone)} />
                <InfoRow label="선호 근무 지역" value={
                    userProfile.preferredAreas.length > 0 
                        ? userProfile.preferredAreas.join(', ')
                        : '선택 안함'
                    } />
                </dl>
            </div>

            {/* Bank Account */}
            <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                <h3 className="text-lg font-semibold text-amber-400 border-b border-slate-600 pb-3 mb-3">급여 계좌 정보</h3>
                <dl className="divide-y divide-slate-700">
                <InfoRow label="금융 기관" value={userProfile.bank} />
                <InfoRow label="계좌번호" value={userProfile.accountNumber} />
                <InfoRow label="예금주명" value={userProfile.accountHolder} />
                </dl>
            </div>

            {/* Documents */}
            <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                <h3 className="text-lg font-semibold text-amber-400 border-b border-slate-600 pb-3 mb-3">제출 서류 및 서명</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                    <DocumentPlaceholder label="프로필 사진" fileName={userProfile.profilePictureFileName} />
                    <DocumentPlaceholder label={userProfile.nationality === 'korean' ? '신분증 사본' : '외국인등록증 사본'} fileName={userProfile.idCardFileName} />
                    <DocumentPlaceholder label="건설기초안전교육 이수증" fileName={userProfile.safetyCertFileName} />
                    <DocumentPlaceholder label="통장 사본" fileName={userProfile.bankAccountFileName} />
                </div>
                <div className="mt-4 pt-4 border-t border-slate-700">
                    <p className="text-sm font-medium text-slate-300 mb-2">개인정보 동의 서명</p>
                    {userProfile.signatureDataUrl ? (
                         <div className="p-2 inline-block bg-slate-700 rounded-md border border-slate-600">
                           <img src={userProfile.signatureDataUrl} alt="User Signature" className="w-48 h-auto" />
                         </div>
                    ) : (
                        <p className="text-sm text-slate-500">서명 데이터가 없습니다.</p>
                    )}
                </div>
            </div>
        </div>
    );
};
