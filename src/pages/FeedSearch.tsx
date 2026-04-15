import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { supabase } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  MapPin, Clock, ExternalLink, Search,
  Plus, ArrowUpRight, Sparkles, ChevronRight, Layers,
} from "lucide-react";
import { analyzePlatforms, type PlatformResult } from "@/utils/aiSearch";
import { getMockResults, getExternalJobUrl, PLATFORM_META, type MockResult, type SearchPlatform } from "@/utils/mockSearchResults";

// ── All-in-One Music Job Search Engine ───────────────────────

const AI_INSTRUMENTS = ["전체", "보컬", "피아노", "기타", "드럼", "작곡·미디", "베이스", "바이올린", "색소폰"];
const AI_REGIONS     = ["전체", "홍대", "강남", "성수", "합정", "건대", "잠실", "노원", "분당", "수원"];
const AI_PURPOSES    = ["전체", "레슨 받기", "강사 구인", "강사 구직"];

const JOB_PLATFORMS: { name: "워크넷" | "사람인" | "잡코리아"; emoji: string; color: string; light: string; text: string }[] = [
  { name: "워크넷",  emoji: "🏛️", color: "bg-teal-600",    light: "bg-teal-50",    text: "text-teal-700" },
  { name: "사람인",  emoji: "💼", color: "bg-red-600",     light: "bg-red-50",     text: "text-red-700" },
  { name: "잡코리아", emoji: "🟡", color: "bg-yellow-500",  light: "bg-yellow-50",  text: "text-yellow-800" },
];

