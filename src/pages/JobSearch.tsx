import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Clock, Sparkles, ArrowRight } from "lucide-react";

// ── Dummy Data ────────────────────────────────────────────────

const JOBS = [
  { id: 1,  title: "보컬 강사 모집 (풀타임)",          academy: "소리나무 실용음악학원", region: "서울 홍대",  major: "보컬", salary: "월 300만",   urgent: true,  verified: true,  time: "37분 전",  desc: "경력 3년 이상, 입시·취미 병행 지도 가능하신 분" },
  { id: 2,  title: "재즈피아노 파트타임 강사",          academy: "블루노트 아카데미",     region: "서울 강남",  major: "건반", salary: "시급 4만",    urgent: false, verified: true,  time: "1시간 전", desc: "주 2~3회, 오후 시간대 가능하신 분 환영" },
  { id: 3,  title: "드럼 전임 강사 급구",               academy: "비트팩토리",            region: "경기 성남",  major: "드럼", salary: "월 280만",   urgent: true,  verified: false, time: "2시간 전", desc: "즉시 출근 가능하신 분, 경력 무관 지원 가능" },
  { id: 4,  title: "미디·작곡 강사 모집",               academy: "사운드랩 아카데미",     region: "서울 마포",  major: "작곡", salary: "협의",       urgent: false, verified: true,  time: "3시간 전", desc: "Logic / Ableton 능숙하신 분, 대학 강의 경력 우대" },
  { id: 5,  title: "기타 파트타임 강사",                academy: "스트링아트 학원",       region: "인천 부평",  major: "기타", salary: "시급 3.5만", urgent: false, verified: false, time: "4시간 전", desc: "입문~중급 위주, 주말 가능하신 분" },
  { id: 6,  title: "보컬 트레이너 모집 (성수점)",       academy: "멜로디아 뮤직스쿨",    region: "서울 성수",  major: "보컬", salary: "월 320만",   urgent: false, verified: true,  time: "5시간 전", desc: "K-POP·CCM 전문, 성인 취미반 경험 있으신 분 우대" },
  { id: 7,  title: "어쿠스틱 기타 강사 구함",           academy: "스트링 하우스",         region: "서울 합정",  major: "기타", salary: "시급 3만",    urgent: false, verified: false, time: "6시간 전", desc: "주 3일 근무, 오후 2시~8시, 초·중급 위주 레슨" },
  { id: 8,  title: "클래식 피아노 강사 급구",           academy: "아르페지오 음악학원",   region: "서울 잠실",  major: "건반", salary: "월 270만",   urgent: true,  verified: true,  time: "8시간 전", desc: "유아~초등 전문, 콩쿠르 지도 경험 우대" },
  { id: 9,  title: "드럼 파트타임 강사 모집",           academy: "리듬팩토리",            region: "서울 건대",  major: "드럼", salary: "시급 3.5만", urgent: false, verified: true,  time: "10시간 전", desc: "주말 포함 주 3~4일, 중·고급반 담당" },
  { id: 10, title: "보컬 입시 전문 강사 모집",          academy: "톱싱어 아카데미",       region: "서울 노원",  major: "보컬", salary: "월 350만",   urgent: true,  verified: true,  time: "1일 전",   desc: "입시 실적 보유자 우대, 4년제 음대 졸업 이상" },
  { id: 11, title: "작곡·편곡 강사 (분당캠퍼스)",      academy: "뮤직스퀘어",            region: "경기 분당",  major: "작곡", salary: "협의",       urgent: false, verified: true,  time: "1일 전",   desc: "FL Studio·Cubase 가능, 팝·힙합 장르 전문이면 우대" },
  { id: 12, title: "색소폰·관악 파트타임 강사",        academy: "재즈클럽 아카데미",     region: "서울 이태원",major: "기타", salary: "시급 4만",    urgent: false, verified: false, time: "2일 전",   desc: "색소폰·클라리넷 가능, 성인 취미반 위주 운영" },
];

const REGIONS = ["전체", "서울", "경기", "인천", "부산", "대구"];
const MAJORS  = ["전체", "보컬", "기타", "건반", "드럼", "작곡"];

// ── Component ─────────────────────────────────────────────────

