import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import ProfileCard, { type InstructorProfile } from "@/components/ProfileCard";
import {
  Sparkles,
  Video,
  Share2,
  MapPin,
  Clock,
  ExternalLink,
  ChevronRight,
  Star,
  Users,
  ArrowRight,
} from "lucide-react";

// ── Sample Profile ────────────────────────────────────────────

const SAMPLE_PROFILE: InstructorProfile = {
  name: "김민수",
  major: "피아노 · 재즈",
  school: "연세대 음악학과",
  experience: "10년 경력",
  tagline: "입시부터 취미까지, 당신의 속도에 맞추는 레슨",
  verifiedSchool: true,
  verifiedCareer: true,
  youtubeId: "jNQXAC9IVRw",
  curriculum: [
    "재즈 기초 이론 및 코드 보이싱",
    "즉흥연주(임프로바이제이션) 트레이닝",
    "팝·클래식 레퍼토리 완성",
    "음악대학 입시 전문 지도",
  ],
  kakaoLink: "https://open.kakao.com/",
  profileId: "kimminsu",
  emoji: "🎹",
};

// ── Aggregator Data ───────────────────────────────────────────

const TODAY_JOBS = [
  { id: 1, title: "보컬 강사 급구 (풀타임)", source: "뮬", region: "서울 홍대", salary: "월 300만", isNew: true, time: "37분 전", urgent: true },
  { id: 2, title: "재즈피아노 파트타임 강사 모집", source: "뮬", region: "서울 강남", salary: "시급 4만", isNew: true, time: "1시간 전", urgent: false },
  { id: 3, title: "드럼 전임 강사 (경력 2년 이상)", source: "카페", region: "경기 성남", salary: "월 280만", isNew: false, time: "2시간 전", urgent: true },
  { id: 4, title: "미디/작곡 강사 모집 (협의)", source: "뮬", region: "서울 마포", salary: "협의", isNew: false, time: "3시간 전", urgent: false },
  { id: 5, title: "기타 강사 파트타임 구합니다", source: "카페", region: "인천 부평", salary: "시급 3.5만", isNew: true, time: "4시간 전", urgent: false },
];

// ── Sub-Components ────────────────────────────────────────────

