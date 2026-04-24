/**
 * DrumHub — 연습실 찾기
 * · Supabase studios 테이블 등록 연습실 — 상단
 * · 구글 CSE 실시간 검색 — 하단 보조
 * · 연습실 직접 등록 폼 (BottomSheet)
 *
 * studios 컬럼:
 *   id(uuid), name, location, price, equipment,
 *   photo_url, description, contact, created_at
 */

import { useState, useRef, ChangeEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import Footer from "@/components/layout/Footer";
import { useCSESearch, type CSEItem } from "@/hooks/useCSESearch";
import { useSupabaseStudios, toStudio, type Studio } from "@/hooks/useSupabaseStudios";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Plus, ExternalLink, MapPin, Camera, RefreshCw,
  X, Clock, Drum, Phone,
} from "lucide-react";

// ── 색상 ─────────────────────────────────────────────────────
const GOLD       = "#D4AF37";
const GOLD_LIGHT = "#F5E27A";
const DARK_BG    = "#0d0f1a";
const CARD_BG    = "#161929";
const BORDER     = "rgba(212,175,55,0.18)";

// ── 상수 ─────────────────────────────────────────────────────
const REGIONS = ["전체", "홍대", "강남", "합정", "신촌", "건대", "수원", "부산", "대구"];

const EMPTY_FORM = {
  name:        "",
  location:    "",
  price:       "",
  equipment:   "",
  description: "",
  contact:     "",
};

// ── 드럼 바운스 ───────────────────────────────────────────────
function DrumDots() {
  return (
    <>
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <span key={i} className="w-1.5 h-1.5 rounded-full inline-block"
            style={{ background: GOLD, animation: `drum-b 0.8s ease-in-out ${i * 0.15}s infinite` }} />
        ))}
      </div>
      <style>{`@keyframes drum-b{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}`}</style>
    </>
  );
}

// ── 스켈레톤 ─────────────────────────────────────────────────
function SkeletonStudioCard() {
  return (
    <div className="rounded-2xl overflow-hidden animate-pulse" style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
      <div className="h-36" style={{ background: "rgba(255,255,255,0.07)" }} />
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="h-5 w-1/2 rounded mb-2" style={{ background: "rgba(255,255,255,0.09)" }} />
            <div className="h-3 w-1/3 rounded" style={{ background: "rgba(255,255,255,0.06)" }} />
          </div>
          <div className="h-8 w-20 rounded-full" style={{ background: "rgba(255,255,255,0.09)" }} />
        </div>
        <div className="h-3 w-full rounded mb-1.5" style={{ background: "rgba(255,255,255,0.06)" }} />
        <div className="h-3 w-4/5 rounded mb-4"   style={{ background: "rgba(255,255,255,0.06)" }} />
        <div className="h-10 rounded-xl"           style={{ background: "rgba(255,255,255,0.07)" }} />
      </div>
    </div>
  );
}

