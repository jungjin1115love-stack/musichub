/**
 * DrumHub — 드럼 공고 모아보기
 * Supabase feed_posts 테이블 완전 연동.
 * 등록 → Supabase INSERT → 화면 즉시 반영
 */

import { useState, useEffect, useRef } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { MapPin, Clock, Search, Plus, Sparkles, ChevronRight, RefreshCw } from "lucide-react";
import DrumSearch from "@/components/DrumSearch";

// ── 타입 ─────────────────────────────────────────────────────
interface JobPost {
  id:          number;
  title:       string;
  place:       string;
  region:      string;
  category:    string;
  salary:      string;
  description: string;   // DB 컬럼: description
  urgent:      boolean;
  postedAt:    string;
  source:      string;
}

// ── 상수 ─────────────────────────────────────────────────────
const CATEGORIES = ["전체", "드럼", "재즈 드럼", "가요·팝", "CCM", "록·메탈"];
const REGIONS    = ["전체", "서울", "경기", "인천", "부산", "대구", "온라인"];

const CATEGORY_COLOR: Record<string, string> = {
  "드럼":     "bg-orange-100 text-orange-600",
  "재즈 드럼": "bg-blue-100 text-blue-600",
  "가요·팝":   "bg-pink-100 text-pink-600",
  "CCM":      "bg-green-100 text-green-600",
  "록·메탈":   "bg-gray-200 text-gray-700",
};

const EMPTY_FORM = {
  title: "", place: "", region: "", category: "드럼",
  salary: "", description: "", urgent: false,
};

// ── DB row → JobPost 변환 ─────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToPost(row: any): JobPost {
  return {
    id:          row.id,
    title:       row.title,
    place:       row.place,
    region:      row.region,
    category:    row.category,
    salary:      row.salary,
    description: row.description ?? "",
    urgent:      row.urgent,
    postedAt:    row.posted_at,
    source:      row.source,
  };
}

