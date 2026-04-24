/**
 * DrumHub — 초간결 홈 피드 (통합 스트림)
 * - useFeedStream으로 3개 섹션 병렬 조회
 * - [NEW] 배지, Pull-to-Refresh, 탭 포커스 자동 갱신
 * - 카드 클릭 → 각 DrumHub 세부 페이지 연결
 */

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useFeedStream } from "@/hooks/useFeedStream";
import { useSupabasePosts, type DbPost } from "@/hooks/useSupabasePosts";
import { useSupabaseInstructors, type InstructorProfile } from "@/hooks/useSupabaseInstructors";
import { useSupabaseStudios, type Studio } from "@/hooks/useSupabaseStudios";
import { Search, RefreshCw, MapPin, Clock, Drum, Play } from "lucide-react";

// ── 색상 ─────────────────────────────────────────────────────
const GOLD       = "#D4AF37";
const GOLD_LIGHT = "#F5E27A";
const DARK_BG    = "#0d0f1a";
const CARD_BG    = "#161929";
const BORDER     = "rgba(212,175,55,0.18)";

// ── [NEW] 배지 ────────────────────────────────────────────────
function NewBadge() {
  return (
    <span
      className="flex-none text-xs font-extrabold rounded-full px-2 py-0.5 animate-pulse"
      style={{
        background: "rgba(255,60,60,0.18)",
        color: "#ff5c5c",
        border: "1px solid rgba(255,60,60,0.35)",
      }}
    >
      NEW
    </span>
  );
}

// ── 태그 배지 ─────────────────────────────────────────────────
type TagType = "학원" | "강사" | "영상";
const TAG_STYLE: Record<TagType, { bg: string; color: string; border: string }> = {
  학원: { bg: `${GOLD}22`,              color: GOLD,      border: `1px solid ${GOLD}55` },
  강사: { bg: "rgba(100,180,255,0.15)", color: "#64b4ff", border: "1px solid rgba(100,180,255,0.35)" },
  영상: { bg: "rgba(255,90,90,0.15)",   color: "#ff6464", border: "1px solid rgba(255,90,90,0.35)" },
};

function TagBadge({ label }: { label: TagType }) {
  const s = TAG_STYLE[label];
  return (
    <span
      className="flex-none text-xs font-extrabold rounded-full px-2.5 py-0.5"
      style={{ background: s.bg, color: s.color, border: s.border }}
    >
      {label}
    </span>
  );
}

// ── 드럼 바운스 로딩 ──────────────────────────────────────────
function DrumDots() {
  return (
    <>
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full inline-block"
            style={{ background: GOLD, animation: `drum-b 0.8s ease-in-out ${i * 0.15}s infinite` }}
          />
        ))}
      </div>
      <style>{`@keyframes drum-b{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}`}</style>
    </>
  );
}

// ── 스켈레톤 — 텍스트 카드 ────────────────────────────────────
function SkeletonTextCard() {
  return (
    <div className="rounded-2xl p-4 animate-pulse" style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="h-4 flex-1 rounded"            style={{ background: "rgba(255,255,255,0.09)" }} />
        <div className="h-5 w-10 rounded-full flex-none" style={{ background: "rgba(255,255,255,0.07)" }} />
      </div>
      <div className="h-3 w-full rounded mb-1.5" style={{ background: "rgba(255,255,255,0.06)" }} />
      <div className="h-3 w-4/5 rounded mb-4"   style={{ background: "rgba(255,255,255,0.06)" }} />
      <div className="h-8 w-24 rounded-full"    style={{ background: "rgba(255,255,255,0.07)" }} />
    </div>
  );
}

// ── 스켈레톤 — 연습실 카드 ───────────────────────────────────
function SkeletonStudioCard() {
  return (
    <div className="rounded-2xl overflow-hidden animate-pulse" style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
      <div className="h-32" style={{ background: "rgba(255,255,255,0.07)" }} />
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="h-4 w-1/2 rounded" style={{ background: "rgba(255,255,255,0.09)" }} />
          <div className="h-6 w-20 rounded-full" style={{ background: "rgba(255,255,255,0.09)" }} />
        </div>
        <div className="h-3 w-1/3 rounded mb-3" style={{ background: "rgba(255,255,255,0.06)" }} />
        <div className="h-9 rounded-xl"         style={{ background: "rgba(255,255,255,0.07)" }} />
      </div>
    </div>
  );
}

