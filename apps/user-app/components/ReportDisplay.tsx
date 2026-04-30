import React, { useState, useEffect } from 'react';
import { LoadingSpinner } from './icons/LoadingSpinner';
import { SubmissionData } from './KeywordInput';

interface RegistrationStatusProps {
  submission: SubmissionData | null;
  isLoading: boolean;
  onProceed: () => void;
}

const calculateAge = (rrn: string): number | null => {
    const cleanedRrn = rrn.replace(/\D/g, '');
    if (cleanedRrn.length < 7) return null;

    const yearStr = cleanedRrn.substring(0, 2);
    const monthStr = cleanedRrn.substring(2, 4);
    const dayStr = cleanedRrn.substring(4, 6);
    const genderDigit = cleanedRrn.charAt(6);

    let birthYear: number;
    if (['1', '2', '5', '6'].includes(genderDigit)) {
        birthYear = 1900 + parseInt(yearStr, 10);
    } else if (['3', '4', '7', '8'].includes(genderDigit)) {
        birthYear = 2000 + parseInt(yearStr, 10);
    } else {
        return null; // Invalid gender digit
    }

    const birthDate = new Date(birthYear, parseInt(monthStr, 10) - 1, parseInt(dayStr, 10));
    if (birthDate.getFullYear() !== birthYear || birthDate.getMonth() !== parseInt(monthStr, 10) - 1 || birthDate.getDate() !== parseInt(dayStr, 10)) {
        return null;
    }

    const today = new Date();
    if (birthDate > today) {
        return null;
    }
    
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
};

const getMaskedRrn = (rrn: string) => {
    if (rrn && rrn.includes('-')) {
        const parts = rrn.split('-');
        if(parts.length === 2 && parts[0].length === 6 && parts[1].length >= 1) {
            return `${parts[0]}-${parts[1].charAt(0)}******`;
        }
    }
    return rrn;
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


export const ReportDisplay: React.FC<RegistrationStatusProps> = ({ submission, isLoading, onProceed }) => {
  const [profilePicUrl, setProfilePicUrl] = useState<string | null>(null);

  useEffect(() => {
    let objectUrl: string | null = null;
    if (submission?.profilePictureFile) {
        objectUrl = URL.createObjectURL(submission.profilePictureFile);
        setProfilePicUrl(objectUrl);
    } else {
        setProfilePicUrl(null);
    }

    return () => {
        if (objectUrl) {
            URL.revokeObjectURL(objectUrl);
        }
    };
  }, [submission]);

  if (isLoading) {
    return <LoadingSpinner text="인력 정보를 등록하고 있습니다..." />;
  }

  if (submission) {
    const isHolderDifferent = submission.name !== submission.accountHolder;
    const age = calculateAge(submission.rrn);

    const displayCountry = submission.country === '기타' ? submission.countryOther : submission.country;
    const displayVisaType = submission.visaType?.startsWith('기타') ? submission.visaTypeOther : submission.visaType;
    const nationalityDisplay = submission.nationality === 'korean'
        ? '내국인'
        : `외국인(${displayCountry || '정보 없음'})`;

    return (
      <div className="bg-green-900/50 p-6 rounded-xl border border-green-700 text-green-200 animate-[fadeIn_0.5s]">
        <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-5 mb-5">
            {profilePicUrl ? (
              <img src={profilePicUrl} alt="Profile" className="w-24 h-24 rounded-full object-cover border-2 border-green-600 flex-shrink-0" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-slate-700 border-2 border-green-600 flex-shrink-0 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              </div>
            )}
            <div className="flex-1 text-center sm:text-left">
              <h3 className="text-xl font-bold">✅ 등록 완료</h3>
              <p className="mt-1">아래 정보 및 필수 서류로 인력이 성공적으로 시스템에 등록되었습니다.</p>
            </div>
        </div>
        <ul className="space-y-2 bg-slate-800/50 p-4 rounded-md">
          <li><strong>이름:</strong> {submission.name}</li>
          <li><strong>국적:</strong> {nationalityDisplay}</li>
          {submission.nationality === 'foreign' && (
            <>
              {displayVisaType && <li><strong>비자 종류:</strong> {displayVisaType}</li>}
            </>
          )}
          {age !== null && <li><strong>나이:</strong> 만 {age}세</li>}
          <li><strong>성별:</strong> {submission.gender === 'male' ? '남성' : '여성'}</li>
          <li><strong>주민등록번호:</strong> {getMaskedRrn(submission.rrn)}</li>
          <li><strong>연락처:</strong> {formatPhoneNumber(submission.phone)}</li>
          <li><strong>선호 지역:</strong> {submission.preferredAreas.join(', ')}</li>
          <li className="pt-2 border-t border-slate-700"><strong>금융 기관:</strong> {submission.bank}</li>
          <li><strong>계좌번호:</strong> {submission.accountNumber}</li>
          <li>
            <strong>예금주명:</strong> {submission.accountHolder}
            {isHolderDifferent && <span className="ml-2 text-xs bg-yellow-600 text-yellow-100 px-2 py-0.5 rounded-full">등록명과 다름</span>}
          </li>
          <li><strong>통장 사본:</strong> <span className="text-green-300 font-semibold">(제출 완료)</span> {submission.bankAccountFile.name}</li>
           <li className="pt-2 border-t border-slate-700"><strong>{submission.nationality === 'korean' ? '신분증' : '외국인등록증'}:</strong> <span className="text-green-300 font-semibold">(제출 완료)</span> {submission.idCardFile.name}</li>
           <li><strong>건설기초안전교육 이수증:</strong> <span className="text-green-300 font-semibold">(제출 완료)</span> {submission.safetyCertFile.name}</li>
           {submission.profilePictureFile && <li><strong>프로필 사진:</strong> <span className="text-green-300 font-semibold">(제출 완료)</span> {submission.profilePictureFile.name}</li>}
           <li className="pt-2 border-t border-slate-700"><strong>개인정보 이용 동의:</strong> <span className="text-green-300 font-semibold">(서명 완료)</span></li>
           {submission.signatureDataUrl && (
            <li>
              <strong>서명:</strong>
              <div className="mt-2 p-1 inline-block bg-slate-700 rounded-md border border-slate-600">
                <img src={submission.signatureDataUrl} alt="User Signature" className="w-40 h-auto" />
              </div>
            </li>
           )}
        </ul>
        <div className="mt-8 text-center">
            <button
                onClick={onProceed}
                className="px-8 py-3 font-semibold bg-amber-600 hover:bg-amber-500 text-white rounded-md transition transform hover:scale-105 flex items-center justify-center mx-auto animate-pulse-fast"
            >
                <span>현장 목록 보기</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </button>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center py-16 px-6 bg-slate-800/50 border-2 border-dashed border-slate-700 rounded-xl">
      <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <h3 className="mt-4 text-lg font-medium text-slate-300">등록 대기 중</h3>
      <p className="mt-1 text-sm text-slate-500">
        위 양식에 인력 정보를 입력하고 모든 인증 절차를 완료해주세요.
      </p>
    </div>
  );
};