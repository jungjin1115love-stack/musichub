/**
 * Mock Search Results — AI 통합 검색 시뮬레이터
 *
 * 뮬·숨고·당근·크몽·워크넷·사람인·잡코리아의
 * 실제 게시글 형식을 모방한 사실적인 더미 데이터
 */

export type SearchPlatform =
  | "뮬"
  | "숨고"
  | "당근"
  | "크몽"
  | "워크넷"
  | "사람인"
  | "잡코리아";

export interface MockResult {
  id:         string;
  platform:   SearchPlatform;
  title:      string;
  summary:    string;
  date:       string;   // 상대 날짜: "방금 전" ~ "7일 전"
  url:        string;   // 클릭 시 이동할 플랫폼 검색 URL
  instrument: string;   // 관련 악기 태그
  region:     string;
  salary:     string;
}

// ── 플랫폼 스타일 메타 ──────────────────────────────────────

export const PLATFORM_META: Record<SearchPlatform, {
  emoji:     string;
  accent:    string;   // Tailwind bg
  text:      string;   // Tailwind text
  light:     string;   // Tailwind light bg
  border:    string;
}> = {
  뮬:    { emoji: "🔵", accent: "bg-blue-600",    text: "text-blue-600",    light: "bg-blue-50",    border: "border-blue-200" },
  숨고:  { emoji: "🔮", accent: "bg-purple-600",  text: "text-purple-600",  light: "bg-purple-50",  border: "border-purple-200" },
  당근:  { emoji: "🥕", accent: "bg-orange-500",  text: "text-orange-500",  light: "bg-orange-50",  border: "border-orange-200" },
  크몽:  { emoji: "💚", accent: "bg-emerald-600", text: "text-emerald-600", light: "bg-emerald-50", border: "border-emerald-200" },
  워크넷: { emoji: "🏛️", accent: "bg-teal-600",   text: "text-teal-600",    light: "bg-teal-50",    border: "border-teal-200" },
  사람인: { emoji: "💼", accent: "bg-red-600",    text: "text-red-600",     light: "bg-red-50",     border: "border-red-200" },
  잡코리아: { emoji: "🟡", accent: "bg-yellow-600", text: "text-yellow-700", light: "bg-yellow-50",  border: "border-yellow-300" },
};

// ── 더미 데이터 풀 (플랫폼·악기·지역 태그 포함) ───────────────

