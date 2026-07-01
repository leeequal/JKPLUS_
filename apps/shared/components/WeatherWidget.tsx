import React, { useEffect, useState } from 'react';

type WeatherTone = 'warm' | 'cool' | 'admin';

interface WeatherWidgetProps {
  tone?: WeatherTone;
}

interface DailyForecast {
  date: string;
  weatherCode: number;
  maxTemp: number;
  minTemp: number;
}

const WEATHER_CODE_LABEL: Record<number, string> = {
  0: '맑음',
  1: '대체로 맑음',
  2: '부분 흐림',
  3: '흐림',
  45: '안개',
  48: '짙은 안개',
  51: '이슬비',
  53: '약한 비',
  55: '강한 이슬비',
  61: '약한 비',
  63: '비',
  65: '강한 비',
  71: '약한 눈',
  73: '눈',
  75: '강한 눈',
  80: '약한 소나기',
  81: '소나기',
  82: '강한 소나기',
  95: '뇌우',
};

const getWeatherEmoji = (code: number) => {
  if (code === 0 || code === 1) return '☀️';
  if (code === 2 || code === 3) return '⛅';
  if (code === 45 || code === 48) return '🌫️';
  if ((code >= 51 && code <= 65) || (code >= 80 && code <= 82)) return '🌧️';
  if (code >= 71 && code <= 77) return '❄️';
  if (code >= 95) return '⛈️';
  return '🌤️';
};

const toneClassMap: Record<WeatherTone, string> = {
  warm: 'border-amber-200 dark:border-amber-900/60 bg-amber-50/80 dark:bg-amber-950/20 text-amber-700 dark:text-amber-300',
  cool: 'border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/80 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-300',
  admin: 'border-sky-900 bg-sky-950/30 text-sky-300',
};

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({ tone = 'warm' }) => {
  const [region, setRegion] = useState('내 위치');
  const [forecast, setForecast] = useState<DailyForecast[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('위치 기능 미지원');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const { latitude, longitude } = coords;

          const reverseRes = await fetch(
            `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${latitude}&longitude=${longitude}&language=ko&count=1`
          );
          if (reverseRes.ok) {
            const reverseJson = await reverseRes.json();
            const place = reverseJson?.results?.[0];
            if (place?.name) {
              setRegion(place.admin2 ? `${place.admin2} ${place.name}` : place.name);
            }
          }

          const weatherRes = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=weather_code,temperature_2m_max,temperature_2m_min&forecast_days=2&timezone=auto`
          );
          if (!weatherRes.ok) {
            throw new Error(`forecast status ${weatherRes.status}`);
          }

          const weatherJson = await weatherRes.json();
          const dates: string[] = weatherJson?.daily?.time ?? [];
          const codes: number[] = weatherJson?.daily?.weather_code ?? [];
          const maxTemps: number[] = weatherJson?.daily?.temperature_2m_max ?? [];
          const minTemps: number[] = weatherJson?.daily?.temperature_2m_min ?? [];

          const nextTwoDays: DailyForecast[] = dates.slice(0, 2).map((date, index) => ({
            date,
            weatherCode: codes[index],
            maxTemp: Math.round(maxTemps[index]),
            minTemp: Math.round(minTemps[index]),
          }));

          setForecast(nextTwoDays);
          setError(null);
        } catch (fetchError) {
          console.error('날씨 정보를 가져오지 못했습니다.', fetchError);
          setError('날씨 조회 실패');
        }
      },
      (geoError) => {
        console.error('위치 정보를 가져오지 못했습니다.', geoError);
        setError('위치 권한 필요');
      },
      { timeout: 10000, maximumAge: 10 * 60 * 1000 }
    );
  }, []);

  return (
    <div className={`rounded-xl border px-3 py-2 text-xs ${toneClassMap[tone]}`}>
      <p className="font-bold">{region} 날씨</p>
      {error && <p className="mt-0.5 opacity-90">{error}</p>}
      {!error && !forecast && <p className="mt-0.5 opacity-90">조회 중...</p>}
      {!!forecast && (
        <div className="mt-1 space-y-0.5">
          {forecast.map((item, index) => {
            const label = index === 0 ? '오늘' : '내일';
            const weatherLabel = WEATHER_CODE_LABEL[item.weatherCode] || '변동';
            return (
              <p key={item.date} className="whitespace-nowrap">
                {label} {getWeatherEmoji(item.weatherCode)} {weatherLabel} {item.minTemp}°/{item.maxTemp}°
              </p>
            );
          })}
        </div>
      )}
    </div>
  );
};
