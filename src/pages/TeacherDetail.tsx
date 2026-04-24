/**
 * DrumHub — 강사 상세 페이지
 * /teachers/:id → teachers 테이블에서 단건 조회
 */

import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { MapPin, Play, ChevronLeft, AlertCircle, Youtube } from "lucide-react";

// ── 색상 ─────────────────────────────────────────────────────
const GOLD       = "#D4AF37";
const GOLD_LIGHT = "#F5E27A";
const DARK_BG    = "#0d0f1a";
const CARD_BG    = "#161929";
const BORDER     = "rgba(212,175,55,0.18)";

// ── 타입 ─────────────────────────────────────────────────────
interface Teacher {
  id:         string;
  name:       string;
  location:   string;
  genre:      string;
  bio:        string;
  experience: string;
  photoUrl:   string;
  youtubeUrl: string;
  createdAt:  string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToTeacher(r: any): Teacher {
  return {
    id:         r.id,
    name:       r.name       ?? "",
    location:   r.location   ?? "",
    genre:      r.genre      ?? "",
    bio:        r.bio        ?? "",
    experience: r.experience ?? "",
    photoUrl:   r.photo_url  ?? "",
    youtubeUrl: r.youtube_url ?? "",
    createdAt:  r.created_at ?? "",
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
const TeacherDetail = () => {
  const { id }      = useParams<{ id: string }>();
  const navigate    = useNavigate();
  const [teacher, setTeacher]   = useState<Teacher | null>(null);
  const [loading, setLoading]   = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [imgErr,  setImgErr]    = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data, error } = await supabase
        .from("teachers")
        .select("*")
        .eq("id", id)
        .single();
      if (error || !data) setNotFound(true);
      else setTeacher(rowToTeacher(data));
      setLoading(false);
    })();
  }, [id]);

  const handleBack = () =>
    window.history.length > 1 ? navigate(-1) : navigate("/instructors");

  if (loading) return <Skeleton />;

  if (notFound || !teacher) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: DARK_BG }}>
        <AlertCircle size={48} style={{ color: GOLD }} />
        <p className="font-extrabold text-white text-lg">강사를 찾을 수 없습니다</p>
        <Link to="/instructors" className="text-sm font-bold" style={{ color: GOLD }}>← 강사 목록으로</Link>
      </div>
    );
  }

  const hasPhoto = !!teacher.photoUrl && !imgErr;
  const hasVideo = !!teacher.youtubeUrl;

  return (
    <div className="min-h-screen" style={{ background: DARK_BG }}>

      {/* ── 히어로 ─────────────────────────────────────────── */}
      <div className="relative h-72 overflow-hidden">

        {/* 배경 사진 or 그라디언트 */}
        {hasPhoto ? (
          <img
            src={teacher.photoUrl}
            alt={teacher.name}
            className="absolute inset-0 w-full h-full object-cover object-top"
            onError={() => setImgErr(true)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${GOLD}18 0%, #0a0c17 60%, #0d0f1a 100%)` }}>
            <span className="text-[140px] leading-none select-none opacity-10">🥁</span>
          </div>
        )}

        {/* 어두운 그라디언트 오버레이 */}
        <div className="absolute inset-0"
          style={{ background: "linear-gradient(to bottom, rgba(13,15,26,0.3) 0%, rgba(13,15,26,0.85) 100%)" }} />

        {/* 상단 버튼 */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
          <button onClick={handleBack}
            className="flex items-center gap-1.5 font-bold text-sm rounded-full px-4 py-2 backdrop-blur-md"
            style={{ background: "rgba(13,15,26,0.7)", color: "rgba(255,255,255,0.8)", border: `1px solid ${BORDER}` }}>
            <ChevronLeft size={16} /> 목록으로
          </button>
          <span className="font-extrabold text-xs rounded-full px-3 py-1.5"
            style={{ background: `${GOLD}22`, color: GOLD, border: `1px solid ${GOLD}50` }}>
            🥁 강사
          </span>
        </div>

        {/* 히어로 하단 — 이름 + 장르 */}
        <div className="absolute bottom-6 left-4 right-4 z-10 flex items-end gap-4">
          {/* 아바타 (사진 없을 때만) */}
          {!hasPhoto && (
            <div className="w-16 h-16 rounded-2xl flex-shrink-0 flex items-center justify-center text-2xl"
              style={{ background: `${GOLD}25`, border: `2px solid ${GOLD}55` }}>
              🥁
            </div>
          )}
          <div className="flex-1">
            <span className="inline-block text-xs font-extrabold rounded-full px-2.5 py-0.5 mb-2 text-black"
              style={{ background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})` }}>
              {teacher.genre}
            </span>
            {hasVideo && (
              <span className="inline-flex items-center gap-1 text-xs font-extrabold rounded-full px-2.5 py-0.5 ml-2"
                style={{ background: "rgba(255,80,80,0.2)", color: "#ff6464", border: "1px solid rgba(255,80,80,0.4)" }}>
                <Play size={9} /> 영상 보유
              </span>
            )}
            <h1 className="text-2xl font-extrabold text-white leading-snug">{teacher.name}</h1>
            <p className="text-sm flex items-center gap-1 mt-0.5" style={{ color: "rgba(255,255,255,0.55)" }}>
              <MapPin size={12} /> {teacher.location}
            </p>
          </div>
        </div>
      </div>

      {/* ── 바디 ───────────────────────────────────────────── */}
      <div className="relative -mt-3 rounded-t-3xl px-4 pt-6 pb-32"
        style={{ background: DARK_BG }}>

        {/* 한 줄 소개 */}
        <div className="rounded-2xl px-5 py-4 mb-5"
          style={{ background: `linear-gradient(135deg, ${GOLD}18, ${GOLD}08)`, border: `1px solid ${GOLD}35` }}>
          <p className="text-xs font-bold mb-1" style={{ color: "rgba(255,255,255,0.45)" }}>소개</p>
          <p className="text-sm font-semibold leading-relaxed text-white">{teacher.bio}</p>
        </div>

        {/* 경력·이력 */}
        {teacher.experience && (
          <div className="mb-5">
            <p className="text-xs font-extrabold tracking-widest uppercase mb-3" style={{ color: GOLD }}>경력·이력</p>
            <div className="rounded-2xl px-5 py-4" style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
              <p className="text-sm leading-relaxed whitespace-pre-wrap"
                style={{ color: "rgba(255,255,255,0.75)" }}>
                {teacher.experience}
              </p>
            </div>
          </div>
        )}

        {/* 활동 지역 */}
        <div className="rounded-2xl px-4 py-3 mb-5 flex items-center gap-3"
          style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
          <MapPin size={16} style={{ color: GOLD }} />
          <div>
            <p className="text-xs font-bold" style={{ color: "rgba(255,255,255,0.4)" }}>활동 지역</p>
            <p className="text-sm font-extrabold text-white">{teacher.location}</p>
          </div>
        </div>

        {/* 유튜브 영상 */}
        {hasVideo && (
          <div className="mb-5">
            <p className="text-xs font-extrabold tracking-widest uppercase mb-3" style={{ color: GOLD }}>연주 영상</p>
            <a href={teacher.youtubeUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-2xl px-5 py-4 hover:opacity-80 transition-opacity"
              style={{ background: "rgba(255,80,80,0.1)", border: "1px solid rgba(255,80,80,0.25)" }}>
              <Youtube size={22} style={{ color: "#ff6464" }} />
              <div>
                <p className="text-sm font-bold" style={{ color: "#ff6464" }}>유튜브 채널 방문</p>
                <p className="text-xs mt-0.5 line-clamp-1" style={{ color: "rgba(255,255,255,0.35)" }}>
                  {teacher.youtubeUrl}
                </p>
              </div>
            </a>
          </div>
        )}

        {/* 등록일 */}
        <p className="text-center text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>
          등록일: {teacher.createdAt?.slice(0, 10)}
        </p>
      </div>

      {/* ── 하단 고정 CTA ─────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 px-4 pb-6 pt-3"
        style={{ background: `linear-gradient(to top, ${DARK_BG} 80%, transparent)` }}>
        <div className="flex gap-3">
          {hasVideo && (
            <a href={teacher.youtubeUrl} target="_blank" rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center h-14 rounded-2xl font-extrabold text-sm hover:opacity-90 transition-opacity"
              style={{ background: "rgba(255,80,80,0.15)", color: "#ff6464", border: "1px solid rgba(255,80,80,0.3)" }}>
              <Play size={15} className="mr-2" /> 연주 영상
            </a>
          )}
          <Link to="/instructors"
            className="flex-1 flex items-center justify-center h-14 rounded-2xl font-extrabold text-base text-black hover:opacity-90 transition-opacity"
            style={{ background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})` }}>
            🥁 강사 더보기
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TeacherDetail;
