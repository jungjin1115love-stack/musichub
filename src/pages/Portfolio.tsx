/**
 * DrumHub — 포트폴리오 전체 보기
 * 더미 데이터 없음. Google CSE API로 실시간 로드.
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useCSESearch, type CSEItem } from "@/hooks/useCSESearch";
import { Play, ExternalLink } from "lucide-react";

const GOLD       = "#D4AF37";
const GOLD_LIGHT = "#F5E27A";
const DARK_BG    = "#0d0f1a";
const CARD_BG    = "#161929";
const BORDER     = "rgba(212,175,55,0.18)";

const GENRE_TAGS = ["전체", "재즈", "CCM", "가요팝", "록", "메탈", "입문", "취미"];

// ── 스켈레톤 ─────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden animate-pulse" style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
      <div className="aspect-video" style={{ background: "rgba(255,255,255,0.07)" }} />
      <div className="p-4">
        <div className="h-5 w-2/3 rounded mb-2"  style={{ background: "rgba(255,255,255,0.09)" }} />
        <div className="h-3 w-full rounded mb-1" style={{ background: "rgba(255,255,255,0.06)" }} />
        <div className="h-3 w-4/5 rounded"       style={{ background: "rgba(255,255,255,0.06)" }} />
      </div>
    </div>
  );
}

// ── 빈 결과 ──────────────────────────────────────────────────

function EmptyState() {
  return (
    <div
      className="rounded-2xl py-12 text-center"
      style={{ border: `2px dashed ${BORDER}`, background: "rgba(212,175,55,0.03)" }}
    >
      <p className="text-3xl mb-2">🥁</p>
      <p className="text-sm font-semibold text-white mb-1">
        드럼허브에서 해당 정보를 찾을 수 없습니다.
      </p>
      <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
        다른 키워드로 검색해보세요.
      </p>
    </div>
  );
}

// ── 로딩 문구 ─────────────────────────────────────────────────

function LoadingRow() {
  return (
    <div className="flex items-center gap-2 mb-4 px-1">
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full inline-block"
            style={{ background: GOLD, animation: `drum-b 0.8s ease-in-out ${i * 0.15}s infinite` }}
          />
        ))}
      </div>
      <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
        최신 데이터를 불러오는 중입니다…
      </span>
      <style>{`@keyframes drum-b{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}`}</style>
    </div>
  );
}

// ── 포트폴리오 카드 ───────────────────────────────────────────

function PortfolioCard({ item }: { item: CSEItem }) {
  const [imgErr, setImgErr]   = useState(false);
  const [playing, setPlaying] = useState(false);
  const ytId  = item.url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/)?.[1];
  const thumb = ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : null;

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}
    >
      {/* 영상 영역 */}
      <div className="relative aspect-video bg-black">
        {playing && ytId ? (
          <iframe
            src={`https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1`}
            className="w-full h-full"
            allowFullScreen
            allow="autoplay"
            title={item.title}
          />
        ) : (
          <>
            {thumb && !imgErr ? (
              <img
                src={thumb}
                alt={item.title}
                className="w-full h-full object-cover opacity-75"
                onError={() => setImgErr(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-6xl" style={{ background: "#0a0a14" }}>
                🥁
              </div>
            )}
            <button
              onClick={() => ytId && setPlaying(true)}
              className="absolute inset-0 flex items-center justify-center bg-black/25 hover:bg-black/15 transition-colors"
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center shadow-xl"
                style={{ background: `${GOLD}ee` }}
              >
                <Play size={26} className="text-black ml-1" />
              </div>
            </button>
          </>
        )}
      </div>

      {/* 정보 */}
      <div className="p-4">
        <p className="font-extrabold text-white text-base leading-snug mb-1.5 line-clamp-2">
          {item.title}
        </p>
        <p className="text-sm leading-relaxed line-clamp-3 mb-4" style={{ color: "rgba(255,255,255,0.55)" }}>
          {item.snippet}
        </p>
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-bold rounded-full px-4 py-2 transition-opacity hover:opacity-80"
          style={{ background: `${GOLD}22`, color: GOLD, border: `1px solid ${GOLD}50` }}
        >
          <ExternalLink size={12} /> 상세 보기
        </a>
      </div>
    </div>
  );
}

// ── 메인 ─────────────────────────────────────────────────────

const Portfolio = () => {
  const [activeTag, setActiveTag] = useState("전체");

  const query = activeTag === "전체"
    ? "드럼 강사 포트폴리오 유튜브"
    : `드럼 강사 포트폴리오 ${activeTag}`;

  const { items, loading } = useCSESearch(query);

  return (
    <div className="min-h-screen" style={{ background: DARK_BG }}>
      <Navbar />

      {/* 헤더 */}
      <div
        className="px-4 pt-8 pb-6 text-center"
        style={{ background: `radial-gradient(ellipse at 50% 0%, ${GOLD}12 0%, transparent 65%), ${DARK_BG}` }}
      >
        <div className="max-w-2xl mx-auto">
          <p
            className="inline-block text-xs font-bold rounded-full px-4 py-1.5 mb-4"
            style={{ background: `${GOLD}18`, color: GOLD, border: `1px solid ${GOLD}40` }}
          >
            🎬 강사 포트폴리오
          </p>
          <h1 className="text-3xl font-extrabold text-white leading-tight mb-2">
            드럼 강사 연주 영상 모음
          </h1>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
            실력을 영상으로 직접 확인하고 바로 문의하세요
          </p>
        </div>
      </div>

      {/* 장르 필터 */}
      <div className="max-w-2xl mx-auto px-4 mb-6">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {GENRE_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag)}
              className="flex-none text-xs font-bold rounded-full px-4 py-2 transition-colors"
              style={
                activeTag === tag
                  ? { background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})`, color: "#000" }
                  : { background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.55)" }
              }
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* 목록 */}
      <div className="max-w-2xl mx-auto px-4 pb-10">
        {loading && <LoadingRow />}
        <div className="space-y-5">
          {loading
            ? [0, 1, 2].map((i) => <SkeletonCard key={i} />)
            : items && items.length > 0
              ? items.map((item) => <PortfolioCard key={item.id} item={item} />)
              : <EmptyState />
          }
        </div>
      </div>

      {/* CTA */}
      <div
        className="py-10 px-4 text-center"
        style={{ borderTop: `1px solid ${BORDER}`, background: `linear-gradient(180deg, ${DARK_BG} 0%, #0a0a14 100%)` }}
      >
        <p className="text-white text-xl font-extrabold mb-1">드럼 강사라면 포트폴리오 등록하세요 🥁</p>
        <p className="text-sm mb-5" style={{ color: "rgba(255,255,255,0.45)" }}>
          연주 영상 하나로 1분 완성 — 무료
        </p>
        <Link to="/feed">
          <button
            className="font-extrabold rounded-2xl px-10 py-3 text-base text-black hover:opacity-90 transition-opacity"
            style={{ background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})` }}
          >
            지금 등록하기
          </button>
        </Link>
      </div>

      <Footer />
    </div>
  );
};

export default Portfolio;
