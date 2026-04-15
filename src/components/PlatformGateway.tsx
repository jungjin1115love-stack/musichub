import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Sparkles, Copy, Check, Bookmark, X } from "lucide-react";

// ── 옵션 ─────────────────────────────────────────────────────

const INSTRUMENTS = ["전체", "보컬", "피아노", "기타", "드럼", "작곡·미디", "베이스", "바이올린", "색소폰"];
const REGIONS     = ["전체", "홍대", "강남", "성수", "합정", "건대", "잠실", "노원", "분당", "수원", "부산", "대구"];
const PURPOSES    = ["전체", "레슨 받기", "강사 구인", "강사 구직"];

// ── 플랫폼 정의 ──────────────────────────────────────────────

const PLATFORMS = [
  {
    name: "뮬",
    icon: "🔵",
    iconBg: "bg-blue-100",
    desc: "실용음악인의 전통 구인·구직 커뮤니티",
    tips: ["전문가 위주", "구인 전문"],
    tipColor: "bg-blue-100 text-blue-600",
    border: "border-blue-200",
    getUrl: (kw: string) =>
      `https://www.mule.co.kr/bbs/info/recruit?f=title&q=${encodeURIComponent(kw || "음악 강사")}`,
  },
  {
    name: "당근",
    icon: "🥕",
    iconBg: "bg-orange-100",
    desc: "위치 기반 동네 레슨·구인 찾기",
    tips: ["동네 기반", "입문자 많음"],
    tipColor: "bg-orange-100 text-orange-600",
    border: "border-orange-200",
    getUrl: (kw: string) =>
      `https://www.daangn.com/search/${encodeURIComponent(kw || "음악 레슨")}`,
  },
  {
    name: "숨고",
    icon: "🔮",
    iconBg: "bg-purple-100",
    desc: "리뷰 기반 전문가 매칭 플랫폼",
    tips: ["매칭 최적", "리뷰 검증"],
    tipColor: "bg-purple-100 text-purple-600",
    border: "border-purple-200",
    getUrl: (kw: string) =>
      `https://soomgo.com/search/user?q=${encodeURIComponent(kw || "음악 강사")}`,
  },
  {
    name: "크몽",
    icon: "💚",
    iconBg: "bg-emerald-100",
    desc: "단기·프리랜서 레슨 의뢰 전문",
    tips: ["프리랜서", "단기 레슨"],
    tipColor: "bg-emerald-100 text-emerald-600",
    border: "border-emerald-200",
    getUrl: (kw: string) =>
      `https://kmong.com/search?keyword=${encodeURIComponent(kw || "음악 레슨")}`,
  },
];

// ── 타입 ─────────────────────────────────────────────────────

interface SavedCondition {
  instrument: string;
  region:     string;
  purpose:    string;
  label:      string;
}

const LS_KEY = "musichub_saved_conditions";

