import React from 'react';
import { Site } from '../data/sites';

interface SiteListProps {
  sites: Site[];
  onSelectSite: (site: Site) => void;
  appliedSiteId: string | null;
}

interface SiteCardProps {
  site: Site;
  onSelect: () => void;
  isLocked: boolean;
  isApplied: boolean;
}

const SiteCard: React.FC<SiteCardProps> = ({ site, onSelect, isLocked, isApplied }) => {
  const vacancyPercentage = (site.filledSlots / site.totalSlots) * 100;
  
  return (
    <article 
      onClick={onSelect}
      className={`relative bg-slate-800/50 p-5 rounded-xl border border-slate-700 transition-all duration-300 shadow-lg 
                  ${isLocked 
                      ? 'opacity-60 cursor-not-allowed' 
                      : 'hover:border-amber-500 hover:bg-slate-800 cursor-pointer group'}`}
    >
      {isApplied && (
        <div className="absolute top-4 right-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full z-10 animate-fadeIn">
          지원 완료
        </div>
      )}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
        <h3 className="text-lg font-bold text-slate-100 group-hover:text-amber-400 transition-colors">{site.name}</h3>
        <span className="text-sm font-semibold bg-slate-700 text-slate-300 px-3 py-1 rounded-full">{site.location}</span>
      </div>
      <p className="mt-3 text-slate-400 text-sm leading-relaxed">{site.description}</p>
      <div className="mt-4 pt-4 border-t border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <div>
              <p className="text-slate-400 text-xs">일급</p>
              <p className="font-bold text-lg text-white">{site.dailyRate.toLocaleString()}원</p>
            </div>
        </div>
        <div className="w-full sm:w-auto">
          <div className="flex justify-between items-center mb-1 text-sm">
            <span className="text-slate-400">모집 현황</span>
            <span className="font-semibold text-slate-200">{site.filledSlots} / {site.totalSlots} 명</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2.5">
            <div 
              className="bg-gradient-to-r from-amber-500 to-orange-500 h-2.5 rounded-full transition-all duration-500" 
              style={{ width: `${vacancyPercentage}%` }}>
            </div>
          </div>
        </div>
      </div>
       {isLocked && (
        <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-lg border-2 border-slate-500 px-4 py-2 rounded-md">지원 불가</span>
        </div>
      )}
    </article>
  );
};


export const SiteList: React.FC<SiteListProps> = ({ sites, onSelectSite, appliedSiteId }) => {
  return (
    <div className="animate-fadeIn">
      <h2 className="text-2xl md:text-3xl font-bold mb-2 text-slate-100">모집 중인 현장</h2>
      <p className="text-slate-400 mb-8">지원하고자 하는 현장을 선택하여 상세 정보를 확인하세요.</p>
      
      <div className="space-y-6">
        {sites.map(site => {
            const isLocked = appliedSiteId !== null && appliedSiteId !== site.id;
            const isApplied = appliedSiteId === site.id;
            return (
              <SiteCard 
                key={site.id} 
                site={site} 
                onSelect={() => !isLocked && onSelectSite(site)}
                isLocked={isLocked}
                isApplied={isApplied}
              />
            );
        })}
      </div>
    </div>
  );
};