// 결과 카드 컴포넌트
function SearchResultCard({ r, onOpen }: { r: MockResult; onOpen: (r: MockResult) => void }) {
  const meta = PLATFORM_META[r.platform];
  return (
    <button
      onClick={() => onOpen(r)}
      className={`w-full text-left bg-white border-2 ${meta.border} rounded-2xl px-4 py-3.5 hover:shadow-md transition-all active:scale-[0.99] group`}
    >
      {/* 상단: 플랫폼 뱃지 + 날짜 */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className={`flex items-center gap-1.5 ${meta.light} ${meta.text} rounded-full px-2.5 py-0.5`}>
          <span className="text-sm">{meta.emoji}</span>
          <span className="text-xs font-extrabold">{r.platform}</span>
        </div>
        <div className="flex items-center gap-2">
          {r.salary && (
            <span className="text-xs font-bold text-[#ff8a3d] bg-orange-50 rounded-full px-2 py-0.5">
              {r.salary}
            </span>
          )}
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <Clock size={10} /> {r.date}
          </span>
        </div>
      </div>

      {/* 제목 */}
      <p className="font-extrabold text-sm text-gray-800 leading-snug mb-1.5 group-hover:text-[#ff8a3d] transition-colors">
        {r.title}
      </p>

      {/* 요약 */}
      <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-2">{r.summary}</p>

      {/* 하단: 지역 + 외부링크 */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400 flex items-center gap-1">
          <MapPin size={10} /> {r.region}
        </span>
        <ExternalLink size={12} className="text-gray-300 group-hover:text-[#ff8a3d] transition-colors" />
      </div>
    </button>
  );
}

function AIPlatformCurator() {
  const [instrument, setInstrument] = useState("전체");
  const [location,   setLocation]   = useState("전체");
  const [purpose,    setPurpose]    = useState("전체");
  const [analyzing,  setAnalyzing]  = useState(false);
  const [aiResults,  setAiResults]  = useState<PlatformResult[] | null>(null);
  const [mockResults,setMockResults]= useState<MockResult[] | null>(null);
  const [activeTab,  setActiveTab]  = useState<"ai" | "list">("ai");
  const [filterPlat, setFilterPlat] = useState<SearchPlatform | "전체">("전체");
  const [toast,      setToast]      = useState("");
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  const inst = instrument === "전체" ? "" : instrument;
  const loc  = location   === "전체" ? "" : location;
  const pur  = purpose    === "전체" ? "" : purpose;
  const hasInput = !!(inst || loc || pur);
  const keyword = [inst, loc].filter(Boolean).join(" ") || "음악 강사";

  // 조건 변경 시 디바운스 → AI 분석 애니메이션 → 결과
  useEffect(() => {
    if (!hasInput) { setAiResults(null); setMockResults(null); setAnalyzing(false); return; }
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(() => {
      setAnalyzing(true);
      setAiResults(null);
      setMockResults(null);
      setTimeout(() => {
        setAiResults(analyzePlatforms(inst, loc, pur));
        setMockResults(getMockResults(instrument, location, purpose));
        setAnalyzing(false);
      }, 1300);
    }, 350);
    return () => { if (debounce.current) clearTimeout(debounce.current); };
  }, [instrument, location, purpose]);

  // window.open — 항상 클릭 핸들러 동기 콜스택에서 실행
  const openUrl = (url: string, label: string) => {
    let win: Window | null = null;
    try { win = window.open(url, "_blank"); } catch (_) { /* ignore */ }
    if (!win) window.open(url, "_blank");
    setToast(`${label} 결과를 불러오는 중...`);
    setTimeout(() => setToast(""), 2200);
  };

  const openPlatform = (r: PlatformResult) => openUrl(r.url, `${r.platform} '${r.keyword}'`);
  const openMock     = (r: MockResult)     => openUrl(r.url, r.platform);
  const openJobSite  = (name: "워크넷" | "사람인" | "잡코리아") =>
    openUrl(getExternalJobUrl(name, keyword), `${name} '${keyword}'`);

  const sel = "flex-1 rounded-xl border-2 border-[#ff8a3d]/30 px-2 py-2.5 text-sm font-medium text-gray-700 focus:outline-none focus:border-[#ff8a3d] bg-white";

  // 통합 리스트 필터
  const visibleMock = mockResults
    ? (filterPlat === "전체" ? mockResults : mockResults.filter((r) => r.platform === filterPlat))
    : [];

  const platformCounts = mockResults
    ? (["전체", "뮬", "숨고", "당근", "크몽", "워크넷", "사람인", "잡코리아"] as const).reduce(
        (acc, p) => {
          acc[p] = p === "전체"
            ? mockResults.length
            : mockResults.filter((r) => r.platform === p).length;
          return acc;
        },
        {} as Record<string, number>,
      )
    : {};

  return (
    <div className="bg-white rounded-3xl shadow-md overflow-hidden">

      {/* 헤더 */}
      <div className="bg-gradient-to-r from-[#ff8a3d] to-[#ffb347] px-5 py-4">
        <div className="flex items-center gap-2 mb-0.5">
          <Layers size={16} className="text-white" />
          <p className="text-white font-extrabold text-base">AI 통합 음악 공고 검색</p>
        </div>
        <p className="text-white/80 text-xs">뮬·숨고·당근·크몽·워크넷·사람인·잡코리아 한 번에 검색</p>
      </div>

      {/* 필터 */}
      <div className="px-4 pt-4 pb-3 space-y-2">
        <div className="flex gap-2">
          <select value={instrument} onChange={(e) => setInstrument(e.target.value)} className={sel}>
            <option value="전체">🎵 악기</option>
            {AI_INSTRUMENTS.slice(1).map((v) => <option key={v}>{v}</option>)}
          </select>
          <select value={location} onChange={(e) => setLocation(e.target.value)} className={sel}>
            <option value="전체">📍 지역</option>
            {AI_REGIONS.slice(1).map((v) => <option key={v}>{v}</option>)}
          </select>
          <select value={purpose} onChange={(e) => setPurpose(e.target.value)} className={sel}>
            <option value="전체">🎯 목적</option>
            {AI_PURPOSES.slice(1).map((v) => <option key={v}>{v}</option>)}
          </select>
        </div>
      </div>

      {/* 분석 중 애니메이션 */}
      {analyzing && (
        <div className="px-4 pb-5">
          <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-100 rounded-2xl px-5 py-5 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-2">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-2 h-2 bg-[#ff8a3d] rounded-full inline-block"
                  style={{ animation: `bounce 0.8s ease-in-out ${i * 0.15}s infinite` }}
                />
              ))}
            </div>
            <p className="text-sm font-extrabold text-gray-700">AI가 7개 플랫폼을 동시에 검색 중...</p>
            <p className="text-xs text-gray-400 mt-1">
              {[inst, loc, pur].filter(Boolean).join(" · ")} 조건으로 최적 결과 수집 중
            </p>
          </div>
          <style>{`@keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }`}</style>
        </div>
      )}

      {/* 조건 미선택 */}
      {!hasInput && !analyzing && (
        <div className="px-4 pb-5">
          <div className="border-2 border-dashed border-orange-100 rounded-2xl py-6 text-center bg-orange-50/30">
            <p className="text-2xl mb-1">🔍</p>
            <p className="text-sm font-semibold text-gray-500">악기·지역·목적을 선택하면</p>
            <p className="text-sm text-gray-400">7개 플랫폼 통합 검색 결과를 바로 보여드립니다</p>
          </div>
        </div>
      )}

      {/* 검색 결과 */}
      {aiResults && mockResults && !analyzing && (
        <div>
          {/* 탭 */}
          <div className="flex border-b border-gray-100 px-4">
            <button
              onClick={() => setActiveTab("ai")}
              className={`flex items-center gap-1.5 px-4 py-3 text-sm font-bold border-b-2 transition-colors ${
                activeTab === "ai"
                  ? "border-[#ff8a3d] text-[#ff8a3d]"
                  : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              <Sparkles size={13} /> AI 분석
            </button>
            <button
              onClick={() => setActiveTab("list")}
              className={`flex items-center gap-1.5 px-4 py-3 text-sm font-bold border-b-2 transition-colors ${
                activeTab === "list"
                  ? "border-[#ff8a3d] text-[#ff8a3d]"
                  : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              <Layers size={13} /> 통합 리스트
              <span className="bg-[#ff8a3d] text-white text-xs font-bold rounded-full px-1.5 py-0 leading-5 min-w-[20px] text-center">
                {mockResults.length}
              </span>
            </button>
          </div>

          {/* ── AI 분석 탭 ── */}
          {activeTab === "ai" && (
            <div className="px-4 py-4 space-y-3">

              {/* 최고 매칭 카드 */}
              {(() => {
                const top = aiResults[0];
                return (
                  <div>
                    <p className="text-xs font-bold text-gray-500 mb-2">🏆 AI 최고 추천</p>
                    <button
                      onClick={() => openPlatform(top)}
                      className={`w-full ${top.accent} text-white rounded-2xl px-5 py-4 text-left transition-all active:scale-[0.98] shadow-md`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-3xl">{top.emoji}</span>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-xl leading-none">{top.platform}</span>
                              <span className="text-white/80 text-xs font-bold bg-white/20 rounded-full px-2 py-0.5">
                                매칭 {top.score}점
                              </span>
                            </div>
                            <p className="text-white/80 text-xs mt-0.5">{top.reason}</p>
                          </div>
                        </div>
                        <ExternalLink size={18} className="text-white/70 flex-shrink-0 mt-1" />
                      </div>
                      <div className="bg-white/15 rounded-xl px-3 py-2">
                        <p className="text-xs text-white/70 mb-0.5">최적화된 검색어</p>
                        <p className="font-extrabold text-sm text-white">"{top.keyword}"</p>
                      </div>
                    </button>
                  </div>
                );
              })()}

              {/* 기타 플랫폼 (뮬·숨고·당근·크몽) */}
              <p className="text-xs font-bold text-gray-500 pt-1">기타 플랫폼</p>
              <div className="space-y-2">
                {aiResults.slice(1).map((r) => (
                  <button
                    key={r.platform}
                    onClick={() => openPlatform(r)}
                    className={`w-full flex items-center gap-3 bg-white border-2 ${r.border} rounded-2xl px-4 py-3 hover:shadow-sm transition-all active:scale-[0.98] text-left`}
                  >
                    <div className={`w-10 h-10 ${r.light} rounded-xl flex items-center justify-center text-xl flex-shrink-0`}>
                      {r.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`font-extrabold text-sm ${r.textColor}`}>{r.platform}</span>
                        <Badge className={`${r.light} ${r.textColor} border-0 text-xs px-1.5 py-0 font-semibold`}>
                          {r.tag}
                        </Badge>
                        <span className="text-xs text-gray-400 ml-auto flex-shrink-0">{r.score}점</span>
                      </div>
                      <p className="text-xs text-gray-500 truncate">검색어: <span className="font-semibold text-gray-700">"{r.keyword}"</span></p>
                    </div>
                    <ExternalLink size={14} className="text-gray-300 flex-shrink-0" />
                  </button>
                ))}
              </div>

              {/* 채용사이트 3총사 */}
              <div>
                <p className="text-xs font-bold text-gray-500 pt-1 mb-2">📋 채용사이트 바로가기</p>
                <div className="grid grid-cols-3 gap-2">
                  {JOB_PLATFORMS.map((jp) => (
                    <button
                      key={jp.name}
                      onClick={() => openJobSite(jp.name)}
                      className={`flex flex-col items-center gap-1.5 ${jp.light} border border-gray-100 rounded-2xl py-3 px-2 hover:shadow-sm transition-all active:scale-[0.97]`}
                    >
                      <span className="text-2xl">{jp.emoji}</span>
                      <span className={`text-xs font-extrabold ${jp.text}`}>{jp.name}</span>
                      <span className="text-xs text-gray-400 text-center leading-tight truncate w-full text-center">
                        "{keyword}"
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 통합 리스트 CTA */}
              <button
                onClick={() => setActiveTab("list")}
                className="w-full flex items-center justify-between bg-gray-50 hover:bg-orange-50 border-2 border-dashed border-gray-200 hover:border-orange-300 rounded-2xl px-4 py-3 transition-colors group"
              >
                <div className="flex items-center gap-2">
                  <Layers size={16} className="text-gray-400 group-hover:text-[#ff8a3d]" />
                  <span className="text-sm font-bold text-gray-600 group-hover:text-[#ff8a3d]">
                    통합 리스트 보기 — {mockResults.length}개 결과 모아보기
                  </span>
                </div>
                <ChevronRight size={16} className="text-gray-400 group-hover:text-[#ff8a3d]" />
              </button>

              {/* 토스트 */}
              {toast && (
                <div className="flex items-center gap-2 bg-gray-800 text-white text-xs font-semibold rounded-xl px-4 py-3">
                  <span className="animate-spin w-3 h-3 border-2 border-white border-t-transparent rounded-full flex-shrink-0" />
                  {toast}
                </div>
              )}
            </div>
          )}

          {/* ── 통합 리스트 탭 ── */}
          {activeTab === "list" && (
            <div className="px-4 py-4 space-y-3">

              {/* 플랫폼 필터 칩 */}
              <div className="flex gap-1.5 flex-wrap">
                {(["전체", "뮬", "숨고", "당근", "크몽", "워크넷", "사람인", "잡코리아"] as const).map((p) => {
                  const cnt = platformCounts[p] ?? 0;
                  if (p !== "전체" && cnt === 0) return null;
                  const isActive = filterPlat === p;
                  const meta = p !== "전체" ? PLATFORM_META[p] : null;
                  return (
                    <button
                      key={p}
                      onClick={() => setFilterPlat(p)}
                      className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold transition-colors border ${
                        isActive
                          ? "bg-[#ff8a3d] text-white border-[#ff8a3d]"
                          : "bg-white text-gray-500 border-gray-200 hover:border-orange-300"
                      }`}
                    >
                      {meta && <span>{meta.emoji}</span>}
                      {p}
                      <span className={`rounded-full px-1 text-xs ${isActive ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"}`}>
                        {cnt}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* 결과 카드 */}
              <div className="space-y-2.5">
                {visibleMock.map((r) => (
                  <SearchResultCard key={r.id} r={r} onOpen={openMock} />
                ))}
                {visibleMock.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <p className="text-3xl mb-2">🔍</p>
                    <p className="text-sm font-semibold">해당 플랫폼 결과가 없어요</p>
                  </div>
                )}
              </div>

              {/* 채용사이트 바로가기 (하단) */}
              <div>
                <p className="text-xs font-bold text-gray-500 mb-2">📋 채용사이트에서 더 찾기</p>
                <div className="grid grid-cols-3 gap-2">
                  {JOB_PLATFORMS.map((jp) => (
                    <button
                      key={jp.name}
                      onClick={() => openJobSite(jp.name)}
                      className={`flex flex-col items-center gap-1 ${jp.light} border border-gray-100 rounded-2xl py-2.5 px-2 hover:shadow-sm transition-all active:scale-[0.97]`}
                    >
                      <span className="text-xl">{jp.emoji}</span>
                      <span className={`text-xs font-extrabold ${jp.text}`}>{jp.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 토스트 */}
              {toast && (
                <div className="flex items-center gap-2 bg-gray-800 text-white text-xs font-semibold rounded-xl px-4 py-3">
                  <span className="animate-spin w-3 h-3 border-2 border-white border-t-transparent rounded-full flex-shrink-0" />
                  {toast}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── 고정 큐레이션 공고 (직접 입력) ───────────────────────────

interface JobPost {
  id:       number;
  title:    string;
  place:    string;   // 학원명 또는 강사명
  region:   string;
  category: string;
  salary:   string;
  desc:     string;
  urgent:   boolean;
  postedAt: string;
  source:   string;   // "자체등록" | "뮬" | "당근" 등
}

const INITIAL_POSTS: JobPost[] = [
  {
    id: 1,
    title: "보컬 강사 모집 (풀타임, 즉시 출근)",
    place: "소리나무 실용음악학원",
    region: "서울 마포 (홍대입구역 5분)",
    category: "보컬", salary: "월 280만~330만",
    urgent: true, postedAt: "2026-04-14", source: "자체등록",
    desc: "입시·취미반 병행 지도 가능하신 분 우대. 경력 2년 이상. 인원 충원 시 마감.",
  },
  {
    id: 2,
    title: "재즈피아노 파트타임 강사",
    place: "블루노트 아카데미",
    region: "서울 강남 (강남구청역)",
    category: "건반", salary: "시급 4만원",
    urgent: false, postedAt: "2026-04-13", source: "자체등록",
    desc: "주 2~3회, 오후 2시~8시 가능하신 분. 재즈 이론 수업 필수. 성인 취미반 특화.",
  },
  {
    id: 3,
    title: "드럼 전임 강사 급구",
    place: "비트팩토리",
    region: "경기 성남 (야탑역 3분)",
    category: "드럼", salary: "월 260만~290만",
    urgent: true, postedAt: "2026-04-14", source: "자체등록",
    desc: "경력 무관 지원 가능. 즉시 출근 가능자 우대. 면접 후 근무 조건 협의.",
  },
  {
    id: 4,
    title: "기타 레슨합니다 — 초·중급 전문",
    place: "박준영 강사 (개인)",
    region: "경기 수원·화성 (방문 가능)",
    category: "기타", salary: "회당 5만원",
    urgent: false, postedAt: "2026-04-12", source: "자체등록",
    desc: "어쿠스틱·일렉·핑거스타일 모두 가능. 버클리 음대 졸업. 주 1회부터 시작 OK.",
  },
  {
    id: 5,
    title: "보컬 트레이닝 — K-POP · 뮤지컬 전문",
    place: "이수진 보컬 트레이너",
    region: "서울 전체 (온라인 가능)",
    category: "보컬", salary: "회당 6만원",
    urgent: false, postedAt: "2026-04-11", source: "자체등록",
    desc: "한양대 실용음악과 졸업. 입시·오디션·취미 전 레벨. 온라인 레슨 시 영상 피드백 포함.",
  },
  {
    id: 6,
    title: "미디 작곡·편곡 강사 모집",
    place: "사운드랩 아카데미",
    region: "서울 마포 (합정역)",
    category: "작곡", salary: "협의",
    urgent: false, postedAt: "2026-04-10", source: "자체등록",
    desc: "Logic Pro / Ableton 능숙하신 분. 음원 발매 경험 보유자 우대. 주 3회 이상.",
  },
  {
    id: 7,
    title: "피아노 전임 강사 구합니다",
    place: "뮤직플러스 학원",
    region: "대구 수성구",
    category: "건반", salary: "월 250만~280만",
    urgent: false, postedAt: "2026-04-09", source: "자체등록",
    desc: "어린이 입문반·성인 취미반 지도. 악보 독보 지도 가능자. 대구 거주자 우대.",
  },
  {
    id: 8,
    title: "드럼 레슨 — 초급부터 세션 준비까지",
    place: "최동욱 드럼 강사",
    region: "서울 송파 (잠실역)",
    category: "드럼", salary: "회당 5만원",
    urgent: false, postedAt: "2026-04-08", source: "자체등록",
    desc: "현직 세션 드러머. 실전 그루브 중심 레슨. 개인 방음 연습실 보유. 토·일 가능.",
  },
];

const CATEGORIES = ["전체", "보컬", "기타", "건반", "드럼", "작곡"];
const REGIONS    = ["전체", "서울", "경기", "인천", "부산", "대구", "온라인"];

const CATEGORY_COLOR: Record<string, string> = {
  보컬: "bg-pink-100 text-pink-600",
  기타: "bg-green-100 text-green-600",
  건반: "bg-blue-100 text-blue-600",
  드럼: "bg-orange-100 text-orange-600",
  작곡: "bg-purple-100 text-purple-600",
};

// ── 빈 폼 ───────────────────────────────────────────────────

const EMPTY_FORM = {
  title: "", place: "", region: "", category: "보컬",
  salary: "", desc: "", urgent: false,
};

// ── Component ────────────────────────────────────────────────

const FeedSearch = () => {
  const [query,      setQuery]      = useState("");
  const [category,   setCategory]   = useState("전체");
  const [region,     setRegion]     = useState("전체");
  const [posts,      setPosts]      = useState<JobPost[]>(INITIAL_POSTS);
  const [showForm,   setShowForm]   = useState(false);
  const [form,       setForm]       = useState({ ...EMPTY_FORM });
  const [submitted,  setSubmitted]  = useState(false);
  const [loading,    setLoading]    = useState(false);

  // Supabase에서 등록된 공고 불러오기 (INITIAL_POSTS 앞에 붙임)
  useEffect(() => {
    const fetchPosts = async () => {
      const { data, error } = await supabase
        .from("feed_posts")
        .select("*")
        .order("created_at", { ascending: false });
      if (error || !data) return;
      const mapped: JobPost[] = data.map((row) => ({
        id:       row.id,
        title:    row.title,
        place:    row.place,
        region:   row.region,
        category: row.category,
        salary:   row.salary,
        desc:     row.desc,
        urgent:   row.urgent,
        postedAt: row.posted_at,
        source:   row.source,
      }));
      setPosts([...mapped, ...INITIAL_POSTS]);
    };
    fetchPosts();
  }, []);

  // 검색·필터
  const results = posts.filter((p) => {
    const q = query.trim().toLowerCase();
    const matchQ = !q ||
      p.title.toLowerCase().includes(q) ||
      p.place.toLowerCase().includes(q) ||
      p.desc.toLowerCase().includes(q);
    const matchC = category === "전체" || p.category === category;
    const matchR = region   === "전체" || p.region.startsWith(region);
    return matchQ && matchC && matchR;
  });

  // 뮬 URL
  const muleUrl = query.trim()
    ? `https://www.mule.co.kr/bbs/info/recruit?f=title&q=${encodeURIComponent(query.trim()).replace(/%20/g, "+")}`
    : "https://www.mule.co.kr/bbs/info/recruit";

  // 공고 등록 제출 (Supabase INSERT)
  const handleSubmit = async () => {
    if (!form.title.trim() || !form.place.trim()) return;
    setLoading(true);
    const payload = {
      title:     form.title,
      place:     form.place,
      region:    form.region || "미입력",
      category:  form.category,
      salary:    form.salary || "협의",
      desc:      form.desc,
      urgent:    form.urgent,
      posted_at: new Date().toISOString().slice(0, 10),
      source:    "자체등록",
    };
    const { data, error } = await supabase
      .from("feed_posts")
      .insert(payload)
      .select()
      .single();
    setLoading(false);
    if (error || !data) {
      alert("등록 중 오류가 발생했습니다. 다시 시도해주세요.");
      return;
    }
    const newPost: JobPost = {
      id:       data.id,
      title:    data.title,
      place:    data.place,
      region:   data.region,
      category: data.category,
      salary:   data.salary,
      desc:     data.desc,
      urgent:   data.urgent,
      postedAt: data.posted_at,
      source:   data.source,
    };
    setPosts((prev) => [newPost, ...prev]);
    setForm({ ...EMPTY_FORM });
    setSubmitted(true);
    setTimeout(() => { setSubmitted(false); setShowForm(false); }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#fff9f5]">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 py-5 space-y-5">

        {/* ── AI 플랫폼 큐레이터 ── */}
        <AIPlatformCurator />

        {/* ── 타이틀 ── */}
        <div>
          <h1 className="text-2xl font-extrabold text-gray-800">📋 공고 모아보기</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            직접 등록한 공고 + 외부 사이트 바로가기
          </p>
        </div>

        {/* ── 뮬 실시간 구인 바로가기 (메인 버튼) ── */}
        <a href={muleUrl} target="_blank" rel="noopener noreferrer">
          <div className="bg-blue-600 hover:bg-blue-700 transition-colors rounded-2xl px-5 py-4 flex items-center justify-between group cursor-pointer">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🔵</span>
              <div>
                <p className="font-extrabold text-white text-base leading-tight">
                  {query.trim()
                    ? `뮬에서 "${query}" 실시간 검색`
                    : "뮬에서 실시간 구인 보기"}
                </p>
                <p className="text-blue-200 text-xs mt-0.5">
                  mule.co.kr 구인/구직 게시판 바로가기
                </p>
              </div>
            </div>
            <ArrowUpRight size={22} className="text-white opacity-70 group-hover:opacity-100 transition-opacity flex-shrink-0" />
          </div>
        </a>

        {/* ── 검색 + 필터 ── */}
        <div className="bg-white rounded-2xl border border-orange-100 p-3 space-y-3">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder='제목·학원명·설명 검색 (예: "기타 강사")'
              className="w-full rounded-xl border-2 border-orange-200 pl-9 py-2.5 text-sm font-medium text-gray-700 focus:outline-none focus:border-[#ff8a3d] bg-white"
            />
          </div>
          <div className="flex gap-2">
            <select value={category} onChange={(e) => setCategory(e.target.value)}
              className="flex-1 rounded-xl border-2 border-orange-200 px-3 py-2 text-sm font-medium text-gray-700 focus:outline-none focus:border-[#ff8a3d] bg-white">
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
            <select value={region} onChange={(e) => setRegion(e.target.value)}
              className="flex-1 rounded-xl border-2 border-orange-200 px-3 py-2 text-sm font-medium text-gray-700 focus:outline-none focus:border-[#ff8a3d] bg-white">
              {REGIONS.map((r) => <option key={r}>{r}</option>)}
            </select>
          </div>
        </div>

        {/* ── 포트폴리오 CTA ── */}
        <Link to="/">
          <div className="bg-gradient-to-r from-[#ff8a3d] to-[#ffb347] rounded-2xl px-4 py-3 flex items-center justify-between group">
            <div className="flex items-center gap-3">
              <Sparkles size={22} className="text-white flex-shrink-0" />
              <p className="text-white font-extrabold text-sm leading-tight">
                나만의 프로필 카드로 채용담당자에게 먼저 연락받기
              </p>
            </div>
            <ChevronRight size={18} className="text-white flex-shrink-0" />
          </div>
        </Link>

        {/* ── 공고 리스트 ── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="font-extrabold text-gray-800 text-base">📝 등록된 공고</h2>
              <p className="text-xs text-gray-400 mt-0.5">{results.length}개</p>
            </div>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-[#ff8a3d] hover:bg-[#e07030] text-white rounded-xl h-9 text-sm font-bold gap-1 px-4"
            >
              <Plus size={15} /> 공고 등록
            </Button>
          </div>

          <div className="space-y-3">
            {results.map((post) => (
              <Card key={post.id} className="rounded-2xl border border-orange-100 shadow-sm bg-white">
                <CardContent className="p-4">
                  {/* 상단: 뱃지 + 제목 */}
                  <div className="flex items-start gap-2 mb-2 flex-wrap">
                    {post.urgent && (
                      <Badge className="bg-red-500 text-white text-xs px-2 py-0 rounded-full flex-shrink-0">급구</Badge>
                    )}
                    <Badge className={`text-xs px-2 py-0 rounded-full border-0 flex-shrink-0 ${CATEGORY_COLOR[post.category] ?? "bg-gray-100 text-gray-500"}`}>
                      {post.category}
                    </Badge>
                    {post.source === "자체등록" && (
                      <Badge className="bg-orange-100 text-orange-500 border-0 text-xs px-2 py-0 rounded-full flex-shrink-0">자체등록</Badge>
                    )}
                  </div>
                  <p className="font-extrabold text-base text-gray-800 mb-0.5">{post.title}</p>
                  <p className="text-sm text-[#ff8a3d] font-semibold mb-2">{post.place}</p>

                  {/* 설명 */}
                  <p className="text-xs text-gray-500 leading-relaxed bg-gray-50 rounded-xl px-3 py-2 mb-3">
                    {post.desc}
                  </p>

                  {/* 하단: 정보 + 급여 */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <MapPin size={11} /> {post.region}
                      </span>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock size={11} /> {post.postedAt}
                      </span>
                    </div>
                    <span className="text-[#ff8a3d] font-extrabold text-sm whitespace-nowrap">
                      {post.salary}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}

            {results.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <p className="text-4xl mb-3">🔍</p>
                <p className="font-semibold text-gray-500">검색 결과가 없어요</p>
                <p className="text-sm mt-1">필터를 바꾸거나 직접 공고를 등록해보세요</p>
                <Button
                  onClick={() => setShowForm(true)}
                  className="mt-4 bg-[#ff8a3d] text-white rounded-xl h-9 text-sm font-bold gap-1"
                >
                  <Plus size={14} /> 첫 공고 등록하기
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Disclaimer */}
        <p className="text-center text-xs text-gray-400 pb-4 leading-relaxed">
          ⚠️ 자체 등록 공고는 MusicHub가 내용을 보증하지 않습니다.<br />
          외부 링크는 해당 사이트에서 직접 확인하세요.
        </p>
      </main>

      {/* ── 공고 등록 Sheet ── */}
      <Sheet open={showForm} onOpenChange={setShowForm}>
        <SheetContent side="bottom" className="h-[92vh] rounded-t-3xl overflow-y-auto">
          <SheetHeader className="pb-4 border-b border-gray-100">
            <SheetTitle className="text-left font-extrabold text-lg text-gray-800">
              📝 공고 등록
            </SheetTitle>
          </SheetHeader>

          {submitted ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <span className="text-6xl">🎉</span>
              <p className="font-extrabold text-gray-800 text-lg">등록 완료!</p>
              <p className="text-sm text-gray-500">공고가 리스트 상단에 추가되었습니다.</p>
            </div>
          ) : (
            <div className="py-4 space-y-4">

              {/* 제목 */}
              <div>
                <label className="text-sm font-bold text-gray-700 mb-1.5 block">
                  공고 제목 <span className="text-red-400">*</span>
                </label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="예: 보컬 강사 모집 (풀타임)"
                  className="w-full rounded-xl border-2 border-orange-200 px-4 py-3 text-sm focus:outline-none focus:border-[#ff8a3d] bg-white"
                />
              </div>

              {/* 학원/강사명 */}
              <div>
                <label className="text-sm font-bold text-gray-700 mb-1.5 block">
                  학원·강사명 <span className="text-red-400">*</span>
                </label>
                <input
                  value={form.place}
                  onChange={(e) => setForm({ ...form, place: e.target.value })}
                  placeholder="예: 소리나무 실용음악학원"
                  className="w-full rounded-xl border-2 border-orange-200 px-4 py-3 text-sm focus:outline-none focus:border-[#ff8a3d] bg-white"
                />
              </div>

              {/* 전공 + 지역 */}
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-sm font-bold text-gray-700 mb-1.5 block">전공</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full rounded-xl border-2 border-orange-200 px-3 py-3 text-sm focus:outline-none focus:border-[#ff8a3d] bg-white"
                  >
                    {["보컬", "기타", "건반", "드럼", "작곡"].map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="text-sm font-bold text-gray-700 mb-1.5 block">지역</label>
                  <input
                    value={form.region}
                    onChange={(e) => setForm({ ...form, region: e.target.value })}
                    placeholder="예: 서울 홍대"
                    className="w-full rounded-xl border-2 border-orange-200 px-3 py-3 text-sm focus:outline-none focus:border-[#ff8a3d] bg-white"
                  />
                </div>
              </div>

              {/* 급여 */}
              <div>
                <label className="text-sm font-bold text-gray-700 mb-1.5 block">급여·레슨비</label>
                <input
                  value={form.salary}
                  onChange={(e) => setForm({ ...form, salary: e.target.value })}
                  placeholder="예: 월 280만원 / 시급 4만원 / 협의"
                  className="w-full rounded-xl border-2 border-orange-200 px-4 py-3 text-sm focus:outline-none focus:border-[#ff8a3d] bg-white"
                />
              </div>

              {/* 설명 */}
              <div>
                <label className="text-sm font-bold text-gray-700 mb-1.5 block">상세 내용</label>
                <textarea
                  value={form.desc}
                  onChange={(e) => setForm({ ...form, desc: e.target.value })}
                  placeholder="자격 요건, 근무 조건, 연락처 등을 자유롭게 입력하세요"
                  rows={4}
                  className="w-full rounded-xl border-2 border-orange-200 px-4 py-3 text-sm focus:outline-none focus:border-[#ff8a3d] bg-white resize-none"
                />
              </div>

              {/* 급구 체크 */}
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.urgent}
                  onChange={(e) => setForm({ ...form, urgent: e.target.checked })}
                  className="w-5 h-5 rounded accent-[#ff8a3d]"
                />
                <span className="text-sm font-bold text-gray-700">급구 표시</span>
                <Badge className="bg-red-500 text-white text-xs px-2 py-0 rounded-full">급구</Badge>
              </label>

              {/* 제출 */}
              <Button
                onClick={handleSubmit}
                disabled={!form.title.trim() || !form.place.trim() || loading}
                className="w-full bg-[#ff8a3d] hover:bg-[#e07030] disabled:opacity-40 text-white rounded-2xl h-13 text-base font-extrabold py-4"
              >
                {loading ? "등록 중…" : "공고 등록하기"}
              </Button>

              <p className="text-center text-xs text-gray-400">
                등록된 공고는 누구나 볼 수 있으며, 새로고침 후에도 유지됩니다.
              </p>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <Footer />
    </div>
  );
};

export default FeedSearch;
