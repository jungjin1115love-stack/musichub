/**
 * MusicHub 스크래핑 프록시 서버 (port 3001)
 * 실행: npm run server  (프로젝트 루트에서)
 */

const express = require("express");
const cors    = require("cors");
const { fetchMuleJobs, searchMule, MULE_JOBS, MULE_SEARCH } =
  require("./scrapers/muleScraper");

const app  = express();
const PORT = 3001;

app.use(cors({ origin: ["http://localhost:8080", "http://127.0.0.1:8080"] }));
app.use(express.json());

// ── 헬스체크 ─────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── 뮬 최신 구인/구직 목록 ───────────────────────────────────
app.get("/api/mule/jobs", async (_req, res) => {
  console.log("[뮬] 구인/구직 목록 요청");
  const { items, errorType, message } = await fetchMuleJobs();

  if (errorType) {
    console.warn(`[뮬] ${errorType}: ${message}`);
    return res.json({
      success:   false,
      errorType,          // "403" | "404" | "429" | "network" | "timeout" | "unknown"
      message,
      items:     [],
      // 직접 방문 링크 — 프론트에서 fallback UI 에 사용
      fallbackUrl: MULE_JOBS,
    });
  }

  console.log(`[뮬] ${items.length}개 파싱 완료`);
  res.json({ success: true, count: items.length, items });
});

// ── 통합 검색 ────────────────────────────────────────────────
app.get("/api/search", async (req, res) => {
  const query = (req.query.q || "").trim();
  if (!query) {
    return res.status(400).json({ success: false, errorType: "bad_request",
      message: "검색어(q)가 필요합니다." });
  }

  console.log(`[검색] "${query}"`);
  const { items, errorType, message } = await searchMule(query);

  if (errorType) {
    return res.json({
      success:   false,
      errorType,
      message,
      items:     [],
      fallbackUrl: `https://www.mule.co.kr/bbs/search.php?sfl=wr_subject%7Cwr_content&stx=${encodeURIComponent(query)}&bo_table=job`,
    });
  }

  res.json({ success: true, query, count: items.length, items });
});

// ── 서버 시작 ────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n✅  MusicHub 스크래핑 서버 실행 중`);
  console.log(`   http://localhost:${PORT}/api/health\n`);
});
