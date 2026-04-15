import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Clock, Phone, Star } from "lucide-react";

// ── Dummy Data ────────────────────────────────────────────────

const ACADEMIES = [
  {
    id: 1, name: "소리나무 실용음악학원", region: "서울 마포", major: ["보컬", "건반"],
    event: "🎉 신규 개원 기념 첫 달 50% 할인", rating: 4.9, reviews: 128,
    isNew: true, time: "1시간 전",
    desc: "홍대입구 5분 거리. 입시·취미 전 과정 운영. 무료 레벨 테스트 가능.",
  },
  {
    id: 2, name: "블루노트 아카데미", region: "서울 강남", major: ["건반", "기타"],
    event: "여름 특강 수강생 모집 중 (7~8월)", rating: 4.7, reviews: 89,
    isNew: false, time: "3시간 전",
    desc: "강남구청역 도보 3분. 재즈·팝 전문. 성인 취미반 특화.",
  },
  {
    id: 3, name: "비트팩토리", region: "경기 성남", major: ["드럼", "작곡"],
    event: "무료 체험 레슨 이벤트 진행 (선착순 20명)", rating: 4.6, reviews: 54,
    isNew: true, time: "30분 전",
    desc: "분당선 야탑역 인근. 드럼·미디 작곡 특화. 방음 개인 연습실 운영.",
  },
  {
    id: 4, name: "뮤직플러스", region: "대구 수성", major: ["보컬"],
    event: "입시반 조기등록 할인 (마감 임박)", rating: 4.8, reviews: 200,
    isNew: false, time: "5시간 전",
    desc: "대구 최대 보컬 전문학원. 합격률 92%. 현직 심사위원 특강 월 2회.",
  },
  {
    id: 5, name: "스트링아트 학원", region: "인천 부평", major: ["기타"],
    event: "기타 입문반 무료 체험 신청 접수 중", rating: 4.5, reviews: 41,
    isNew: true, time: "2시간 전",
    desc: "부평역 1번 출구. 어쿠스틱·일렉·클래식 기타 전 과정 운영.",
  },
];

const REGIONS = ["전체", "서울", "경기", "인천", "부산", "대구"];
const MAJORS  = ["전체", "보컬", "기타", "건반", "드럼", "작곡"];

// ── Component ─────────────────────────────────────────────────

const AcademySearch = () => {
  const [region, setRegion] = useState("전체");
  const [major, setMajor]   = useState("전체");

  const filtered = ACADEMIES.filter(
    (a) =>
      (major === "전체" || a.major.includes(major)) &&
      (region === "전체" || a.region.startsWith(region))
  );

  return (
    <div className="min-h-screen bg-[#fff9f5]">
      <Navbar />

      {/* Banner */}
      <div className="bg-gradient-to-r from-[#ff8a3d] to-[#ffb347] px-4 py-3">
        <p className="max-w-2xl mx-auto text-white text-sm font-semibold text-center">
          🏫 우리 동네 음악학원을 찾아보세요 — 이벤트 정보도 한눈에!
        </p>
      </div>

      <main className="max-w-2xl mx-auto px-4 py-5">
        {/* Title */}
        <div className="mb-4">
          <h1 className="text-2xl font-extrabold text-gray-800">🏫 내 주변 학원</h1>
          <p className="text-sm text-gray-500 mt-0.5">지역과 전공으로 딱 맞는 학원을 찾아보세요</p>
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

        {/* Academy List */}
        <div className="space-y-3">
          {filtered.map((academy) => (
            <Card key={academy.id} className="rounded-2xl border border-orange-100 shadow-sm bg-white overflow-hidden">
              <CardContent className="p-4">
                {/* Header row */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap mb-1">
                      {academy.isNew && (
                        <Badge className="bg-[#ff8a3d] text-white text-xs px-2 py-0 rounded-full">NEW</Badge>
                      )}
                      {academy.major.map((m) => (
                        <Badge key={m} variant="outline" className="text-xs px-2 py-0 rounded-full border-orange-200 text-orange-400">
                          {m}
                        </Badge>
                      ))}
                    </div>
                    <p className="font-extrabold text-base text-gray-800">{academy.name}</p>
                  </div>
                  {/* Rating */}
                  <div className="flex flex-col items-end flex-shrink-0">
                    <div className="flex items-center gap-0.5 text-yellow-400">
                      <Star size={13} fill="currentColor" />
                      <span className="text-sm font-bold text-gray-700">{academy.rating}</span>
                    </div>
                    <span className="text-xs text-gray-400">리뷰 {academy.reviews}</span>
                  </div>
                </div>

                {/* Event highlight */}
                <div className="bg-orange-50 border border-orange-100 rounded-xl px-3 py-2 mb-3">
                  <p className="text-sm font-semibold text-[#e07030]">{academy.event}</p>
                </div>

                {/* Description */}
                <p className="text-xs text-gray-500 leading-relaxed mb-3">{academy.desc}</p>

                {/* Footer */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <MapPin size={11} /> {academy.region}
                    </span>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock size={11} /> {academy.time}
                    </span>
                  </div>
                  <Button className="bg-[#ff8a3d] hover:bg-[#e07030] text-white rounded-xl h-9 text-sm font-bold px-4 gap-1">
                    <Phone size={13} /> 문의하기
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <p className="text-4xl mb-3">🔍</p>
              <p className="font-semibold">조건에 맞는 학원이 없어요</p>
              <p className="text-sm mt-1">필터를 변경해보세요</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AcademySearch;
