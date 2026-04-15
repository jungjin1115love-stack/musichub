import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ExternalLink, Sparkles, ArrowRight } from "lucide-react";

// ── 옵션 데이터 ──────────────────────────────────────────────

const INSTRUMENTS = ["전체", "보컬", "피아노", "기타", "드럼", "작곡·미디", "베이스", "바이올린", "색소폰"];
const REGIONS     = ["전체", "홍대", "강남", "성수", "합정", "건대", "잠실", "노원", "분당", "수원", "부산", "대구"];
const PURPOSES    = ["전체", "레슨 받기", "강사 구인", "강사 구직"];

// ── 플랫폼 정의 ──────────────────────────────────────────────

const PLATFORMS = [
  {
    name: "뮬",
    icon: "🔵",
    desc: "실용음악 전문",
    bg: "bg-blue-600 hover:bg-blue-700",
    getUrl: (kw: string) =>
      `https://www.mule.co.kr/bbs/info/recruit?f=title&q=${encodeURIComponent(kw || "음악 강사")}`,
  },
  {
    name: "당근",
    icon: "🥕",
    desc: "동네 레슨 찾기",
    bg: "bg-orange-500 hover:bg-orange-600",
    getUrl: (kw: string) =>
      `https://www.daangn.com/search/${encodeURIComponent(kw || "음악 레슨")}`,
  },
  {
    name: "숨고",
    icon: "🔮",
    desc: "전문가 매칭",
    bg: "bg-purple-600 hover:bg-purple-700",
    getUrl: (kw: string) =>
      `https://soomgo.com/search/user?q=${encodeURIComponent(kw || "음악 강사")}`,
  },
  {
    name: "크몽",
    icon: "💚",
    desc: "프리랜서 레슨",
    bg: "bg-emerald-600 hover:bg-emerald-700",
    getUrl: (kw: string) =>
      `https://kmong.com/search?keyword=${encodeURIComponent(kw || "음악 레슨")}`,
  },
];

// ── 키워드 생성 ───────────────────────────────────────────────

function buildKeyword(instrument: string, region: string, purpose: string): string {
  const parts: string[] = [];
  if (instrument !== "전체") parts.push(instrument);
  if (region !== "전체") parts.push(region);
  if (purpose === "레슨 받기") parts.push("레슨");
  else if (purpose === "강사 구인") parts.push("강사 모집");
  else if (purpose === "강사 구직") parts.push("강사");
  return parts.join(" ");
}

// ── Component ─────────────────────────────────────────────────

const PlatformGateway = () => {
  const [instrument, setInstrument] = useState("전체");
  const [region,     setRegion]     = useState("전체");
  const [purpose,    setPurpose]    = useState("전체");

  const hasFilter = instrument !== "전체" || region !== "전체" || purpose !== "전체";
  const keyword   = buildKeyword(instrument, region, purpose);

  const selectClass =
    "flex-1 rounded-xl border-2 border-orange-200 px-2 py-2.5 text-sm font-medium text-gray-700 focus:outline-none focus:border-[#ff8a3d] bg-white";

  return (
    <div className="bg-white rounded-3xl shadow-md overflow-hidden">

      {/* ── 포트폴리오 CTA ── */}
      <div className="bg-gradient-to-r from-[#ff8a3d] to-[#ffb347] px-5 py-4">
        <p className="text-white font-extrabold text-base leading-snug mb-0.5">
          🎯 외부에서 찾기 전에, MusicHub 전용 프로필 카드부터 만드세요!
        </p>
        <p className="text-white/80 text-xs mb-3">
          지원할 때 링크 하나면 끝납니다 — 연주 영상 + 커리큘럼 + 카톡 연결까지
        </p>
        <Link to="/">
          <Button className="bg-white text-[#ff8a3d] hover:bg-yellow-50 font-extrabold rounded-xl h-10 text-sm gap-1.5 shadow-sm">
            <Sparkles size={14} /> 내 프로필 카드 만들기
          </Button>
        </Link>
      </div>

      {/* ── 필터 ── */}
      <div className="px-5 pt-5 pb-4">
        <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">
          조건 선택 후 플랫폼으로 바로 이동
        </p>
        <div className="flex gap-2">
          <select value={instrument} onChange={(e) => setInstrument(e.target.value)} className={selectClass}>
            <option value="전체">🎵 악기 전체</option>
            {INSTRUMENTS.slice(1).map((i) => <option key={i}>{i}</option>)}
          </select>
          <select value={region} onChange={(e) => setRegion(e.target.value)} className={selectClass}>
            <option value="전체">📍 지역 전체</option>
            {REGIONS.slice(1).map((r) => <option key={r}>{r}</option>)}
          </select>
          <select value={purpose} onChange={(e) => setPurpose(e.target.value)} className={selectClass}>
            <option value="전체">🎯 목적 전체</option>
            {PURPOSES.slice(1).map((p) => <option key={p}>{p}</option>)}
          </select>
        </div>

        {/* 선택된 키워드 미리보기 */}
        {hasFilter && (
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xs text-gray-400">검색어:</span>
            <span className="text-xs font-bold text-[#ff8a3d] bg-orange-50 rounded-full px-2.5 py-1">
              {keyword || "전체"}
            </span>
          </div>
        )}
      </div>

      {/* ── 플랫폼 버튼 (조건 선택 시 표시) ── */}
      {hasFilter && (
        <div className="px-5 pb-5 pt-1">
          <p className="text-xs font-bold text-gray-500 mb-3">
            아래 플랫폼에서 <span className="text-[#ff8a3d]">"{keyword}"</span> 검색하기
          </p>
          <div className="grid grid-cols-2 gap-3">
            {PLATFORMS.map((p) => (
              <a
                key={p.name}
                href={p.getUrl(keyword)}
                target="_blank"
                rel="noopener noreferrer"
                className={`${p.bg} text-white rounded-2xl px-4 py-3.5 flex items-center justify-between transition-colors group`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{p.icon}</span>
                  <div>
                    <p className="font-extrabold text-base leading-tight">{p.name}</p>
                    <p className="text-white/70 text-xs">{p.desc}</p>
                  </div>
                </div>
                <ExternalLink size={16} className="opacity-60 group-hover:opacity-100 transition-opacity flex-shrink-0" />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* 조건 미선택 시 안내 */}
      {!hasFilter && (
        <div className="px-5 pb-5">
          <div className="border-2 border-dashed border-orange-200 rounded-2xl py-5 text-center">
            <p className="text-2xl mb-1">👆</p>
            <p className="text-sm font-semibold text-gray-500">악기·지역·목적을 선택하면</p>
            <p className="text-sm text-gray-400">뮬·당근·숨고·크몽 바로가기 버튼이 나타납니다</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlatformGateway;
