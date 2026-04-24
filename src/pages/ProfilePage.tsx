/**
 * DrumHub — 마이페이지 / 프로필 설정
 * 로그인한 유저가 닉네임·한 줄 소개·지역·프로필 사진을 설정합니다.
 * Supabase `profiles` 테이블과 `avatars` Storage 버킷을 사용합니다.
 */

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/contexts/ProfileContext";
import { toast } from "sonner";
import { Camera, Save, Loader2, ChevronLeft, User } from "lucide-react";

// ── 색상 ─────────────────────────────────────────────────────
const GOLD       = "#D4AF37";
const GOLD_LIGHT = "#F5E27A";
const DARK_BG    = "#0d0f1a";
const CARD_BG    = "#161929";
const BORDER     = "rgba(212,175,55,0.18)";

// ── 지역 목록 ─────────────────────────────────────────────────
const REGIONS = [
  "서울 강남/서초", "서울 홍대/마포", "서울 종로/중구", "서울 노원/도봉",
  "서울 강서/양천", "서울 송파/강동", "경기 분당/성남", "경기 수원",
  "경기 일산/고양", "경기 용인/수원", "인천", "대전/세종",
  "대구", "광주", "부산", "울산", "제주", "기타",
];

// ── Profile 타입 ──────────────────────────────────────────────
interface Profile {
  nickname:   string;
  bio:        string;
  region:     string;
  avatar_url: string;
}

const DEFAULT_PROFILE: Profile = {
  nickname:   "",
  bio:        "",
  region:     "",
  avatar_url: "",
};

