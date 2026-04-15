import { useState, useMemo, useEffect, useRef } from "react";
import Navbar from "@/components/layout/Navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Clock, ExternalLink, Search, X, RefreshCw, Wifi, WifiOff } from "lucide-react";
import { checkServerHealth, fetchMuleJobs, searchFeed, type ScrapedItem } from "@/lib/scrapers/feedClient";

// ── Types ─────────────────────────────────────────────────────

type Platform = "뮬" | "당근" | "숨고" | "크몽";

interface FeedItem {
  id: number;
  platform: Platform;
  title: string;
  region: string;
  category: string;
  time: string;
  url: string;
  desc: string;
}

// ── Dummy Data (15개) ─────────────────────────────────────────

const FEED_ITEMS: FeedItem[] = [
  // 뮬
  {
    id: 1, platform: "뮬",
    title: "보컬 강사 구인 (홍대 학원, 풀타임)",
    region: "서울 마포", category: "보컬", time: "23분 전",
    url: "https://www.mule.co.kr/",
    desc: "경력 2년 이상, 입시·취미반 병행 지도 가능하신 분. 월 300만원 이상.",
  },
  {
    id: 2, platform: "뮬",
    title: "기타 강사 파트타임 모집 — 즉시 출근 가능자 우대",
    region: "서울 강남", category: "기타", time: "1시간 전",
    url: "https://www.mule.co.kr/",
    desc: "주 3회, 오후 2~8시 가능하신 분. 시급 4만원. 어쿠스틱/일렉 모두 환영.",
  },
  {
    id: 3, platform: "뮬",
    title: "드럼 전임 강사 급구 (경기 성남)",
    region: "경기 성남", category: "드럼", time: "2시간 전",
    url: "https://www.mule.co.kr/",
    desc: "비트팩토리 학원. 경력 무관 지원 가능. 면접 후 즉시 채용.",
  },
  {
    id: 4, platform: "뮬",
    title: "피아노/재즈 강사 찾습니다 (강남·서초)",
    region: "서울 서초", category: "건반", time: "4시간 전",
    url: "https://www.mule.co.kr/",
    desc: "재즈 이론 수업 가능하신 분. 성인 취미반 특화. 시급 협의.",
  },
  // 당근
  {
    id: 5, platform: "당근",
    title: "기타 레슨 합니다 — 초보자 환영 (부평)",
    region: "인천 부평", category: "기타", time: "15분 전",
    url: "https://www.daangn.com/",
    desc: "10년 경력 기타 강사. 집 근처 방문 레슨 가능. 회당 4만원.",
  },
  {
    id: 6, platform: "당근",
    title: "우리 동네 보컬 레슨 (홍대·합정 근처)",
    region: "서울 마포", category: "보컬", time: "45분 전",
    url: "https://www.daangn.com/",
    desc: "버클리 음대 출신. K-POP·팝 보컬 전문. 주 1회부터 시작 가능.",
  },
  {
    id: 7, platform: "당근",
    title: "피아노 방문 레슨 — 어린이·성인 모두 OK",
    region: "경기 수원", category: "건반", time: "2시간 전",
    url: "https://www.daangn.com/",
    desc: "20년 경력 피아노 강사. 수원·화성 지역 방문 레슨. 월 12만원.",
  },
  {
    id: 8, platform: "당근",
    title: "드럼 개인 레슨 (전자드럼 보유, 잠실)",
    region: "서울 송파", category: "드럼", time: "5시간 전",
    url: "https://www.daangn.com/",
    desc: "집에 방음 연습실 보유. 초급~중급 대상. 회당 5만원.",
  },
  // 숨고
  {
    id: 9, platform: "숨고",
    title: "전문 보컬 트레이너 — 음대 출신, 온/오프라인",
    region: "서울 전체", category: "보컬", time: "30분 전",
    url: "https://soomgo.com/",
    desc: "한양대 실용음악과. 입시·오디션 전문. 온라인 레슨 가능. 회당 6만원~.",
  },
  {
    id: 10, platform: "숨고",
    title: "기타 강사 — 어쿠스틱·일렉·핑거스타일 전문",
    region: "서울·경기", category: "기타", time: "1시간 전",
    url: "https://soomgo.com/",
    desc: "버클리 음대 졸업. 유튜브 1만 구독자. 입문~고급 전 레벨.",
  },
  {
    id: 11, platform: "숨고",
    title: "미디·작곡 레슨 — Logic Pro / Ableton 전문",
    region: "온라인", category: "작곡", time: "3시간 전",
    url: "https://soomgo.com/",
    desc: "현직 작·편곡가. 음원 발매 경험 다수. 초급부터 프로급까지.",
  },
  {
    id: 12, platform: "숨고",
    title: "드럼 레슨 전문가 — 입문~세션 준비까지",
    region: "서울 강북", category: "드럼", time: "6시간 전",
    url: "https://soomgo.com/",
    desc: "현직 세션 드러머. 실전 그루브 중심 레슨. 회당 7만원.",
  },
  // 크몽
  {
    id: 13, platform: "크몽",
    title: "1:1 기타 레슨 패키지 (4회/월)",
    region: "온라인·서울", category: "기타", time: "2시간 전",
    url: "https://kmong.com/",
    desc: "4회 패키지 20만원. 입문자 맞춤 커리큘럼. 악보 제공.",
  },
  {
    id: 14, platform: "크몽",
    title: "보컬 레슨 — 영상 피드백 포함 온라인 패키지",
    region: "온라인", category: "보컬", time: "4시간 전",
    url: "https://kmong.com/",
    desc: "매 수업 영상 녹화 후 세부 피드백 제공. 월 8회 기준 30만원.",
  },
  {
    id: 15, platform: "크몽",
    title: "피아노 초급 완성 패키지 — 3개월 집중 과정",
    region: "온라인", category: "건반", time: "7시간 전",
    url: "https://kmong.com/",
    desc: "3개월 안에 좋아하는 곡 연주 가능하도록. 악보·교재 포함.",
  },
];