// ── 빈 결과 ──────────────────────────────────────────────────
function EmptySection() {
  return (
    <div
      className="rounded-2xl py-10 text-center"
      style={{ border: `2px dashed ${BORDER}`, background: "rgba(212,175,55,0.02)" }}
    >
      <p className="text-3xl mb-2">🥁</p>
      <p className="text-xs font-semibold" style={{ color: "rgba(255,255,255,0.3)" }}>
        API 키가 설정되면 실시간 데이터가 표시됩니다.
      </p>
    </div>
  );
}

// ── 섹션 라벨 ─────────────────────────────────────────────────
function SectionLabel({ emoji, title, loading }: { emoji: string; title: string; loading: boolean }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="text-base leading-none">{emoji}</span>
      <span className="text-xs font-extrabold tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.35)" }}>
        {title}
      </span>
      {loading && <DrumDots />}
    </div>
  );
}

// ── 구분선 ───────────────────────────────────────────────────
function Divider() {
  return <div className="h-px w-full" style={{ background: BORDER }} />;
}

// ── 더보기 링크 ───────────────────────────────────────────────
function MoreLink({ to, label }: { to: string; label: string }) {
  return (
    <Link
      to={to}
      className="flex items-center justify-center mt-3 py-2 text-xs font-bold tracking-wider transition-opacity hover:opacity-60"
      style={{ color: "rgba(255,255,255,0.2)" }}
    >
      {label} →
    </Link>
  );
}

// ── 마지막 새로고침 시간 표시 ─────────────────────────────────
function useRelativeTime(ts: number) {
  const [label, setLabel] = useState("방금");
  useEffect(() => {
    const update = () => {
      const diff = Math.floor((Date.now() - ts) / 1000);
      if (diff < 60)       setLabel("방금");
      else if (diff < 3600) setLabel(`${Math.floor(diff / 60)}분 전`);
      else                  setLabel(`${Math.floor(diff / 3600)}시간 전`);
    };
    update();
    const t = setInterval(update, 30_000);
    return () => clearInterval(t);
  }, [ts]);
  return label;
}

// ── 공고 카드 ─────────────────────────────────────────────────
function JobCard({ item, searchQ }: { item: FeedItem; searchQ: string }) {
  const academyLink = searchQ
    ? `/academies?q=${encodeURIComponent(searchQ)}`
    : `/academies?q=${encodeURIComponent(item.title.split(" ").slice(0, 4).join(" "))}`;

  return (
    <div
      className="rounded-2xl p-4 transition-all hover:border-[rgba(212,175,55,0.35)]"
      style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}
    >
      {/* 제목 행 */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="font-extrabold text-white text-sm leading-snug line-clamp-2 flex-1">
          {item.title}
        </p>
        <div className="flex items-center gap-1.5 flex-none">
          {item.isNew && <NewBadge />}
          <TagBadge label="학원" />
        </div>
      </div>

      <p className="text-xs leading-relaxed line-clamp-2 mb-3" style={{ color: "rgba(255,255,255,0.45)" }}>
        {item.snippet}
      </p>

      {/* 버튼 행 */}
      <div className="flex items-center gap-2 flex-wrap">
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-bold rounded-full px-4 py-2 transition-opacity hover:opacity-75"
          style={{ background: `${GOLD}22`, color: GOLD, border: `1px solid ${GOLD}50` }}
        >
          <ExternalLink size={11} /> 상세 보기
        </a>
        <Link
          to={academyLink}
          className="inline-flex items-center gap-1.5 text-xs font-bold rounded-full px-4 py-2 transition-opacity hover:opacity-75"
          style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)", border: `1px solid ${BORDER}` }}
        >
          🏫 학원 더보기
        </Link>
      </div>
    </div>
  );
}