// ── 프로필 사진 위젯 ──────────────────────────────────────────
function AvatarUploader({
  avatarUrl,
  nickname,
  uploading,
  onFileSelect,
}: {
  avatarUrl: string;
  nickname:  string;
  uploading: boolean;
  onFileSelect: (file: File) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const initial  = nickname?.charAt(0)?.toUpperCase() || "🥁";

  return (
    <div className="flex flex-col items-center gap-3 mb-6">
      <div className="relative">
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center overflow-hidden"
          style={{ background: `${GOLD}18`, border: `3px solid ${GOLD}40` }}
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="프로필"
              className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          ) : (
            <span className="text-3xl font-extrabold" style={{ color: GOLD }}>
              {initial}
            </span>
          )}
        </div>

        {/* 카메라 버튼 */}
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center transition-opacity hover:opacity-80 disabled:opacity-40"
          style={{ background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})` }}
        >
          {uploading
            ? <Loader2 size={14} className="animate-spin text-black" />
            : <Camera size={14} className="text-black" />
          }
        </button>
      </div>

      <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
        탭하여 사진 변경 (JPG, PNG, 최대 2MB)
      </p>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFileSelect(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}

// ── 메인 ─────────────────────────────────────────────────────
const ProfilePage = () => {
  const navigate      = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { refreshProfile } = useProfile();

  const [profile,    setProfile]    = useState<Profile>(DEFAULT_PROFILE);
  const [fetching,   setFetching]   = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [uploading,  setUploading]  = useState(false);

  // 비로그인 접근 차단
  useEffect(() => {
    if (!authLoading && !user) {
      toast.error("로그인이 필요합니다.");
      navigate("/auth", { replace: true });
    }
  }, [authLoading, user, navigate]);

  // 기존 프로필 로드
  useEffect(() => {
    if (!user) return;

    const load = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("nickname, bio, region, avatar_url")
        .eq("id", user.id)
        .maybeSingle();

      if (!error && data) {
        setProfile({
          nickname:   data.nickname   ?? "",
          bio:        data.bio        ?? "",
          region:     data.region     ?? "",
          avatar_url: data.avatar_url ?? "",
        });
      }
      setFetching(false);
    };

    load();
  }, [user]);

  // ── 이미지 업로드 ─────────────────────────────────────────
  const handleFileSelect = async (file: File) => {
    if (!user) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("파일 크기는 2MB 이하여야 합니다.");
      return;
    }

    setUploading(true);

    const ext      = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const filePath = `${user.id}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true, contentType: file.type });

    if (uploadError) {
      toast.error("사진 업로드 실패: " + uploadError.message);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

    const cleanUrl   = data.publicUrl;
    const displayUrl = `${cleanUrl}?t=${Date.now()}`;

    // DB에 즉시 저장 (저장 버튼 클릭 전에도 반영)
    await supabase
      .from("profiles")
      .upsert({ id: user.id, avatar_url: cleanUrl, updated_at: new Date().toISOString() }, { onConflict: "id" });

    setProfile((p) => ({ ...p, avatar_url: displayUrl }));
    refreshProfile();
    toast.success("프로필 사진이 업로드되었습니다.");
    setUploading(false);
  };

  // ── 저장 ─────────────────────────────────────────────────
  const handleSave = async () => {
    if (!user) return;

    if (!profile.nickname.trim()) {
      toast.error("닉네임을 입력해주세요.");
      return;
    }

    setSaving(true);

    const { error } = await supabase
      .from("profiles")
      .upsert(
        {
          id:         user.id,
          nickname:   profile.nickname.trim(),
          bio:        profile.bio.trim(),
          region:     profile.region,
          avatar_url: profile.avatar_url,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );

    setSaving(false);

    if (error) {
      toast.error("저장 실패: " + error.message);
      return;
    }

    await refreshProfile();
    toast.success("프로필이 저장되었습니다! 🥁");
  };

  // ── 로딩 중 ─────────────────────────────────────────────
  if (authLoading || fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: DARK_BG }}>
        <Loader2 size={32} className="animate-spin" style={{ color: GOLD }} />
      </div>
    );
  }

  if (!user) return null;

  const displayEmail =
    user.email ?? user.phone ?? "알 수 없음";

  return (
    <div
      className="min-h-screen pb-20"
      style={{
        background: `radial-gradient(ellipse at 50% 0%, ${GOLD}10 0%, transparent 55%), ${DARK_BG}`,
      }}
    >
      {/* 헤더 */}
      <div
        className="sticky top-0 z-40 border-b"
        style={{ background: `${DARK_BG}ee`, borderColor: BORDER, backdropFilter: "blur(12px)" }}
      >
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-sm font-bold transition-opacity hover:opacity-60"
            style={{ color: "rgba(255,255,255,0.45)" }}
          >
            <ChevronLeft size={18} />
          </button>
          <span className="font-extrabold text-white text-base flex-1">마이페이지</span>
          {/* 저장 버튼 (헤더) */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 rounded-full px-4 h-8 text-xs font-extrabold transition-opacity hover:opacity-80 disabled:opacity-40"
            style={{ background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})`, color: "#0d0f1a" }}
          >
            {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
            저장
          </button>
        </div>
      </div>

      {/* 본문 */}
      <div className="max-w-lg mx-auto px-4 pt-8">

        {/* ── 프로필 카드 ── */}
        <div
          className="rounded-3xl px-6 py-7 mb-5"
          style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}
        >
          {/* 사진 업로더 */}
          <AvatarUploader
            avatarUrl={profile.avatar_url}
            nickname={profile.nickname}
            uploading={uploading}
            onFileSelect={handleFileSelect}
          />

          {/* 계정 정보 (읽기 전용) */}
          <div
            className="flex items-center gap-2 rounded-xl px-4 py-3 mb-5"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <User size={13} style={{ color: "rgba(255,255,255,0.3)" }} />
            <span className="text-xs font-bold" style={{ color: "rgba(255,255,255,0.3)" }}>
              계정:
            </span>
            <span className="text-xs font-mono" style={{ color: "rgba(255,255,255,0.5)" }}>
              {displayEmail}
            </span>
          </div>

          {/* 닉네임 */}
          <Label>닉네임 *</Label>
          <input
            type="text"
            value={profile.nickname}
            onChange={(e) => setProfile((p) => ({ ...p, nickname: e.target.value.slice(0, 20) }))}
            placeholder="드럼허브에서 표시될 이름"
            maxLength={20}
            className="w-full rounded-xl px-4 h-[50px] text-sm font-bold text-white placeholder:text-gray-600 focus:outline-none mb-1 transition-colors"
            style={{ background: "rgba(255,255,255,0.04)", border: `1.5px solid ${BORDER}` }}
            onFocus={(e) => (e.target.style.borderColor = `${GOLD}70`)}
            onBlur={(e)  => (e.target.style.borderColor = BORDER)}
          />
          <p className="text-xs mb-4 text-right" style={{ color: "rgba(255,255,255,0.2)" }}>
            {profile.nickname.length}/20
          </p>

          {/* 한 줄 소개 */}
          <Label>한 줄 소개</Label>
          <textarea
            value={profile.bio}
            onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value.slice(0, 80) }))}
            placeholder="예: 재즈·록 전문 드러머, 레슨 가능"
            rows={2}
            maxLength={80}
            className="w-full rounded-xl px-4 py-3 text-sm font-bold text-white placeholder:text-gray-600 focus:outline-none resize-none mb-1 transition-colors"
            style={{ background: "rgba(255,255,255,0.04)", border: `1.5px solid ${BORDER}` }}
            onFocus={(e) => (e.target.style.borderColor = `${GOLD}70`)}
            onBlur={(e)  => (e.target.style.borderColor = BORDER)}
          />
          <p className="text-xs mb-4 text-right" style={{ color: "rgba(255,255,255,0.2)" }}>
            {profile.bio.length}/80
          </p>

          {/* 주 활동 지역 */}
          <Label>주 활동 지역</Label>
          <div className="relative mb-6">
            <select
              value={profile.region}
              onChange={(e) => setProfile((p) => ({ ...p, region: e.target.value }))}
              className="w-full rounded-xl px-4 h-[50px] text-sm font-bold text-white focus:outline-none appearance-none"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: `1.5px solid ${BORDER}`,
                color: profile.region ? "white" : "rgba(255,255,255,0.35)",
              }}
              onFocus={(e) => (e.target.style.borderColor = `${GOLD}70`)}
              onBlur={(e)  => (e.target.style.borderColor = BORDER)}
            >
              <option value="" style={{ background: CARD_BG }}>지역을 선택해주세요</option>
              {REGIONS.map((r) => (
                <option key={r} value={r} style={{ background: CARD_BG }}>{r}</option>
              ))}
            </select>
            <span
              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs"
              style={{ color: GOLD }}
            >▼</span>
          </div>

          {/* 저장 버튼 (하단) */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full rounded-2xl font-extrabold text-base text-black transition-opacity hover:opacity-90 disabled:opacity-40 flex items-center justify-center gap-2"
            style={{
              background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})`,
              height: "52px",
            }}
          >
            {saving
              ? <><Loader2 size={16} className="animate-spin" /> 저장 중…</>
              : <><Save size={16} /> 프로필 저장</>
            }
          </button>
        </div>

        {/* ── 계정 안내 ── */}
        <div
          className="rounded-2xl px-5 py-4"
          style={{ background: `${GOLD}08`, border: `1px dashed ${GOLD}30` }}
        >
          <p className="text-xs font-bold mb-1" style={{ color: GOLD }}>💡 프로필 안내</p>
          <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.38)" }}>
            설정한 닉네임은 공고 등록·강사 프로필 등 드럼허브 전체에 표시됩니다.<br/>
            프로필 사진은 Supabase <code className="text-xs" style={{ color: `${GOLD}cc` }}>avatars</code> 버킷에 저장됩니다.
          </p>
        </div>
      </div>
    </div>
  );
};

// ── 공용 서브 컴포넌트 ─────────────────────────────────────────
function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-extrabold mb-2 tracking-wide" style={{ color: "rgba(255,255,255,0.5)" }}>
      {children}
    </p>
  );
}

export default ProfilePage;
