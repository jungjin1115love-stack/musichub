import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import ProfileCard, { type InstructorProfile } from "@/components/ProfileCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { MapPin, Clock, GraduationCap, Briefcase, Play } from "lucide-react";

// ── Dummy Data ────────────────────────────────────────────────

const INSTRUCTORS: InstructorProfile[] = [
  {
    name: "김민수", major: "피아노 · 재즈", school: "연세대 음악학과",
    experience: "10년 경력", tagline: "입시부터 취미까지, 당신의 속도에 맞추는 레슨",
    verifiedSchool: true, verifiedCareer: true,
    youtubeId: "jNQXAC9IVRw",
    curriculum: ["재즈 기초 이론 및 코드 보이싱", "즉흥연주 트레이닝", "팝·클래식 레퍼토리", "음대 입시 지도"],
    kakaoLink: "https://open.kakao.com/", profileId: "kimminsu", emoji: "🎹",
  },
  {
    name: "이수진", major: "보컬", school: "한양대 실용음악과",
    experience: "7년 경력", tagline: "K-POP · 뮤지컬 · CCM 전문 보컬 트레이너",
    verifiedSchool: true, verifiedCareer: true,
    curriculum: ["발성 교정 및 호흡 훈련", "음정·박자 집중 트레이닝", "장르별 보컬 스타일 지도", "무대 매너 및 퍼포먼스"],
    kakaoLink: "https://open.kakao.com/", profileId: "leesujin", emoji: "🎤",
  },
  {
    name: "박준영", major: "기타", school: "버클리 음대 졸업",
    experience: "8년 경력", tagline: "어쿠스틱부터 일렉까지, 모든 장르 OK",
    verifiedSchool: true, verifiedCareer: false,
    curriculum: ["기초 코드 & 리듬 패턴", "핑거스타일 기타 완성", "블루스·록 테크닉", "작편곡 기초"],
    kakaoLink: "https://open.kakao.com/", profileId: "parkjy", emoji: "🎸",
  },
  {
    name: "정하은", major: "작곡 · 미디", school: "서울예대 작곡과",
    experience: "6년 경력", tagline: "Logic Pro · Ableton으로 나만의 음악을 만들어보세요",
    verifiedSchool: true, verifiedCareer: true,
    curriculum: ["미디 기초 (DAW 활용법)", "코드 진행 & 편곡 이론", "샘플링 & 비트메이킹", "음원 발매까지 A to Z"],
    kakaoLink: "https://open.kakao.com/", profileId: "junghaeun", emoji: "🎛️",
  },
  {
    name: "최동욱", major: "드럼", school: "경희대 포스트모던음악과",
    experience: "5년 경력", tagline: "리듬의 기초부터 고급 그루브까지 체계적으로",
    verifiedSchool: false, verifiedCareer: true,
    curriculum: ["기초 스틱 컨트롤 & 패드 연습", "8비트·16비트 기초 리듬", "필인 & 응용 패턴", "앙상블 & 합주 레슨"],
    kakaoLink: "https://open.kakao.com/", profileId: "choidongwook", emoji: "🥁",
  },
];

const REGIONS = ["전체", "서울", "경기", "인천", "부산", "대구"];
const MAJORS  = ["전체", "보컬", "기타", "건반", "드럼", "작곡"];

// ── Component ─────────────────────────────────────────────────

const InstructorSearch = () => {
  const [region, setRegion] = useState("전체");
  const [major, setMajor]   = useState("전체");
  const [selected, setSelected] = useState<InstructorProfile | null>(null);

  return (
    <div className="min-h-screen bg-[#fff9f5]">
      <Navbar />

      {/* Portfolio Banner */}
      <div className="bg-gradient-to-r from-[#ff8a3d] to-[#ffb347] px-4 py-3">
        <p className="max-w-2xl mx-auto text-white text-sm font-semibold text-center">
          🎬 강사의 연주 영상을 바로 확인하고 <span className="font-extrabold underline">'포트폴리오 보기'</span>를 눌러보세요
        </p>
      </div>

      <main className="max-w-2xl mx-auto px-4 py-5">
        {/* Title */}
        <div className="mb-4">
          <h1 className="text-2xl font-extrabold text-gray-800">🎓 선생님 찾기</h1>
          <p className="text-sm text-gray-500 mt-0.5">학원에 딱 맞는 강사를 연주 영상으로 직접 확인하세요</p>
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

        {/* Instructor List */}
        <div className="space-y-3">
          {INSTRUCTORS.map((inst) => (
            <Card key={inst.profileId} className="rounded-2xl border border-orange-100 shadow-sm bg-white overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  {/* Avatar */}
                  <div className="w-14 h-14 rounded-2xl bg-orange-100 flex items-center justify-center text-2xl flex-shrink-0">
                    {inst.emoji}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap mb-1">
                      <span className="font-extrabold text-base text-gray-800">{inst.name}</span>
                      {inst.verifiedSchool && (
                        <Badge className="bg-blue-100 text-blue-600 border-0 text-xs gap-0.5 px-1.5 py-0">
                          <GraduationCap size={10} /> 학력인증
                        </Badge>
                      )}
                      {inst.verifiedCareer && (
                        <Badge className="bg-green-100 text-green-600 border-0 text-xs gap-0.5 px-1.5 py-0">
                          <Briefcase size={10} /> 경력확인
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-[#ff8a3d] font-semibold">{inst.major}</p>
                    <p className="text-xs text-gray-400 mt-0.5 truncate">{inst.school} · {inst.experience}</p>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed line-clamp-2">{inst.tagline}</p>
                  </div>
                </div>

                {/* Portfolio Button */}
                <Button
                  className="w-full mt-3 bg-[#ff8a3d] hover:bg-[#e07030] text-white rounded-xl h-10 font-bold text-sm gap-2"
                  onClick={() => setSelected(inst)}
                >
                  <Play size={15} /> 포트폴리오 보기
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      {/* Portfolio Sheet */}
      <Sheet open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent side="bottom" className="h-[92vh] rounded-t-3xl overflow-y-auto p-0">
          <SheetHeader className="px-5 pt-5 pb-3 border-b border-gray-100">
            <SheetTitle className="text-left font-extrabold text-lg text-gray-800">
              강사 포트폴리오
            </SheetTitle>
          </SheetHeader>
          <div className="flex justify-center p-5 pb-10">
            {selected && <ProfileCard profile={selected} />}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default InstructorSearch;
