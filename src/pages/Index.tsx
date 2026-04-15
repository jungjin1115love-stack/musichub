import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Briefcase,
  Music,
  School,
  MessageCircle,
  MapPin,
  Clock,
  Star,
  ChevronRight,
  Search,
} from "lucide-react";

// ── Dummy Data ──────────────────────────────────────────────

const JOBS = [
  { id: 1, title: "보컬 강사 모집", academy: "소리나무 실용음악학원", region: "서울", salary: "시급 4만", urgent: true, time: "3분 전" },
  { id: 2, title: "재즈피아노 파트타임 강사", academy: "블루노트 아카데미", region: "서울", salary: "월 250만", urgent: false, time: "1시간 전" },
  { id: 3, title: "드럼 강사 급구", academy: "비트팩토리", region: "경기", salary: "시급 3.5만", urgent: true, time: "15분 전" },
  { id: 4, title: "기타 전임 강사", academy: "스트링아트 학원", region: "인천", salary: "월 300만", urgent: false, time: "3시간 전" },
  { id: 5, title: "작곡/미디 강사", academy: "사운드랩 아카데미", region: "부산", salary: "협의", urgent: false, time: "30분 전" },
];

const LESSONS = [
  { id: 1, instructor: "김민수", category: "건반", region: "서울", title: "재즈피아노 1:1 레슨", price: "회당 8만", verified: true, time: "20분 전" },
  { id: 2, instructor: "이수진", category: "보컬", region: "서울", title: "입시/취미 보컬 레슨", price: "회당 6만", verified: true, time: "5분 전" },
  { id: 3, instructor: "박준영", category: "기타", region: "경기", title: "어쿠스틱/일렉 기타 레슨", price: "회당 5만", verified: false, time: "10분 전" },
  { id: 4, instructor: "정하은", category: "작곡", region: "서울", title: "미디작곡 & 프로듀싱", price: "회당 7만", verified: true, time: "1시간 전" },
  { id: 5, instructor: "최동욱", category: "드럼", region: "부산", title: "드럼 초급~고급 레슨", price: "회당 5만", verified: false, time: "45분 전" },
];

const ACADEMIES = [
  { id: 1, name: "소리나무 실용음악학원", region: "서울", category: "보컬", event: "신규 개원 기념 첫 달 50% 할인 🎉", isNew: true, time: "1시간 전" },
  { id: 2, name: "블루노트 아카데미", region: "서울", category: "건반", event: "여름 특강 수강생 모집 중", isNew: false, time: "3시간 전" },
  { id: 3, name: "비트팩토리", region: "경기", category: "드럼", event: "무료 체험 레슨 이벤트 진행 중", isNew: true, time: "30분 전" },
  { id: 4, name: "뮤직플러스", region: "대구", category: "보컬", event: "입시반 조기등록 할인", isNew: false, time: "5시간 전" },
  { id: 5, name: "스트링아트 학원", region: "인천", category: "기타", event: "기타 입문 무료 체험 신청 접수 중", isNew: true, time: "2시간 전" },
];

const COMMUNITY = [
  { id: 1, title: "야마하 C3 그랜드피아노 판매", region: "서울", price: "800만원", type: "악기거래", time: "2시간 전" },
  { id: 2, title: "강남역 연습실 시간대여", region: "서울", price: "시간당 1만원", type: "연습실", time: "15분 전" },
  { id: 3, title: "펜더 스트라토캐스터 중고", region: "경기", price: "120만원", type: "악기거래", time: "40분 전" },
  { id: 4, title: "롤랜드 전자드럼 TD-17", region: "인천", price: "85만원", type: "악기거래", time: "1시간 전" },
  { id: 5, title: "홈레코딩 장비 세트 일괄", region: "서울", price: "45만원", type: "장비", time: "3시간 전" },
];

const CATEGORIES = ["전체", "보컬", "기타", "건반", "드럼", "작곡"];
const REGIONS = ["전체", "서울", "경기", "인천", "부산", "대구"];

// ── Sub-Components ───────────────────────────────────────────

type SectionHeaderProps = {
  icon: React.ReactNode;
  title: string;
  sub: string;
};