const JobSearch = () => {
  const [region, setRegion] = useState("전체");
  const [major, setMajor]   = useState("전체");

  const filtered = JOBS.filter(
    (j) =>
      (major === "전체" || j.major === major) &&
      (region === "전체" || j.region.startsWith(region))
  );

  return (
    <div className="min-h-screen bg-[#fff9f5]">
      <Navbar />

      {/* Portfolio Promo Banner */}
      <div className="bg-gradient-to-r from-[#ff8a3d] to-[#ffb347] px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
          <div>
            <p className="text-white font-extrabold text-sm leading-tight">
              🚀 포트폴리오 카드로 채용 담당자 눈에 띄세요!
            </p>
            <p className="text-white/75 text-xs mt-0.5">
              연주 영상 + 커리큘럼 카드로 지원하면 응답률 3배 ↑
            </p>
          </div>
          <button className="bg-white text-[#ff8a3d] font-extrabold text-xs rounded-xl px-3 py-2 whitespace-nowrap flex items-center gap-1 hover:bg-yellow-50 transition-colors">
            만들기 <ArrowRight size={12} />
          </button>
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-4 py-5">
        {/* Title */}
        <div className="mb-4">
          <h1 className="text-2xl font-extrabold text-gray-800">💼 학원 일자리</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            포트폴리오 카드를 등록하면 채용담당자가 먼저 연락해요
          </p>
        </div>

        {/* Portfolio Highlight CTA */}
        <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-4 mb-5">
          <div className="flex items-start gap-3">
            <span className="text-3xl">✨</span>
            <div className="flex-1">
              <p className="font-extrabold text-gray-800 text-sm mb-1">
                포트폴리오 카드 등록 시 리스트 상단 노출!
              </p>
              <p className="text-xs text-gray-500 leading-relaxed mb-3">
                연주 영상과 커리큘럼이 담긴 나만의 프로필 카드를 등록하면
                구인 중인 학원장님께 <span className="text-[#ff8a3d] font-bold">우선 노출</span>됩니다.
              </p>
              <Button className="bg-[#ff8a3d] text-white rounded-xl h-9 text-sm font-bold gap-1 hover:bg-[#e07030]">
                <Sparkles size={14} /> 내 포트폴리오 등록하기
              </Button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-5">
          <select
            value={major}
            onChange={(e) => setMajor(e.target.value)}
            className="flex-1 rounded-xl border-2 border-orange-200 px-3 py-2 text-sm font-medium text-gray-700 focus:outline-none focus:border-[#ff8a3d] bg-white"
          >
            {MAJORS.map((m) => <option key={m}>{m}</option>)}
          </select>
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="flex-1 rounded-xl border-2 border-orange-200 px-3 py-2 text-sm font-medium text-gray-700 focus:outline-none focus:border-[#ff8a3d] bg-white"
          >
            {REGIONS.map((r) => <option key={r}>{r}</option>)}
          </select>
        </div>

        {/* Job List */}
        <div className="space-y-3">
          {filtered.map((job) => (
            <Card key={job.id} className="rounded-2xl border border-orange-100 shadow-sm bg-white">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap mb-1">
                      {job.urgent && (
                        <Badge className="bg-red-500 text-white text-xs px-2 py-0 rounded-full">급구</Badge>
                      )}
                      {job.verified && (
                        <Badge className="bg-blue-100 text-blue-600 border-0 text-xs px-2 py-0 rounded-full">인증학원</Badge>
                      )}
                      <Badge variant="outline" className="text-xs px-2 py-0 rounded-full border-orange-200 text-orange-400">
                        {job.major}
                      </Badge>
                    </div>
                    <p className="font-extrabold text-base text-gray-800">{job.title}</p>
                    <p className="text-sm text-gray-500 mt-0.5">{job.academy}</p>
                  </div>
                  <span className="text-[#ff8a3d] font-extrabold text-sm whitespace-nowrap">{job.salary}</span>
                </div>

                <p className="text-xs text-gray-500 bg-gray-50 rounded-xl px-3 py-2 mb-3 leading-relaxed">
                  {job.desc}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <MapPin size={11} /> {job.region}
                    </span>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock size={11} /> {job.time}
                    </span>
                  </div>
                  <Button className="bg-[#ff8a3d] hover:bg-[#e07030] text-white rounded-xl h-9 text-sm font-bold px-4">
                    지원하기
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <p className="text-4xl mb-3">🔍</p>
              <p className="font-semibold">조건에 맞는 채용공고가 없어요</p>
              <p className="text-sm mt-1">필터를 변경해보세요</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default JobSearch;
