
import React from 'react';

// This interface should be kept in sync with the one in App.tsx
export interface UserProfile {
    name: string;
    rrn: string;
    gender: 'male' | 'female' | '';
    nationality: 'korean' | 'foreign';
    country?: string;
    countryOther?: string;
    visaType?: string;
    visaTypeOther?: string;
    phone: string;
    preferredAreas: string[];
    bank: string;
    accountNumber: string;
    accountHolder: string;
    signatureDataUrl: string;
    profilePictureFileName?: string;
    bankAccountFileName: string;
    idCardFileName: string;
    safetyCertFileName: string;
    registrationDate: string;
}

interface UserInfoViewProps {
  userProfile: UserProfile | null;
  onEdit: () => void;
}

const InfoRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4">
        <dt className="text-sm font-medium text-slate-400">{label}</dt>
        <dd className="mt-1 text-sm text-slate-200 sm:mt-0 sm:col-span-2">{value || '-'}</dd>
    </div>
);

const DocumentRow: React.FC<{ label: string; fileName?: string }> = ({ label, fileName }) => (
    <div className="py-3 flex justify-between items-center">
        <span className="text-sm font-medium text-slate-300">{label}</span>
        {fileName ? (
            <span className="text-sm text-green-400 font-semibold">✅ 제출 완료</span>
        ) : (
            <span className="text-sm text-slate-500">미제출</span>
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

const formatDateTime = (isoString?: string) => {
    if (!isoString) return '-';
    try {
        const date = new Date(isoString);
        // Check if date is valid
        if (isNaN(date.getTime())) return isoString; 
        
        return date.toLocaleString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    } catch {
        return isoString;
    }
};


export const UserInfoView: React.FC<UserInfoViewProps> = ({ userProfile, onEdit }) => {
  if (!userProfile) {
    return (
      <div className="text-center py-16 px-6 bg-slate-800/50 border-2 border-dashed border-slate-700 rounded-xl">
        <h3 className="text-lg font-medium text-slate-300">회원 정보를 불러올 수 없습니다.</h3>
        <p className="mt-1 text-sm text-slate-500">
          데이터가 없거나 불러오는 중 오류가 발생했습니다.
        </p>
      </div>
    );
  }

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
        <h2 className="text-2xl font-bold text-slate-100">회원 정보</h2>
        <p className="text-slate-400 mt-1">등록된 회원님의 정보를 확인하세요.</p>
      </div>
      
      {/* Basic Info */}
      <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
        <h3 className="text-lg font-semibold text-amber-400 border-b border-slate-600 pb-3 mb-3">기본 정보</h3>
        <dl className="divide-y divide-slate-700">
          <InfoRow label="이름" value={userProfile.name} />
          <InfoRow label="가입 일시" value={formatDateTime(userProfile.registrationDate)} />
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
        <h3 className="text-lg font-semibold text-amber-400 border-b border-slate-600 pb-3 mb-3">제출 서류</h3>
        <div className="divide-y divide-slate-700">
            <DocumentRow label="프로필 사진" fileName={userProfile.profilePictureFileName} />
            <DocumentRow label={userProfile.nationality === 'korean' ? '신분증 사본' : '외국인등록증 사본'} fileName={userProfile.idCardFileName} />
            <DocumentRow label="건설기초안전교육 이수증" fileName={userProfile.safetyCertFileName} />
            <DocumentRow label="통장 사본" fileName={userProfile.bankAccountFileName} />
        </div>
      </div>
      
      <div className="mt-8 text-right">
        <button
          onClick={onEdit}
          className="px-6 py-3 font-semibold bg-slate-600 hover:bg-slate-500 text-white rounded-md transition"
        >
          정보 수정
        </button>
      </div>
    </div>
  );
};
