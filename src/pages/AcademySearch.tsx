/**
 * DrumHub — 학원 찾기
 * 자체 검색바 없음. 홈 통합 검색창 → URL ?q= 파라미터 수신.
 */

import { useSearchParams, Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useCSESearch, type CSEItem } from "@/hooks/useCSESearch";
import { ExternalLink, MapPin, ArrowLeft } from "lucide-react";

// ── 색상 ─────────────────────────────────────────────────────
const GOLD       = "#D4AF37";
const GOLD_LIGHT = "#F5E27A";
const DARK_BG    = "#0d0f1a";
const CARD_BG    = "#161929";
const BORDER     = "rgba(212,175,55,0.18)";

// ── 스켈레톤 카드 ─────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div
      className="rounded-2xl p-4 animate-pulse"
      style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}
    >
      <div className="flex items-start gap-3 mb-3">
        <div
          className="w-12 h-12 rounded-xl flex-shrink-0"
          style={{ background: "rgba(255,255,255,0.08)" }}
        />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-3/4 rounded" style={{ background: "rgba(255,255,255,0.09)" }} />
          <div className="h-3 w-1/4 rounded" style={{ background: "rgba(255,255,255,0.06)" }} />
        </div>
      </div>
      <div
        className="rounded-xl px-3 py-2.5 mb-3 space-y-1.5"
        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="h-3 w-full rounded" style={{ background: "rgba(255,255,255,0.07)" }} />
        <div className="h-3 w-5/6 rounded" style={{ background: "rgba(255,255,255,0.05)" }} />
        <div className="h-3 w-4/6 rounded" style={{ background: "rgba(255,255,255,0.04)" }} />
      </div>
      <div className="flex items-center justify-between">
        <div className="h-3 w-24 rounded" style={{ background: "rgba(255,255,255,0.05)" }} />
        <div className="h-8 w-20 rounded-full" style={{ background: "rgba(255,255,255,0.07)" }} />
      </div>
    </div>
  );
}

// ── 드럼 바운스 ───────────────────────────────────────────────

function DrumDots() {
  return (
    <div className="flex gap-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full inline-block"
          style={{ background: GOLD, animation: `drum-b 0.8s ease-in-out ${i * 0.15}s infinite` }}
        />
      ))}
      <style>{`@keyframes drum-b{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}`}</style>
    </div>
  );
}

// ── 초기 안내 (쿼리 없음) ─────────────────────────────────────

function GuideEmpty() {
  return (
    <div
      className="rounded-2xl py-12 px-6 text-center"
      style={{ border: `2px dashed ${BORDER}`, background: "rgba(212,175,55,0.025)" }}
    >
      <p className="text-4xl mb-4">🔍</p>
      <p className="text-sm font-extrabold text-white mb-2">
        검색어를 입력해주세요
      </p>
      <p className="text-xs leading-relaxed mb-5" style={{ color: "rgba(255,255,255,0.4)" }}>
        홈 화면 검색창에서 지역이나<br />학원 이름을 검색해 보세요.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-xs font-bold rounded-full px-5 py-2.5 transition-opacity hover:opacity-80"
        style={{ background: `${GOLD}22`, color: GOLD, border: `1px solid ${GOLD}50` }}
      >
        <ArrowLeft size={13} /> 홈으로 돌아가기
      </Link>
    </div>
  );
}

// ── 검색 결과 없음 ────────────────────────────────────────────

function GuideNoResult({ query }: { query: string }) {
  return (
    <div
      className="rounded-2xl py-12 text-center"
      style={{ border: `2px dashed ${BORDER}`, background: "rgba(212,175,55,0.025)" }}
    >
      <p className="text-3xl mb-2">🏫</p>
      <p className="text-sm font-semibold text-white mb-1">
        "{query}"에 대한 결과가 없습니다.
      </p>
      <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
        홈 검색창에서 다른 키워드로 검색해보세요.
      </p>
    </div>
  );
}

// ── 학원 카드 ─────────────────────────────────────────────────

