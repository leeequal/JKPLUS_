
export interface Site {
  id: string;
  name: string;
  location: string;
  mapUrl: string;
  description: string;
  supervisor: {
    name: string;
    phone: string;
  };
  dailyRate: number;
  totalSlots: number;
  filledSlots: number;
  coords: {
    lat: number;
    lng: number;
  };
  confirmationDetails: {
    startTime: string;
    onArrival: string[];
    contactInfo: string;

    notes: string;
  };
  designatedWorkerIds?: string[];
  createdAt?: string; // Added field for registration timestamp
}

export const SITES_DATA: Site[] = [
  {
    id: 'site_001',
    name: '강남 파이낸스 센터 신축 공사',
    location: '서울 강남구 역삼동',
    mapUrl: 'https://map.naver.com/p/search/강남파이낸스센터',
    description: '철근 콘크리트 구조물 시공, 거푸집 설치 및 해체, 자재 정리 및 현장 청소. 경력자 우대.',
    supervisor: {
      name: '김철수 소장',
      phone: '010-1111-2222',
    },
    dailyRate: 180000,
    totalSlots: 10,
    filledSlots: 7,
    coords: { lat: 37.5088, lng: 127.0458 },
    confirmationDetails: {
      startTime: "오전 06:30까지 현장 도착",
      onArrival: [
        "안전 조끼와 안전모를 착용하고 현장 사무실로 방문하세요.",
        "담당자에게 연락하여 출근 확인 서명을 하세요.",
        "오늘의 작업 내용을 브리핑 받고 지정된 구역으로 이동합니다."
      ],
      contactInfo: "현장 관리팀: 02-1234-5678",
      notes: "개인 공구 지참 시 추가 수당 협의 가능. 점심 식사 제공됩니다."
    },
    createdAt: '2024-07-15T09:00:00.000Z'
  },
  {
    id: 'site_002',
    name: '판교 테크노밸리 데이터센터 증축',
    location: '경기 성남시 분당구 삼평동',
    mapUrl: 'https://map.naver.com/p/search/판교테크노밸리',
    description: '내부 마감 공사, 경량 벽체 설치, 전기 배선 보조. 꼼꼼하고 성실한 인력 모집.',
    supervisor: {
      name: '이영희 팀장',
      phone: '010-3333-4444',
    },
    dailyRate: 175000,
    totalSlots: 15,
    filledSlots: 5,
    coords: { lat: 37.4022, lng: 127.1055 },
    confirmationDetails: {
      startTime: "오전 07:00까지 현장 도착",
      onArrival: [
        "3번 게이트를 통해 출입하며, 방문자 등록을 먼저 해주세요.",
        "이영희 팀장에게 전화하여 도착 사실을 알리세요.",
        "TBM(Tool Box Meeting)에 참석하여 안전 수칙을 숙지합니다."
      ],
      contactInfo: "이영희 팀장: 010-3333-4444",
      notes: "실내 작업이므로 먼지 방지 마스크 착용이 필수입니다."
    },
    designatedWorkerIds: ['01012345678'],
    createdAt: '2024-07-20T14:30:00.000Z'
  },
  {
    id: 'site_003',
    name: '인천 국제공항 제3여객터미널 부지 정리',
    location: '인천 중구 운서동',
    mapUrl: 'https://map.naver.com/p/search/인천국제공항',
    description: '초급 가능. 현장 정리, 자재 운반, 신호수 역할. 안전 교육 이수 필수.',
    supervisor: {
      name: '박현준 반장',
      phone: '010-5555-6666',
    },
    dailyRate: 160000,
    totalSlots: 20,
    filledSlots: 18,
    coords: { lat: 37.4692, lng: 126.4533 },
    confirmationDetails: {
      startTime: "오전 06:00까지 공항철도 임시역 앞 집결",
      onArrival: [
        "박현준 반장을 찾아 인원 점검을 받으세요.",
        "셔틀버스를 타고 작업 현장으로 함께 이동합니다.",
        "작업 전 안전 장비 지급 및 착용 상태를 점검합니다."
      ],
      contactInfo: "박현준 반장: 010-5555-6666",
      notes: "기상 상황에 따라 작업이 취소될 수 있으니, 출발 전 연락 바랍니다."
    },
    createdAt: '2024-08-01T10:15:00.000Z'
  },
];
