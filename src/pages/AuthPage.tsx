/**
 * DrumHub — 이메일 OTP 로그인 / 회원가입
 *
 * 테스트 모드 (DEV):
 *   test@drumhub.dev 입력 → [로그인] 한 번으로 signInWithPassword 즉시 완료
 *   (OTP 단계 없음, 이메일 발송 없음)
 *
 * 실서비스:
 *   일반 이메일 → signInWithOtp → verifyOtp(type:"email") 경로
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Mail, ChevronLeft, Loader2, RotateCcw, FlaskConical, CheckCircle2 } from "lucide-react";

// ── 색상 ─────────────────────────────────────────────────────
const GOLD       = "#D4AF37";
const GOLD_LIGHT = "#F5E27A";
const DARK_BG    = "#0d0f1a";
const CARD_BG    = "#161929";
const BORDER     = "rgba(212,175,55,0.18)";

// ── 테스트 크레덴셜 ────────────────────────────────────────────
// 환경변수가 없을 경우 하드코딩 fallback 포함
const IS_DEV        = import.meta.env.DEV;
const TEST_EMAIL    = (import.meta.env.VITE_TEST_EMAIL    as string | undefined) || "test@drumhub.dev";
const TEST_PASSWORD = (import.meta.env.VITE_TEST_PASSWORD as string | undefined) || "12345678";

// ── 테스트 이메일 여부 ─────────────────────────────────────────
function isTestEmail(email: string): boolean {
  if (!IS_DEV) return false;
  return email.trim().toLowerCase() === TEST_EMAIL.trim().toLowerCase();
}

// ── 이메일 간단 검증 ──────────────────────────────────────────
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

// ── 카운트다운 훅 ─────────────────────────────────────────────
function useCountdown(initial: number) {
  const [count, setCount] = useState(0);
  const start = useCallback(() => setCount(initial), [initial]);
  useEffect(() => {
    if (count <= 0) return;
    const t = setTimeout(() => setCount((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [count]);
  return { count, start, done: count <= 0 };
}

// ── OTP 6칸 입력 ─────────────────────────────────────────────
function OtpInput({
  value, onChange, onComplete,
}: {
  value: string;
  onChange: (v: string) => void;
  onComplete: () => void;
}) {
  const refs   = useRef<(HTMLInputElement | null)[]>([]);
  const digits = (value + "      ").slice(0, 6).split("");

  const set = (i: number, digit: string) => {
    const next = digits.map((d, idx) => (idx === i ? digit : d)).join("").trimEnd();
    onChange(next.slice(0, 6));
    if (digit && i < 5) refs.current[i + 1]?.focus();
  };

  const onKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!digits[i]?.trim() && i > 0) {
        onChange(digits.map((d, idx) => (idx === i - 1 ? "" : d)).join("").trimEnd());
        refs.current[i - 1]?.focus();
      } else {
        onChange(digits.map((d, idx) => (idx === i ? "" : d)).join("").trimEnd());
      }
    }
    if (e.key === "Enter" && value.trim().length === 6) onComplete();
  };

  const onPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const p = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    onChange(p);
    refs.current[Math.min(p.length, 5)]?.focus();
  };

  return (
    <div className="flex gap-2 justify-center">
      {[0,1,2,3,4,5].map((i) => (
        <input key={i}
          ref={(el) => { refs.current[i] = el; }}
          type="text" inputMode="numeric" maxLength={1}
          value={digits[i]?.trim() ?? ""}
          onChange={(e) => set(i, e.target.value.replace(/\D/g,"").slice(-1))}
          onKeyDown={(e) => onKeyDown(i, e)}
          onPaste={onPaste}
          className="w-11 h-14 rounded-2xl text-center text-xl font-extrabold text-white focus:outline-none transition-all"
          style={{
            background: digits[i]?.trim() ? `${GOLD}18` : "rgba(255,255,255,0.04)",
            border: `2px solid ${digits[i]?.trim() ? `${GOLD}80` : BORDER}`,
            caretColor: GOLD,
          }}
        />
      ))}
    </div>
  );
}

// ── 테스트 패널 (DEV only) ────────────────────────────────────
function TestPanel({
  onTestLogin,
  testLoading,
}: {
  onTestLogin: () => void;
  testLoading: boolean;
}) {
  if (!IS_DEV) return null;

  const [createStatus, setCreateStatus] = useState<"idle"|"loading"|"ok"|"unconfirmed"|"error">("idle");
  const [createMsg,    setCreateMsg]    = useState("");
  const [createDetail, setCreateDetail] = useState("");

  const handleCreate = async () => {
    setCreateStatus("loading");
    setCreateMsg("");
    setCreateDetail("");

    // ── STEP A: signUp 시도 ───────────────────────────────
    console.log("[DrumHub] 🧪 STEP A — signUp 시도:", TEST_EMAIL, "/ pw:", TEST_PASSWORD);

    const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
      email:    TEST_EMAIL,
      password: TEST_PASSWORD,
      options:  { data: { nickname: "테스트유저" } },
    });

    console.log("[DrumHub] signUp 결과:", { session: signUpData?.session, user: signUpData?.user, error: signUpErr });

    // signUp 자체에서 세션 반환 → 이메일 인증 비활성화 상태, 바로 로그인됨
    if (!signUpErr && signUpData?.session) {
      console.log("[DrumHub] ✅ signUp + 세션 즉시 발급 → 로그인 완료");
      setCreateStatus("ok");
      setCreateMsg("✅ 가입 & 로그인 완료! 자동 이동 중…");
      return;
    }

    // ── STEP B: signInWithPassword 시도 ──────────────────
    // (이미 계정이 있거나, signUp은 됐지만 세션이 없는 경우 모두 포함)
    console.log("[DrumHub] 🧪 STEP B — signInWithPassword 시도:", TEST_EMAIL);

    const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({
      email:    TEST_EMAIL,
      password: TEST_PASSWORD,
    });

    console.log("[DrumHub] signInWithPassword 결과:", { session: signInData?.session, error: signInErr });

    if (!signInErr && signInData?.session) {
      console.log("[DrumHub] ✅ signInWithPassword 성공 → 로그인 완료");
      setCreateStatus("ok");
      setCreateMsg("✅ 로그인 성공! 자동 이동 중…");
      return;
    }

    // ── STEP B 실패 원인 분석 ─────────────────────────────
    const errMsg = (signInErr?.message ?? "").toLowerCase();
    const errCode = signInErr?.status;

    console.error("[DrumHub] ❌ signIn 실패:", errCode, signInErr?.message);
    console.error("[DrumHub] signUp 에러:", signUpErr?.status, signUpErr?.message);

    if (errMsg.includes("email not confirmed") || errMsg.includes("not confirmed")) {
      // 가장 흔한 원인: Supabase에서 이메일 인증 필수 설정
      setCreateStatus("unconfirmed");
      setCreateMsg("⚠ 이메일 인증 필수 설정 감지");
      setCreateDetail(
        "Supabase 대시보드 → Authentication → Settings\n" +
        "→ 'Confirm email' 토글을 OFF 하고 다시 시도하세요."
      );
    } else if (errMsg.includes("invalid") || errMsg.includes("credentials") || errCode === 400) {
      // 비밀번호 불일치: 기존에 다른 비밀번호로 가입된 계정
      setCreateStatus("error");
      setCreateMsg("⚠ 비밀번호 불일치 — 기존 계정의 비밀번호가 다릅니다");
      setCreateDetail(
        "Supabase 대시보드 → Authentication → Users\n" +
        "→ test@drumhub.dev 계정 삭제 후 다시 0️⃣ 누르세요."
      );
    } else {
      setCreateStatus("error");
      setCreateMsg("❌ " + (signInErr?.message ?? "알 수 없는 오류"));
      setCreateDetail("F12 콘솔에서 [DrumHub] 로그를 확인해주세요.");
    }
  };

  const statusColor =
    createStatus === "ok"          ? "#64dc8c" :
    createStatus === "unconfirmed" ? "#fbbf24" :
    createStatus === "error"       ? "#f87171" : "rgba(255,255,255,0.4)";

  return (
    <div className="w-full max-w-sm mt-4 rounded-2xl px-5 py-4"
      style={{ background: "rgba(100,200,100,0.06)", border: "1px dashed rgba(100,200,100,0.3)" }}>

      {/* 헤더 */}
      <div className="flex items-center gap-2 mb-3">
        <FlaskConical size={13} style={{ color: "#64dc8c" }} />
        <span className="text-xs font-extrabold tracking-widest uppercase" style={{ color: "#64dc8c" }}>
          DEV 테스트 모드
        </span>
        <span className="ml-auto text-xs font-bold rounded-full px-2 py-0.5"
          style={{ background: "rgba(100,220,140,0.15)", color: "#64dc8c", border: "1px solid rgba(100,220,140,0.25)" }}>
          이메일 발송 없음
        </span>
      </div>

      {/* 인증 정보 */}
      <div className="rounded-xl px-4 py-3 mb-3 space-y-1"
        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-bold flex-shrink-0" style={{ color: "rgba(255,255,255,0.35)" }}>이메일</span>
          <span className="text-xs font-mono truncate" style={{ color: "#64dc8c" }}>{TEST_EMAIL}</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-bold flex-shrink-0" style={{ color: "rgba(255,255,255,0.35)" }}>비밀번호</span>
          <span className="text-xs font-mono" style={{ color: "#64dc8c" }}>{TEST_PASSWORD}</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-bold flex-shrink-0" style={{ color: "rgba(255,255,255,0.35)" }}>방식</span>
          <span className="text-xs font-bold" style={{ color: "#64b4ff" }}>signInWithPassword</span>
        </div>
      </div>

      {/* STEP 0: 계정 생성 */}
      <p className="text-xs font-extrabold mb-1.5" style={{ color: "rgba(255,255,255,0.35)" }}>
        STEP 0 — 최초 1회 계정 생성
      </p>
      <button
        onClick={handleCreate}
        disabled={createStatus === "loading"}
        className="w-full rounded-xl py-2.5 text-xs font-bold mb-1.5 flex items-center justify-center gap-1.5 transition-opacity hover:opacity-70 disabled:opacity-40"
        style={{ background: "rgba(100,180,255,0.12)", color: "#64b4ff", border: "1px solid rgba(100,180,255,0.3)" }}>
        {createStatus === "loading"
          ? <><Loader2 size={11} className="animate-spin" /> 생성 중…</>
          : "0️⃣ 테스트 계정 자동 생성"}
      </button>

      {createMsg && (
        <div className="mb-3">
          <p className="text-xs font-bold text-center" style={{ color: statusColor }}>
            {createMsg}
          </p>
          {createDetail && (
            <p className="text-xs text-center mt-1.5 whitespace-pre-line leading-relaxed"
              style={{ color: "rgba(255,255,255,0.45)" }}>
              {createDetail}
            </p>
          )}
        </div>
      )}

      {/* STEP 1: 즉시 로그인 */}
      <p className="text-xs font-extrabold mb-1.5" style={{ color: "rgba(255,255,255,0.35)" }}>
        STEP 1 — 즉시 로그인
      </p>
      <button
        onClick={onTestLogin}
        disabled={testLoading}
        className="w-full rounded-xl py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 transition-opacity hover:opacity-70 disabled:opacity-40"
        style={{ background: "rgba(100,220,140,0.15)", color: "#64dc8c", border: "1px solid rgba(100,220,140,0.35)" }}>
        {testLoading
          ? <><Loader2 size={11} className="animate-spin" /> 로그인 중…</>
          : "1️⃣ 테스트 계정으로 즉시 로그인"}
      </button>
    </div>
  );
}

