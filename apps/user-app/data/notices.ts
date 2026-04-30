
export interface Notice {
  id: string;
  title: string;
  content: string;
  createdAt: string; // YYYY-MM-DD
  isPinned: boolean;
  authorName: string;
  target: 'user' | 'employer'; // Added target field
}

export const NOTICES_DATA: Notice[] = [
  {
    id: 'notice_001',
    title: '📢 중요: 8월 급여 지급일 안내',
    content: '안녕하세요. 관리자입니다.\n\n8월분 급여는 9월 10일(화)에 지급될 예정입니다. \n\n지급 계좌에 변동이 있으신 분들은 반드시 9월 5일까지 회원 정보 수정을 완료해주시기 바랍니다. \n\n감사합니다.',
    createdAt: '2024-08-05',
    isPinned: true,
    authorName: '마스터 관리자',
    target: 'user',
  },
  {
    id: 'notice_002',
    title: '개인정보 처리방침 변경 안내 (2024년 9월 1일 시행)',
    content: '2024년 9월 1일부터 개인정보 처리방침이 일부 변경됩니다.\n\n주요 변경 사항:\n- 제3자 정보 제공 업체 추가\n- 개인정보 보관 기간 정책 명확화\n\n자세한 내용은 앱 내 약관 메뉴를 확인해주시기 바랍니다.',
    createdAt: '2024-08-01',
    isPinned: false,
    authorName: '마스터 관리자',
    target: 'user',
  },
  {
    id: 'notice_003',
    title: '태풍 대비 현장 안전 수칙 강화 안내',
    content: '최근 북상 중인 태풍에 대비하여 각 현장의 안전 수칙이 강화되었습니다.\n\n모든 인력은 현장 관리자의 지시에 따라 안전 장비를 필히 착용하고, 위험 지역 접근을 삼가주시기 바랍니다.\n\n기상 상황에 따라 작업 일정이 변동될 수 있으며, 변동 시 즉시 문자로 안내해 드리겠습니다.',
    createdAt: '2024-07-28',
    isPinned: false,
    authorName: '안전관리팀',
    target: 'user',
  },
  // Employer Notices
  {
    id: 'notice_emp_001',
    title: '📢 [필독] 현장 등록 승인 기준 변경 안내',
    content: '구인자 파트너님 안녕하세요.\n\n보다 신뢰할 수 있는 현장 정보 제공을 위해 현장 등록 승인 기준이 강화되었습니다.\n\n1. 사업자등록증 필수 첨부\n2. 현장 상세 주소 및 담당자 연락처 검증 강화\n\n위 내용이 누락될 경우 승인이 지연되거나 반려될 수 있으니 유의 바랍니다.',
    createdAt: '2024-08-10',
    isPinned: true,
    authorName: '운영팀',
    target: 'employer',
  },
  {
    id: 'notice_emp_002',
    title: '8월 우수 파트너 선정 결과',
    content: '8월 한 달간 가장 활발하게 활동해주신 우수 파트너사가 선정되었습니다.\n\n선정되신 파트너사에게는 수수료 할인 혜택이 제공됩니다.\n\n자세한 내용은 파트너 포털에서 확인해주세요.',
    createdAt: '2024-08-05',
    isPinned: false,
    authorName: '마케팅팀',
    target: 'employer',
  }
];