// ── 강사 카드 ─────────────────────────────────────────────────
function InstructorCard({ item }: { item: FeedItem }) {
  return (
    <div
      className="rounded-2xl p-4 transition-all hover:border-[rgba(100,180,255,0.35)]"
      style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="font-extrabold text-white text-sm leading-snug line-clamp-2 flex-1">
          {item.title}
        </p>
        <div className="flex items-center gap-1.5 flex-none">
          {item.isNew && <NewBadge />}
          <TagBadge label="강사" />
        </div>
      </div>

      <p className="text-xs leading-relaxed line-clamp-2 mb-3" style={{ color: "rgba(255,255,255,0.45)" }}>
        {item.snippet}
      </p>

      <div className="flex items-center gap-2 flex-wrap">
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-bold rounded-full px-4 py-2 transition-opacity hover:opacity-75"
          style={{ background: "rgba(100,180,255,0.12)", color: "#64b4ff", border: "1px solid rgba(100,180,255,0.3)" }}
        >
          <ExternalLink size={11} /> 프로필 보기
        </a>
        <Link
          to="/instructors"
          className="inline-flex items-center gap-1.5 text-xs font-bold rounded-full px-4 py-2 transition-opacity hover:opacity-75"
          style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)", border: `1px solid ${BORDER}` }}
        >
          🥁 강사 더보기
        </Link>
      </div>
    </div>
  );
}

// ── 홈 연습실 카드 (Supabase) ────────────────────────────────
function DbStudioCard({ studio }: { studio: Studio }) {
  const hasPhoto = !!studio.photoUrl;
  const [imgErr, setImgErr] = useState(false);

  return (
    <Link to={`/studios/${studio.id}`} className="block">
      <div
        className="rounded-2xl overflow-hidden transition-all hover:border-[rgba(212,175,55,0.38)] cursor-pointer"
        style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}
      >
        {/* 사진 + 가격 오버레이 */}
        <div className="relative h-28 overflow-hidden"
          style={{ background: `${GOLD}0a` }}>
          {hasPhoto && !imgErr ? (
            <img src={studio.photoUrl} alt={studio.name}
              className="w-full h-full object-cover"
              onError={() => setImgErr(true)} />
          ) : (
            <div className="w-full h-full flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${GOLD}10, ${GOLD}04)` }}>
              <span className="text-3xl opacity-25">🥁</span>
            </div>
          )}
          <div className="absolute top-2 right-2">
            <span className="font-extrabold text-xs rounded-full px-2.5 py-1 text-black shadow-md"
              style={{ background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})` }}>
              {studio.price}
            </span>
          </div>
        </div>

        {/* 정보 */}
        <div className="p-3">
          <div className="flex items-start justify-between gap-2 mb-1">
            <p className="font-extrabold text-white text-sm leading-snug line-clamp-1 flex-1">
              {studio.name}
            </p>
            <span className="flex-none text-xs font-extrabold rounded-full px-2.5 py-0.5"
              style={{ background: "rgba(100,220,180,0.15)", color: "#64dcb4", border: "1px solid rgba(100,220,180,0.35)" }}>
              연습실
            </span>
          </div>
          <p className="text-xs flex items-center gap-1" style={{ color: "rgba(255,255,255,0.4)" }}>
            <MapPin size={10} style={{ color: GOLD }} /> {studio.location}
          </p>
          {studio.equipment && (
            <p className="text-xs mt-1 flex items-center gap-1" style={{ color: "rgba(255,255,255,0.35)" }}>
              <Drum size={10} /> {studio.equipment}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}

// ── 급구 배지 ─────────────────────────────────────────────────
function UrgentBadge() {
  return (
    <span
      className="text-xs font-extrabold rounded-full px-2 py-0.5"
      style={{
        background: "rgba(239,68,68,0.15)",
        color: "#f87171",
        border: "1px solid rgba(239,68,68,0.3)",
      }}
    >
      급구
    </span>
  );
}

// ── DB 공고 카드 (다크 럭셔리) ────────────────────────────────
function DbJobCard({ post }: { post: DbPost }) {
  return (
    <Link to={`/posts/${post.id}`} className="block">
      <div
        className="rounded-2xl p-4 transition-all hover:border-[rgba(212,175,55,0.45)] cursor-pointer"
        style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}
      >
        {/* 배지 행 */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            {post.urgent && <UrgentBadge />}
            <span
              className="text-xs font-extrabold rounded-full px-2.5 py-0.5"
              style={{ background: `${GOLD}22`, color: GOLD, border: `1px solid ${GOLD}55` }}
            >
              {post.category}
            </span>
          </div>
          <TagBadge label="학원" />
        </div>

        {/* 제목 */}
        <p className="font-extrabold text-white text-sm leading-snug line-clamp-2 mb-1">
          {post.title}
        </p>

        {/* 장소 */}
        <p className="text-xs font-semibold mb-2" style={{ color: GOLD }}>
          {post.place}
        </p>

        {/* 설명 */}
        <p
          className="text-xs leading-relaxed line-clamp-2 mb-3"
          style={{ color: "rgba(255,255,255,0.45)" }}
        >
          {post.description}
        </p>

        {/* 하단: 지역·날짜 / 급여 */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span
              className="text-xs flex items-center gap-1"
              style={{ color: "rgba(255,255,255,0.3)" }}
            >
              <MapPin size={10} /> {post.region}
            </span>
            <span
              className="text-xs flex items-center gap-1"
              style={{ color: "rgba(255,255,255,0.3)" }}
            >
              <Clock size={10} /> {post.postedAt}
            </span>
          </div>
          <span className="text-xs font-extrabold" style={{ color: GOLD }}>
            {post.salary}
          </span>
        </div>
      </div>
    </Link>
  );
}

// ── 홈 강사 카드 (Supabase) ───────────────────────────────────
function DbInstructorCard({ profile }: { profile: InstructorProfile }) {
  const hasPhoto = !!profile.photoUrl;
  const hasVideo = !!profile.youtubeUrl;

  return (
    <Link to={`/teachers/${profile.id}`} className="block">
      <div
        className="rounded-2xl p-4 transition-all hover:border-[rgba(100,180,255,0.45)] cursor-pointer"
        style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}
      >
        <div className="flex items-start gap-3">
          {/* 프로필 사진 */}
          <div
            className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center text-xl"
            style={{ background: `${GOLD}15`, border: `1px solid ${GOLD}28` }}
          >
            {hasPhoto ? (
              <img src={profile.photoUrl} alt={profile.name} className="w-full h-full object-cover" />
            ) : (
              "🥁"
            )}
          </div>

          {/* 정보 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <p className="font-extrabold text-white text-sm leading-snug">{profile.name}</p>
              <div className="flex gap-1 flex-none">
                {hasVideo && (
                  <span
                    className="text-xs font-bold rounded-full px-2 py-0.5"
                    style={{
                      background: "rgba(255,80,80,0.15)",
                      color: "#ff6464",
                      border: "1px solid rgba(255,80,80,0.3)",
                    }}
                  >
                    영상
                  </span>
                )}
                <TagBadge label="강사" />
              </div>
            </div>

            <span
              className="inline-block text-xs font-extrabold rounded-full px-2 py-0.5 mb-1 text-black"
              style={{ background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})` }}
            >
              {profile.genre}
            </span>

            <p className="text-xs line-clamp-2 leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>
              {profile.bio}
            </p>
            <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.25)" }}>
              📍 {profile.location}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ── 메인 ─────────────────────────────────────────────────────
