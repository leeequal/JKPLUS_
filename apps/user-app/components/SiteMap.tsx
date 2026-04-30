import React from 'react';
import { Site } from '../data/sites';

// --- Icon Components for each Map Service ---

const NaverMapIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22S19 14.25 19 9C19 5.13 15.87 2 12 2Z" fill="currentColor"/>
    <path d="M10.0571 13.5V7.88571H11.0429L13.1143 11.5857V7.88571H14.0143V13.5H13.0286L10.9571 9.59999V13.5H10.0571Z" fill="white"/>
  </svg>
);


const KakaoMapIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C13.74 22 15.37 21.55 16.8 20.75L22 22L20.75 16.8C21.55 15.37 22 13.74 22 12C22 6.48 17.52 2 12 2Z" />
  </svg>
);

const GoogleMapIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
  </svg>
);

const MapLink: React.FC<{ href: string; children: React.ReactNode; serviceName: string; colorClasses: string; }> = ({ href, children, serviceName, colorClasses }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={`${serviceName}에서 보기`}
    className={`flex flex-col items-center justify-center gap-2 p-3 w-20 h-20 bg-slate-800 rounded-lg transition-transform transform hover:scale-105 hover:bg-slate-700 ${colorClasses}`}
  >
    {children}
    <span className="text-xs font-semibold">{serviceName} 지도</span>
  </a>
);

export const SiteMap: React.FC<{ site: Site }> = ({ site }) => {
  const { name, location, coords } = site;
  const encodedLocation = encodeURIComponent(location);
  
  const naverMapUrl = `https://map.naver.com/p/search/${encodedLocation}`;
  const kakaoMapUrl = `https://map.kakao.com/link/search/${encodedLocation}`;
  const googleMapUrl = `https://www.google.com/maps/search/?api=1&query=${encodedLocation}`;

  const { lat, lng } = coords;
  const bboxDelta = 0.01; // Controls zoom level
  const bbox = `${lng - bboxDelta},${lat - bboxDelta},${lng + bboxDelta},${lat + bboxDelta}`;
  const iframeSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`;


  return (
    <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-200">지도 앱으로 길찾기</h3>
        <p className="text-sm text-slate-400">아이콘을 선택하여 선호하는 지도 앱으로 현장 위치를 확인하세요.</p>
      </div>

      <div className="flex justify-center sm:justify-start flex-wrap gap-3 mb-6">
        <MapLink href={naverMapUrl} serviceName="네이버" colorClasses="text-green-400 hover:text-green-300">
          <NaverMapIcon className="w-8 h-8"/>
        </MapLink>
        <MapLink href={kakaoMapUrl} serviceName="카카오" colorClasses="text-yellow-400 hover:text-yellow-300">
          <KakaoMapIcon className="w-8 h-8"/>
        </MapLink>
        <MapLink href={googleMapUrl} serviceName="구글" colorClasses="text-blue-400 hover:text-blue-300">
          <GoogleMapIcon className="w-8 h-8"/>
        </MapLink>
      </div>

      <div className="relative w-full h-64 md:h-80 rounded-lg overflow-hidden border border-slate-600">
        <iframe
          title={`Map of ${name}`}
          className="w-full h-full border-0"
          src={iframeSrc}
          loading="lazy"
          aria-label={`Map showing location of ${name}`}
        ></iframe>
      </div>
    </div>
  );
};