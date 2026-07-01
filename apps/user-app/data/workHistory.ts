import { SITES_DATA } from './sites';

export interface WorkHistory {
  id: string;
  userId: string;
  siteId: string;
  siteName: string;
  date: string; // YYYY-MM-DD
  dailyRate: number;
  status: '확정' | '출근' | '완료' | '지급완료';
}

// Mock data for user '01012345678' and the default user
const defaultUserPhone = '01011112222';
const newUserPhone = '01099998888';

export const WORK_HISTORY_DATA: WorkHistory[] = [
  // --- MOCK DATA FOR 2024-08-05 (for testing new workflow) ---
  {
    id: 'wh_011',
    userId: defaultUserPhone,
    siteId: 'site_001',
    siteName: SITES_DATA.find(s => s.id === 'site_001')?.name || '정보 없음',
    date: '2024-08-05',
    dailyRate: 180000,
    status: '출근', // 김테스트: 출근 상태
  },
  {
    id: 'wh_012',
    userId: newUserPhone, // 박성실
    siteId: 'site_001',
    siteName: SITES_DATA.find(s => s.id === 'site_001')?.name || '정보 없음',
    date: '2024-08-05',
    dailyRate: 180000,
    status: '확정', // 박성실: 출역 확정 상태
  },
  {
    id: 'wh_009',
    userId: defaultUserPhone,
    siteId: 'site_003',
    siteName: SITES_DATA.find(s => s.id === 'site_003')?.name || '정보 없음',
    date: '2024-08-05', // 김테스트: 다른 현장에서 근무 완료
    dailyRate: 160000,
    status: '완료',
  },
   {
    id: 'wh_013',
    userId: newUserPhone, // 박성실
    siteId: 'site_003',
    siteName: SITES_DATA.find(s => s.id === 'site_003')?.name || '정보 없음',
    date: '2024-08-05',
    dailyRate: 160000,
    status: '완료', // 박성실: 근무 완료, 정산 대기
  },
  // --- END OF MOCK DATA FOR 2024-08-05 ---

  {
    id: 'wh_001',
    userId: '01012345678',
    siteId: 'site_002',
    siteName: SITES_DATA.find(s => s.id === 'site_002')?.name || '정보 없음',
    date: '2024-07-15',
    dailyRate: 175000,
    status: '지급완료',
  },
  {
    id: 'wh_002',
    userId: '01012345678',
    siteId: 'site_002',
    siteName: SITES_DATA.find(s => s.id === 'site_002')?.name || '정보 없음',
    date: '2024-07-16',
    dailyRate: 175000,
    status: '지급완료',
  },
  {
    id: 'wh_003',
    userId: '01012345678',
    siteId: 'site_001',
    siteName: SITES_DATA.find(s => s.id === 'site_001')?.name || '정보 없음',
    date: '2024-07-22',
    dailyRate: 180000,
    status: '완료',
  },
    {
    id: 'wh_004',
    userId: '01012345678',
    siteId: 'site_001',
    siteName: SITES_DATA.find(s => s.id === 'site_001')?.name || '정보 없음',
    date: '2024-08-01',
    dailyRate: 180000,
    status: '완료',
  },
    {
    id: 'wh_005',
    userId: '01012345678',
    siteId: 'site_003',
    siteName: SITES_DATA.find(s => s.id === 'site_003')?.name || '정보 없음',
    date: '2024-08-06',
    dailyRate: 160000,
    status: '확정',
  },
  {
    id: 'wh_006',
    userId: defaultUserPhone,
    siteId: 'site_001',
    siteName: SITES_DATA.find(s => s.id === 'site_001')?.name || '정보 없음',
    date: '2024-07-29',
    dailyRate: 180000,
    status: '지급완료',
  },
   {
    id: 'wh_007',
    userId: defaultUserPhone,
    siteId: 'site_001',
    siteName: SITES_DATA.find(s => s.id === 'site_001')?.name || '정보 없음',
    date: '2024-07-30',
    dailyRate: 180000,
    status: '지급완료',
  },
  {
    id: 'wh_008',
    userId: defaultUserPhone,
    siteId: 'site_002',
    siteName: SITES_DATA.find(s => s.id === 'site_002')?.name || '정보 없음',
    date: '2024-07-25',
    dailyRate: 175000,
    status: '지급완료',
  },
  {
    id: 'wh_010',
    userId: defaultUserPhone,
    siteId: 'site_003',
    siteName: SITES_DATA.find(s => s.id === 'site_003')?.name || '정보 없음',
    date: '2024-08-20',
    dailyRate: 160000,
    status: '확정',
  },
];