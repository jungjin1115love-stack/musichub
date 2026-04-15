/**
 * MusicHub 스크래핑 프록시 서버
 * 실행: node index.js  (또는 npm run dev)
 * 포트: 3001
 *
 * 브라우저는 CORS 때문에 외부 사이트에 직접 요청할 수 없어서
 * 이 서버가 중간에서 대신 요청하고 결과를 React 앱에 전달합니다.
 */

const express = require("express");
const cors    = require("cors");
const { fetchMuleJobs, searchMule } = require("./scrapers/muleScraper");

const app  = express();
const PORT = 3001;

// React 앱(localhost:8080)에서의 요청만 허용
app.use(cors({ origin: ["http://localhost:8080", "http://127.0.0.1:8080"] }));
app.use(express.json());

// ── 헬스체크 ──────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── 뮬 최신 구인/구직 목록 ────────────────────────────────────
// GET /api/mule/jobs
app.get("/api/mule/jobs", async (_req, res) => {
  try {
    console.log("[뮬] 구인/구직 목록 요청");
    const items = await fetchMuleJobs();
    console.log(`[뮬] ${items.length}개 파싱 완료`);
    res.json({ success: true, count: items.length, items });
  } catch (err) {
    console.error("[뮬] 오류:", err.message);
    res.status(500).json({
      success: false,
      error: err.message,
      hint: "SELECTORS 설정을 사이트 실제 DOM에 맞게 수정해야 할 수 있습니다.",
    });
  }
});

// ── 통합 검색 (현재: 뮬만, 추후 플랫폼 확장 예정) ──────────────
// GET /api/search?q=기타강사&platforms=mule
app.get("/api/search", async (req, res) => {
  const query     = (req.query.q || "").trim();
  const platforms = (req.query.platforms || "mule").split(",");

  if (!query) {
    return res.status(400).json({ success: false, error: "검색어(q)가 필요합니다." });
  }

  console.log(`[검색] "${query}" — 플랫폼: ${platforms.join(", ")}`);

  const results = [];
  const errors  = [];

  // 플랫폼별 병렬 요청
  await Promise.allSettled(
    platforms.map(async (platform) => {
      if (platform === "mule") {
        const items = await searchMule(query);
        results.push(...items);
      }
      // TODO: 당근, 숨고, 크몽 스크래퍼 추가
    })
  ).then((settled) => {
    settled.forEach((r) => {
      if (r.status === "rejected") errors.push(r.reason?.message);
    });
  });

  res.json({
    success: true,
    query,
    count: results.length,
    items: results,
    errors: errors.length ? errors : undefined,
  });
});

// ── 서버 시작 ─────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n✅  MusicHub 스크래핑 서버 실행 중`);
  console.log(`   http://localhost:${PORT}/api/health\n`);
});