const Index = () => {
  const [search,    setSearch]    = useState("");
  const [debounced, setDebounced] = useState("");

  // 400ms 디바운스
  useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 400);
    return () => clearTimeout(t);
  }, [search]);

  const {
    loading,
    refresh,
    lastRefreshed,
    pullProgress,
  } = useFeedStream(debounced);

  // Supabase 실데이터 (최신 드럼 공고 섹션)
  const { posts: dbPosts, loading: dbLoading, reload: reloadDb } = useSupabasePosts(5);

  // Supabase 강사 프로필 (활동 중인 선생님 섹션)
  const { profiles: instProfiles, loading: instProfileLoading, reload: reloadInst } = useSupabaseInstructors(5);

  // Supabase 연습실 (내 근처 연습실 섹션)
  const { studios, loading: studioLoading, reload: reloadStudios } = useSupabaseStudios(5);

  const anyLoading = dbLoading || instProfileLoading || studioLoading;

  // 전체 새로고침 (pull-to-refresh 포함)
  const handleRefresh = () => { refresh(); reloadDb(); reloadInst(); reloadStudios(); };

  const timeAgo = useRelativeTime(lastRefreshed);

  return (
    <div className="min-h-screen" style={{ background: DARK_BG }}>
      <Navbar />

      {/* ── Pull-to-Refresh 인디케이터 ───────────────────────── */}
      {pullProgress > 0 && (
        <div
          className="flex items-center justify-center gap-2 overflow-hidden transition-all"
          style={{
            height: `${Math.round((pullProgress / 100) * 44)}px`,
            background: `${GOLD}10`,
          }}
        >
          <RefreshCw
            size={14}
            className="transition-transform"
            style={{
              color: GOLD,
              transform: `rotate(${Math.round(pullProgress * 3.6)}deg)`,
              opacity: pullProgress / 100,
            }}
          />
          {pullProgress >= 100 && (
            <span className="text-xs font-bold" style={{ color: GOLD }}>
              놓으면 새로고침
            </span>
          )}
        </div>
      )}

      {/* ── 통합 검색바 — sticky ─────────────────────────────── */}
      <div
        className="sticky top-24 z-30 max-w-2xl mx-auto px-4 pt-4 pb-3"
        style={{ background: `${DARK_BG}f0`, backdropFilter: "blur(14px)" }}
      >
        <div className="relative">
          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: search ? GOLD : "rgba(212,175,55,0.4)" }}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="드럼 공고, 강사, 레슨 검색…"
            className="w-full rounded-2xl pl-11 pr-4 py-3 text-sm font-medium bg-transparent text-white placeholder:text-gray-600 focus:outline-none transition-all"
            style={{
              background: CARD_BG,
              border: `1.5px solid ${search ? GOLD + "80" : BORDER}`,
              boxShadow: search ? `0 0 0 3px ${GOLD}12` : "none",
            }}
          />
        </div>

        {/* 마지막 갱신 시간 + 수동 새로고침 */}
        <div className="flex items-center justify-between mt-2 px-1">
          <span className="text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>
            {anyLoading ? "업데이트 중…" : `${timeAgo} 업데이트`}
          </span>
          <button
            onClick={handleRefresh}
            disabled={anyLoading}
            className="flex items-center gap-1 text-xs font-bold transition-opacity hover:opacity-70 disabled:opacity-30"
            style={{ color: GOLD }}
          >
            <RefreshCw size={11} className={anyLoading ? "animate-spin" : ""} />
            새로고침
          </button>
        </div>
      </div>

      {/* ── 피드 ─────────────────────────────────────────────── */}
      <div className="max-w-2xl mx-auto px-4 pt-2 pb-14 space-y-8">

        {/* 섹션 1: 최신 드럼 공고 — Supabase 실데이터 */}
        <section>
          <SectionLabel emoji="🏫" title="최신 드럼 공고" loading={dbLoading} />
          <div className="space-y-3">
            {dbLoading
              ? [0, 1, 2].map((i) => <SkeletonTextCard key={i} />)
              : dbPosts.length > 0
                ? dbPosts.map((post) => <DbJobCard key={post.id} post={post} />)
                : <EmptySection />
            }
          </div>
          <MoreLink to="/feed" label="전체 공고 보기" />
        </section>

        <Divider />

        {/* 섹션 2: 활동 중인 선생님 — Supabase 등록 프로필 */}
        <section>
          <SectionLabel emoji="🥁" title="활동 중인 선생님" loading={instProfileLoading} />
          <div className="space-y-3">
            {instProfileLoading
              ? [0, 1, 2].map((i) => <SkeletonTextCard key={i} />)
              : instProfiles.length > 0
                ? instProfiles.map((p) => <DbInstructorCard key={p.id} profile={p} />)
                : <EmptySection />
            }
          </div>
          <MoreLink to="/instructors" label="강사 프로필 더보기" />
        </section>

        <Divider />

        {/* 섹션 3: 내 근처 연습실 — Supabase */}
        <section>
          <SectionLabel emoji="🎸" title="내 근처 연습실" loading={studioLoading} />
          <div className="space-y-3">
            {studioLoading
              ? [0, 1].map((i) => <SkeletonStudioCard key={i} />)
              : studios.length > 0
                ? studios.map((s) => <DbStudioCard key={s.id} studio={s} />)
                : <EmptySection />
            }
          </div>
          <MoreLink to="/studios" label="연습실 더보기" />
        </section>

      </div>

      <Footer />
    </div>
  );
};

export default Index;