const POOL: MockResult[] = [
  // ── 뮬 ─────────────────────────────────────────────────────
  {
    id: "mule-1", platform: "뮬",
    title: "보컬 강사 급구 — 홍대 실용음악학원 (풀타임·즉시 출근)",
    summary: "경력 3년 이상, 입시·취미반 병행 가능하신 분. 급여 월 290만~330만. 인원 충원 시 조기 마감됩니다.",
    date: "1시간 전", url: "https://www.mule.co.kr/bbs/info/recruit?f=title&q=%EB%B3%B4%EC%BB%AC+%EA%B0%95%EC%82%AC",
    instrument: "보컬", region: "홍대", salary: "월 290만~330만",
  },
  {
    id: "mule-2", platform: "뮬",
    title: "드럼 전임 강사 모집 — 분당 소재 학원 (경력 무관)",
    summary: "드럼 전 레벨(입문~중급) 담당. 주 5일 근무. 방음 개인 연습실·악기 제공. 강남 출퇴근 가능.",
    date: "3시간 전", url: "https://www.mule.co.kr/bbs/info/recruit?f=title&q=%EB%93%9C%EB%9F%BC+%EA%B0%95%EC%82%AC",
    instrument: "드럼", region: "분당", salary: "월 250만~280만",
  },
  {
    id: "mule-3", platform: "뮬",
    title: "세션 기타리스트 구합니다 — 녹음 프로젝트 (단기)",
    summary: "팝·R&B 성향 앨범 세션. 5~6곡 분량. 스튜디오는 홍대 인근. 리드·리듬 파트 분리 녹음 예정.",
    date: "5시간 전", url: "https://www.mule.co.kr/bbs/info/recruit?f=title&q=%EA%B8%B0%ED%83%80+%EC%84%B8%EC%85%98",
    instrument: "기타", region: "홍대", salary: "세션비 협의",
  },
  {
    id: "mule-4", platform: "뮬",
    title: "피아노 강사 구인 — 서울 노원 음악학원",
    summary: "클래식·실용 병행 지도. 어린이~성인 전 레벨. 주 5일 파트타임 가능. 4년제 졸업 이상 우대.",
    date: "1일 전", url: "https://www.mule.co.kr/bbs/info/recruit?f=title&q=%ED%94%BC%EC%95%84%EB%85%B8+%EA%B0%95%EC%82%AC",
    instrument: "피아노", region: "노원", salary: "시급 3.5만~4만",
  },
  {
    id: "mule-5", platform: "뮬",
    title: "미디 작곡 강사 모집 — 강남 사운드 아카데미",
    summary: "Logic Pro / Ableton 능숙자 우대. 음원 발매 경험 필수. 성인 취미·입문반 위주. 주 3회 이상.",
    date: "2일 전", url: "https://www.mule.co.kr/bbs/info/recruit?f=title&q=%EC%9E%91%EA%B3%A1+%EA%B0%95%EC%82%AC",
    instrument: "작곡·미디", region: "강남", salary: "협의",
  },

  // ── 숨고 ────────────────────────────────────────────────────
  {
    id: "soomgo-1", platform: "숨고",
    title: "보컬 레슨 전문 트레이너 — K-POP · 뮤지컬 특화",
    summary: "리뷰 127개 ⭐4.9. 온라인·오프라인 병행. 입시·오디션·취미 전 레벨. 첫 수업 할인 진행 중.",
    date: "방금 전", url: "https://soomgo.com/search/total?query=%EB%B3%B4%EC%BB%AC+%EB%A0%88%EC%8A%A8",
    instrument: "보컬", region: "전국", salary: "회당 5~7만",
  },
  {
    id: "soomgo-2", platform: "숨고",
    title: "어쿠스틱·일렉 기타 레슨 (입문~고급 전 레벨)",
    summary: "리뷰 89개 ⭐4.8. 핑거스타일·코드 스트러밍·재즈 보이싱. 악보 제공. 성수·건대 인근 스튜디오.",
    date: "2시간 전", url: "https://soomgo.com/search/total?query=%EA%B8%B0%ED%83%80+%EB%A0%88%EC%8A%A8",
    instrument: "기타", region: "성수", salary: "회당 4~6만",
  },
  {
    id: "soomgo-3", platform: "숨고",
    title: "피아노 1:1 레슨 — 바이엘부터 쇼팽까지",
    summary: "리뷰 212개 ⭐4.9. 클래식·재즈 피아노. 유아~성인 전문. 자택 방문 레슨 가능 (강남 일원).",
    date: "4시간 전", url: "https://soomgo.com/search/total?query=%ED%94%BC%EC%95%84%EB%85%B8+%EB%A0%88%EC%8A%A8",
    instrument: "피아노", region: "강남", salary: "회당 5만",
  },
  {
    id: "soomgo-4", platform: "숨고",
    title: "드럼 레슨 — 팝·록·재즈 장르별 그루브",
    summary: "리뷰 56개 ⭐4.7. 현직 세션 드러머. 입문~중급 전문. 개인 스튜디오 보유 (잠실·송파). 체험 1회 무료.",
    date: "6시간 전", url: "https://soomgo.com/search/total?query=%EB%93%9C%EB%9F%BC+%EB%A0%88%EC%8A%A8",
    instrument: "드럼", region: "잠실", salary: "회당 4.5만",
  },

  // ── 당근 ────────────────────────────────────────────────────
  {
    id: "daangn-1", platform: "당근",
    title: "보컬 레슨 합니다 — 홍대 인근, 합리적 가격",
    summary: "홍대입구역 도보 5분. 취미·입문 위주. 주 1회부터 OK. 팝·발라드·CCM 전 장르. 첫 수업 체험 가능.",
    date: "30분 전", url: "https://www.daangn.com/search/%EB%B3%B4%EC%BB%AC+%EB%A0%88%EC%8A%A8+%ED%99%8D%EB%8C%80",
    instrument: "보컬", region: "홍대", salary: "월 8만~12만",
  },
  {
    id: "daangn-2", platform: "당근",
    title: "기타 레슨 선생님 구합니다 — 초등학생 자녀용",
    summary: "강남구 거주. 자녀 기타 입문 레슨 선생님 찾아요. 주 1회 방문 가능하신 분. 협의 후 결정.",
    date: "1시간 전", url: "https://www.daangn.com/search/%EA%B8%B0%ED%83%80+%EB%A0%88%EC%8A%A8+%EA%B0%95%EB%82%A8",
    instrument: "기타", region: "강남", salary: "협의",
  },
  {
    id: "daangn-3", platform: "당근",
    title: "피아노 성인 입문 레슨 — 성수동 스튜디오",
    summary: "성수역 3분. 성인 취미 피아노 전문. 악보 읽기부터 시작. 플렉서블 스케줄 조정 가능. 선착순 2자리.",
    date: "3시간 전", url: "https://www.daangn.com/search/%ED%94%BC%EC%95%84%EB%85%B8+%EB%A0%88%EC%8A%A8+%EC%84%B1%EC%88%98",
    instrument: "피아노", region: "성수", salary: "월 10만",
  },
  {
    id: "daangn-4", platform: "당근",
    title: "드럼 강사 알바 구합니다 — 건대 인근 학원",
    summary: "건대입구역 7분. 주 2~3일 파트타임. 초·중급 어린이반 담당. 오후 3시~8시 시간대. 즉시 가능자 우대.",
    date: "5시간 전", url: "https://www.daangn.com/search/%EB%93%9C%EB%9F%BC+%EA%B0%95%EC%82%AC+%EA%B1%B4%EB%8C%80",
    instrument: "드럼", region: "건대", salary: "시급 2.5만",
  },

  // ── 크몽 ────────────────────────────────────────────────────
  {
    id: "kmong-1", platform: "크몽",
    title: "보컬 강습 — 원데이 집중 레슨 패키지 (3시간)",
    summary: "⭐4.9 / 주문 347건. 발성·음정·리듬 집중 교정. 녹음 전 단기 준비 레슨. 비대면 Zoom 가능.",
    date: "방금 전", url: "https://kmong.com/search?keyword=%EB%B3%B4%EC%BB%AC+%EA%B0%95%EC%8A%B5",
    instrument: "보컬", region: "전국", salary: "12만원/패키지",
  },
  {
    id: "kmong-2", platform: "크몽",
    title: "기타 강습 — 팝 코드 30곡 속성 마스터 (4주)",
    summary: "⭐4.8 / 주문 182건. 비기너를 위한 실전 코드 위주. 주 2회 × 4주 = 8회. 악보 PDF 제공.",
    date: "1시간 전", url: "https://kmong.com/search?keyword=%EA%B8%B0%ED%83%80+%EA%B0%95%EC%8A%B5",
    instrument: "기타", region: "전국", salary: "16만원/월",
  },
  {
    id: "kmong-3", platform: "크몽",
    title: "미디 작곡 강습 — FL Studio 완성곡 제작 과정",
    summary: "⭐4.7 / 주문 95건. 멜로디 라이팅·드럼 프로그래밍·믹싱까지. 1개월 내 완성곡 1곡 목표.",
    date: "2시간 전", url: "https://kmong.com/search?keyword=%EC%9E%91%EA%B3%A1+%EA%B0%95%EC%8A%B5",
    instrument: "작곡·미디", region: "전국", salary: "25만원/월",
  },

  // ── 워크넷 ──────────────────────────────────────────────────
  {
    id: "worknet-1", platform: "워크넷",
    title: "[고용24] 음악학원 드럼 강사 채용 — 서울 강북",
    summary: "주 5일 풀타임 근무. 4대보험 적용. 경력 1년 이상 우대. 수업 준비 지원금 별도 제공. 이력서 접수 중.",
    date: "1일 전", url: "https://www.work.go.kr/empInfo/empInfoSrch/list.do?srchKeyword=%EB%93%9C%EB%9F%BC+%EA%B0%95%EC%82%AC",
    instrument: "드럼", region: "서울", salary: "월 230만~260만",
  },
  {
    id: "worknet-2", platform: "워크넷",
    title: "[고용24] 드럼 레슨 강사 정규직 채용 (경기)",
    summary: "예술단체 소속. 4대보험·퇴직금 보장. 주 40시간 이내. 관련 전공 학사 학위 소지자. 서류 전형 → 면접.",
    date: "2일 전", url: "https://www.work.go.kr/empInfo/empInfoSrch/list.do?srchKeyword=%EB%93%9C%EB%9F%BC+%EB%A0%88%EC%8A%A8",
    instrument: "드럼", region: "경기", salary: "월 240만~270만",
  },

  // ── 사람인 ──────────────────────────────────────────────────
  {
    id: "saramin-1", platform: "사람인",
    title: "드럼 강사 채용 — 경기 수원 음악학원",
    summary: "수원 인계동 소재. 어린이~성인 드럼 레슨. 오후 근무 가능자. 경력 무관, 입사 후 커리큘럼 교육 제공. 면접 후 결정.",
    date: "3시간 전", url: "https://www.saramin.co.kr/zf_user/search/recruit?searchword=%EB%93%9C%EB%9F%BC+%EA%B0%95%EC%82%AC",
    instrument: "드럼", region: "수원", salary: "시급 2.8만~3만",
  },
  {
    id: "saramin-2", platform: "사람인",
    title: "재즈 드럼 강사 모집 — 대구 실용음악학원",
    summary: "드럼 전 레벨 담당. 재즈·팝 장르 선호. 주 4~5일 근무. 월 정급제. 신입 가능, 성실한 분 환영.",
    date: "1일 전", url: "https://www.saramin.co.kr/zf_user/search/recruit?searchword=%EB%93%9C%EB%9F%BC+%EB%A0%88%EC%8A%A8",
    instrument: "드럼", region: "대구", salary: "월 220만~250만",
  },

  // ── 잡코리아 ────────────────────────────────────────────────
  {
    id: "jobkorea-1", platform: "잡코리아",
    title: "드럼 강사 채용 — 대형 음악교육 그룹 (서울 강남)",
    summary: "대형 음악 교육 그룹 소속. 드럼 커리큘럼 개발 참여. 전 레벨 지도 가능자 우대. 계약직 후 정규직 전환.",
    date: "4시간 전", url: "https://www.jobkorea.co.kr/Search/?stext=%EB%93%9C%EB%9F%BC+%EA%B0%95%EC%82%AC",
    instrument: "드럼", region: "강남", salary: "월 260만~300만",
  },
  {
    id: "jobkorea-2", platform: "잡코리아",
    title: "드럼 강사 채용 — 전국 체인 음악학원 (부산·대구)",
    summary: "체인 학원 브랜드. 지역 내 직영점 배치. 경력 2년 이상 우대. 성과급·수업 수당 별도 지급. 복리후생 우수.",
    date: "2일 전", url: "https://www.jobkorea.co.kr/Search/?stext=%EB%93%9C%EB%9F%BC+%EB%A0%88%EC%8A%A8",
    instrument: "드럼", region: "부산", salary: "월 240만~280만",
  },
];

