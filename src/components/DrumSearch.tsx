/**
 * DrumSearch — DrumHub 통합 검색
 *
 * .env.local 에 VITE_GOOGLE_API_KEY, VITE_GOOGLE_CX 설정 시 실시간 검색.
 * 미설정 시 내부 샘플 데이터로 자동 폴백.
 * 외부 플랫폼 명칭은 UI에 노출하지 않습니다.
 */

import { useState, useRef, useCallback } from "react";
import { Search, MapPin, ExternalLink, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getMockResults, type MockResult } from "@/utils/mockSearchResults";

const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY as string | undefined;
const GOOGLE_CX      = import.meta.env.VITE_GOOGLE_CX      as string | undefined;

const REGIONS = [
  "전체", "홍대", "강남", "성수", "합정", "건대",
  "잠실", "노원", "분당", "수원", "부산", "대구",
];

const GOLD = "#D4AF37";

interface DrumResult {
  id:      string;
  title:   string;
  summary: string;
  url:     string;
  region:  string;
  salary:  string;
  date:    string;
  isNew:   boolean;
}

function fromMock(r: MockResult): DrumResult {
  return {
    id:      r.id,
    title:   r.title,
    summary: r.summary,
    url:     r.url,
    region:  r.region,
    salary:  r.salary,
    date:    r.date,
    isNew:   r.date.includes("전") && !r.date.includes("일"),
  };
}