function SectionHeader({ icon, title, sub }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-orange-100 text-[#ff8a3d]">
          {icon}
        </span>
        <div>
          <p className="font-extrabold text-lg text-gray-800 leading-tight">{title}</p>
          <p className="text-xs text-gray-400">{sub}</p>
        </div>
      </div>
      <button className="flex items-center gap-1 text-sm text-[#ff8a3d] font-semibold">
        더보기 <ChevronRight size={15} />
      </button>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────

const Index = () => {
  // 'show' → 'fadeout' → 'done'
  const [splashPhase, setSplashPhase] = useState<"show" | "fadeout" | "done">("show");
  const [category, setCategory] = useState("전체");
  const [region, setRegion] = useState("전체");

  useEffect(() => {
    const t1 = setTimeout(() => setSplashPhase("fadeout"), 1500);
    const t2 = setTimeout(() => setSplashPhase("done"), 2300);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div className="min-h-screen bg-[#fff9f5]">

      {/* ── Splash Screen ── */}
      {splashPhase !== "done" && (
        <div
          className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#ff8a3d] transition-opacity duration-700 ${
            splashPhase === "fadeout" ? "opacity-0" : "opacity-100"
          }`}
        >
          <div className="text-center">
            <div className="text-7xl mb-4">🎵</div>
            <h1 className="text-5xl font-extrabold text-white tracking-tight">MusicHub</h1>
            <p className="text-white/80 text-xl mt-3 font-medium">실용음악 통합 플랫폼</p>
          </div>
        </div>
      )}

      {/* ── Main Content ── */}
      <div
        className={`transition-opacity duration-700 ${
          splashPhase === "done" ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* Header */}
        <header className="sticky top-0 z-40 bg-white shadow-sm">
          <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-3xl">🎵</span>
              <span className="text-2xl font-extrabold text-[#ff8a3d]">MusicHub</span>
            </div>
            <Button className="bg-[#ff8a3d] hover:bg-[#e07030] text-white rounded-full px-6 font-bold text-base h-10">
              로그인
            </Button>
          </div>
        </header>

        {/* Search / Filter Area */}
        <section className="bg-[#ff8a3d] pt-6 pb-10 px-4">
          <div className="max-w-2xl mx-auto">
            <p className="text-white text-2xl font-extrabold text-center mb-5">
              🔍 어떤 음악 정보를 찾으세요?
            </p>
            <div className="bg-white rounded-2xl p-4 shadow-lg flex gap-3 items-center">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="flex-1 rounded-xl border-2 border-orange-200 px-3 py-2.5 text-base font-medium text-gray-700 focus:outline-none focus:border-[#ff8a3d] bg-white"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="flex-1 rounded-xl border-2 border-orange-200 px-3 py-2.5 text-base font-medium text-gray-700 focus:outline-none focus:border-[#ff8a3d] bg-white"
              >
                {REGIONS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
              <button className="bg-[#ff8a3d] hover:bg-[#e07030] text-white rounded-xl px-4 py-2.5 font-bold text-base flex items-center gap-1 transition-colors">
                <Search size={16} /> 검색
              </button>
            </div>
          </div>
        </section>

        {/* QUAD Dashboard */}
        <main className="max-w-2xl mx-auto px-4 -mt-4 pb-12 space-y-6">

          {/* ① 구인/구직 */}
          <div className="bg-white rounded-3xl shadow-md p-5">
            <SectionHeader icon={<Briefcase size={20} />} title="구인/구직" sub="학원 채용 정보" />
            <div className="space-y-3">
              {JOBS.map((job) => (
                <Card key={job.id} className="rounded-2xl border border-orange-100 shadow-none bg-orange-50">
                  <CardContent className="p-4 flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        {job.urgent && (
                          <Badge className="bg-red-500 text-white text-xs px-2 py-0 rounded-full">급구</Badge>
                        )}
                        <span className="font-bold text-base text-gray-800 truncate">{job.title}</span>
                      </div>
                      <p className="text-sm text-gray-500 mb-1">{job.academy}</p>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <MapPin size={11} /> {job.region}
                        </span>
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Clock size={11} /> {job.time}
                        </span>
                      </div>
                    </div>
                    <span className="text-[#ff8a3d] font-bold text-sm whitespace-nowrap">{job.salary}</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* ② 레슨/매칭 */}
          <div className="bg-white rounded-3xl shadow-md p-5">
            <SectionHeader icon={<Music size={20} />} title="레슨/매칭" sub="강사 찾기" />
            <div className="space-y-3">
              {LESSONS.map((lesson) => (
                <Card key={lesson.id} className="rounded-2xl border border-orange-100 shadow-none bg-yellow-50">
                  <CardContent className="p-4 flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        {lesson.verified && (
                          <Badge className="bg-green-500 text-white text-xs px-2 py-0 rounded-full">인증</Badge>
                        )}
                        <span className="font-bold text-base text-gray-800 truncate">{lesson.title}</span>
                      </div>
                      <p className="text-sm text-gray-500 mb-1">
                        {lesson.instructor} 강사 · {lesson.category}
                      </p>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <MapPin size={11} /> {lesson.region}
                        </span>
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Clock size={11} /> {lesson.time}
                        </span>
                      </div>
                    </div>
                    <span className="text-[#ff8a3d] font-bold text-sm whitespace-nowrap">{lesson.price}</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* ③ 학원 소식 */}
          <div className="bg-white rounded-3xl shadow-md p-5">
            <SectionHeader icon={<School size={20} />} title="학원 소식" sub="우리 동네 학원" />
            <div className="space-y-3">
              {ACADEMIES.map((academy) => (
                <Card key={academy.id} className="rounded-2xl border border-orange-100 shadow-none bg-green-50">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="font-bold text-base text-gray-800">{academy.name}</span>
                      <div className="flex gap-1 flex-shrink-0">
                        {academy.isNew && (
                          <Badge className="bg-[#ff8a3d] text-white text-xs px-2 py-0 rounded-full">NEW</Badge>
                        )}
                        <Badge variant="outline" className="text-xs px-2 py-0 rounded-full border-orange-200 text-orange-500">
                          {academy.category}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{academy.event}</p>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <MapPin size={11} /> {academy.region}
                      </span>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock size={11} /> {academy.time}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* ④ 커뮤니티 */}
          <div className="bg-white rounded-3xl shadow-md p-5">
            <SectionHeader icon={<MessageCircle size={20} />} title="커뮤니티" sub="악기 · 정보" />
            <div className="space-y-3">
              {COMMUNITY.map((item) => (
                <Card key={item.id} className="rounded-2xl border border-orange-100 shadow-none bg-blue-50">
                  <CardContent className="p-4 flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <Badge variant="outline" className="text-xs px-2 py-0 rounded-full border-orange-200 text-orange-500">
                          {item.type}
                        </Badge>
                        <span className="font-bold text-base text-gray-800 truncate">{item.title}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <MapPin size={11} /> {item.region}
                        </span>
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Clock size={11} /> {item.time}
                        </span>
                      </div>
                    </div>
                    <span className="text-[#ff8a3d] font-bold text-sm whitespace-nowrap">{item.price}</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

        </main>
      </div>
    </div>
  );
};

export default Index;
