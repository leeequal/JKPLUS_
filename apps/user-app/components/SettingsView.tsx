import React, { useState, useEffect } from 'react';

interface SettingsViewProps {
  theme: 'light' | 'dark' | 'system';
  onThemeChange: (theme: 'light' | 'dark' | 'system') => void;
  isEmployer?: boolean;
}

interface CompanyInfo {
  companyName: string;
  ceoName: string;
  businessNumber: string;
  address: string;
  phone: string;
}

const formatCompanyPhone = (val: string): string => {
  const cleaned = val.replace(/\D/g, '');
  if (cleaned.startsWith('02')) {
    if (cleaned.length <= 2) return cleaned;
    if (cleaned.length <= 5) return `${cleaned.slice(0, 2)}-${cleaned.slice(2)}`;
    if (cleaned.length <= 9) return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 5)}-${cleaned.slice(5)}`;
    return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 6)}-${cleaned.slice(6, 10)}`;
  } else {
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 6) return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
    if (cleaned.length <= 10) {
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7, 11)}`;
  }
};

export const SettingsView: React.FC<SettingsViewProps> = ({ theme, onThemeChange, isEmployer = false }) => {
  // Load company info from localStorage
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>(() => {
    const saved = localStorage.getItem(isEmployer ? 'employer_company_info' : 'worker_company_info');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // use default
      }
    }
    return {
      companyName: isEmployer ? '(주)한길이앤씨' : '',
      ceoName: isEmployer ? '김민우' : '',
      businessNumber: isEmployer ? '120-81-99881' : '',
      address: isEmployer ? '서울특별시 서초구 강남대로 343' : '',
      phone: isEmployer ? '02-555-0192' : '',
    };
  });

  const [isEditing, setIsEditing] = useState(false);
  const [tempInfo, setTempInfo] = useState<CompanyInfo>({ ...companyInfo });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [expandedSection, setExpandedSection] = useState<'terms' | 'privacy' | null>(null);

  const handleSaveCompany = (e: React.FormEvent) => {
    e.preventDefault();
    setCompanyInfo(tempInfo);
    localStorage.setItem(
      isEmployer ? 'employer_company_info' : 'worker_company_info',
      JSON.stringify(tempInfo)
    );
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const toggleSection = (section: 'terms' | 'privacy') => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto animate-fadeIn">
      {/* Settings Title */}
      <div className="flex items-center space-x-3 mb-2">
        <div className="p-2.5 bg-indigo-500/10 dark:bg-indigo-500/10 rounded-2xl text-indigo-500 border border-indigo-500/10">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 animate-spin-slow" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">시스템 설정</h2>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">환경 설정 및 어플리케이션 명세</p>
        </div>
      </div>

      {/* 1. Theme Configuration Cards */}
      <section className="bg-white dark:bg-slate-900/40 backdrop-blur-md p-6 rounded-3xl border border-slate-200 dark:border-slate-850 shadow-xl">
        <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight mb-4 flex items-center">
          <span className="w-1.5 h-4 bg-amber-500 rounded-full mr-2" />
          화면 모드 테마 설정
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-5 leading-relaxed">
          어플리케이션의 색상 테마를 어둡게, 밝게 또는 운영체제의 시스템 환경에 맞게 자동 조절할 수 있습니다.
        </p>

        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => onThemeChange('light')}
            className={`flex flex-col items-center justify-center p-4 rounded-2xl border text-xs font-bold transition-all ${
              theme === 'light'
                ? 'bg-amber-500/10 border-amber-500 text-amber-600 shadow-md shadow-amber-500/5'
                : 'bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-850 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-2 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
            </svg>
            <span>밝게 (Light)</span>
          </button>

          <button
            onClick={() => onThemeChange('dark')}
            className={`flex flex-col items-center justify-center p-4 rounded-2xl border text-xs font-bold transition-all ${
              theme === 'dark'
                ? 'bg-indigo-500/10 border-indigo-500 text-indigo-500 dark:text-indigo-400 shadow-md shadow-indigo-500/5'
                : 'bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-850 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-2 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
            <span>어둡게 (Dark)</span>
          </button>

          <button
            onClick={() => onThemeChange('system')}
            className={`flex flex-col items-center justify-center p-4 rounded-2xl border text-xs font-bold transition-all ${
              theme === 'system'
                ? 'bg-sky-500/10 border-sky-500 text-sky-600 dark:text-sky-400 shadow-md shadow-sky-500/5'
                : 'bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-850 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-2 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span>시스템 자동</span>
          </button>
        </div>
      </section>

      {/* 2. Company Information Input / Viewer Section */}
      {isEmployer && (
        <section className="bg-white dark:bg-slate-900/40 backdrop-blur-md p-6 rounded-3xl border border-slate-200 dark:border-slate-850 shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight flex items-center">
              <span className="w-1.5 h-4 bg-sky-500 rounded-full mr-2" />
              구인 회사 정보 등록
            </h3>
            {!isEditing && (
              <button
                onClick={() => {
                  setTempInfo({ ...companyInfo });
                  setIsEditing(true);
                }}
                className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 bg-sky-500/5 dark:bg-sky-500/10 px-3 py-1.5 rounded-xl border border-sky-500/10"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                <span>{companyInfo.companyName ? '정보 수정' : '신규 등록'}</span>
              </button>
            )}
          </div>

          {saveSuccess && (
            <div className="mb-4 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 py-2.5 px-4 rounded-xl flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>회사 정보가 성공적으로 반영되었습니다.</span>
            </div>
          )}

          {isEditing ? (
            <form onSubmit={handleSaveCompany} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">회사명 / 상호</label>
                  <input
                    type="text"
                    value={tempInfo.companyName}
                    onChange={(e) => setTempInfo({ ...tempInfo, companyName: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-850 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 dark:text-white"
                    placeholder="예: (주)한길토건"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">대표자명</label>
                  <input
                    type="text"
                    value={tempInfo.ceoName}
                    onChange={(e) => setTempInfo({ ...tempInfo, ceoName: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-850 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 dark:text-white"
                    placeholder="대표자 이름"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">사업자등록번호</label>
                  <input
                    type="text"
                    value={tempInfo.businessNumber}
                    onChange={(e) => setTempInfo({ ...tempInfo, businessNumber: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-850 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 dark:text-white"
                    placeholder="예: 120-00-00000"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">대표 전화번호</label>
                  <input
                    type="text"
                    value={formatCompanyPhone(tempInfo.phone)}
                    onChange={(e) => setTempInfo({ ...tempInfo, phone: formatCompanyPhone(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-850 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 dark:text-white"
                    placeholder="예: 02-1234-5678"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">회사 소재지 주소</label>
                <input
                  type="text"
                  value={tempInfo.address}
                  onChange={(e) => setTempInfo({ ...tempInfo, address: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-850 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 dark:text-white"
                  placeholder="전체 주소 입력"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-950/40 rounded-xl hover:bg-slate-200"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-extrabold text-white bg-sky-600 hover:bg-sky-500 rounded-xl"
                >
                  정보 저장
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-3.5">
              {companyInfo.companyName ? (
                <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-950/40 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-900 text-xs leading-relaxed">
                  <div className="space-y-1.5">
                    <p className="text-slate-400 font-bold">회사명 / 상호</p>
                    <p className="font-extrabold text-slate-800 dark:text-white text-sm">{companyInfo.companyName}</p>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-slate-400 font-bold">대표자</p>
                    <p className="font-extrabold text-slate-800 dark:text-white text-sm">{companyInfo.ceoName || '-'}</p>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-slate-400 font-bold">사업자 번호</p>
                    <p className="font-extrabold text-slate-800 dark:text-white text-sm">{companyInfo.businessNumber || '-'}</p>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-slate-400 font-bold">대표 번호</p>
                    <p className="font-extrabold text-slate-800 dark:text-white text-sm">{formatCompanyPhone(companyInfo.phone) || '-'}</p>
                  </div>
                  <div className="col-span-2 space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-900/60">
                    <p className="text-slate-400 font-bold">소재지 주소</p>
                    <p className="font-medium text-slate-800 dark:text-white leading-relaxed">{companyInfo.address || '-'}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 border border-dashed border-slate-300 dark:border-slate-850 rounded-2xl">
                  <p className="text-xs font-medium text-slate-500">등록된 회사 정보가 없습니다.</p>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="mt-2.5 text-xs font-bold text-sky-500 hover:underline"
                  >
                    회사 정보 입력하기 &rarr;
                  </button>
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {/* 3. Legal Agreements and Terms of Service */}
      <section className="bg-white dark:bg-slate-900/40 backdrop-blur-md p-6 rounded-3xl border border-slate-200 dark:border-slate-850 shadow-xl">
        <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight mb-4 flex items-center">
          <span className="w-1.5 h-4 bg-emerald-500 rounded-full mr-2" />
          개인정보 동의서 및 약관
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
          본 매칭 플랫폼 이용을 위한 기본 서비스 이용약관 및 개인정보 동의 조항을 상세하게 조회할 수 있습니다.
        </p>

        <div className="space-y-3">
          {/* Terms Accordion */}
          <div className="border border-slate-200 dark:border-slate-850 rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-950/20">
            <button
              onClick={() => toggleSection('terms')}
              className="w-full flex justify-between items-center px-4 py-3 text-xs font-bold text-slate-800 dark:text-slate-200"
            >
              <span>1. 서비스 이용약관 (Terms of Service)</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-4 w-4 transform transition-transform duration-300 ${expandedSection === 'terms' ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {expandedSection === 'terms' && (
              <div className="p-4 border-t border-slate-200 dark:border-slate-850 text-[11px] leading-relaxed text-slate-600 dark:text-slate-400 max-h-48 overflow-y-auto scrollbar-hide space-y-2">
                <p className="font-bold">제1조 (목적)</p>
                <p>본 약관은 건설매칭 어플리케이션(이하 "앱")이 제공하는 구인·구직 매칭 서비스와 노무 관리 기능의 이용 조건 및 절차에 관한 사항을 규정함을 목적으로 합니다.</p>
                <p className="font-bold">제2조 (회원의 책임)</p>
                <p>1. 모든 회원은 휴대폰 번호를 기반으로 본인 인증을 성실히 이행해야 합니다.</p>
                <p>2. 구직 회원은 본인의 실명, 주민등록번호, 근로에 필요한 자격증 정보 등을 정직하게 입력해야 하며, 허위 기재 시 즉각 탈퇴 처리될 수 있습니다.</p>
                <p className="font-bold">제3조 (근로계약 및 급여정산)</p>
                <p>1. 구인자가 현장에 인력을 최종 승인/배정하는 시점에 상호 간 전자식 간이 근로합의서가 성립되는 것에 동의합니다.</p>
                <p>2. 일일 출석 및 퇴근 인증은 신뢰할 수 있는 GPS 좌표 및 모바일 인증 절차에 따라 최종 기록되며, 이는 급여(노임) 정산의 공식 기준이 됩니다.</p>
              </div>
            )}
          </div>

          {/* Privacy Accordion */}
          <div className="border border-slate-200 dark:border-slate-850 rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-950/20">
            <button
              onClick={() => toggleSection('privacy')}
              className="w-full flex justify-between items-center px-4 py-3 text-xs font-bold text-slate-800 dark:text-slate-200"
            >
              <span>2. 개인정보 처리방침 및 동의 조항</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-4 w-4 transform transition-transform duration-300 ${expandedSection === 'privacy' ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {expandedSection === 'privacy' && (
              <div className="p-4 border-t border-slate-200 dark:border-slate-850 text-[11px] leading-relaxed text-slate-600 dark:text-slate-400 max-h-48 overflow-y-auto scrollbar-hide space-y-2">
                <p className="font-bold">개인정보 수집 및 이용 동의 (필수)</p>
                <p>수집 항목: 성명, 생년월일, 주민등록번호(일용직 세무 세액 신고 및 고용보험 취득신고용), 연락처, 계좌번호, 예금주명, 현장 근로이력, 위치정보(GPS 출퇴근 인증용).</p>
                <p>수집 목적: 건설 일용직 근로계약 체결, 세무 신고, 고용·산재 취득 신고, 실시간 GPS 기반 출역 점검, 자동 노무 일지 생성 및 임금 정산.</p>
                <p>보유 및 이용 기간: 근로계약법 등 법령에 따른 서류 보존 기한 준수 (근로계약 종료 후 3년).</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 4. App Specification / Version section */}
      <section className="bg-slate-50 dark:bg-slate-950/40 p-5 rounded-3xl border border-slate-200 dark:border-slate-900 flex justify-between items-center">
        <div>
          <p className="text-xs font-black text-slate-800 dark:text-white">어플리케이션 명세</p>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">Construction Labor Management Engine</p>
        </div>
        <div className="text-right">
          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-[10px] font-black bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/10">
            버전정보 v3.2.0 (최신형)
          </span>
        </div>
      </section>
    </div>
  );
};
