/**
 * DrumHub — 연습실 상세 페이지
 * /studios/:id → studios 테이블에서 단건 조회
 */

import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { MapPin, Drum, Phone, ChevronLeft, AlertCircle } from "lucide-react";

// ── 색상 ─────────────────────────────────────────────────────
const GOLD       = "#D4AF37";
const GOLD_LIGHT = "#F5E27A";
const DARK_BG    = "#0d0f1a";
const CARD_BG    = "#161929";
const BORDER     = "rgba(212,175,55,0.18)";

// ── 타입 ─────────────────────────────────────────────────────
interface Studio {
  id:          string;
  name:        string;
  location:    string;
  price:       string;
  equipment:   string;
  photoUrl:    string;
  description: string;
  contact:     string;
  createdAt:   string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToStudio(r: any): Studio {
  return {
    id:          r.id,
    name:        r.name        ?? "",
    location:    r.location    ?? "",
    price:       r.price       ?? "",
    equipment:   r.equipment   ?? "",
    photoUrl:    r.photo_url   ?? "",
    description: r.description ?? "",
    contact:     r.contact     ?? "",
    createdAt:   r.created_at  ?? "",
  };
}

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
const StudioDetail = () => {
  const { id }      = useParams<{ id: string }>();
  const navigate    = useNavigate();
  const [studio,   setStudio]   = useState<Studio | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [imgErr,   setImgErr]   = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data, error } = await supabase
        .from("studios")
        .select("*")
        .eq("id", id)
        .single();
      if (error || !data) setNotFound(true);
      else setStudio(rowToStudio(data));
      setLoading(false);
    })();
  }, [id]);

  const handleBack = () =>
    window.history.length > 1 ? navigate(-1) : navigate("/studios");

  if (loading) return <Skeleton />;

  if (notFound || !studio) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: DARK_BG }}>
        <AlertCircle size={48} style={{ color: GOLD }} />
        <p className="font-extrabold text-white text-lg">연습실을 찾을 수 없습니다</p>
        <Link to="/studios" className="text-sm font-bold" style={{ color: GOLD }}>← 연습실 목록으로</Link>
      </div>
    );
  }

  const hasPhoto = !!studio.photoUrl && !imgErr;

  return (
    <div className="min-h-screen" style={{ background: DARK_BG }}>

      {/* ── 히어로 ─────────────────────────────────────────── */}
      <div className="relative h-72 overflow-hidden">

        {/* 배경 사진 or 그라디언트 */}
        {hasPhoto ? (
          <img
            src={studio.photoUrl}
            alt={studio.name}
            className="absolute inset-0 w-full h-full object-cover"
            onError={() => setImgErr(true)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${GOLD}18 0%, #0a0c17 60%, #0d0f1a 100%)` }}>
            <span className="text-[120px] leading-none select-none opacity-10">🥁</span>
          </div>
        )}

        {/* 어두운 오버레이 */}
        <div className="absolute inset-0"
          style={{ background: "linear-gradient(to bottom, rgba(13,15,26,0.25) 0%, rgba(13,15,26,0.9) 100%)" }} />

        {/* 상단 버튼 */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
          <button onClick={handleBack}
            className="flex items-center gap-1.5 font-bold text-sm rounded-full px-4 py-2 backdrop-blur-md"
            style={{ background: "rgba(13,15,26,0.7)", color: "rgba(255,255,255,0.8)", border: `1px solid ${BORDER}` }}>
            <ChevronLeft size={16} /> 목록으로
          </button>
          <span className="font-extrabold text-xs rounded-full px-3 py-1.5"
            style={{ background: "rgba(100,220,180,0.15)", color: "#64dcb4", border: "1px solid rgba(100,220,180,0.35)" }}>
            🥁 연습실
          </span>
        </div>

        {/* 히어로 하단 */}
        <div className="absolute bottom-6 left-4 right-4 z-10">
          {/* 가격 배지 */}
          <div className="mb-2">
            <span className="inline-block font-extrabold text-sm rounded-full px-4 py-1.5 text-black shadow-lg"
              style={{ background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})` }}>
              {studio.price}
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white leading-snug">{studio.name}</h1>
          <p className="text-sm flex items-center gap-1.5 mt-0.5" style={{ color: "rgba(255,255,255,0.6)" }}>
            <MapPin size={13} style={{ color: GOLD }} /> {studio.location}
          </p>
        </div>
      </div>

      {/* ── 바디 ───────────────────────────────────────────── */}
      <div className="relative -mt-3 rounded-t-3xl px-4 pt-6 pb-32"
        style={{ background: DARK_BG }}>

        {/* 가격 강조 */}
        <div className="rounded-2xl px-5 py-4 mb-5 flex items-center justify-between"
          style={{ background: `linear-gradient(135deg, ${GOLD}18, ${GOLD}08)`, border: `1px solid ${GOLD}35` }}>
          <span className="text-sm font-bold" style={{ color: "rgba(255,255,255,0.55)" }}>시간당 가격</span>
          <span className="text-xl font-extrabold" style={{ color: GOLD }}>{studio.price}</span>
        </div>

        {/* 위치 */}
        <div className="rounded-2xl px-4 py-3 mb-3 flex items-center gap-3"
          style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
          <MapPin size={16} style={{ color: GOLD }} />
          <div>
            <p className="text-xs font-bold" style={{ color: "rgba(255,255,255,0.4)" }}>위치</p>
            <p className="text-sm font-extrabold text-white">{studio.location}</p>
          </div>
        </div>

        {/* 보유 장비 */}
        {studio.equipment && (
          <div className="rounded-2xl px-4 py-3 mb-3 flex items-start gap-3"
            style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
            <Drum size={16} className="mt-0.5 flex-shrink-0" style={{ color: GOLD }} />
            <div>
              <p className="text-xs font-bold mb-1" style={{ color: "rgba(255,255,255,0.4)" }}>보유 장비</p>
              <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.75)" }}>
                {studio.equipment}
              </p>
            </div>
          </div>
        )}

        {/* 연습실 소개 */}
        {studio.description && (
          <div className="mb-5">
            <p className="text-xs font-extrabold tracking-widest uppercase mb-3" style={{ color: GOLD }}>연습실 소개</p>
            <div className="rounded-2xl px-5 py-4" style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
              <p className="text-sm leading-relaxed whitespace-pre-wrap"
                style={{ color: "rgba(255,255,255,0.75)" }}>
                {studio.description}
              </p>
            </div>
          </div>
        )}

        {/* 연락처 */}
        {studio.contact && (
          <div className="mb-5">
            <p className="text-xs font-extrabold tracking-widest uppercase mb-3" style={{ color: GOLD }}>연락처</p>
            <div className="rounded-2xl px-5 py-4 flex items-center gap-3"
              style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
              <Phone size={16} style={{ color: GOLD }} />
              <p className="text-sm font-bold text-white">{studio.contact}</p>
            </div>
          </div>
        )}

        {/* 등록일 */}
        <p className="text-center text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>
          등록일: {studio.createdAt?.slice(0, 10)}
        </p>
      </div>

      {/* ── 하단 고정 CTA ─────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 px-4 pb-6 pt-3"
        style={{ background: `linear-gradient(to top, ${DARK_BG} 80%, transparent)` }}>
        {studio.contact ? (
          <div className="rounded-2xl px-5 py-3 mb-3 text-center"
            style={{ background: `${GOLD}18`, border: `1px solid ${GOLD}40` }}>
            <p className="text-xs font-bold mb-0.5" style={{ color: "rgba(255,255,255,0.5)" }}>연락처</p>
            <p className="text-base font-extrabold" style={{ color: GOLD }}>{studio.contact}</p>
          </div>
        ) : null}
        <Link to="/studios"
          className="flex items-center justify-center w-full h-14 rounded-2xl font-extrabold text-base text-black hover:opacity-90 transition-opacity"
          style={{ background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})` }}>
          🥁 연습실 더보기
        </Link>
      </div>
    </div>
  );
};

export default StudioDetail;
