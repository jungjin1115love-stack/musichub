import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Clock, ExternalLink, Search, X, ArrowUpRight, Sparkles } from "lucide-react";

// ── 외부 플랫폼 다이렉트 링크 설정 ──────────────────────────

interface PlatformLink {
  id:         string;
  name:       string;
  emoji:      string;
  desc:       string;
  bgColor:    string;
  textColor:  string;
  baseUrl:    string;
  searchUrl:  (q: string) => string;
}

const PLATFORM_LINKS: PlatformLink[] = [
  {
    id: "mule", name: "뮬(Mule)", emoji: "🔵",
    desc: "실용음악 전문 커뮤니티 · 구인/구직",
    bgColor: "bg-blue-50", textColor: "text-blue-700",
    baseUrl: "https://www.mule.co.kr/bbs/board.php?bo_table=job",
    searchUrl: (q) =>
      `https://www.mule.co.kr/bbs/search.php?sfl=wr_subject%7Cwr_content&stx=${encodeURIComponent(q)}&bo_table=job`,
  },
  {
    id: "daangn", name: "당근마켓", emoji: "🟠",
    desc: "우리 동네 음악 레슨 · 악기 거래",
    bgColor: "bg-orange-50", textColor: "text-orange-700",
    baseUrl: "https://www.daangn.com/search/음악%20레슨",
    searchUrl: (q) =>
      `https://www.daangn.com/search/${encodeURIComponent(q)}`,
  },
  {
    id: "soomgo", name: "숨고", emoji: "🟣",
    desc: "전문 강사 매칭 서비스",
    bgColor: "bg-purple-50", textColor: "text-purple-700",
    baseUrl: "https://soomgo.com/profile/search?term=음악",
    searchUrl: (q) =>
      `https://soomgo.com/profile/search?term=${encodeURIComponent(q)}`,
  },
  {
    id: "kmong", name: "크몽", emoji: "🟣",
    desc: "음악 레슨 · 작곡 전문 프리랜서",
    bgColor: "bg-violet-50", textColor: "text-violet-700",
    baseUrl: "https://kmong.com/search?type=gigs&keyword=음악+레슨",
    searchUrl: (q) =>
      `https://kmong.com/search?type=gigs&keyword=${encodeURIComponent(q)}`,
  },
];

// ── 큐레이션 더미 데이터 (직접 입력 추천 공고) ──────────────

type Platform = "뮬" | "당근" | "숨고" | "크몽";

const CURATED_ITEMS = [
  {
    id: 1, platform: "뮬" as Platform,
    title: "보컬 강사 구인 (홍대 학원, 풀타임)",
    region: "서울 마포", category: "보컬", time: "23분 전",
    url: "https://www.mule.co.kr/bbs/board.php?bo_table=job",
    desc: "경력 2년 이상, 입시·취미반 병행 지도 가능하신 분. 월 300만원 이상.",
  },
  {
    id: 2, platform: "뮬" as Platform,
    title: "기타 강사 파트타임 모집 — 즉시 출근 가능자 우대",
    region: "서울 강남", category: "기타", time: "1시간 전",
    url: "https://www.mule.co.kr/bbs/board.php?bo_table=job",
    desc: "주 3회, 오후 2~8시 가능하신 분. 시급 4만원. 어쿠스틱/일렉 모두 환영.",
  },
  {
    id: 3, platform: "뮬" as Platform,
    title: "드럼 전임 강사 급구 (경기 성남)",
    region: "경기 성남", category: "드럼", time: "2시간 전",
    url: "https://www.mule.co.kr/bbs/board.php?bo_table=job",
    desc: "비트팩토리 학원. 경력 무관 지원 가능. 면접 후 즉시 채용.",
  },
  {
    id: 4, platform: "당근" as Platform,
    title: "기타 레슨 합니다 — 초보자 환영 (부평)",
    region: "인천 부평", category: "기타", time: "15분 전",
    url: "https://www.daangn.com/search/기타%20레슨",
    desc: "10년 경력 기타 강사. 집 근처 방문 레슨 가능. 회당 4만원.",
  },
  {
    id: 5, platform: "당근" as Platform,
    title: "우리 동네 보컬 레슨 (홍대·합정 근처)",
    region: "서울 마포", category: "보컬", time: "45분 전",
    url: "https://www.daangn.com/search/보컬%20레슨",
    desc: "버클리 음대 출신. K-POP·팝 보컬 전문. 주 1회부터 시작 가능.",
  },
  {
    id: 6, platform: "숨고" as Platform,
    title: "전문 보컬 트레이너 — 음대 출신, 온/오프라인",
    region: "서울 전체", category: "보컬", time: "30분 전",
    url: "https://soomgo.com/profile/search?term=보컬",
    desc: "한양대 실용음악과. 입시·오디션 전문. 온라인 레슨 가능. 회당 6만원~.",
  },
  {
    id: 7, platform: "숨고" as Platform,
    title: "기타 강사 — 어쿠스틱·일렉·핑거스타일 전문",
    region: "서울·경기", category: "기타", time: "1시간 전",
    url: "https://soomgo.com/profile/search?term=기타",
    desc: "버클리 음대 졸업. 유튜브 1만 구독자. 입문~고급 전 레벨.",
  },
  {
    id: 8, platform: "크몽" as Platform,
    title: "1:1 기타 레슨 패키지 (4회/월)",
    region: "온라인·서울", category: "기타", time: "2시간 전",
    url: "https://kmong.com/search?type=gigs&keyword=기타+레슨",
    desc: "4회 패키지 20만원. 입문자 맞춤 커리큘럼. 악보 제공.",
  },
  {
    id: 9, platform: "크몽" as Platform,
    title: "보컬 레슨 — 영상 피드백 포함 온라인 패키지",
    region: "온라인", category: "보컬", time: "4시간 전",
    url: "https://kmong.com/search?type=gigs&keyword=보컬+레슨",
    desc: "매 수업 영상 녹화 후 세부 피드백 제공. 월 8회 기준 30만원.",
  },
  {
    id: 10, platform: "뮬" as Platform,
    title: "미디/작곡 강사 모집 (서울 마포)",
    region: "서울 마포", category: "작곡", time: "3시간 전",
    url: "https://www.mule.co.kr/bbs/board.php?bo_table=job",
    desc: "Logic Pro / Ableton 능숙하신 분. 대학 강의 경력 우대. 협의.",
  },
];