// ── Component ─────────────────────────────────────────────────
const FeedSearch = () => {
  const [searchParams]                    = useSearchParams();
  const highlightId                       = Number(searchParams.get("highlight")) || null;
  const highlightRef                      = useRef<HTMLDivElement | null>(null);
  const navigate                          = useNavigate();
  const { user }                          = useAuth();

  const [query,     setQuery]     = useState("");
  const [category,  setCategory]  = useState("전체");
  const [region,    setRegion]    = useState("전체");
  const [posts,     setPosts]     = useState<JobPost[]>([]);
  const [showForm,  setShowForm]  = useState(false);
  const [form,      setForm]      = useState({ ...EMPTY_FORM });
  const [submitted, setSubmitted] = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [fetching,  setFetching]  = useState(true);

  const openForm = () => {
    if (!user) { navigate("/auth"); return; }
    setShowForm(true);
  };

  // ── Supabase에서 공고 로드 ──────────────────────────────────
  const loadPosts = async () => {
    setFetching(true);
    console.log("[DrumHub] feed_posts 조회 중…");

    const { data, error } = await supabase
      .from("feed_posts")
      .select("*")
      .order("posted_at", { ascending: false });

    if (error) {
      console.error("[DrumHub] ❌ feed_posts SELECT 실패", {
        code:    error.code,
        message: error.message,
        details: error.details,
      });
      toast.error(`조회 실패: ${error.message} (${error.code})`, { duration: 4000 });
      setFetching(false);
      return;
    }
    console.log(`[DrumHub] ✅ feed_posts ${(data ?? []).length}건 로드`);
    setPosts((data ?? []).map(rowToPost));
    setFetching(false);
  };

  useEffect(() => { loadPosts(); }, []);

  // ── 하이라이트 카드로 자동 스크롤 ──────────────────────────
  useEffect(() => {
    if (!highlightId || fetching) return;
    const timer = setTimeout(() => {
      highlightRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 350);
    return () => clearTimeout(timer);
  }, [highlightId, fetching]);

  // ── 검색·필터 ──────────────────────────────────────────────
  const results = posts.filter((p) => {
    const q      = query.trim().toLowerCase();
    const matchQ = !q ||
      p.title.toLowerCase().includes(q) ||
      p.place.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q);
    const matchC = category === "전체" || p.category === category;
    const matchR = region   === "전체" || p.region.startsWith(region);
    return matchQ && matchC && matchR;
  });

  // ── 공고 등록 — Supabase INSERT ────────────────────────────
  const handleSubmit = async () => {
    if (!form.title.trim() || !form.place.trim()) return;
    setLoading(true);

    const payload = {
      title:       form.title,
      place:       form.place,
      region:      form.region      || "미입력",
      category:    form.category,
      salary:      form.salary      || "협의",
      description: form.description,
      urgent:      form.urgent,
      posted_at:   new Date().toISOString().slice(0, 10),
      source:      "자체등록",
    };

    console.log("[DrumHub] 공고 등록 시도 →", payload);

    const { data, error } = await supabase
      .from("feed_posts")
      .insert(payload)
      .select()
      .single();

    setLoading(false);

    if (error || !data) {
      console.error("[DrumHub] ❌ feed_posts INSERT 실패", {
        code:    error?.code,
        message: error?.message,
        details: error?.details,
        hint:    error?.hint,
      });
      toast.error(
        `등록 실패: ${error?.message ?? "알 수 없는 오류"} (${error?.code ?? "-"})`,
        { duration: 5000 }
      );
      return;
    }

    console.log("[DrumHub] ✅ feed_posts INSERT 성공 →", data);

    // 화면 최상단에 즉시 반영
    setPosts((prev) => [rowToPost(data), ...prev]);
    setForm({ ...EMPTY_FORM });
    setSubmitted(true);

    toast.success("드럼허브에 공고가 등록되었습니다! 🎉", {
      description: "새로고침 후에도 유지됩니다.",
      duration: 3000,
    });

    setTimeout(() => { setSubmitted(false); setShowForm(false); }, 1400);
  };

  // ── 렌더 ──────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#fff9f5]">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 py-5 space-y-5">

        {/* 드럼 통합 검색 */}
        <DrumSearch />

        {/* 타이틀 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-800">🥁 드럼 공고 모아보기</h1>
            <p className="text-sm text-gray-500 mt-0.5">DrumHub에 직접 등록된 드럼 강사 공고</p>
          </div>
          <button
            onClick={loadPosts}
            disabled={fetching}
            className="p-2 rounded-xl border border-orange-200 text-orange-400 hover:bg-orange-50 transition-colors disabled:opacity-40"
            title="새로고침"
          >
            <RefreshCw size={16} className={fetching ? "animate-spin" : ""} />
          </button>
        </div>

        {/* 검색 + 필터 */}
        <div className="bg-white rounded-2xl border border-orange-100 p-3 space-y-3">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder='제목·학원명·설명 검색 (예: "재즈 드럼")'
              className="w-full rounded-xl border-2 border-orange-200 pl-9 py-2.5 text-sm font-medium text-gray-700 focus:outline-none focus:border-[#ff8a3d] bg-white"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="flex-1 rounded-xl border-2 border-orange-200 px-3 py-2 text-sm font-medium text-gray-700 focus:outline-none focus:border-[#ff8a3d] bg-white"
            >
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="flex-1 rounded-xl border-2 border-orange-200 px-3 py-2 text-sm font-medium text-gray-700 focus:outline-none focus:border-[#ff8a3d] bg-white"
            >
              {REGIONS.map((r) => <option key={r}>{r}</option>)}
            </select>
          </div>
        </div>

        {/* CTA 배너 */}
        <Link to="/">
          <div className="bg-gradient-to-r from-[#ff8a3d] to-[#ffb347] rounded-2xl px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles size={22} className="text-white flex-shrink-0" />
              <p className="text-white font-extrabold text-sm leading-tight">
                나만의 프로필 카드로 채용담당자에게 먼저 연락받기
              </p>
            </div>
            <ChevronRight size={18} className="text-white flex-shrink-0" />
          </div>
        </Link>

        {/* 공고 리스트 */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="font-extrabold text-gray-800 text-base">📝 등록된 공고</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {fetching ? "불러오는 중…" : `${results.length}개`}
              </p>
            </div>
            <Button
              onClick={openForm}
              className="bg-[#ff8a3d] hover:bg-[#e07030] text-white rounded-xl h-9 text-sm font-bold gap-1 px-4"
            >
              <Plus size={15} /> 공고 등록
            </Button>
          </div>

          {/* 로딩 스켈레톤 */}
          {fetching && (
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="rounded-2xl border border-orange-100 bg-white p-4 animate-pulse">
                  <div className="flex gap-2 mb-3">
                    <div className="h-5 w-12 rounded-full bg-orange-100" />
                    <div className="h-5 w-16 rounded-full bg-orange-100" />
                  </div>
                  <div className="h-5 w-3/4 rounded bg-gray-100 mb-1" />
                  <div className="h-4 w-1/3 rounded bg-gray-100 mb-3" />
                  <div className="h-10 rounded-xl bg-gray-50 mb-3" />
                  <div className="flex justify-between">
                    <div className="h-3 w-24 rounded bg-gray-100" />
                    <div className="h-3 w-20 rounded bg-gray-100" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 공고 카드 목록 */}
          {!fetching && (
            <div className="space-y-3">
              {results.map((post) => (
                <div
                  key={post.id}
                  ref={post.id === highlightId ? highlightRef : undefined}
                >
                <Link to={`/posts/${post.id}`} className="block">
                <Card
                  className="rounded-2xl border shadow-sm bg-white transition-all hover:border-[#ff8a3d] cursor-pointer"
                  style={{
                    borderColor: post.id === highlightId ? "#ff8a3d" : undefined,
                    boxShadow:   post.id === highlightId ? "0 0 0 2px #ff8a3d55, 0 4px 20px #ff8a3d22" : undefined,
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-2 mb-2 flex-wrap">
                      {post.urgent && (
                        <Badge className="bg-red-500 text-white text-xs px-2 py-0 rounded-full flex-shrink-0">급구</Badge>
                      )}
                      <Badge className="bg-orange-500 text-white border-0 text-xs px-2 py-0 rounded-full flex-shrink-0 font-bold">드럼</Badge>
                      <Badge className={`text-xs px-2 py-0 rounded-full border-0 flex-shrink-0 ${CATEGORY_COLOR[post.category] ?? "bg-gray-100 text-gray-500"}`}>
                        {post.category}
                      </Badge>
                    </div>
                    <p className="font-extrabold text-base text-gray-800 mb-0.5">{post.title}</p>
                    <p className="text-sm text-[#ff8a3d] font-semibold mb-2">{post.place}</p>
                    <p className="text-xs text-gray-500 leading-relaxed bg-gray-50 rounded-xl px-3 py-2 mb-3">
                      {post.description}
                    </p>
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <MapPin size={11} /> {post.region}
                        </span>
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Clock size={11} /> {post.postedAt}
                        </span>
                      </div>
                      <span className="text-[#ff8a3d] font-extrabold text-sm whitespace-nowrap">
                        {post.salary}
                      </span>
                    </div>
                  </CardContent>
                </Card>
                </Link>
                </div>
              ))}

              {results.length === 0 && !fetching && (
                <div className="text-center py-12 text-gray-400">
                  <p className="text-4xl mb-3">🔍</p>
                  <p className="font-semibold text-gray-500">검색 결과가 없어요</p>
                  <p className="text-sm mt-1">필터를 바꾸거나 직접 공고를 등록해보세요</p>
                  <Button
                    onClick={openForm}
                    className="mt-4 bg-[#ff8a3d] text-white rounded-xl h-9 text-sm font-bold gap-1"
                  >
                    <Plus size={14} /> 첫 공고 등록하기
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 pb-4 leading-relaxed">
          ⚠️ 자체 등록 공고는 DrumHub가 내용을 보증하지 않습니다.<br />
          공고 내용은 학원·강사 측에 직접 확인하세요.
        </p>
      </main>

      {/* 공고 등록 Sheet */}
      <Sheet open={showForm} onOpenChange={setShowForm}>
        <SheetContent side="bottom" className="h-[92vh] rounded-t-3xl overflow-y-auto">
          <SheetHeader className="pb-4 border-b border-gray-100">
            <SheetTitle className="text-left font-extrabold text-lg text-gray-800">
              📝 공고 등록
            </SheetTitle>
          </SheetHeader>

          {submitted ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <span className="text-6xl">🎉</span>
              <p className="font-extrabold text-gray-800 text-lg">등록 완료!</p>
              <p className="text-sm text-gray-500">공고가 리스트 상단에 추가되었습니다.</p>
            </div>
          ) : (
            <div className="py-4 space-y-4">

              <div>
                <label className="text-sm font-bold text-gray-700 mb-1.5 block">
                  공고 제목 <span className="text-red-400">*</span>
                </label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="예: 드럼 강사 모집 (풀타임)"
                  className="w-full rounded-xl border-2 border-orange-200 px-4 py-3 text-sm focus:outline-none focus:border-[#ff8a3d] bg-white"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-gray-700 mb-1.5 block">
                  학원·강사명 <span className="text-red-400">*</span>
                </label>
                <input
                  value={form.place}
                  onChange={(e) => setForm({ ...form, place: e.target.value })}
                  placeholder="예: 비트팩토리 음악학원"
                  className="w-full rounded-xl border-2 border-orange-200 px-4 py-3 text-sm focus:outline-none focus:border-[#ff8a3d] bg-white"
                />
              </div>

              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-sm font-bold text-gray-700 mb-1.5 block">전공</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full rounded-xl border-2 border-orange-200 px-3 py-3 text-sm focus:outline-none focus:border-[#ff8a3d] bg-white"
                  >
                    {["드럼", "재즈 드럼", "가요·팝", "CCM", "록·메탈"].map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="text-sm font-bold text-gray-700 mb-1.5 block">지역</label>
                  <input
                    value={form.region}
                    onChange={(e) => setForm({ ...form, region: e.target.value })}
                    placeholder="예: 서울 홍대"
                    className="w-full rounded-xl border-2 border-orange-200 px-3 py-3 text-sm focus:outline-none focus:border-[#ff8a3d] bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-bold text-gray-700 mb-1.5 block">급여·레슨비</label>
                <input
                  value={form.salary}
                  onChange={(e) => setForm({ ...form, salary: e.target.value })}
                  placeholder="예: 월 280만원 / 시급 4만원 / 협의"
                  className="w-full rounded-xl border-2 border-orange-200 px-4 py-3 text-sm focus:outline-none focus:border-[#ff8a3d] bg-white"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-gray-700 mb-1.5 block">상세 내용</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="자격 요건, 근무 조건, 연락처 등을 자유롭게 입력하세요"
                  rows={4}
                  className="w-full rounded-xl border-2 border-orange-200 px-4 py-3 text-sm focus:outline-none focus:border-[#ff8a3d] bg-white resize-none"
                />
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.urgent}
                  onChange={(e) => setForm({ ...form, urgent: e.target.checked })}
                  className="w-5 h-5 rounded accent-[#ff8a3d]"
                />
                <span className="text-sm font-bold text-gray-700">급구 표시</span>
                <Badge className="bg-red-500 text-white text-xs px-2 py-0 rounded-full">급구</Badge>
              </label>

              <Button
                onClick={handleSubmit}
                disabled={!form.title.trim() || !form.place.trim() || loading}
                className="w-full bg-[#ff8a3d] hover:bg-[#e07030] disabled:opacity-40 text-white rounded-2xl h-13 text-base font-extrabold py-4"
              >
                {loading ? "등록 중…" : "공고 등록하기"}
              </Button>

              <p className="text-center text-xs text-gray-400">
                등록된 공고는 누구나 볼 수 있으며, 새로고침 후에도 유지됩니다.
              </p>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <Footer />
    </div>
  );
};

export default FeedSearch;