const DrumSearch = () => {
  const [query,   setQuery]   = useState("드럼 강사");
  const [region,  setRegion]  = useState("전체");
  const [results, setResults] = useState<DrumResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const runSearch = useCallback(async (q: string, reg: string) => {
    const keyword = ["드럼", q.trim(), reg !== "전체" ? reg : ""]
      .filter(Boolean).join(" ");

    setLoading(true);
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    if (!GOOGLE_API_KEY || !GOOGLE_CX) {
      await new Promise((r) => setTimeout(r, 600));
      setResults(getMockResults("드럼", reg, "전체").map(fromMock));
      setLoading(false);
      return;
    }

    try {
      const url =
        `https://www.googleapis.com/customsearch/v1` +
        `?key=${GOOGLE_API_KEY}&cx=${GOOGLE_CX}` +
        `&q=${encodeURIComponent(keyword)}&num=10`;

      const res = await fetch(url, { signal: abortRef.current.signal });
      if (!res.ok) throw new Error(`API ${res.status}`);
      const data = await res.json();

      const items: Array<{ title: string; link: string; snippet: string }> =
        data.items ?? [];

      const mapped: DrumResult[] = items.map((it, i) => ({
        id:      `g-${i}`,
        title:   it.title,
        summary: it.snippet,
        url:     it.link,
        region:  reg !== "전체" ? reg : "전국",
        salary:  "",
        date:    "방금",
        isNew:   true,
      }));

      setResults(mapped.length > 0 ? mapped : getMockResults("드럼", reg, "전체").map(fromMock));
    } catch (e: unknown) {
      if (e instanceof Error && e.name === "AbortError") return;
      setResults(getMockResults("드럼", reg, "전체").map(fromMock));
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearch = () => runSearch(query, region);
  const handleKey    = (e: React.KeyboardEvent) => { if (e.key === "Enter") handleSearch(); };

  return (
    <div className="rounded-3xl overflow-hidden shadow-xl"
         style={{ background: "#161929", border: "1px solid rgba(212,175,55,0.18)" }}>

      {/* ── 헤더 ── */}
      <div className="px-5 py-4"
           style={{ background: "linear-gradient(135deg, #1a1d2e, #0d0f1a)" }}>
        <p className="font-extrabold text-base leading-snug mb-0.5 text-white">
          🥁 드럼허브 통합 공고 검색
        </p>
        <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
          전국 드럼 강사 채용 공고를 한곳에서 검색합니다
        </p>
      </div>

      {/* ── 검색 바 ── */}
      <div className="px-4 pt-4 pb-3 space-y-2">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: GOLD }} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKey}
              placeholder="재즈 드럼, CCM, 록·메탈…"
              className="w-full rounded-xl pl-9 py-2.5 text-sm font-medium bg-transparent text-white placeholder:text-gray-600 focus:outline-none"
              style={{ border: "1.5px solid rgba(212,175,55,0.3)" }}
            />
          </div>
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="w-24 flex-none rounded-xl px-2 py-2.5 text-sm font-medium text-white bg-transparent focus:outline-none"
            style={{ border: "1.5px solid rgba(212,175,55,0.3)" }}
          >
            {REGIONS.map((r) => <option key={r} value={r} className="bg-[#161929]">{r}</option>)}
          </select>
        </div>
        <button
          onClick={handleSearch}
          className="w-full font-extrabold rounded-xl py-2.5 text-sm transition-opacity hover:opacity-90 active:scale-[0.98] text-black"
          style={{ background: `linear-gradient(135deg, ${GOLD}, #F5E27A)` }}
        >
          공고 검색
        </button>
      </div>

      {/* ── 로딩 ── */}
      {loading && (
        <div className="px-4 pb-6 text-center">
          <div className="flex items-center justify-center gap-1.5 mb-2">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-2 h-2 rounded-full inline-block"
                style={{
                  background: GOLD,
                  animation: `drum-b 0.8s ease-in-out ${i * 0.15}s infinite`,
                }}
              />
            ))}
          </div>
          <p className="text-sm font-extrabold text-white">드럼 공고 수집 중…</p>
          <style>{`@keyframes drum-b { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }`}</style>
        </div>
      )}

      {/* ── 초기 안내 ── */}
      {!loading && !results && (
        <div className="px-4 pb-6">
          <div className="rounded-2xl py-6 text-center"
               style={{ border: "2px dashed rgba(212,175,55,0.2)", background: "rgba(212,175,55,0.03)" }}>
            <p className="text-3xl mb-1">🥁</p>
            <p className="text-sm font-semibold text-white">검색어를 입력하고 버튼을 누르세요</p>
            <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.35)" }}>
              전국 드럼 강사 공고를 DrumHub에서 바로 확인합니다
            </p>
          </div>
        </div>
      )}

      {/* ── 결과 ── */}
      {!loading && results && (
        <div className="px-4 pb-5">
          <p className="text-xs font-bold mb-3" style={{ color: "rgba(255,255,255,0.4)" }}>
            DrumHub 추천 공고{" "}
            <span style={{ color: GOLD }}>{results.length}건</span>
          </p>

          <div className="space-y-2.5">
            {results.map((r) => (
              <a
                key={r.id}
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-2xl px-4 py-3.5 transition-all hover:scale-[1.01] group"
                style={{
                  background: "#0d0f1a",
                  border: "1px solid rgba(212,175,55,0.15)",
                }}
              >
                {/* 상단 배지 행 */}
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <Badge
                    className="border-0 text-xs px-2 py-0 rounded-full font-bold text-black"
                    style={{ background: `linear-gradient(135deg, ${GOLD}, #F5E27A)` }}
                  >
                    드럼
                  </Badge>
                  {r.isNew && (
                    <Badge className="bg-red-500 text-white border-0 text-xs px-2 py-0 rounded-full">
                      NEW
                    </Badge>
                  )}
                  {r.salary && (
                    <span
                      className="text-xs font-bold ml-auto"
                      style={{ color: GOLD }}
                    >
                      {r.salary}
                    </span>
                  )}
                </div>

                {/* 제목 */}
                <p className="font-extrabold text-sm text-white leading-snug mb-1.5 group-hover:opacity-80 transition-opacity">
                  {r.title}
                </p>

                {/* 요약 */}
                <p className="text-xs leading-relaxed line-clamp-2 mb-2"
                   style={{ color: "rgba(255,255,255,0.45)" }}>
                  {r.summary}
                </p>

                {/* 하단 */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {r.region && (
                      <span className="text-xs flex items-center gap-1"
                            style={{ color: "rgba(255,255,255,0.3)" }}>
                        <MapPin size={10} /> {r.region}
                      </span>
                    )}
                    {r.date && (
                      <span className="text-xs flex items-center gap-1"
                            style={{ color: "rgba(255,255,255,0.3)" }}>
                        <Clock size={10} /> {r.date}
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-semibold flex items-center gap-1"
                        style={{ color: GOLD }}>
                    상세 정보 보기 <ExternalLink size={11} />
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DrumSearch;
