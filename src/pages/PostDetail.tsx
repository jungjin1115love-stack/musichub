/**
 * DrumHub — 공고 상세 페이지
 * /posts/:id → feed_posts 테이블에서 단건 조회
 */

import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { MapPin, Clock, ChevronLeft, AlertCircle } from "lucide-react";

// ── 색상 ─────────────────────────────────────────────────────
const GOLD       = "#D4AF37";
const GOLD_LIGHT = "#F5E27A";
const DARK_BG    = "#0d0f1a";
const CARD_BG    = "#161929";
const BORDER     = "rgba(212,175,55,0.18)";

// ── 타입 ─────────────────────────────────────────────────────
interface Post {
  id:          number;
  title:       string;
  place:       string;
  region:      string;
  category:    string;
  salary:      string;
  description: string;
  urgent:      boolean;
  postedAt:    string;
  source:      string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToPost(r: any): Post {
  return {
    id:          r.id,
    title:       r.title,
    place:       r.place,
    region:      r.region,
    category:    r.category,
    salary:      r.salary,
    description: r.description ?? "",
    urgent:      r.urgent,
    postedAt:    r.posted_at,
    source:      r.source,
  };
}

const CATEGORY_BG: Record<string, string> = {
  "드럼":     "rgba(255,138,61,0.18)",
  "재즈 드럼": "rgba(100,180,255,0.18)",
  "가요·팝":   "rgba(255,100,180,0.18)",
  "CCM":      "rgba(100,220,140,0.18)",
  "록·메탈":   "rgba(180,180,180,0.18)",
};
const CATEGORY_FG: Record<string, string> = {
  "드럼":     "#ff8a3d",
  "재즈 드럼": "#64b4ff",
  "가요·팝":   "#ff64b4",
  "CCM":      "#64dc8c",
  "록·메탈":   "#b4b4b4",
};

// ── 스켈레톤 ─────────────────────────────────────────────────
function Skeleton() {
  return (
    <div className="min-h-screen animate-pulse" style={{ background: DARK_BG }}>
      <div className="h-72" style={{ background: "rgba(255,255,255,0.05)" }} />
      <div className="px-4 pt-6 space-y-4">
        <div className="h-7 w-3/4 rounded" style={{ background: "rgba(255,255,255,0.09)" }} />
        <div className="h-4 w-1/3 rounded" style={{ background: "rgba(255,255,255,0.07)" }} />
        <div className="h-24 rounded-2xl"  style={{ background: "rgba(255,255,255,0.05)" }} />
      </div>
    </div>
  );
}

// ── 메인 ─────────────────────────────────────────────────────
const PostDetail = () => {
  const { id }       = useParams<{ id: string }>();
  const navigate     = useNavigate();
  const [post,    setPost]    = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data, error } = await supabase
        .from("feed_posts")
        .select("*")
        .eq("id", id)
        .single();
      if (error || !data) setNotFound(true);
      else setPost(rowToPost(data));
      setLoading(false);
    })();
  }, [id]);

  const handleBack = () =>
    window.history.length > 1 ? navigate(-1) : navigate("/feed");

  if (loading) return <Skeleton />;

  if (notFound || !post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: DARK_BG }}>
        <AlertCircle size={48} style={{ color: GOLD }} />
        <p className="font-extrabold text-white text-lg">공고를 찾을 수 없습니다</p>
        <Link to="/feed" className="text-sm font-bold" style={{ color: GOLD }}>← 목록으로 돌아가기</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: DARK_BG }}>

      {/* ── 히어로 ─────────────────────────────────────────── */}
      <div className="relative h-72 overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${GOLD}18 0%, #0a0c17 60%, #0d0f1a 100%)` }}>

        {/* 배경 장식 */}
        <div className="absolute inset-0 flex items-center justify-center opacity-10">
          <span className="text-[140px] leading-none select-none">🥁</span>
        </div>
        <div className="absolute inset-0"
          style={{ background: "linear-gradient(to bottom, transparent 40%, #0d0f1a 100%)" }} />

        {/* 상단 버튼 */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
          <button onClick={handleBack}
            className="flex items-center gap-1.5 font-bold text-sm rounded-full px-4 py-2 backdrop-blur-md"
            style={{ background: "rgba(13,15,26,0.7)", color: "rgba(255,255,255,0.8)", border: `1px solid ${BORDER}` }}>
            <ChevronLeft size={16} /> 목록으로
          </button>
          <span className="font-extrabold text-xs rounded-full px-3 py-1.5"
            style={{ background: `${GOLD}22`, color: GOLD, border: `1px solid ${GOLD}50` }}>
            🏫 공고
          </span>
        </div>

        {/* 히어로 하단 타이틀 */}
        <div className="absolute bottom-6 left-4 right-4 z-10">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            {post.urgent && (
              <span className="text-xs font-extrabold rounded-full px-2.5 py-1"
                style={{ background: "rgba(239,68,68,0.25)", color: "#f87171", border: "1px solid rgba(239,68,68,0.4)" }}>
                🔴 급구
              </span>
            )}
            <span className="text-xs font-extrabold rounded-full px-2.5 py-1"
              style={{
                background: CATEGORY_BG[post.category] ?? "rgba(255,255,255,0.12)",
                color:      CATEGORY_FG[post.category] ?? "rgba(255,255,255,0.7)",
                border:     `1px solid ${CATEGORY_FG[post.category] ?? "rgba(255,255,255,0.2)"}44`,
              }}>
              {post.category}
            </span>
          </div>
          <h1 className="text-xl font-extrabold text-white leading-snug">{post.title}</h1>
          <p className="text-sm font-semibold mt-1" style={{ color: "#ff8a3d" }}>{post.place}</p>
        </div>
      </div>

      {/* ── 바디 ───────────────────────────────────────────── */}
      <div className="relative -mt-3 rounded-t-3xl px-4 pt-6 pb-32"
        style={{ background: DARK_BG }}>

        {/* 급여 강조 */}
        <div className="rounded-2xl px-5 py-4 mb-5 flex items-center justify-between"
          style={{ background: `linear-gradient(135deg, ${GOLD}18, ${GOLD}08)`, border: `1px solid ${GOLD}35` }}>
          <span className="text-sm font-bold" style={{ color: "rgba(255,255,255,0.55)" }}>급여 / 레슨비</span>
          <span className="text-xl font-extrabold" style={{ color: GOLD }}>{post.salary}</span>
        </div>

        {/* 메타 정보 */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="rounded-2xl px-4 py-3 flex items-center gap-2"
            style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
            <MapPin size={14} style={{ color: GOLD }} />
            <div>
              <p className="text-xs font-bold" style={{ color: "rgba(255,255,255,0.4)" }}>활동 지역</p>
              <p className="text-sm font-extrabold text-white">{post.region}</p>
            </div>
          </div>
          <div className="rounded-2xl px-4 py-3 flex items-center gap-2"
            style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
            <Clock size={14} style={{ color: GOLD }} />
            <div>
              <p className="text-xs font-bold" style={{ color: "rgba(255,255,255,0.4)" }}>등록일</p>
              <p className="text-sm font-extrabold text-white">{post.postedAt}</p>
            </div>
          </div>
        </div>

        {/* 공고 내용 */}
        {post.description && (
          <div className="mb-5">
            <p className="text-xs font-extrabold tracking-widest uppercase mb-3" style={{ color: GOLD }}>공고 상세 내용</p>
            <div className="rounded-2xl px-5 py-4" style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
              <p className="text-sm leading-relaxed whitespace-pre-wrap text-white"
                style={{ color: "rgba(255,255,255,0.75)" }}>
                {post.description}
              </p>
            </div>
          </div>
        )}

        {/* 출처 */}
        <p className="text-center text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>
          출처: {post.source}
        </p>
      </div>

      {/* ── 하단 고정 CTA ─────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 px-4 pb-6 pt-3"
        style={{ background: `linear-gradient(to top, ${DARK_BG} 80%, transparent)` }}>
        <Link to={`/academies?q=${encodeURIComponent(post.place)}`}
          className="flex items-center justify-center w-full h-14 rounded-2xl font-extrabold text-base text-black hover:opacity-90 transition-opacity"
          style={{ background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})` }}>
          🏫 학원 정보 찾기
        </Link>
      </div>
    </div>
  );
};

export default PostDetail;