const PLATFORM_STYLE: Record<Platform, { bg: string; text: string; dot: string }> = {
  뮬:  { bg: "bg-blue-100",   text: "text-blue-600",   dot: "bg-blue-500" },
  당근: { bg: "bg-orange-100", text: "text-orange-600", dot: "bg-orange-500" },
  숨고: { bg: "bg-purple-100", text: "text-purple-600", dot: "bg-purple-500" },
  크몽: { bg: "bg-violet-100", text: "text-violet-600", dot: "bg-violet-500" },
};

const PLATFORMS: Array<Platform | "전체"> = ["전체", "뮬", "당근", "숨고", "크몽"];
const CATEGORIES = ["전체", "보컬", "기타", "건반", "드럼", "작곡"];

// ── Component ─────────────────────────────────────────────────

const FeedSearch = () => {
  const [query,    setQuery]    = useState("");
  const [platform, setPlatform] = useState<Platform | "전체">("전체");
  const [category, setCategory] = useState("전체");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CURATED_ITEMS.filter((item) => {
      const matchQuery =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.region.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.desc.toLowerCase().includes(q);
      const matchPlatform = platform === "전체" || item.platform === platform;
      const matchCategory = category === "전체" || item.category === category;
      return matchQuery && matchPlatform && matchCategory;
    });
  }, [query, platform, category]);

  return (
    <div className="min-h-screen bg-[#fff9f5]">
      <Navbar />

      {/* Top banner */}
      <div className="bg-gradient-to-r from-[#ff8a3d] to-[#ffb347] px-4 py-3">
        <p className="max-w-2xl mx-auto text-white text-sm font-semibold text-center">
          📋 뮬 · 당근 · 숨고 · 크몽의 음악 정보를 한 곳에서 확인하세요
        </p>
      </div>

      <main className="max-w-2xl mx-auto px-4 py-5 space-y-5">

        {/* ── 점검 안내 배너 ── */}
        <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl flex-shrink-0">🔧</span>
            <div>
              <p className="font-extrabold text-amber-800 text-sm mb-1">
                실시간 모아보기 기능 점검 중
              </p>
              <p className="text-xs text-amber-700 leading-relaxed">
                현재 외부 사이트 보안 정책으로 인해 실시간 모아보기 기능이 점검 중입니다.
                대신 아래 버튼을 통해 <strong>가장 빠르게 최신 정보</strong>를 확인하실 수 있습니다.
              </p>
            </div>
          </div>
        </div>

        {/* ── 포트폴리오 CTA ── */}
        <div className="bg-gradient-to-br from-[#ff8a3d] to-[#e85d00] rounded-3xl p-5 text-white">
          <div className="flex items-start gap-3 mb-4">
            <span className="text-3xl">🎵</span>
            <div>
              <p className="font-extrabold text-lg leading-tight">
                나만의 프로필 카드로<br />구인 담당자에게 먼저 연락받으세요
              </p>
              <p className="text-white/75 text-xs mt-1">
                연주 영상 + 커리큘럼 카드 하나로 뮬·인스타 공유 가능
              </p>
            </div>
          </div>
          <Link to="/">
            <Button className="w-full bg-white text-[#ff8a3d] hover:bg-yellow-50 font-extrabold rounded-xl h-12 text-base gap-2 shadow-md">
              <Sparkles size={18} />
              나만의 프로필 카드 만들기 (무료)
            </Button>
          </Link>
        </div>

        {/* ── 외부 플랫폼 다이렉트 링크 버튼 ── */}
        <div>
          <h2 className="font-extrabold text-gray-800 text-base mb-3">
            🔗 외부 플랫폼 바로가기
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {PLATFORM_LINKS.map((pl) => {
              const url = query.trim() ? pl.searchUrl(query.trim()) : pl.baseUrl;
              return (
                <a
                  key={pl.id}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${pl.bgColor} ${pl.textColor} rounded-2xl p-4 flex flex-col gap-2 border border-transparent hover:border-current transition-all group`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xl">{pl.emoji}</span>
                    <ArrowUpRight size={15} className="opacity-50 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="font-extrabold text-sm leading-tight">{pl.name}</p>
                  <p className="text-xs opacity-70 leading-tight">{pl.desc}</p>
                  {query.trim() && (
                    <Badge className={`${pl.bgColor} ${pl.textColor} border border-current text-xs px-2 py-0 w-fit mt-1 font-semibold`}>
                      "{query}" 검색
                    </Badge>
                  )}
                </a>
              );
            })}
          </div>
          {query.trim() && (
            <p className="text-xs text-gray-400 mt-2 text-center">
              각 플랫폼에서 "<span className="text-[#ff8a3d] font-semibold">{query}</span>" 검색 결과로 바로 이동합니다
            </p>
          )}
        </div>

        {/* ── 큐레이션 공고 리스트 ── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-extrabold text-gray-800 text-base">
              ✍️ 추천 공고 모음
            </h2>
            <Badge className="bg-orange-100 text-orange-600 border-0 text-xs">직접 큐레이션</Badge>
          </div>

          {/* 검색 + 필터 */}
          <div className="bg-white rounded-2xl border border-orange-100 p-3 mb-4 space-y-3">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder='예) "기타 강사", "보컬 레슨"'
                className="w-full rounded-xl border-2 border-orange-200 pl-9 pr-9 py-2.5 text-sm font-medium text-gray-700 focus:outline-none focus:border-[#ff8a3d] bg-white"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as Platform | "전체")}
                className="flex-1 rounded-xl border-2 border-orange-200 px-2 py-2 text-sm font-medium text-gray-700 focus:outline-none focus:border-[#ff8a3d] bg-white"
              >
                {PLATFORMS.map((p) => <option key={p}>{p}</option>)}
              </select>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="flex-1 rounded-xl border-2 border-orange-200 px-2 py-2 text-sm font-medium text-gray-700 focus:outline-none focus:border-[#ff8a3d] bg-white"
              >
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <p className="text-xs text-gray-400 mb-3">{results.length}개의 추천 공고</p>

          <div className="space-y-3">
            {results.map((item) => {
              const style = PLATFORM_STYLE[item.platform];
              return (
                <Card key={item.id} className="rounded-2xl border border-orange-100 shadow-sm bg-white">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-2 mb-2">
                      <Badge className={`${style.bg} ${style.text} border-0 text-xs px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5 gap-1`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${style.dot} inline-block`} />
                        {item.platform}
                      </Badge>
                      <p className="font-bold text-sm text-gray-800 leading-tight">{item.title}</p>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed mb-3">{item.desc}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <MapPin size={11} /> {item.region}
                        </span>
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Clock size={11} /> {item.time}
                        </span>
                        <Badge variant="outline" className="text-xs px-2 py-0 rounded-full border-orange-200 text-orange-400">
                          {item.category}
                        </Badge>
                      </div>
                      <a href={item.url} target="_blank" rel="noopener noreferrer">
                        <Button
                          size="sm"
                          className={`${style.bg} ${style.text} border-0 hover:opacity-80 rounded-xl h-8 text-xs font-bold gap-1 shadow-none`}
                        >
                          <ExternalLink size={12} />
                          원문 보기
                        </Button>
                      </a>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {results.length === 0 && (
              <div className="text-center py-10 text-gray-400">
                <p className="text-4xl mb-3">🔍</p>
                <p className="font-semibold text-gray-500">검색 결과가 없어요</p>
                <p className="text-sm mt-1">위의 플랫폼 버튼에서 직접 검색해보세요</p>
              </div>
            )}
          </div>
        </div>

        {/* Disclaimer */}
        <p className="text-center text-xs text-gray-400 pb-6 leading-relaxed">
          ⚠️ 이 정보는 외부 사이트(뮬, 당근마켓, 숨고, 크몽)에서 제공된 정보입니다.<br />
          정확한 내용은 원문 링크에서 직접 확인해주세요.
        </p>
      </main>
    </div>
  );
};

export default FeedSearch;
