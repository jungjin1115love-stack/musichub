import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PlatformGateway from "@/components/PlatformGateway";
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
import { GraduationCap, Briefcase, Play } from "lucide-react";

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
  {
    name: "한지원", major: "보컬", school: "중앙대 음악극과",
    experience: "9년 경력", tagline: "홍대 클럽 현직 싱어 — 실전 무대 경험을 레슨에 담아요",
    verifiedSchool: true, verifiedCareer: true,
    curriculum: ["성구 전환 & 믹스보이스", "고음 확장 트레이닝", "감성 표현 & 리릭 해석", "오디션 준비 집중 클래스"],
    kakaoLink: "https://open.kakao.com/", profileId: "hanjiwon", emoji: "🎤",
  },
  {
    name: "오세훈", major: "베이스 기타", school: "서울종합예술실용학교",
    experience: "6년 경력", tagline: "밴드 사운드의 뿌리, 베이스를 제대로 배워보세요",
    verifiedSchool: true, verifiedCareer: true,
    curriculum: ["5선 악보 읽기 & 태블러처", "핑거링 & 슬랩 테크닉", "펑크·재즈·록 스타일 연구", "밴드 합주 트레이닝"],
    kakaoLink: "https://open.kakao.com/", profileId: "osehun", emoji: "🎸",
  },
  {
    name: "신예린", major: "클래식 피아노", school: "서울대 음악대학 피아노과",
    experience: "12년 경력", tagline: "콩쿠르 입상 경력, 성수동 스튜디오 레슨 운영 중",
    verifiedSchool: true, verifiedCareer: true,
    curriculum: ["체르니 & 하농 기초", "소나타·협주곡 레퍼토리", "콩쿠르 대비 집중 지도", "음대 입시 전문 코칭"],
    kakaoLink: "https://open.kakao.com/", profileId: "shinyerin", emoji: "🎹",
  },
  {
    name: "강태양", major: "색소폰", school: "상명대 실용음악과",
    experience: "7년 경력", tagline: "합정 재즈바 레지던트 — 재즈부터 보사노바까지",
    verifiedSchool: true, verifiedCareer: false,
    curriculum: ["기초 음형 & 운지법", "스케일 & 아르페지오 완성", "재즈 즉흥연주 입문", "앙상블 & 세션 레슨"],
    kakaoLink: "https://open.kakao.com/", profileId: "kangtaeyang", emoji: "🎷",
  },
  {
    name: "윤서아", major: "작곡 · 편곡", school: "Berklee Online 수료",
    experience: "4년 경력", tagline: "스트리밍 플랫폼에 음원 냈어요 — 당신도 할 수 있어요",
    verifiedSchool: true, verifiedCareer: true,
    curriculum: ["화성학 집중 과정", "Cubase·FL Studio 기초", "장르별 믹싱·마스터링", "멜론·스포티파이 발매 가이드"],
    kakaoLink: "https://open.kakao.com/", profileId: "yoonseoa", emoji: "🎛️",
  },
  {
    name: "임재원", major: "기타", school: "한국예술종합학교",
    experience: "11년 경력", tagline: "건대 앞 스튜디오 레슨 — 클래식·재즈·팝 전 장르",
    verifiedSchool: true, verifiedCareer: true,
    curriculum: ["음계 & 코드 이론 정복", "클래식 기타 에튀드", "재즈 보이싱 & 보사노바", "솔로 기타 편곡 실습"],
    kakaoLink: "https://open.kakao.com/", profileId: "imjaewon", emoji: "🎸",
  },
  {
    name: "조미나", major: "보컬 · 뮤지컬", school: "동덕여대 실용음악과",
    experience: "8년 경력", tagline: "잠실 뮤지컬 배우 출신 — 연기와 노래를 함께 배워요",
    verifiedSchool: true, verifiedCareer: true,
    curriculum: ["호흡 & 딕션 집중 훈련", "뮤지컬 넘버 해석", "댄스 결합 퍼포먼스 레슨", "오디션 실전 모의 진행"],
    kakaoLink: "https://open.kakao.com/", profileId: "jomina", emoji: "🎭",
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
        {/* Platform Gateway */}
        <div className="mb-5">
          <PlatformGateway />
        </div>

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

      <Footer />
    </div>
  );
};

export default InstructorSearch;
