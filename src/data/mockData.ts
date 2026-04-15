export type Category = "전체" | "보컬" | "건반" | "기타" | "드럼" | "작곡";
export type Region = "전체" | "서울" | "경기" | "인천" | "부산" | "대구" | "기타지역";

export interface JobPost {
  id: string;
  title: string;
  academy: string;
  region: Region;
  category: Category;
  salary: string;
  urgent: boolean;
  verified: boolean;
  isNew: boolean;
  time: string;
}

export interface LessonPost {
  id: string;
  instructor: string;
  category: Category;
  region: Region;
  title: string;
  price: string;
  verified: boolean;
  isNew: boolean;
  time: string;
}

export interface AcademyPost {
  id: string;
  name: string;
  region: Region;
  category: Category;
  event: string;
  isNew: boolean;
  time: string;
}

export interface MarketPost {
  id: string;
  title: string;
  category: Category;
  region: Region;
  price: string;
  type: "악기" | "연습실" | "기타";
  time: string;
}

export const CATEGORIES: Category[] = ["전체", "보컬", "건반", "기타", "드럼", "작곡"];
export const REGIONS: Region[] = ["전체", "서울", "경기", "인천", "부산", "대구", "기타지역"];

export const mockJobs: JobPost[] = [
  { id: "j1", title: "보컬 강사 모집", academy: "소리나무 실용음악학원", region: "서울", category: "보컬", salary: "시급 4만", urgent: true, verified: true, isNew: true, time: "3분 전" },
  { id: "j2", title: "재즈피아노 파트타임 강사", academy: "블루노트 아카데미", region: "서울", category: "건반", salary: "월 250만", urgent: false, verified: true, isNew: false, time: "1시간 전" },
  { id: "j3", title: "드럼 강사 급구", academy: "비트팩토리", region: "경기", category: "드럼", salary: "시급 3.5만", urgent: true, verified: false, isNew: true, time: "15분 전" },
  { id: "j4", title: "기타 전임 강사", academy: "스트링아트 학원", region: "인천", category: "기타", salary: "월 300만", urgent: false, verified: true, isNew: false, time: "3시간 전" },
  { id: "j5", title: "작곡/미디 강사", academy: "사운드랩 아카데미", region: "부산", category: "작곡", salary: "협의", urgent: false, verified: false, isNew: true, time: "30분 전" },
  { id: "j6", title: "보컬 트레이너 풀타임", academy: "뮤직플러스", region: "대구", category: "보컬", salary: "월 280만", urgent: true, verified: true, isNew: false, time: "2시간 전" },
];

export const mockLessons: LessonPost[] = [
  { id: "l1", instructor: "김민수", category: "건반", region: "서울", title: "재즈피아노 1:1 레슨", price: "회당 8만", verified: true, isNew: false, time: "20분 전" },
  { id: "l2", instructor: "이수진", category: "보컬", region: "서울", title: "입시/취미 보컬 레슨", price: "회당 6만", verified: true, isNew: true, time: "5분 전" },
  { id: "l3", instructor: "박준영", category: "기타", region: "경기", title: "어쿠스틱/일렉 기타 레슨", price: "회당 5만", verified: false, isNew: true, time: "10분 전" },
  { id: "l4", instructor: "정하은", category: "작곡", region: "서울", title: "미디작곡 & 프로듀싱", price: "회당 7만", verified: true, isNew: false, time: "1시간 전" },
  { id: "l5", instructor: "최동욱", category: "드럼", region: "부산", title: "드럼 초급~고급 레슨", price: "회당 5만", verified: false, isNew: true, time: "45분 전" },
];

export const mockAcademies: AcademyPost[] = [
  { id: "a1", name: "소리나무 실용음악학원", region: "서울", category: "보컬", event: "🎉 신규 개원 기념 첫 달 50% 할인", isNew: true, time: "1시간 전" },
  { id: "a2", name: "블루노트 아카데미", region: "서울", category: "건반", event: "여름 특강 수강생 모집 중", isNew: false, time: "3시간 전" },
  { id: "a3", name: "비트팩토리", region: "경기", category: "드럼", event: "무료 체험 레슨 이벤트 진행", isNew: true, time: "30분 전" },
  { id: "a4", name: "뮤직플러스", region: "대구", category: "보컬", event: "입시반 조기등록 할인", isNew: false, time: "5시간 전" },
];

export const mockMarket: MarketPost[] = [
  { id: "m1", title: "야마하 C3 그랜드피아노 판매", category: "건반", region: "서울", price: "800만", type: "악기", time: "2시간 전" },
  { id: "m2", title: "강남역 연습실 시간대여", category: "전체", region: "서울", price: "시간당 1만", type: "연습실", time: "15분 전" },
  { id: "m3", title: "펜더 스트라토캐스터 중고", category: "기타", region: "경기", price: "120만", type: "악기", time: "40분 전" },
  { id: "m4", title: "롤랜드 전자드럼 TD-17", category: "드럼", region: "인천", price: "85만", type: "악기", time: "1시간 전" },
  { id: "m5", title: "홈레코딩 장비 세트", category: "작곡", region: "서울", price: "45만", type: "기타", time: "3시간 전" },
];
