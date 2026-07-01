import React, { useState, useEffect, useRef } from 'react';
import { Site } from '../data/sites';
import { SiteMap } from './SiteMap';

interface SiteDetailProps {
  site: Site;
  onBack: () => void;
  appliedSiteId: string | null;
  onApply: (siteId: string) => void;
  currentUser: { phone: string; name: string | null } | null;
}

const InfoMessage: React.FC<{ icon: React.ReactNode; text: string; subtext?: string; type: 'success' | 'warning' | 'info' }> = ({ icon, text, subtext, type }) => {
  const baseClasses = "px-6 py-4 font-semibold rounded-md flex items-center justify-center gap-3 text-center";
  const typeClasses = {
    success: "bg-green-50 dark:bg-green-900/50 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-700",
    warning: "bg-yellow-50 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-700",
    info: "bg-sky-50 dark:bg-sky-900/50 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-700",
  };

  return (
    <div className={`${baseClasses} ${typeClasses[type]}`}>
      {icon}
      <div>
        <span>{text}</span>
        {subtext && <p className="text-xs font-normal opacity-80 mt-1">{subtext}</p>}
      </div>
    </div>
  );
};

export const SiteDetail: React.FC<SiteDetailProps> = ({ site, onBack, appliedSiteId, onApply, currentUser }) => {
  const [isLoading, setIsLoading] = useState(false);
  const applyTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (applyTimeoutRef.current !== null) {
        window.clearTimeout(applyTimeoutRef.current);
      }
    };
  }, []);

  const handleApply = () => {
    if (isLoading) return;
    setIsLoading(true);
    // Simulate API call
    if (applyTimeoutRef.current !== null) {
      window.clearTimeout(applyTimeoutRef.current);
    }
    applyTimeoutRef.current = window.setTimeout(() => {
      applyTimeoutRef.current = null;
      onApply(site.id);
      setIsLoading(false);
    }, 1500);
  };

  const vacancyPercentage = (site.filledSlots / site.totalSlots) * 100;
  const remainingSlots = site.totalSlots - site.filledSlots;

  const hasAppliedToThisSite = appliedSiteId === site.id;
  const hasAppliedToAnotherSite = appliedSiteId !== null && appliedSiteId !== site.id;

  const isDesignatedOnly = site.designatedWorkerIds && site.designatedWorkerIds.length > 0;
  const isUserDesignated = !!(isDesignatedOnly && currentUser && site.designatedWorkerIds.includes(currentUser.phone));
  
  const canUserApply = !isDesignatedOnly || isUserDesignated;

  const renderApplicationArea = () => {
    if (hasAppliedToThisSite) {
      return (
        <InfoMessage
          type="success"
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          text="지원 완료! 관리자가 확인 후 확정드릴 예정입니다."
          subtext="반려가 되면 다른 현장 지원이 가능합니다."
        />
      );
    }
    if (hasAppliedToAnotherSite) {
        return (
            <InfoMessage
              type="warning"
              icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>}
              text="이미 다른 현장에 지원하셨습니다."
              subtext="한 현장의 지원 결과가 나오기 전까지는 다른 현장에 지원할 수 없습니다."
            />
        );
    }
    if (!canUserApply) {
        return (
            <InfoMessage
              type="info"
              icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6.364-6.364l-1.414-1.414a9 9 0 1015.556 0L18.364 9.186M12 18.75h.008v.008H12v-.008z" /></svg>}
              text="지정된 인원만 지원 가능한 현장입니다."
            />
        );
    }
    
    return (
      <button
        onClick={handleApply}
        disabled={isLoading}
        className="w-full md:w-auto px-10 py-4 font-semibold bg-amber-600 hover:bg-amber-500 text-white rounded-md transition transform hover:scale-105 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:text-slate-500 dark:disabled:text-slate-400 disabled:cursor-not-allowed flex items-center justify-center mx-auto"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            지원하는 중...
          </>
        ) : (
          '이 현장에 지원하기'
        )}
      </button>
    );
  };


  return (
    <div className="bg-white dark:bg-slate-800/50 p-6 md:p-8 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm dark:shadow-none animate-fadeIn transition-colors duration-300">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 transition mb-4"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        목록으로 돌아가기
      </button>

      <header className="mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100">{site.name}</h2>
        <a 
          href={site.mapUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 mt-2 hover:text-amber-600 dark:hover:text-amber-500 transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
          <span className="text-sm font-medium">{site.location}</span>
        </a>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg flex items-center gap-4 border border-slate-150 dark:border-transparent transition-colors duration-300">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-amber-600 dark:text-amber-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <div>
            <p className="text-slate-500 dark:text-slate-400 text-xs">일급</p>
            <p className="font-bold text-xl text-slate-900 dark:text-white">{site.dailyRate.toLocaleString()}원</p>
          </div>
        </div>
        <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg border border-slate-150 dark:border-transparent transition-colors duration-300">
          <div className="flex justify-between items-center mb-1 text-xs">
            <span className="text-slate-500 dark:text-slate-400">모집 현황</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{site.filledSlots} / {site.totalSlots}</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2">
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-full" style={{ width: `${vacancyPercentage}%` }}></div>
          </div>
          <p className="text-right text-xs mt-1.5 text-amber-600 dark:text-amber-300">{remainingSlots}자리 남음</p>
        </div>
        <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg flex items-center gap-4 border border-slate-150 dark:border-transparent transition-colors duration-300">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-amber-600 dark:text-amber-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <div>
            <p className="text-slate-500 dark:text-slate-400 text-xs">담당자</p>
            <p className="font-semibold text-lg text-slate-900 dark:text-white">{site.supervisor.name}</p>
          </div>
        </div>
      </div>
      
      <div className="space-y-6">
        <div>
          <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">업무 내용</h4>
          <p className="text-slate-600 dark:text-slate-400 text-sm whitespace-pre-line">{site.description}</p>
        </div>
        
        <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm dark:shadow-none transition-colors duration-300">
          <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-3">출근 확정 시 안내사항</h4>
          <dl className="space-y-3">
            <div>
              <dt className="flex items-center text-sm font-medium text-amber-600 dark:text-amber-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                현장 도착 시간
              </dt>
              <dd className="mt-1 ml-5 text-sm text-slate-700 dark:text-slate-300">{site.confirmationDetails.startTime}</dd>
            </div>
            <div>
              <dt className="flex items-center text-sm font-medium text-amber-600 dark:text-amber-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                도착 후 할 일
              </dt>
              <dd className="mt-1 ml-5 text-sm text-slate-700 dark:text-slate-300">
                <ul className="list-disc list-outside ml-4 space-y-1">
                  {site.confirmationDetails.onArrival.map((item, index) => <li key={index}>{item}</li>)}
                </ul>
              </dd>
            </div>
             <div>
              <dt className="flex items-center text-sm font-medium text-amber-600 dark:text-amber-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                비상 연락처
              </dt>
              <dd className="mt-1 ml-5 text-sm text-slate-700 dark:text-slate-300">{site.confirmationDetails.contactInfo}</dd>
            </div>
            {site.confirmationDetails.notes && (
               <div>
                <dt className="flex items-center text-sm font-medium text-amber-600 dark:text-amber-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  참고 사항
                </dt>
                <dd className="mt-1 ml-5 text-sm text-slate-700 dark:text-slate-300">{site.confirmationDetails.notes}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>
      
      <div className="mt-8 text-center">
        {renderApplicationArea()}
      </div>

      <div className="mt-8">
        <SiteMap site={site} />
      </div>
    </div>
  );
};