function StepBadge({ n, label, icon }: { n: number; label: string; icon: string }) {
  return (
    <div className="flex flex-col items-center gap-2 flex-1">
      <div className="w-14 h-14 rounded-2xl bg-orange-100 flex items-center justify-center text-2xl">
        {icon}
      </div>
      <span className="w-6 h-6 rounded-full bg-[#ff8a3d] text-white text-xs font-extrabold flex items-center justify-center -mt-1">
        {n}
      </span>
      <p className="text-sm font-semibold text-gray-700 text-center leading-tight">{label}</p>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────

const Index = () => {
  const [splashPhase, setSplashPhase] = useState<"show" | "fadeout" | "done">("show");
  const [showSample, setShowSample] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setSplashPhase("fadeout"), 1500);
    const t2 = setTimeout(() => setSplashPhase("done"), 2300);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div className="min-h-screen bg-[#fff9f5]">

      {/* ── Splash ── */}
      {splashPhase !== "done" && (
        <div
          className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#ff8a3d] transition-opacity duration-700 ${
            splashPhase === "fadeout" ? "opacity-0" : "opacity-100"
          }`}
        >
          <div className="text-center">
            <div className="text-7xl mb-4">🎵</div>
            <h1 className="text-5xl font-extrabold text-white tracking-tight">MusicHub</h1>
            <p className="text-white/80 text-xl mt-3 font-medium">강사의 무기를 만드는 곳</p>
          </div>
        </div>
      )}

      {/* ── Main ── */}
      <div className={`transition-opacity duration-700 ${splashPhase === "done" ? "opacity-100" : "opacity-0"}`}>

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

        {/* ── Hero ── */}
        <section className="bg-gradient-to-b from-[#ff8a3d] to-[#ffb347] px-4 pt-10 pb-14">
          <div className="max-w-2xl mx-auto text-center">
            <Badge className="bg-white/20 text-white border-white/30 text-sm px-3 py-1 mb-4 rounded-full">
              <Sparkles size={13} className="mr-1" /> 강사 전용 무료 서비스
            </Badge>
            <h1 className="text-3xl font-extrabold text-white leading-tight mb-3">
              내 연주 영상 하나로<br />
              <span className="text-yellow-200">1분 만에 끝내는</span><br />
              레슨 프로필 생성
            </h1>
            <p className="text-white/80 text-base mb-6 leading-relaxed">
              뮬, 인스타, 카카오에 바로 공유할 수 있는<br />
              나만의 강사 프로필 카드를 지금 무료로 만들어보세요.
            </p>
            <Button
              className="bg-white text-[#ff8a3d] hover:bg-yellow-50 font-extrabold rounded-2xl px-8 h-14 text-lg shadow-lg gap-2 mb-4"
              onClick={() => setShowSample(true)}
            >
              무료로 만들기 <ArrowRight size={20} />
            </Button>
            <div className="flex items-center justify-center gap-4 text-white/70 text-sm">
              <span className="flex items-center gap-1"><Users size={14} /> 강사 2,400명 사용 중</span>
              <span className="flex items-center gap-1"><Star size={14} /> 평점 4.9</span>
            </div>
          </div>
        </section>

        {/* ── How It Works ── */}
        <section className="max-w-2xl mx-auto px-4 -mt-4 mb-6">
          <div className="bg-white rounded-3xl shadow-md p-6">
            <h2 className="text-center font-extrabold text-gray-800 text-lg mb-5">이렇게 만들어요 👇</h2>
            <div className="flex items-start gap-2">
              <StepBadge n={1} icon="🎬" label={"유튜브 링크\n붙여넣기"} />
              <div className="flex-shrink-0 mt-7 text-gray-300">
                <ChevronRight size={20} />
              </div>
              <StepBadge n={2} icon="✍️" label={"커리큘럼 & \n연락처 입력"} />
              <div className="flex-shrink-0 mt-7 text-gray-300">
                <ChevronRight size={20} />
              </div>
              <StepBadge n={3} icon="🚀" label={"뮬/인스타에\n바로 공유"} />
            </div>
          </div>
        </section>

        {/* ── Profile Card Sample ── */}
        <section className="max-w-2xl mx-auto px-4 mb-6">
          <div className="bg-white rounded-3xl shadow-md p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-extrabold text-gray-800 text-lg">📱 샘플 프로필 카드</h2>
              <Badge className="bg-orange-100 text-[#ff8a3d] border-0 text-xs">미리보기</Badge>
            </div>
            <p className="text-gray-500 text-sm mb-5">
              이런 카드가 만들어집니다. 뮬, 인스타 링크 하나로 공유하세요.
            </p>
            <div className="flex justify-center">
              <ProfileCard profile={SAMPLE_PROFILE} />
            </div>
          </div>
        </section>

        {/* ── Trust Badges Info ── */}
        <section className="max-w-2xl mx-auto px-4 mb-6">
          <div className="bg-white rounded-3xl shadow-md p-5">
            <h2 className="font-extrabold text-gray-800 text-lg mb-4">🏅 신뢰 마크 시스템</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-50 rounded-2xl p-4 flex flex-col gap-2">
                <div className="text-2xl">🎓</div>
                <p className="font-bold text-gray-800 text-sm">학력 인증</p>
                <p className="text-xs text-gray-500 leading-relaxed">졸업증명서 제출 시 프로필에 인증 배지 표시</p>
              </div>
              <div className="bg-green-50 rounded-2xl p-4 flex flex-col gap-2">
                <div className="text-2xl">💼</div>
                <p className="font-bold text-gray-800 text-sm">경력 확인</p>
                <p className="text-xs text-gray-500 leading-relaxed">재직증명서·추천서 제출 시 경력 확인 배지 표시</p>
              </div>
              <div className="bg-yellow-50 rounded-2xl p-4 flex flex-col gap-2">
                <div className="text-2xl">▶️</div>
                <p className="font-bold text-gray-800 text-sm">연주 영상</p>
                <p className="text-xs text-gray-500 leading-relaxed">유튜브 링크 연결 시 카드에서 바로 재생 가능</p>
              </div>
              <div className="bg-pink-50 rounded-2xl p-4 flex flex-col gap-2">
                <div className="text-2xl">💬</div>
                <p className="font-bold text-gray-800 text-sm">카톡 연결</p>
                <p className="text-xs text-gray-500 leading-relaxed">오픈채팅 링크 등록으로 즉시 문의 가능</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Today's Job Aggregator ── */}
        <section className="max-w-2xl mx-auto px-4 mb-10">
          <div className="bg-white rounded-3xl shadow-md p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-extrabold text-gray-800 text-lg">
                📋 오늘의 신규 구인 소식
              </h2>
              <button className="flex items-center gap-1 text-sm text-[#ff8a3d] font-semibold">
                더보기 <ChevronRight size={15} />
              </button>
            </div>
            <p className="text-xs text-gray-400 mb-4 flex items-center gap-1">
              <ExternalLink size={11} /> 뮬, 음악 카페 등 외부 채용 공고 모음
            </p>
            <div className="space-y-3">
              {TODAY_JOBS.map((job) => (
                <Card key={job.id} className="rounded-2xl border border-orange-100 shadow-none bg-orange-50">
                  <CardContent className="p-4 flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        {job.urgent && (
                          <Badge className="bg-red-500 text-white text-xs px-2 py-0 rounded-full">급구</Badge>
                        )}
                        {job.isNew && (
                          <Badge className="bg-[#ff8a3d] text-white text-xs px-2 py-0 rounded-full">NEW</Badge>
                        )}
                        <Badge variant="outline" className="text-xs px-2 py-0 rounded-full border-orange-200 text-orange-400">
                          {job.source}
                        </Badge>
                      </div>
                      <p className="font-bold text-sm text-gray-800 truncate">{job.title}</p>
                      <div className="flex items-center gap-3 mt-1">
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
        </section>

        {/* ── Bottom CTA ── */}
        <section className="bg-[#ff8a3d] py-10 px-4 text-center">
          <p className="text-white text-xl font-extrabold mb-2">지금 바로 시작해보세요 🎵</p>
          <p className="text-white/75 text-sm mb-5">가입 없이 1분 만에 프로필 카드 완성</p>
          <Button className="bg-white text-[#ff8a3d] hover:bg-yellow-50 font-extrabold rounded-2xl px-8 h-12 text-base shadow-md gap-2">
            무료로 프로필 만들기 <ArrowRight size={18} />
          </Button>
        </section>

      </div>
    </div>
  );
};

export default Index;