// ── Constants ────────────────────────────────────────────────

const PLATFORM_STYLE: Record<Platform, { bg: string; text: string; dot: string }> = {
  뮬:  { bg: "bg-blue-100",   text: "text-blue-600",   dot: "bg-blue-500" },
  당근: { bg: "bg-orange-100", text: "text-orange-600", dot: "bg-orange-500" },
  숨고: { bg: "bg-purple-100", text: "text-purple-600", dot: "bg-purple-500" },
  크몽: { bg: "bg-purple-100", text: "text-purple-600", dot: "bg-purple-500" },
};

const PLATFORMS: Array<Platform | "전체"> = ["전체", "뮬", "당근", "숨고", "크몽"];
const CATEGORIES = ["전체", "보컬", "기타", "건반", "드럼", "작곡"];

// ── Component ─────────────────────────────────────────────────

// FeedItem 타입을 ScrapedItem과 로컬 더미 데이터 양쪽에 사용할 수 있도록 통일
type FeedItemUnified = FeedItem | ScrapedItem;

const FeedSearch = () => {
  const [query,       setQuery]       = useState("");
  const [platform,    setPlatform]    = useState<Platform | "전체">("전체");
  const [category,    setCategory]    = useState("전체");
  const [serverOnline, setServerOnline] = useState<boolean | null>(null); // null=확인중
  const [liveItems,   setLiveItems]   = useState<ScrapedItem[]>([]);
  const [loading,     setLoading]     = useState(false);
  const [liveError,   setLiveError]   = useState<string | null>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 서버 상태 확인 (컴포넌트 마운트 시)
  useEffect(() => {
    checkServerHealth().then(setServerOnline);
  }, []);

  // 서버가 온라인이면 뮬 최신 목록 자동 로드
  useEffect(() => {
    if (!serverOnline) return;
    setLoading(true);
    fetchMuleJobs()
      .then(setLiveItems)
      .catch((e) => setLiveError(e.message))
      .finally(() => setLoading(false));
  }, [serverOnline]);

  // 검색어 입력 시 300ms 디바운스 후 서버 검색
  useEffect(() => {
    if (!serverOnline || !query.trim()) return;
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setLoading(true);
      searchFeed(query.trim())
        .then(setLiveItems)
        .catch((e) => setLiveError(e.message))
        .finally(() => setLoading(false));
    }, 300);
    return () => { if (searchTimer.current) clearTimeout(searchTimer.current); };
  }, [query, serverOnline]);

  // 표시할 데이터: 서버 온라인이면 실시간 데이터, 아니면 더미 데이터
  const sourceItems: FeedItemUnified[] = serverOnline ? liveItems : FEED_ITEMS;

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sourceItems.filter((item) => {
      const matchQuery =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.region.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        ("desc" in item ? item.desc : "").toLowerCase().includes(q);
      const matchPlatform = platform === "전체" || item.platform === platform;
      const matchCategory = category === "전체" || item.category === category;
      return matchQuery && matchPlatform && matchCategory;
    });
  }, [query, platform, category, sourceItems]);

  return (
    <div className="min-h-screen bg-[#fff9f5]">
      <Navbar />

      {/* Banner */}
      <div className="bg-gradient-to-r from-[#ff8a3d] to-[#ffb347] px-4 py-3">
        <p className="max-w-2xl mx-auto text-white text-sm font-semibold text-center">
          📋 뮬 · 당근 · 숨고 · 크몽의 음악 정보를 한 곳에서 확인하세요
        </p>
      </div>

      <main className="max-w-2xl mx-auto px-4 py-5">
        {/* Title */}
        <div className="mb-4">
          <h1 className="text-2xl font-extrabold text-gray-800">📋 정보 모아보기</h1>
          <p className="text-sm text-gray-500 mt-0.5">외부 플랫폼의 최신 음악 구인·레슨 정보를 통합해서 보여드려요</p>
        </div>

        {/* 서버 상태 배너 */}
        {serverOnline === null && (
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 mb-4 text-sm text-gray-500">
            <RefreshCw size={14} className="animate-spin" />
            스크래핑 서버 연결 확인 중...
          </div>
        )}
        {serverOnline === true && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-2.5 mb-4 text-sm text-green-700">
            <Wifi size={14} />
            <span><strong>실시간 수집 ON</strong> — 뮬 외부 데이터를 가져오고 있습니다</span>
            {loading && <RefreshCw size={12} className="animate-spin ml-auto" />}
          </div>
        )}
        {serverOnline === false && (
          <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 mb-4 text-sm text-amber-700">
            <div className="flex items-center gap-2">
              <WifiOff size={14} />
              <span>스크래핑 서버 미실행 — <strong>샘플 데이터</strong> 표시 중</span>
            </div>
            <code className="text-xs bg-amber-100 px-2 py-0.5 rounded font-mono">cd server && npm i && node index.js</code>
          </div>
        )}
        {liveError && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 mb-4 text-xs text-red-600">
            ⚠️ {liveError} — CSS 셀렉터를 사이트 실제 DOM에 맞게 수정해야 합니다.
          </div>
        )}

        {/* Search Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-3 mb-3">
          <div className="relative mb-3">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder='예) "기타 강사", "보컬 레슨", "드럼 급구"'
              className="w-full rounded-xl border-2 border-orange-200 pl-9 pr-9 py-2.5 text-sm font-medium text-gray-700 focus:outline-none focus:border-[#ff8a3d] bg-white"
            />
            {query && (
              <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X size={15} />
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

        {/* Platform Filter Chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 mb-4 scrollbar-none">
          {PLATFORMS.map((p) => {
            const style = p !== "전체" ? PLATFORM_STYLE[p] : null;
            const isActive = platform === p;
            return (
              <button
                key={p}
                onClick={() => setPlatform(p as Platform | "전체")}
                className={`flex-shrink-0 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold border transition-colors ${
                  isActive
                    ? "bg-[#ff8a3d] text-white border-[#ff8a3d]"
                    : "bg-white text-gray-500 border-gray-200 hover:border-[#ff8a3d]"
                }`}
              >
                {style && !isActive && (
                  <span className={`w-2 h-2 rounded-full ${style.dot}`} />
                )}
                {p}
              </button>
            );
          })}
        </div>

        {/* Results Count */}
        <p className="text-xs text-gray-400 mb-3">
          {results.length}개의 정보
          {query && <span> — "<span className="text-[#ff8a3d] font-semibold">{query}</span>" 검색 결과</span>}
        </p>

        {/* Feed List */}
        <div className="space-y-3">
          {results.map((item) => {
            const style = PLATFORM_STYLE[item.platform];
            return (
              <Card key={item.id} className="rounded-2xl border border-orange-100 shadow-sm bg-white">
                <CardContent className="p-4">
                  {/* Platform badge + title */}
                  <div className="flex items-start gap-2 mb-2">
                    <Badge className={`${style.bg} ${style.text} border-0 text-xs px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5 gap-1`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${style.dot} inline-block`} />
                      {item.platform}
                    </Badge>
                    <p className="font-bold text-sm text-gray-800 leading-tight">{item.title}</p>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-gray-500 leading-relaxed mb-3 pl-0.5">
                    {item.desc}
                  </p>

                  {/* Footer: region + time + link button */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
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
            <div className="text-center py-12 text-gray-400">
              <p className="text-4xl mb-3">🔍</p>
              <p className="font-semibold text-gray-500">검색 결과가 없어요</p>
              <p className="text-sm mt-1">다른 키워드나 필터를 시도해보세요</p>
            </div>
          )}
        </div>

        {/* Disclaimer */}
        <p className="text-center text-xs text-gray-400 mt-6 pb-6 leading-relaxed">
          ⚠️ 이 정보는 외부 사이트(뮬, 당근마켓, 숨고, 크몽)에서 제공된 정보입니다.<br />
          정확한 내용은 원문 링크에서 직접 확인해주세요.
        </p>
      </main>
    </div>
  );
};

export default FeedSearch;