function loadSaved(): SavedCondition[] {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveCondition(cond: SavedCondition) {
  const prev = loadSaved().filter((c) => c.label !== cond.label);
  localStorage.setItem(LS_KEY, JSON.stringify([cond, ...prev].slice(0, 5)));
}

function deleteCondition(label: string) {
  const next = loadSaved().filter((c) => c.label !== label);
  localStorage.setItem(LS_KEY, JSON.stringify(next));
}

function buildKeyword(instrument: string, region: string, purpose: string): string {
  const parts: string[] = [];
  if (instrument !== "전체") parts.push(instrument);
  if (region !== "전체")     parts.push(region);
  if (purpose === "레슨 받기")  parts.push("레슨");
  else if (purpose === "강사 구인") parts.push("강사 모집");
  else if (purpose === "강사 구직") parts.push("강사");
  return parts.join(" ");
}

function buildLabel(instrument: string, region: string, purpose: string): string {
  return [instrument, region, purpose]
    .filter((v) => v !== "전체")
    .join(" · ") || "전체";
}

// ── Component ─────────────────────────────────────────────────

const PlatformGateway = () => {
  const [instrument, setInstrument] = useState("전체");
  const [region,     setRegion]     = useState("전체");
  const [purpose,    setPurpose]    = useState("전체");
  const [saved,      setSaved]      = useState<SavedCondition[]>([]);
  const [copied,     setCopied]     = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => { setSaved(loadSaved()); }, []);

  const hasFilter = instrument !== "전체" || region !== "전체" || purpose !== "전체";
  const keyword   = buildKeyword(instrument, region, purpose);
  const label     = buildLabel(instrument, region, purpose);

  const profileUrl = window.location.origin;

  const handleSave = () => {
    const cond: SavedCondition = { instrument, region, purpose, label };
    saveCondition(cond);
    setSaved(loadSaved());
    setBookmarked(true);
    setTimeout(() => setBookmarked(false), 1500);
  };

  const handleRestore = (c: SavedCondition) => {
    setInstrument(c.instrument);
    setRegion(c.region);
    setPurpose(c.purpose);
  };

  const handleDelete = (lbl: string) => {
    deleteCondition(lbl);
    setSaved(loadSaved());
  };

  const handleCopyProfile = () => {
    navigator.clipboard.writeText(profileUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const selectClass =
    "flex-1 rounded-xl border-2 border-orange-200 px-2 py-2.5 text-sm font-medium text-gray-700 focus:outline-none focus:border-[#ff8a3d] bg-white min-w-0";

  return (
    <div className="bg-white rounded-3xl shadow-md overflow-hidden">

      {/* ── 포트폴리오 CTA ── */}
      <div className="bg-gradient-to-r from-[#ff8a3d] to-[#ffb347] px-5 py-4">
        <p className="text-white font-extrabold text-base leading-snug mb-0.5">
          🎯 외부에서 찾기 전에, MusicHub 프로필 카드부터 만드세요!
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

      {/* ── 나의 검색 조건 ── */}
      {saved.length > 0 && (
        <div className="px-5 pt-4 pb-0">
          <p className="text-xs font-bold text-gray-500 mb-2">⭐ 나의 검색 조건</p>
          <div className="flex flex-wrap gap-2">
            {saved.map((c) => (
              <div
                key={c.label}
                className="flex items-center gap-1 bg-orange-50 border border-orange-200 rounded-full pl-3 pr-1.5 py-1"
              >
                <button
                  onClick={() => handleRestore(c)}
                  className="text-xs font-semibold text-orange-600 hover:text-[#ff8a3d] transition-colors"
                >
                  {c.label}
                </button>
                <button
                  onClick={() => handleDelete(c.label)}
                  className="text-gray-300 hover:text-red-400 transition-colors ml-0.5"
                >
                  <X size={11} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 필터 ── */}
      <div className="px-5 pt-4 pb-3">
        <p className="text-xs font-bold text-gray-500 mb-2">조건 선택 후 플랫폼으로 바로 이동</p>
        <div className="flex gap-2 mb-2">
          <select value={instrument} onChange={(e) => setInstrument(e.target.value)} className={selectClass}>
            <option value="전체">🎵 악기</option>
            {INSTRUMENTS.slice(1).map((i) => <option key={i}>{i}</option>)}
          </select>
          <select value={region} onChange={(e) => setRegion(e.target.value)} className={selectClass}>
            <option value="전체">📍 지역</option>
            {REGIONS.slice(1).map((r) => <option key={r}>{r}</option>)}
          </select>
          <select value={purpose} onChange={(e) => setPurpose(e.target.value)} className={selectClass}>
            <option value="전체">🎯 목적</option>
            {PURPOSES.slice(1).map((p) => <option key={p}>{p}</option>)}
          </select>
        </div>

        {/* 키워드 미리보기 + 저장 버튼 */}
        {hasFilter && (
          <div className="flex items-center justify-between gap-2 mt-1">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs text-gray-400 flex-shrink-0">검색어:</span>
              <span className="text-xs font-bold text-[#ff8a3d] bg-orange-50 rounded-full px-2.5 py-1 truncate">
                {keyword}
              </span>
            </div>
            <button
              onClick={handleSave}
              className="flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-[#ff8a3d] transition-colors flex-shrink-0"
            >
              {bookmarked
                ? <><Check size={13} className="text-green-500" /> 저장됨</>
                : <><Bookmark size={13} /> 조건 저장</>
              }
            </button>
          </div>
        )}
      </div>

      {/* ── 조건 선택 시 표시 ── */}
      {hasFilter && (
        <div className="px-5 pb-5 space-y-3">

          {/* 프로필 링크 복사 */}
          <button
            onClick={handleCopyProfile}
            className="w-full flex items-center justify-between gap-3 bg-gray-50 hover:bg-orange-50 border-2 border-dashed border-gray-200 hover:border-orange-300 rounded-2xl px-4 py-3 transition-colors group"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="text-xl flex-shrink-0">🔗</span>
              <div className="text-left min-w-0">
                <p className="text-sm font-bold text-gray-700 group-hover:text-[#ff8a3d] transition-colors leading-tight">
                  지원할 때 쓸 내 프로필 링크 복사하기
                </p>
                <p className="text-xs text-gray-400 truncate">{profileUrl}</p>
              </div>
            </div>
            <div className="flex-shrink-0">
              {copied
                ? <Check size={18} className="text-green-500" />
                : <Copy size={16} className="text-gray-400 group-hover:text-[#ff8a3d] transition-colors" />
              }
            </div>
          </button>

          {/* 플랫폼 섹션 제목 */}
          <p className="text-xs font-bold text-gray-500 pt-1">
            <span className="text-[#ff8a3d]">"{keyword}"</span> 으로 검색하기
          </p>

          {/* 플랫폼 카드 목록 */}
          <div className="space-y-2.5">
            {PLATFORMS.map((p) => (
              <a
                key={p.name}
                href={p.getUrl(keyword)}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-3 bg-white border-2 ${p.border} rounded-2xl px-4 py-3 hover:shadow-md transition-all group`}
              >
                {/* 아이콘 */}
                <div className={`w-11 h-11 rounded-xl ${p.iconBg} flex items-center justify-center text-xl flex-shrink-0`}>
                  {p.icon}
                </div>

                {/* 내용 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                    <span className="font-extrabold text-gray-800 text-sm">{p.name}</span>
                    {p.tips.map((tip) => (
                      <Badge key={tip} className={`${p.tipColor} border-0 text-xs px-1.5 py-0 rounded-full font-semibold`}>
                        {tip}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 truncate">{p.desc}</p>
                </div>

                {/* 화살표 */}
                <ExternalLink
                  size={16}
                  className="text-gray-300 group-hover:text-[#ff8a3d] transition-colors flex-shrink-0"
                />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* ── 조건 미선택 안내 ── */}
      {!hasFilter && (
        <div className="px-5 pb-5">
          <div className="border-2 border-dashed border-orange-100 rounded-2xl py-5 text-center bg-orange-50/30">
            <p className="text-2xl mb-1">👆</p>
            <p className="text-sm font-semibold text-gray-500">악기·지역·목적을 선택하면</p>
            <p className="text-sm text-gray-400">뮬·당근·숨고·크몽 바로가기가 나타납니다</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlatformGateway;
