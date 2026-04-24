import { createClient } from "@supabase/supabase-js";

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL  as string;
const supabaseKey  = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// ── 환경 변수 진단 (앱 시작 시 콘솔에서 확인) ────────────────────
if (!supabaseUrl || !supabaseKey) {
  console.error(
    "[DrumHub] ❌ Supabase 환경 변수 누락!\n" +
    `  VITE_SUPABASE_URL      : ${supabaseUrl  ? "✅ 있음" : "❌ 없음"}\n` +
    `  VITE_SUPABASE_ANON_KEY : ${supabaseKey  ? "✅ 있음" : "❌ 없음"}\n` +
    "  → .env.local 파일을 확인하고 개발 서버를 재시작하세요."
  );
} else {
  console.log(
    "[DrumHub] ✅ Supabase 초기화 완료\n" +
    `  URL: ${supabaseUrl}`
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession:    true,           // 세션을 localStorage에 저장 (앱 재시작 후에도 유지)
    autoRefreshToken:  true,           // 토큰 만료 전 자동 갱신
    detectSessionInUrl: true,          // URL 해시에서 세션 토큰 자동 감지
    storageKey:        "drumhub-auth", // localStorage 키 이름
  },
});

// ── 타입 ─────────────────────────────────────────────────────
export interface FeedPost {
  id:          number;
  title:       string;
  place:       string;
  region:      string;
  category:    string;
  salary:      string;
  description: string;
  urgent:      boolean;
  posted_at:   string;
  source:      string;
  created_at?: string;
}
