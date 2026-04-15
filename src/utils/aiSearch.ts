/**
 * AI Platform Curator — 플랫폼별 키워드 최적화 엔진
 *
 * 실제 LLM 호출 없이 플랫폼의 사용자 유형·검색 특성을 기반으로
 * 각각 다른 키워드 전략을 적용해 "최적 경로"를 계산한다.
 */

export type Platform = "뮬" | "당근" | "숨고" | "크몽";
export type MatchTag = "🏆 최고 매칭" | "✅ 추천" | "💡 대안";

export interface PlatformResult {
  platform:   Platform;
  emoji:      string;
  keyword:    string;   // 이 플랫폼에 최적화된 검색어
  url:        string;   // 바로 열 수 있는 완성된 URL
  reason:     string;   // 이 플랫폼을 추천하는 이유
  score:      number;   // 0–100 매칭 점수
  tag:        MatchTag;
  accent:     string;   // Tailwind bg class
  light:      string;   // Tailwind light bg class
  textColor:  string;   // Tailwind text class
  border:     string;   // Tailwind border class
}

// ── 목적별 플랫폼 기본 점수 ────────────────────────────────────
// 각 플랫폼이 해당 목적에 얼마나 적합한지 (경험적 수치)

const PURPOSE_BASE: Record<string, Record<Platform, number>> = {
  "레슨 받기": { 뮬: 52, 당근: 78, 숨고: 93, 크몽: 84 },
  "강사 구인":  { 뮬: 95, 당근: 62, 숨고: 44, 크몽: 38 },
  "강사 구직":  { 뮬: 88, 당근: 52, 숨고: 58, 크몽: 42 },
  "전체":       { 뮬: 72, 당근: 68, 숨고: 70, 크몽: 64 },
};

// ── 악기별 플랫폼 보너스 ─────────────────────────────────────
// 특정 악기가 특정 플랫폼에서 검색 결과가 더 풍부한 경향

const INSTRUMENT_BONUS: Partial<Record<string, Partial<Record<Platform, number>>>> = {
  "보컬":      { 뮬: 6,  숨고: 8  },
  "피아노":    { 크몽: 9, 숨고: 6  },
  "기타":      { 당근: 9, 크몽: 5  },
  "드럼":      { 뮬: 8                },
  "작곡·미디": { 크몽: 11, 뮬: 5   },
  "베이스":    { 뮬: 7                },
  "바이올린":  { 크몽: 8, 숨고: 5  },
  "색소폰":    { 뮬: 6,  크몽: 6   },
};

// ── 플랫폼별 키워드 빌더 ─────────────────────────────────────

function muleKeyword(inst: string, loc: string, purpose: string): string {
  // 뮬: 경력/세션/구인 중심 — 지역 포함, 직종 수식어 추가
  const parts = [inst, loc].filter(Boolean);
  if      (purpose === "강사 구인") parts.push("강사 모집");
  else if (purpose === "강사 구직") parts.push("구직");
  else if (purpose === "레슨 받기") parts.push("레슨");
  return parts.join(" ").trim() || "음악 강사";
}

function daangnKeyword(inst: string, loc: string, purpose: string): string {
  // 당근: 동네 기반 — 지역을 앞에, 캐주얼 수식어 사용
  const suffix = purpose === "강사 구인" ? "알바" : "레슨";
  return [inst, suffix, loc].filter(Boolean).join(" ").trim() || "음악 레슨";
}

function soomgoKeyword(inst: string, purpose: string): string {
  // 숨고: 취미/레슨 소비자 중심 — 악기명만, 지역 무관 (전국 매칭)
  const type = purpose === "레슨 받기" ? "1:1 레슨"
             : purpose === "강사 구인" ? "강사"
             : "레슨";
  return [inst, type].filter(Boolean).join(" ").trim() || "음악 레슨";
}

function kmongKeyword(inst: string, purpose: string): string {
  // 크몽: 프리랜서/단기 의뢰 중심 — "강습" "원데이" 등 프로젝트성 수식어
  const suffix = purpose === "레슨 받기" ? "강습"
               : purpose === "강사 구인" ? "레슨 강사"
               : "레슨";
  return [inst, suffix].filter(Boolean).join(" ").trim() || "음악 레슨";
}

// ── URL 빌더 ────────────────────────────────────────────────

function toUrl(base: string, kw: string): string {
  return base + encodeURIComponent(kw);
}

// ── 메인 분석 함수 ────────────────────────────────────────────

export function analyzePlatforms(
  instrument: string,
  location:   string,
  purpose:    string,
): PlatformResult[] {
  const pKey    = purpose || "전체";
  const base    = PURPOSE_BASE[pKey] ?? PURPOSE_BASE["전체"];
  const bonus   = INSTRUMENT_BONUS[instrument] ?? {};

  const muleKw   = muleKeyword(instrument, location, purpose);
  const daangnKw = daangnKeyword(instrument, location, purpose);
  const soomgoKw = soomgoKeyword(instrument, purpose);
  const kmongKw  = kmongKeyword(instrument, purpose);

  const raw: Omit<PlatformResult, "tag" | "score">[] = [
    {
      platform:  "뮬",
      emoji:     "🔵",
      keyword:   muleKw,
      url:       toUrl("https://www.mule.co.kr/bbs/info/recruit?f=title&q=", muleKw),
      reason:    "실용음악인 커뮤니티 — 경력직·세션 구인 가장 활발",
      accent:    "bg-blue-600",
      light:     "bg-blue-50",
      textColor: "text-blue-600",
      border:    "border-blue-200",
    },
    {
      platform:  "당근",
      emoji:     "🥕",
      keyword:   daangnKw,
      url:       toUrl("https://www.daangn.com/search/", daangnKw),
      reason:    "위치 기반 동네 레슨 — 근거리 매칭 응답률 높음",
      accent:    "bg-orange-500",
      light:     "bg-orange-50",
      textColor: "text-orange-500",
      border:    "border-orange-200",
    },
    {
      platform:  "숨고",
      emoji:     "🔮",
      keyword:   soomgoKw,
      url:       toUrl("https://soomgo.com/search?query=", soomgoKw),
      reason:    "리뷰 검증 전문가 풀 — 취미·입문 레슨 수요 최다",
      accent:    "bg-purple-600",
      light:     "bg-purple-50",
      textColor: "text-purple-600",
      border:    "border-purple-200",
    },
    {
      platform:  "크몽",
      emoji:     "💚",
      keyword:   kmongKw,
      url:       toUrl("https://kmong.com/search?keyword=", kmongKw),
      reason:    "프리랜서 단기 의뢰 — 원데이·단기 레슨 전문",
      accent:    "bg-emerald-600",
      light:     "bg-emerald-50",
      textColor: "text-emerald-600",
      border:    "border-emerald-200",
    },
  ];

  // 점수 계산 후 내림차순 정렬
  const scored = raw.map((r) => ({
    ...r,
    score: Math.min(99, (base[r.platform] ?? 65) + (bonus[r.platform] ?? 0)),
    tag:   "💡 대안" as MatchTag,
  }));
  scored.sort((a, b) => b.score - a.score);

  // 순위별 태그 부여
  scored[0].tag = "🏆 최고 매칭";
  scored[1].tag = "✅ 추천";
  scored[2].tag = "✅ 추천";
  scored[3].tag = "💡 대안";

  return scored;
}
