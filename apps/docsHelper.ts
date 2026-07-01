import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from 'firebase/auth';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/documents');
provider.addScope('https://www.googleapis.com/auth/drive.file');

let isSigningIn = false;
let cachedAccessToken: string | null = null;

export const initDocsAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Google Docs API 접근을 위한 Access Token을 획득하지 못했습니다.');
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google 로그인 오류:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getCachedToken = (): string | null => {
  return cachedAccessToken;
};

export const googleSignOut = async () => {
  await auth.signOut();
  cachedAccessToken = null;
};

/**
 * Google Docs API를 사용하여 상세 구현 설명서를 생성하고 내용을 입력합니다.
 */
export const createSpecificationDoc = async (accessToken: string, docTitle: string): Promise<string> => {
  // 1. Google Doc 생성
  const createResponse = await fetch('https://docs.googleapis.com/v1/documents', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: docTitle,
    }),
  });

  if (!createResponse.ok) {
    const errText = await createResponse.text();
    throw new Error(`문서 생성 실패: ${errText}`);
  }

  const doc = await createResponse.json();
  const documentId = doc.documentId;

  // 2. 입력할 문서 본문 작성
  const docContent = `건설 인력 매칭 플랫폼 상세 구현 설명서 및 워킹 플로우

본 문서는 현재까지 개발된 '건설 인력 매칭 플랫폼'의 3대 프로그램(근로자용 앱, 구인자용 앱, 관리자용 웹 시스템)의 구조, 주요 기능, 데이터 스키마 및 워킹 플로우를 상세하게 설명합니다. 이를 통해 오구현 사항을 점검하고, 향후 안드로이드/iOS 모바일 앱 출시 외주 진행 시 기획서 및 기술 명세서로 활용할 수 있도록 구성되었습니다.

--------------------------------------------------
1. 전체 아키텍처 및 로컬 데이터베이스 스키마
--------------------------------------------------

현재 플랫폼은 프론트엔드 환경에서 동작하는 단일 페이지 애플리케이션(SPA)으로, 영속성 데이터는 브라우저의 localStorage를 활용해 가상 데이터베이스 구조로 상호 연동됩니다.

[가상 데이터베이스(localStorage) 스키마 상세]

A. 근로자 목록 및 프로필 (Key: 'registeredUsers', 'userProfiles')
  - registeredUsers: 근로자 기본 회원 정보 (전화번호, 이름)
    * 예시: [{ phone: '01011112222', name: '김테스트' }]
  - userProfiles: 근로자 상세 프로필 데이터 (전화번호 기준 매핑)
    * 주민등록번호(rrn), 성별, 국적, 선호지역
    * 계좌정보 (은행, 계좌번호, 예금주, 서명 이미지, 통장사본 파일명)
    * 자격 증명 (신분증 파일명, 안전교육이수증 파일명, 프로필사진 파일명)
    * 가입일자 (registrationDate)

B. 구인자 목록 (Key: 'employers')
  - 구인자 가입 및 회사 기본 정보 (전화번호, 이름, 상호명/건설사명, 승인상태)
    * 예시: [{ phone: '01099998888', name: '박소장', companyName: '튼튼건설', isRegistered: true }]

C. 현장 등록 목록 (Key: 'employerSites')
  - 구인자가 등록하고 관리자 승인을 필요로 하는 현장 정보
    * 현장ID, 소유자전화번호(ownerId), 현장명, 주소(address), 담당자명(supervisorName), 연락처(supervisorPhone), 필요직종(jobType), 승인상태(status: 'pending' | 'approved' | 'rejected'), 등록일자

D. 일일 구인 요청 목록 (Key: 'jobRequests')
  - 승인된 현장에서 특정 날짜에 인력을 요청한 내역
    * 요청ID, 현장ID(siteId), 구인날짜(date), 필요인원(workerCount), 단가(dailyRate), 필요직종(jobType), 특이사항(notes), 상태(status: 'requested' | 'assigned'), 배정된근로자ID 배열(assignedWorkerIds)

E. 출역 및 근무 이력 목록 (Key: 'workHistory')
  - 근로자의 일일 출근, 확정, 근무완료, 노무비 정산 등의 라이프사이클을 추적하는 핵심 데이터
    * 이력ID, 근로자ID(userId), 현장ID(siteId), 현장명(siteName), 일자(date), 단가(dailyRate), 근무상태(status: '지원완료' | '확정' | '출근' | '완료' | '지급완료' 등)

--------------------------------------------------
2. 근로자용 앱 (Worker App - user-app) 워킹 플로우
--------------------------------------------------

근로자용 모바일 웹 앱은 건설 근로자가 가입하여 현장을 탐색하고, 구직 신청을 한 뒤, 당일 출석 체크와 급여 수령을 진행하는 사용자 지향적 인터페이스입니다.

A. 가입 및 정보 등록 단계 (로그인 / 마이페이지)
  - 1단계: 휴대폰 번호 입력 후 OTP 인증 진행 (테스트 환경에서는 고정 OTP '123456' 입력으로 통과).
  - 2단계: 신규 가입자인 경우 프로필 사진, 주민등록번호, 계좌 정보, 통장사본 이미지, 신분증 이미지, 건설업 기초안전보건교육 이수증 이미지를 업로드하고 비대면 서명을 진행하여 가입을 완료합니다.
  - 3단계: 프로필 정보(UserInfoView)에서 등록한 필수 서류, 은행 정보 및 서명 내역을 상시 확인 및 수정할 수 있습니다.

B. 현장 탐색 및 지원 단계 (현장 찾기 / 검색)
  - 1단계: 지도 뷰(SiteMap) 및 리스트 뷰(SiteList)를 통해 거주지 주변 또는 원하는 지역의 건설 현장 채용 정보를 탐색합니다.
  - 2단계: 현장의 일급(단가), 담당자 정보, 작업 내용, 안전 수칙을 확인합니다.
  - 3단계: '간편 지원하기' 버튼을 클릭하면, 'workHistory'에 해당 근로자의 상태가 '지원완료'로 기록되며 구직 신청이 완료됩니다.

C. 출퇴근 인증 및 근무 단계
  - 1단계: 관리자에 의해 매칭이 승인되면 상태가 '확정'으로 전환되고 알림이 표시됩니다.
  - 2단계: 당일 아침 현장에 도착하여 GPS 반경 인증 및 카메라 촬영을 통해 '출근 완료'를 서명과 함께 등록합니다. (workHistory 상태가 '출근'으로 변경됨).
  - 3단계: 하루 일과가 종료되면 퇴근 체크 및 당일 근무 이력 상태가 '완료'로 등록되어 정산 대기 상태가 됩니다.

D. 급여 확인 및 정산 단계
  - 1단계: 캘린더 화면(CalendarView)에서 월별 총 근무 일수, 지급 대기 금액, 지급 완료 금액을 한눈에 조회합니다.
  - 2단계: 상세 정산 내역 및 원천징수 세금공제 내역서, 전자 근로계약서 확인이 가능합니다.

--------------------------------------------------
3. 구인자용 앱 (Employer App - employer-app) 워킹 플로우
--------------------------------------------------

현장의 소장 및 건설사 채용 담당자를 위한 구인 전용 시스템으로, 현장을 개설하고 필요한 일용직 직종과 단가를 요청하며 배정된 근로자의 당일 출결을 검토하는 업무용 프로그램입니다.

A. 구인자 가입 및 현장 개설 단계
  - 1단계: 휴대폰 번호 인증을 통해 파트너 로그인 및 회원가입을 완료합니다. (상호명 및 명함 업로드 필수).
  - 2단계: '현장 등록' 버튼을 누르고 현장명, 상세 주소, 담당자명, 연락처, 주요 구인 직종을 입력하여 본사에 '승인 요청'을 넣습니다 (employerSites에 'pending' 상태로 생성).
  - 3단계: 본사 관리자의 심사를 거쳐 현장 상태가 '승인됨(approved)'으로 변경되면 실제 구인 광고를 게시할 자격이 주어집니다.

B. 인력 요청 및 매칭 단계
  - 1단계: 승인 완료된 나의 현장 카드를 클릭하여 구인 요청 페이지로 진입합니다.
  - 2단계: 작업 일자(날짜), 필요한 인원수, 지급할 일일 단가(원), 세부 직종(보통인부/조공/기공/타설 등) 및 전달 사항을 작성하고 '구인 요청하기'를 실행합니다.
  - 3단계: 관리자 시스템에서 배정된 근로자 리스트(이름, 나이, 연락처 및 프로필 서류 완비 여부)를 실시간으로 확인합니다.

C. 현장 출결 관리 단계 (현장 소장 관리 기능)
  - 1단계: 당일 현장에 출근하여 근로자가 모바일로 전송한 서명 및 사진을 대조하며 '출석 확정' 또는 '결근/무단이탈' 처리를 진행합니다.
  - 2단계: 출석 확정된 근로자의 출근 기록은 본사 관리자의 노무비 정산 큐로 즉시 전송됩니다.

--------------------------------------------------
4. 관리자 시스템 (Admin App - admin-app) 워킹 플로우
--------------------------------------------------

모든 구인/구직 데이터를 통제하고 매칭을 수동/자동 조율하며, 노무비 정산 및 노무 서류(근로계약서 등)를 일괄 검인하고 세무 신고 기초 자료를 생성하는 통합 관리 허브 웹입니다.

A. 현장 승인 및 로고 등록
  - 1단계: 구인자 앱에서 신청한 신규 현장 목록 중 '승인 대기(pending)' 상태를 필터링하여 검토합니다.
  - 2단계: 주소의 실제 존재 여부 및 건설사 신원을 확인한 후 '승인' 버튼을 누르고, 현장의 전경 이미지나 건설사 로고를 업로드하여 승인 프로세스를 완료합니다.

B. 일일 출역 조율 및 배정 (DailyWorkManagement)
  - 1단계: 당일 발생한 신규 구인 요청 목록을 실시간 모니터링합니다.
  - 2단계: 해당 지역 인근에 거주하거나, 동일한 직종 자격증(안전이수증 등)을 보유하여 구직을 신청한 근로자(user-app)를 검색합니다.
  - 3단계: '인력 배정하기'를 통해 해당 현장에 근로자를 매칭하면, 구인자와 근로자에게 상호 배정 완료 상태('확정')가 실시간 업데이트됩니다.

C. 회원 및 서류 검증 (MemberManagement)
  - 1단계: 가입한 근로자의 주민등록증, 계좌번호, 안전보건교육 이수증 등의 파일 이미지를 열람하여 누락되거나 위조된 서류가 없는지 검토합니다.
  - 2단계: 필수 서류 검증이 통과된 회원에게 '인력풀 참여 자격'을 부여하고 정식 승인합니다.

D. 급여 정산 및 지급 관리 (WageManagement)
  - 1단계: 출근 및 근무가 완료된(status: '완료') 일일 노무 내역을 수집합니다.
  - 2단계: 정산 모달을 통해 3.3% 사업소득세 공제액을 자동 계산하고 예금주 불일치 여부를 재확인합니다.
  - 3단계: '지급 완료' 승인을 처리하면 근로자 앱의 누적 정산 현황 및 세무 증빙자료에 자동 누계 적용되고, 노무비 정산서 및 영수증 출력이 가능해집니다.

--------------------------------------------------
5. 하이브리드 모바일 앱 (Android / iOS) 출시 외주 가이드 및 예상 예산
--------------------------------------------------

현재 개발된 3종의 동작 프로토타입을 바탕으로 크로스 플랫폼(Flutter, React Native) 모바일 앱으로 재개발하여 앱스토어에 최종 등록하기 위한 실무 외주 가이드라인입니다.

[개발 기술 스택 추천 및 비용 영향 요인]
1. 하이브리드 앱 프레임워크 선택: Flutter 또는 React Native
   - 현재 프론트엔드가 React/TypeScript 기반이므로, React Native를 사용 시 비즈니스 로직과 UI 컴포넌트 설계 사상을 그대로 재사용할 수 있어 개발 기간 단축 및 외주 단가 절감에 유리합니다.

2. 백엔드 서버 및 DB 설계 마이그레이션 (필수):
   - 현재의 브라우저 localStorage 기반 가상 데이터를 관계형 데이터베이스(PostgreSQL, MySQL) 또는 실시간 NoSQL 데이터베이스(Firebase Firestore)로 전환해야 합니다.
   - 실시간 배정 알림 및 당일 새벽 구인 매칭 속도가 중요한 비즈니스 특성상 'Firebase Firestore' 혹은 'Redis를 가미한 Spring Boot / Node.js 백엔드' 서버 개발이 적합합니다.

[외주 개발 예상 비용 산정표 (중소형 외주 에이전시 / 전문 개발 프리랜서 기준)]

A. UI/UX 디자인 고도화 및 리디자인 (모바일 최적화)
  - 화면 수: 약 20~25개 (근로자용 약 10개, 구인자용 약 8개, 관리자용 대시보드 및 공통 모달)
  - 기간: 약 3~4주
  - 예상 단가: 4,000,000원 ~ 6,500,000원

B. 백엔드 서버 인프라 구축 및 API 개발
  - 가입/인증(진짜 휴대폰 OTP 문자 연동), GPS 위치 기반 조회 API, 파일 업로드 스토리지(S3), 실시간 알림 푸시(FCM) 연동, 관리자 통합 웹 패널용 백오피스 API.
  - 기간: 약 5~7주
  - 예상 단가: 8,000,000원 ~ 14,000,000원

C. 모바일 앱 클라이언트 개발 (React Native / Flutter)
  - Android 및 iOS 네이티브 기능 구현 (카메라 연동 이수증 스캔, GPS 기반 반경 100m 내 출근 인증, 백그라운드 푸시 알림, 디바이스 내 서명 저장).
  - 기간: 약 6~8주
  - 예상 단가: 10,000,000원 ~ 18,000,000원

D. 테스트, 빌드 배포 및 구글/애플 앱스토어 등록 대행
  - 각 스토어 개발자 계정 설정, 심사 반려 대응(일용직 중개 플랫폼의 경우 스토어 심사 기준이 까다로우므로 전문 반려 대응 노하우 필요).
  - 기간: 약 2주
  - 예상 단가: 2,000,000원 ~ 3,500,000원

--------------------------------------------------
★ 최종 합계 외주 프리랜서/에이전시 외주 개발 비용 범위:
- 프리랜서 조합/소형 외주사 계약 시: 약 20,000,000원 ~ 28,000,000원
- 체계적인 중형 에이전시(PM, QA 검증 포함) 계약 시: 약 35,000,000원 ~ 50,000,000원

본 비용은 현재 작성된 3대 프로그램의 상세 프로토타입 소스 코드와 완벽한 명세가 선제공되므로, 순수 제로 베이스 기획 대비 기획 공수가 약 25% 이상 세이브되어 매우 실질적이고 보수적인 견적으로 도출된 금액입니다. 본 명세서를 외주 개발 시 RFP(제안요청서)로 제공할 경우 불필요한 기획 추가 비용과 커뮤니케이션 오해를 최소화할 수 있습니다.
`;

  // 3. Google Docs Update Requests API
  const updateResponse = await fetch(`https://docs.googleapis.com/v1/documents/${documentId}:batchUpdate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      requests: [
        {
          insertText: {
            text: docContent,
            location: {
              index: 1,
            },
          },
        },
      ],
    }),
  });

  if (!updateResponse.ok) {
    const errText = await updateResponse.text();
    throw new Error(`문서 내용 입력 실패: ${errText}`);
  }

  return documentId;
};