// ── 등록 연습실 없음 ─────────────────────────────────────────
function EmptyRegistered({ onRegister }: { onRegister: () => void }) {
  return (
    <div className="rounded-2xl px-5 py-8 text-center"
      style={{ border: `2px dashed ${BORDER}`, background: "rgba(212,175,55,0.02)" }}>
      <p className="text-4xl mb-3">🥁</p>
      <p className="font-extrabold text-white text-sm mb-1">아직 등록된 DrumHub 연습실이 없습니다</p>
      <p className="text-xs mb-4" style={{ color: "rgba(255,255,255,0.4)" }}>
        연습실을 운영 중이라면 지금 바로 등록해보세요!<br />등록 즉시 이 자리에 노출됩니다.
      </p>
      <button onClick={onRegister}
        className="inline-flex items-center gap-2 font-extrabold rounded-xl px-6 py-2.5 text-sm text-black hover:opacity-90 transition-opacity"
        style={{ background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})` }}>
        <Plus size={15} /> 연습실 등록하기
      </button>
    </div>
  );
}

// ── DrumHub 등록 연습실 카드 ──────────────────────────────────
function StudioCard({ studio, onContact }: { studio: Studio; onContact: () => void }) {
  const hasPhoto = !!studio.photoUrl;
  const [imgErr, setImgErr] = useState(false);

  return (
    <Link to={`/studios/${studio.id}`} className="block">
    <div className="rounded-2xl overflow-hidden transition-all hover:border-[rgba(212,175,55,0.38)]"
      style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>

      {/* 사진 영역 */}
      <div className="relative h-36 overflow-hidden"
        style={{ background: hasPhoto && !imgErr ? "transparent" : `${GOLD}0a` }}>
        {hasPhoto && !imgErr ? (
          <img src={studio.photoUrl} alt={studio.name}
            className="w-full h-full object-cover"
            onError={() => setImgErr(true)} />
        ) : (
          <div className="w-full h-full flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${GOLD}12, ${GOLD}04)` }}>
            <span className="text-5xl opacity-30">🥁</span>
          </div>
        )}
        {/* 가격 배지 — 사진 위에 오버레이 */}
        <div className="absolute top-3 right-3">
          <span className="font-extrabold text-sm rounded-full px-3 py-1.5 text-black shadow-lg"
            style={{ background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})` }}>
            {studio.price}
          </span>
        </div>
      </div>

      {/* 정보 */}
      <div className="p-4">
        {/* 이름 + 위치 */}
        <div className="mb-3">
          <p className="font-extrabold text-white text-base leading-snug mb-1">{studio.name}</p>
          <p className="text-xs flex items-center gap-1.5" style={{ color: "rgba(255,255,255,0.45)" }}>
            <MapPin size={11} style={{ color: GOLD }} /> {studio.location}
          </p>
        </div>

        {/* 보유 장비 */}
        {studio.equipment && (
          <div className="flex items-start gap-1.5 mb-3">
            <Drum size={12} className="mt-0.5 flex-shrink-0" style={{ color: GOLD }} />
            <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.6)" }}>
              {studio.equipment}
            </p>
          </div>
        )}

        {/* 설명 */}
        {studio.description && (
          <p className="text-xs leading-relaxed line-clamp-2 mb-4"
            style={{ color: "rgba(255,255,255,0.45)" }}>
            {studio.description}
          </p>
        )}

        {/* 문의 버튼 */}
        <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onContact(); }}
          className="flex items-center justify-center gap-2 w-full rounded-xl py-2.5 text-sm font-bold hover:opacity-80 transition-opacity"
          style={{ background: `${GOLD}22`, color: GOLD, border: `1px solid ${GOLD}50` }}>
          <Phone size={13} /> 예약·문의하기
        </button>
      </div>
    </div>
    </Link>
  );
}

// ── CSE 검색 결과 카드 ────────────────────────────────────────
function StudioCSECard({ item }: { item: CSEItem }) {
  return (
    <div className="rounded-2xl p-4" style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
      <div className="flex items-start gap-3 mb-3">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
          style={{ background: `${GOLD}15`, border: `1px solid ${GOLD}28` }}>
          🥁
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-extrabold text-white text-sm leading-snug line-clamp-2 mb-1.5">{item.title}</p>
          <span className="inline-flex items-center gap-1 text-xs font-bold rounded-full px-2.5 py-0.5 text-black"
            style={{ background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})` }}>
            <Drum size={10} /> 드럼 연습실
          </span>
        </div>
      </div>
      <p className="text-xs leading-relaxed line-clamp-2 mb-3" style={{ color: "rgba(255,255,255,0.5)" }}>
        {item.snippet}
      </p>
      <a href={item.url} target="_blank" rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full font-bold rounded-xl py-2.5 text-sm hover:opacity-80 transition-opacity"
        style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)", border: `1px solid ${BORDER}` }}>
        <ExternalLink size={13} /> 상세 보기
      </a>
    </div>
  );
}