// ── 필터링 함수 ──────────────────────────────────────────────

export function getMockResults(
  instrument: string,
  region:     string,
  purpose:    string,
): MockResult[] {
  const inst = instrument === "전체" ? "" : instrument;
  const reg  = region     === "전체" ? "" : region;

  // 악기 매칭 (빈 문자열이면 전체 통과)
  const matchInst = (r: MockResult) =>
    !inst || r.instrument === inst || r.instrument === "전체";

  // 지역 매칭 (빈 문자열이면 전체 통과, 전국은 항상 통과)
  const matchReg = (r: MockResult) =>
    !reg || r.region === "전국" || r.region.includes(reg);

  // 목적 → 플랫폼 우선순위 필터
  const platformPriority = getPlatformPriority(purpose);

  const filtered = POOL.filter((r) => matchInst(r) && matchReg(r));

  // 조건에 맞는 결과가 없으면 악기만 매칭 (지역 완화)
  const base = filtered.length >= 4 ? filtered : POOL.filter(matchInst);

  // 플랫폼 우선순위 가중치 정렬 + 최대 20개
  return base
    .slice()
    .sort((a, b) => {
      const pA = platformPriority.indexOf(a.platform);
      const pB = platformPriority.indexOf(b.platform);
      const wA = pA === -1 ? 999 : pA;
      const wB = pB === -1 ? 999 : pB;
      return wA - wB;
    })
    .slice(0, 20);
}