// ── 메인 ─────────────────────────────────────────────────────
type Step = "email" | "otp" | "success";

const AuthPage = () => {
  const navigate  = useNavigate();
  const { user }  = useAuth();
  const countdown = useCountdown(60);

  const [step,        setStep]        = useState<Step>("email");
  const [email,       setEmail]       = useState("");
  const [otp,         setOtp]         = useState("");
  const [loading,     setLoading]     = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [error,       setError]       = useState("");

  // 이미 로그인 상태 → 프로필로
  useEffect(() => {
    if (user && step === "email") {
      navigate("/profile", { replace: true });
    }
  }, [user, step, navigate]);

  // 로그인 성공 감지 (step = success) → 환영 토스트 + 프로필로
  useEffect(() => {
    if (user && step === "success") {
      toast.success("드럼허브에 오신 것을 환영합니다! 🥁", {
        description: "프로필을 설정해주세요.",
        duration: 3500,
      });
      const t = setTimeout(() => navigate("/profile", { replace: true }), 1400);
      return () => clearTimeout(t);
    }
  }, [user, step, navigate]);

  const resetError = () => setError("");

  // ── 테스트 계정 즉시 로그인 ─────────────────────────────────
  const handleTestLogin = async () => {
    setTestLoading(true);
    resetError();

    console.log("[DrumHub] 🧪 테스트 로그인 시도:", TEST_EMAIL);

    const { data, error } = await supabase.auth.signInWithPassword({
      email:    TEST_EMAIL,
      password: TEST_PASSWORD,
    });

    console.log("[DrumHub] signInWithPassword 결과:", { data, error });

    setTestLoading(false);

    if (error) {
      console.error("[DrumHub] ❌ 테스트 로그인 실패:", error.status, error.message);
      setError(
        `로그인 실패: ${error.message}\n` +
        `→ 위 0️⃣ 버튼으로 먼저 계정을 생성하고 다시 시도하세요.`
      );
      return;
    }

    console.log("[DrumHub] ✅ 로그인 성공:", data.user?.id, data.user?.email);
    setStep("success");
  };

  // ──────────────────────────────────────────────────────────
  // 1단계: [인증번호 발송]
  //   - 테스트 이메일 → signInWithPassword 즉시 로그인 (OTP 단계 없음)
  //   - 일반 이메일   → signInWithOtp 호출 (이메일 발송)
  // ──────────────────────────────────────────────────────────
  const sendOtp = async () => {
    const trimmed = email.trim();
    if (!isValidEmail(trimmed)) {
      setError("올바른 이메일 주소를 입력해주세요.");
      return;
    }
    resetError();

    // ── 테스트 이메일: 즉시 로그인 ───────────────────────
    if (isTestEmail(trimmed)) {
      console.log("[DrumHub] 🧪 테스트 이메일 감지 → signInWithPassword 즉시 실행");
      setLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email:    TEST_EMAIL,
        password: TEST_PASSWORD,
      });

      console.log("[DrumHub] signInWithPassword 결과:", { data, error });
      setLoading(false);

      if (error) {
        console.error("[DrumHub] ❌ 로그인 실패:", error.status, error.message);
        setError(
          `로그인 실패: ${error.message}\n` +
          `→ 하단 패널의 0️⃣ 버튼으로 먼저 계정을 생성해주세요.`
        );
        return;
      }

      console.log("[DrumHub] ✅ 로그인 성공:", data.user?.id);
      setStep("success");
      return;
    }

    // ── 일반 이메일: OTP 발송 ─────────────────────────
    setLoading(true);
    console.log("[DrumHub] 이메일 OTP 발송:", trimmed);

    const { error } = await supabase.auth.signInWithOtp({
      email: trimmed,
      options: { shouldCreateUser: true },
    });
    setLoading(false);

    if (error) {
      console.error("[DrumHub] ❌ OTP 발송 실패:", error.status, error.message);
      if (error.status === 429)
        setError("잠시 후 다시 시도해주세요. (발송 횟수 초과)");
      else
        setError(`발송 실패: ${error.message}`);
      return;
    }

    setStep("otp");
    countdown.start();
  };

  // ──────────────────────────────────────────────────────────
  // 2단계: [인증 완료] — 일반 이메일 OTP 검증
  // ──────────────────────────────────────────────────────────
  const verifyOtp = async () => {
    const token   = otp.trim();
    const trimmed = email.trim();

    if (token.length < 6) {
      setError("6자리 인증번호를 모두 입력해주세요.");
      return;
    }
    setLoading(true); resetError();

    console.log("[DrumHub] 이메일 OTP 검증:", { email: trimmed, token });

    const { data, error } = await supabase.auth.verifyOtp({
      email: trimmed,
      token,
      type:  "email",
    });
    setLoading(false);

    if (error) {
      console.error("[DrumHub] ❌ OTP 검증 실패:", error.status, error.message);
      if (error.message.toLowerCase().includes("expired"))
        setError("인증번호가 만료되었습니다. 다시 발송해주세요.");
      else
        setError(`인증 실패: ${error.message}`);
      return;
    }

    console.log("[DrumHub] ✅ 로그인 성공:", data.user?.id);
    setStep("success");
  };

  const resend = async () => {
    if (!countdown.done) return;
    setOtp(""); resetError();
    await sendOtp();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 pb-12"
      style={{ background: `radial-gradient(ellipse at 50% 0%, ${GOLD}14 0%, transparent 60%), ${DARK_BG}` }}>

      {/* 로고 */}
      <Link to="/" className="flex items-center gap-2 mb-10">
        <span className="text-3xl">🥁</span>
        <span className="text-2xl font-extrabold" style={{ color: GOLD }}>DrumHub</span>
      </Link>

      {/* ── 카드 ──────────────────────────────────────────── */}
      <div className="w-full max-w-sm rounded-3xl px-7 py-8"
        style={{ background: CARD_BG, border: `1px solid ${BORDER}`, boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}>

        {/* ══ 성공 화면 ══ */}
        {step === "success" && (
          <div className="flex flex-col items-center py-6 gap-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: "rgba(100,220,140,0.15)", border: "2px solid rgba(100,220,140,0.4)" }}>
              <CheckCircle2 size={32} style={{ color: "#64dc8c" }} />
            </div>
            <p className="font-extrabold text-white text-xl">로그인 완료!</p>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>프로필 설정 화면으로 이동합니다…</p>
            <div className="flex gap-1 mt-1">
              {[0,1,2].map((i) => (
                <span key={i} className="w-1.5 h-1.5 rounded-full"
                  style={{ background: GOLD, animation: `pb 0.8s ease-in-out ${i*0.2}s infinite` }} />
              ))}
            </div>
            <style>{`@keyframes pb{0%,100%{transform:translateY(0);opacity:.4}50%{transform:translateY(-4px);opacity:1}}`}</style>
          </div>
        )}

        {/* ══ 1단계: 이메일 입력 ══ */}
        {step === "email" && (
          <>
            <div className="flex justify-center mb-5">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: `${GOLD}18`, border: `1px solid ${GOLD}40` }}>
                <Mail size={24} style={{ color: GOLD }} />
              </div>
            </div>

            <p className="font-extrabold text-white text-lg text-center mb-1">이메일로 시작하기</p>
            <p className="text-xs text-center mb-7" style={{ color: "rgba(255,255,255,0.38)" }}>
              이메일을 입력하고 인증번호를 받으세요
            </p>

            <input
              type="email" autoFocus
              value={email}
              onChange={(e) => { setEmail(e.target.value); resetError(); }}
              onKeyDown={(e) => { if (e.key === "Enter") sendOtp(); }}
              placeholder="example@email.com"
              className="w-full h-[52px] rounded-xl px-4 text-sm font-bold text-white placeholder:text-gray-600 focus:outline-none mb-3"
              style={{ background: "rgba(255,255,255,0.04)", border: `2px solid ${BORDER}` }}
              onFocus={(e) => (e.target.style.borderColor = `${GOLD}80`)}
              onBlur={(e)  => (e.target.style.borderColor = BORDER)}
            />

            <p className="text-xs mb-5" style={{ color: "rgba(255,255,255,0.28)" }}>
              미가입 이메일은 자동으로 회원가입 됩니다.
            </p>

            {error && <ErrorBox msg={error} />}

            <GoldButton onClick={sendOtp} loading={loading} disabled={loading}>
              ✉️ 인증번호 발송
            </GoldButton>
          </>
        )}

        {/* ══ 2단계: OTP 입력 (일반 이메일만) ══ */}
        {step === "otp" && (
          <>
            <button onClick={() => { setStep("email"); setOtp(""); resetError(); }}
              className="flex items-center gap-1 text-xs font-bold mb-5 hover:opacity-60 transition-opacity"
              style={{ color: "rgba(255,255,255,0.4)" }}>
              <ChevronLeft size={14} /> 이메일 다시 입력
            </button>

            <div className="flex justify-center mb-5">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: `${GOLD}18`, border: `1px solid ${GOLD}40` }}>
                <span className="text-2xl">💬</span>
              </div>
            </div>

            <p className="font-extrabold text-white text-lg text-center mb-1">인증번호 입력</p>
            <p className="text-xs text-center mb-1" style={{ color: "rgba(255,255,255,0.38)" }}>
              <span style={{ color: GOLD }}>{email.trim()}</span>으로 발송된
            </p>
            <p className="text-xs text-center mb-7 font-bold" style={{ color: "rgba(255,255,255,0.38)" }}>
              6자리 숫자를 입력해주세요
            </p>

            <div className="mb-5">
              <OtpInput value={otp} onChange={setOtp} onComplete={verifyOtp} />
            </div>

            <div className="text-center mb-4">
              {countdown.done ? (
                <button onClick={resend} disabled={loading}
                  className="inline-flex items-center gap-1.5 text-xs font-bold hover:opacity-70 transition-opacity disabled:opacity-40"
                  style={{ color: GOLD }}>
                  <RotateCcw size={12} /> 인증번호 재발송
                </button>
              ) : (
                <p className="text-xs tabular-nums" style={{ color: "rgba(255,255,255,0.3)" }}>
                  {countdown.count}초 후 재발송 가능
                </p>
              )}
            </div>

            {error && <ErrorBox msg={error} />}

            <GoldButton
              onClick={verifyOtp}
              loading={loading}
              disabled={loading || otp.trim().length < 6}>
              ✅ 인증 완료
            </GoldButton>
          </>
        )}
      </div>

      {/* ── 테스트 패널 (DEV only) ──────────────────────────── */}
      {step !== "success" && (
        <TestPanel
          onTestLogin={handleTestLogin}
          testLoading={testLoading}
        />
      )}

      {step !== "success" && (
        <Link to="/" className="mt-8 text-xs font-bold transition-opacity hover:opacity-60"
          style={{ color: "rgba(255,255,255,0.25)" }}>
          ← 홈으로 돌아가기
        </Link>
      )}
    </div>
  );
};

// ── 공용 서브 컴포넌트 ─────────────────────────────────────────
function ErrorBox({ msg }: { msg: string }) {
  return (
    <div className="mb-4 rounded-xl px-4 py-3 text-xs font-bold whitespace-pre-line leading-relaxed"
      style={{ background: "rgba(239,68,68,0.12)", color: "#f87171", border: "1px solid rgba(239,68,68,0.25)" }}>
      {msg}
    </div>
  );
}

function GoldButton({
  onClick, loading, disabled, children,
}: {
  onClick: () => void; loading: boolean; disabled: boolean; children: React.ReactNode;
}) {
  return (
    <button onClick={onClick} disabled={disabled}
      className="w-full rounded-2xl font-extrabold text-base text-black transition-opacity hover:opacity-90 disabled:opacity-40 flex items-center justify-center gap-2"
      style={{ background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})`, height: "52px" }}>
      {loading ? <><Loader2 size={16} className="animate-spin" /> 처리 중…</> : children}
    </button>
  );
}

export default AuthPage;