function AcademyCard({ item }: { item: CSEItem }) {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}
    >
      <div className="p-4">
        {/* 아이콘 + 제목 */}
        <div className="flex items-start gap-3 mb-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
            style={{ background: `${GOLD}18`, border: `1px solid ${GOLD}30` }}
          >
            🏫
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-extrabold text-white text-sm leading-snug line-clamp-2 mb-1.5">
              {item.title}
            </p>
            <span
              className="inline-block text-xs font-bold rounded-full px-2.5 py-0.5 text-black"
              style={{ background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})` }}
            >
              드럼 학원
            </span>
          </div>
        </div>

        {/* 설명 */}
        <div
          className="rounded-xl px-3 py-2.5 mb-3"
          style={{ background: `${GOLD}0a`, border: `1px solid ${GOLD}1e` }}
        >
          <p
            className="text-xs leading-relaxed line-clamp-3"
            style={{ color: "rgba(255,255,255,0.65)" }}
          >
            {item.snippet}
          </p>
        </div>

        {/* 하단 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1" style={{ color: "rgba(255,255,255,0.28)" }}>
            <MapPin size={11} />
            <span className="text-xs">실시간 검색 결과</span>
          </div>
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-bold rounded-full px-4 py-2 transition-opacity hover:opacity-75"
            style={{ background: `${GOLD}22`, color: GOLD, border: `1px solid ${GOLD}50` }}
          >
            <ExternalLink size={11} /> 상세 보기
          </a>
        </div>
      </div>
    </div>
  );
}

// ── 메인 ─────────────────────────────────────────────────────

const AcademySearch = () => {
  const [params]   = useSearchParams();
  const rawQuery   = params.get("q") ?? "";
  const apiQuery   = rawQuery.trim() ? `드럼 학원 ${rawQuery.trim()}` : "";

  const { items, loading } = useCSESearch(apiQuery);

  const isInitial  = !rawQuery.trim();
  const hasResults = !loading && !!items && items.length > 0;
  const isEmpty    = !loading && !!items && items.length === 0 && !isInitial;

  return (
    <div className="min-h-screen" style={{ background: DARK_BG }}>
      <Navbar />

      {/* ── 헤더 ── */}
      <div
        className="px-4 pt-6 pb-5"
        style={{
          background: `radial-gradient(ellipse at 50% 0%, ${GOLD}0e 0%, transparent 60%), ${DARK_BG}`,
        }}
      >
        <div className="max-w-2xl mx-auto">
          {/* 상단: 라벨 */}
          <p
            className="inline-block text-xs font-bold rounded-full px-3.5 py-1 mb-3"
            style={{ background: `${GOLD}18`, color: GOLD, border: `1px solid ${GOLD}40` }}
          >
            🏫 드럼 학원 찾기
          </p>

          {/* 검색어 표시 or 기본 타이틀 */}
          {rawQuery.trim() ? (
            <>
              <h1 className="text-2xl font-extrabold text-white leading-tight mb-1">
                "{rawQuery}" 검색 결과
              </h1>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                구글 실시간 수집 · 드럼 학원 정보
              </p>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-extrabold text-white leading-tight mb-1">
                전국 드럼 학원 정보
              </h1>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                홈 검색창에서 검색하면 결과가 여기에 나타납니다
              </p>
            </>
          )}
        </div>
      </div>

      {/* ── 콘텐츠 ── */}
      <div className="max-w-2xl mx-auto px-4 pb-12">

        {/* 로딩 */}
        {loading && (
          <div className="flex items-center gap-2 mb-4">
            <DrumDots />
            <span className="text-xs" style={{ color: "rgba(255,255,255,0.38)" }}>
              학원 정보를 불러오는 중입니다…
            </span>
          </div>
        )}

        {/* 결과 수 */}
        {hasResults && (
          <p className="text-xs font-bold mb-3" style={{ color: "rgba(255,255,255,0.3)" }}>
            검색 결과{" "}
            <span style={{ color: GOLD }}>{items!.length}건</span>
          </p>
        )}

        {/* 스켈레톤 */}
        {loading && (
          <div className="space-y-4">
            {[0, 1, 2].map((i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* 학원 카드 목록 */}
        {hasResults && (
          <div className="space-y-4">
            {items!.map((item) => <AcademyCard key={item.id} item={item} />)}
          </div>
        )}

        {/* 쿼리 없음 */}
        {isInitial && !loading && <GuideEmpty />}

        {/* 결과 없음 */}
        {isEmpty && <GuideNoResult query={rawQuery} />}

      </div>

      <Footer />
    </div>
  );
};

export default AcademySearch;