// ── 문의 팝업 ─────────────────────────────────────────────────
function ContactModal({ studio, onClose }: { studio: Studio; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: "rgba(0,0,0,0.7)" }} onClick={onClose}>
      <div className="w-full max-w-lg rounded-t-3xl p-6"
        style={{ background: "#1a1d2e", border: `1px solid ${BORDER}` }}
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <p className="font-extrabold text-white text-base">📞 {studio.name} 문의</p>
          <button onClick={onClose} style={{ color: "rgba(255,255,255,0.4)" }}><X size={20} /></button>
        </div>

        {studio.contact ? (
          <>
            <p className="text-xs mb-2" style={{ color: "rgba(255,255,255,0.4)" }}>연락처</p>
            <div className="rounded-xl px-4 py-3 font-bold text-sm mb-3"
              style={{ background: `${GOLD}18`, color: GOLD, border: `1px solid ${GOLD}40` }}>
              {studio.contact}
            </div>
          </>
        ) : (
          <p className="text-sm text-center py-3" style={{ color: "rgba(255,255,255,0.5)" }}>
            등록된 연락처가 없습니다.
          </p>
        )}

        <div className="rounded-xl px-4 py-3 mb-3"
          style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${BORDER}` }}>
          <p className="text-xs font-bold text-white mb-0.5">📍 위치</p>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>{studio.location}</p>
          {studio.price && (
            <>
              <p className="text-xs font-bold text-white mt-2 mb-0.5">💰 가격</p>
              <p className="text-xs" style={{ color: GOLD }}>{studio.price}</p>
            </>
          )}
        </div>

        <button onClick={onClose} className="w-full rounded-xl py-2.5 text-sm font-bold"
          style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.4)" }}>
          닫기
        </button>
      </div>
    </div>
  );
}

// ── 메인 ─────────────────────────────────────────────────────
const StudioSearch = () => {
  const [region,     setRegion]     = useState("전체");
  const [showForm,   setShowForm]   = useState(false);
  const [form,       setForm]       = useState({ ...EMPTY_FORM });
  const [photo,      setPhoto]      = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted,  setSubmitted]  = useState(false);
  const [contactOf,  setContactOf]  = useState<Studio | null>(null);

  const photoInputRef = useRef<HTMLInputElement>(null);
  const navigate      = useNavigate();
  const { user }      = useAuth();

  const { studios, loading: studioLoading, reload } = useSupabaseStudios();

  const openForm = () => {
    if (!user) { navigate("/auth"); return; }
    setShowForm(true);
  };

  // CSE 검색
  const regionSuffix = region !== "전체" ? ` ${region}` : "";
  const cseQuery = `드럼 연습실 대관${regionSuffix}`;
  const { items: cseItems, loading: cseLoading } = useCSESearch(cseQuery);

  // ── 사진 업로드 ──────────────────────────────────────────
  const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 800 * 1024) {
      toast.error("사진 크기는 800KB 이하여야 합니다.");
      e.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setPhoto(reader.result as string);
    reader.readAsDataURL(file);
  };

  // ── 연습실 등록 ──────────────────────────────────────────
  const handleSubmit = async () => {
    if (!form.name.trim() || !form.location.trim() || !form.price.trim()) return;
    setSubmitting(true);

    const payload = {
      name:        form.name,
      location:    form.location,
      price:       form.price,
      equipment:   form.equipment   || null,
      description: form.description || null,
      contact:     form.contact     || null,
      photo_url:   photo            || null,
    };

    console.log("[DrumHub] 연습실 등록 시도 →", { ...payload, photo_url: photo ? "[base64]" : null });

    const { data, error } = await supabase
      .from("studios")
      .insert(payload)
      .select()
      .single();

    setSubmitting(false);

    if (error || !data) {
      console.error("[DrumHub] ❌ studios INSERT 실패", {
        code: error?.code, message: error?.message,
        details: error?.details, hint: error?.hint,
      });
      toast.error(
        `등록 실패: ${error?.message ?? "알 수 없는 오류"} (${error?.code ?? "-"})`,
        { duration: 5000 }
      );
      return;
    }

    console.log("[DrumHub] ✅ studios INSERT 성공 →", { ...data, photo_url: data.photo_url ? "[저장됨]" : null });
    toast.success("연습실이 등록되었습니다! 🎉", {
      description: "연습실 찾기 상단에 바로 표시됩니다.",
      duration: 3000,
    });

    reload();
    setForm({ ...EMPTY_FORM });
    setPhoto("");
    setSubmitted(true);
    setTimeout(() => { setSubmitted(false); setShowForm(false); }, 1400);
  };

  const setF = (k: keyof typeof EMPTY_FORM) => (v: string) =>
    setForm((p) => ({ ...p, [k]: v }));

  const canSubmit = form.name.trim() && form.location.trim() && form.price.trim() && !submitting;

  return (
    <div className="min-h-screen" style={{ background: DARK_BG }}>
      <Navbar />

      {/* ── 헤더 ─────────────────────────────────────────────── */}
      <div className="px-4 pt-8 pb-6"
        style={{ background: `radial-gradient(ellipse at 50% 0%, ${GOLD}12 0%, transparent 65%), ${DARK_BG}` }}>
        <div className="max-w-2xl mx-auto flex items-end justify-between">
          <div>
            <p className="inline-block text-xs font-bold rounded-full px-4 py-1.5 mb-4"
              style={{ background: `${GOLD}18`, color: GOLD, border: `1px solid ${GOLD}40` }}>
              🎸 연습실 찾기
            </p>
            <h1 className="text-3xl font-extrabold text-white leading-tight mb-1">드럼 연습실 검색</h1>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
              내 근처 드럼 연습실을 찾고 바로 예약하세요
            </p>
          </div>
          <button onClick={openForm}
            className="flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-extrabold text-black hover:opacity-90 transition-opacity flex-shrink-0"
            style={{ background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})` }}>
            <Plus size={15} /> 연습실 등록
          </button>
        </div>
      </div>

      {/* ── 지역 필터 ─────────────────────────────────────────── */}
      <div className="max-w-2xl mx-auto px-4 mb-6">
        <div className="rounded-2xl px-4 py-3" style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
          <div className="flex gap-1.5 flex-wrap">
            <span className="text-xs font-bold self-center mr-1" style={{ color: "rgba(255,255,255,0.4)" }}>지역</span>
            {REGIONS.map((r) => (
              <button key={r} onClick={() => setRegion(r)}
                className="text-xs font-bold rounded-full px-3 py-1 transition-colors"
                style={region === r
                  ? { background: `${GOLD}33`, color: GOLD, border: `1px solid ${GOLD}80` }
                  : { background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)" }}>
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── 콘텐츠 ───────────────────────────────────────────── */}
      <div className="max-w-2xl mx-auto px-4 pb-12 space-y-8">

        {/* DrumHub 등록 연습실 */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-extrabold text-white text-base">✦ DrumHub 등록 연습실</h2>
              <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
                {studioLoading ? "불러오는 중…" : `${studios.length}곳 등록됨`}
              </p>
            </div>
            <button onClick={reload} disabled={studioLoading}
              className="p-2 rounded-xl hover:opacity-60 disabled:opacity-30 transition-opacity"
              style={{ color: GOLD, border: `1px solid ${BORDER}` }}>
              <RefreshCw size={14} className={studioLoading ? "animate-spin" : ""} />
            </button>
          </div>

          {studioLoading
            ? <div className="space-y-4">{[0, 1].map((i) => <SkeletonStudioCard key={i} />)}</div>
            : studios.length > 0
              ? <div className="space-y-4">{studios.map((s) => (
                  <StudioCard key={s.id} studio={s} onContact={() => setContactOf(s)} />
                ))}</div>
              : <EmptyRegistered onRegister={openForm} />
          }
        </section>

        <div className="h-px" style={{ background: BORDER }} />

        {/* CSE 실시간 검색 */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            {cseLoading && <DrumDots />}
            <div>
              <h2 className="text-base font-extrabold text-white">🔍 실시간 검색 결과</h2>
              <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>구글 검색 기반</p>
            </div>
            {!cseLoading && cseItems && cseItems.length > 0 && (
              <span className="ml-auto text-xs font-bold" style={{ color: GOLD }}>{cseItems.length}곳</span>
            )}
          </div>
          <div className="space-y-4">
            {cseLoading
              ? [0, 1, 2].map((i) => <SkeletonStudioCard key={i} />)
              : cseItems && cseItems.length > 0
                ? cseItems.map((item) => <StudioCSECard key={item.id} item={item} />)
                : (
                  <div className="rounded-2xl py-10 text-center"
                    style={{ border: `2px dashed ${BORDER}`, background: "rgba(212,175,55,0.02)" }}>
                    <p className="text-xs font-semibold" style={{ color: "rgba(255,255,255,0.3)" }}>
                      검색 결과가 없습니다.
                    </p>
                  </div>
                )
            }
          </div>
        </section>
      </div>

      {/* 문의 팝업 */}
      {contactOf && <ContactModal studio={contactOf} onClose={() => setContactOf(null)} />}

      {/* ── 연습실 등록 Sheet ─────────────────────────────────── */}
      <Sheet open={showForm} onOpenChange={setShowForm}>
        <SheetContent side="bottom" className="h-[94vh] rounded-t-3xl overflow-y-auto"
          style={{ background: "#0d0f1a", borderTop: `1px solid ${BORDER}` }}>
          <SheetHeader className="pb-4 border-b" style={{ borderColor: BORDER }}>
            <SheetTitle className="text-left font-extrabold text-lg text-white">
              🎸 연습실 등록
            </SheetTitle>
          </SheetHeader>

          {submitted ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <span className="text-6xl">🎉</span>
              <p className="font-extrabold text-white text-lg">등록 완료!</p>
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
                연습실 찾기 상단에 바로 표시됩니다.
              </p>
            </div>
          ) : (
            <div className="py-5 space-y-5">

              <p className="text-xs font-extrabold tracking-widest uppercase" style={{ color: GOLD }}>기본 정보</p>

              {/* 이름 */}
              <div>
                <label className="text-sm font-bold mb-1.5 block" style={{ color: "rgba(255,255,255,0.7)" }}>
                  연습실 이름 <span className="text-red-400">*</span>
                </label>
                <input value={form.name} onChange={(e) => setF("name")(e.target.value)}
                  placeholder="예: 홍대 드럼스튜디오"
                  className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none"
                  style={{ background: "rgba(255,255,255,0.04)", border: `2px solid ${BORDER}` }} />
              </div>

              {/* 위치 + 가격 */}
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-sm font-bold mb-1.5 block" style={{ color: "rgba(255,255,255,0.7)" }}>
                    위치 <span className="text-red-400">*</span>
                  </label>
                  <input value={form.location} onChange={(e) => setF("location")(e.target.value)}
                    placeholder="예: 서울 홍대"
                    className="w-full rounded-xl px-3 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none"
                    style={{ background: "rgba(255,255,255,0.04)", border: `2px solid ${BORDER}` }} />
                </div>
                <div className="flex-1">
                  <label className="text-sm font-bold mb-1.5 block" style={{ color: "rgba(255,255,255,0.7)" }}>
                    시간당 가격 <span className="text-red-400">*</span>
                  </label>
                  <input value={form.price} onChange={(e) => setF("price")(e.target.value)}
                    placeholder="예: 10,000원/h"
                    className="w-full rounded-xl px-3 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none"
                    style={{ background: "rgba(255,255,255,0.04)", border: `2px solid ${BORDER}` }} />
                </div>
              </div>

              <p className="text-xs font-extrabold tracking-widest uppercase pt-2" style={{ color: GOLD }}>장비·시설 정보 (선택)</p>

              {/* 보유 장비 */}
              <div>
                <label className="text-sm font-bold mb-1.5 block" style={{ color: "rgba(255,255,255,0.7)" }}>
                  보유 장비
                </label>
                <input value={form.equipment} onChange={(e) => setF("equipment")(e.target.value)}
                  placeholder="예: 야마하 드럼 세트 2대, 심벌 세트, 방음 완비"
                  className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none"
                  style={{ background: "rgba(255,255,255,0.04)", border: `2px solid ${BORDER}` }} />
              </div>

              {/* 설명 */}
              <div>
                <label className="text-sm font-bold mb-1.5 block" style={{ color: "rgba(255,255,255,0.7)" }}>
                  연습실 소개
                </label>
                <textarea value={form.description} onChange={(e) => setF("description")(e.target.value)}
                  placeholder="운영 시간, 주차 가능 여부, 주변 교통 정보 등"
                  rows={3}
                  className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none resize-none"
                  style={{ background: "rgba(255,255,255,0.04)", border: `2px solid ${BORDER}` }} />
              </div>

              {/* 연락처 */}
              <div>
                <label className="text-sm font-bold mb-1.5 block" style={{ color: "rgba(255,255,255,0.7)" }}>
                  연락처
                </label>
                <input value={form.contact} onChange={(e) => setF("contact")(e.target.value)}
                  placeholder="전화번호 / 카카오 ID / SNS"
                  className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none"
                  style={{ background: "rgba(255,255,255,0.04)", border: `2px solid ${BORDER}` }} />
              </div>

              <p className="text-xs font-extrabold tracking-widest uppercase pt-2" style={{ color: GOLD }}>사진 (선택)</p>

              {/* 사진 업로드 */}
              <div>
                <div className="flex items-center gap-4 rounded-2xl p-4 cursor-pointer hover:border-[rgba(212,175,55,0.4)] transition-colors"
                  style={{ border: `2px dashed ${BORDER}`, background: "rgba(255,255,255,0.02)" }}
                  onClick={() => photoInputRef.current?.click()}>
                  {photo ? (
                    <>
                      <img src={photo} alt="preview" className="w-20 h-16 rounded-xl object-cover flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-bold text-white">사진 선택 완료</p>
                        <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>다른 사진으로 변경</p>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); setPhoto(""); }}
                        style={{ color: "rgba(255,255,255,0.3)" }}><X size={16} /></button>
                    </>
                  ) : (
                    <>
                      <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: `${GOLD}12` }}>
                        <Camera size={22} style={{ color: GOLD }} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">연습실 사진 업로드</p>
                        <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>JPG / PNG · 최대 800KB</p>
                      </div>
                    </>
                  )}
                </div>
                <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
              </div>

              {/* 등록 버튼 */}
              <Button onClick={handleSubmit} disabled={!canSubmit}
                className="w-full rounded-2xl h-14 text-base font-extrabold text-black disabled:opacity-40"
                style={{ background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})` }}>
                {submitting ? "등록 중…" : "연습실 등록하기"}
              </Button>

              <p className="text-center text-xs pb-4" style={{ color: "rgba(255,255,255,0.25)" }}>
                등록된 정보는 누구나 열람할 수 있습니다.
              </p>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <Footer />
    </div>
  );
};

export default StudioSearch;