function getPlatformPriority(purpose: string): SearchPlatform[] {
  if (purpose === "레슨 받기")  return ["숨고", "당근", "크몽", "뮬", "사람인", "워크넷", "잡코리아"];
  if (purpose === "강사 구인")  return ["뮬", "사람인", "잡코리아", "워크넷", "당근", "숨고", "크몽"];
  if (purpose === "강사 구직")  return ["뮬", "사람인", "잡코리아", "워크넷", "당근", "숨고", "크몽"];
  return ["뮬", "숨고", "당근", "크몽", "사람인", "잡코리아", "워크넷"];
}

// ── 외부 플랫폼 점프 URL (워크넷·사람인·잡코리아) ────────────

export function getExternalJobUrl(platform: "워크넷" | "사람인" | "잡코리아", keyword: string): string {
  // 키워드가 비어 있으면 드럼 강사를 기본 검색어로 사용
  const q = encodeURIComponent(keyword || "드럼 강사");
  if (platform === "워크넷")  return `https://www.work.go.kr/empInfo/empInfoSrch/list.do?srchKeyword=${q}`;
  if (platform === "사람인")  return `https://www.saramin.co.kr/zf_user/search/recruit?searchword=${q}`;
  return `https://www.jobkorea.co.kr/Search/?stext=${q}`;
}
