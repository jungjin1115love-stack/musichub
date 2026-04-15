/**
 * 뮬(Mule) 스크래퍼 — 그누보드 기반 셀렉터 적용
 *
 * ⚠️  주의사항
 * 1. 외부 사이트 스크래핑 전 이용약관(ToS)을 확인하세요.
 * 2. robots.txt 준수: https://www.mule.co.kr/robots.txt
 * 3. 과도한 요청은 IP 차단 원인. 요청 간격을 두세요.
 */

const axios   = require("axios");
const cheerio = require("cheerio");

const MULE_BASE   = "https://www.mule.co.kr";
const MULE_JOBS   = `${MULE_BASE}/bbs/board.php?bo_table=job`;
const MULE_SEARCH = (q) =>
  `${MULE_BASE}/bbs/search.php?sfl=wr_subject%7Cwr_content&stx=${encodeURIComponent(q)}&bo_table=job`;

// ── 브라우저 위장 헤더 ────────────────────────────────────────
// 403을 피하기 위해 실제 Chrome 브라우저 요청과 최대한 동일하게 설정
const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
    "AppleWebKit/537.36 (KHTML, like Gecko) " +
    "Chrome/124.0.0.0 Safari/537.36",
  "Accept":
    "text/html,application/xhtml+xml,application/xml;q=0.9," +
    "image/avif,image/webp,image/apng,*/*;q=0.8",
  "Accept-Language":  "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
  "Accept-Encoding":  "gzip, deflate, br",
  "Cache-Control":    "no-cache",
  "Connection":       "keep-alive",
  "DNT":              "1",
  "Referer":          MULE_BASE,
  "Sec-Fetch-Dest":   "document",
  "Sec-Fetch-Mode":   "navigate",
  "Sec-Fetch-Site":   "same-origin",
  "Sec-Fetch-User":   "?1",
  "Upgrade-Insecure-Requests": "1",
};

// ── 셀렉터 (그누보드 5.x 표준 + 변형 fallback) ───────────────
//
// 뮬은 그누보드(Gnuboard) 기반으로 추정됩니다.
// URL 패턴 bbs/board.php?bo_table= 이 그누보드 표준입니다.
//
// ✅ 실제 DOM 확인 방법:
//   Chrome → F12 → Elements → 게시글 행 우클릭 → Copy selector
//   아래 각 배열의 첫 번째 항목을 복사한 값으로 교체하세요.
const SELECTORS = {
  // 게시글 row — 그누보드 5.x 기본 → 변형 순으로 시도
  row: [
    "#fboardlist tbody tr:not(.thead)",   // 그누보드 5.x 기본
    ".tbl_head01 tbody tr",               // 그누보드 변형1
    "table#fboardlist tr.bo_notice",      // 공지 포함
    "ul.bo_list > li",                    // 목록형 레이아웃
    "div.list-body .list-row",            // 커스텀 테마
  ].join(", "),

  // 제목 + 링크 — .bo_tit 이 그누보드 표준 클래스
  titleLink: [
    "td.td_subject .bo_tit",             // 그누보드 5.x 표준
    "td.td_subject a.bo_tit",
    ".bo_tit a",
    "td.subject a",
    ".title a",
    "a.subject",
  ].join(", "),

  // 날짜
  date: [
    "td.td_datetime",                    // 그누보드 5.x 표준
    ".datetime",
    "td.date",
    "td:nth-child(5)",                   // 열 번호 직접 지정 (최후 수단)
  ].join(", "),

  // 조회수
  views: [
    "td.td_num2",                        // 그누보드 5.x 표준
    ".hit",
    "td.views",
    "td:nth-child(6)",
  ].join(", "),
};

// ── 유틸 ─────────────────────────────────────────────────────

/** 제목 키워드로 카테고리 추론 */
function detectCategory(title) {
  const t = title.toLowerCase();
  if (/보컬|vocal|노래|싱어|singer/.test(t)) return "보컬";
  if (/기타|guitar|베이스|bass/.test(t))      return "기타";
  if (/피아노|piano|건반|keyboard|재즈/.test(t)) return "건반";
  if (/드럼|drum|퍼커션|percussion/.test(t))  return "드럼";
  if (/작곡|미디|midi|프로듀|ableton|logic/.test(t)) return "작곡";
  return "기타";
}

/** 에러 분류: HTTP 상태코드 → 타입 문자열 */
function classifyAxiosError(err) {
  const status = err.response?.status;
  if (status === 403) return "403";
  if (status === 404) return "404";
  if (status === 429) return "429";
  if (err.code === "ECONNREFUSED" || err.code === "ENOTFOUND") return "network";
  if (err.code === "ETIMEDOUT" || err.code === "ECONNABORTED")  return "timeout";
  return "unknown";
}

/** HTML 파싱 → FeedItem 배열 */
function parsePostList(html, tag = "") {
  const $     = cheerio.load(html);
  const items = [];

  $(SELECTORS.row).each((i, el) => {
    const anchor = $(el).find(SELECTORS.titleLink).first();
    const title  = anchor.text().replace(/\s+/g, " ").trim();
    if (!title || title.length < 2) return;

    const href  = anchor.attr("href") || $(el).find("a").first().attr("href") || "";
    const url   = href.startsWith("http") ? href : `${MULE_BASE}${href}`;
    const date  = $(el).find(SELECTORS.date).first().text().trim()  || "";
    const views = $(el).find(SELECTORS.views).first().text().trim() || "-";

    items.push({
      id:       `mule-${tag}-${i}`,
      platform: "뮬",
      title,
      url,
      time:     date || "날짜 없음",
      views,
      region:   "전국",
      category: detectCategory(title),
      desc:     "",
    });
  });

  return items;
}

// ── Public API ────────────────────────────────────────────────

async function fetchMuleJobs() {
  try {
    const { data } = await axios.get(MULE_JOBS, {
      headers: HEADERS,
      timeout: 12_000,
      // gzip 자동 디코딩
      decompress: true,
    });
    const items = parsePostList(data, "jobs");
    return { items, errorType: null };
  } catch (err) {
    const errorType = classifyAxiosError(err);
    console.error(`[뮬 fetchJobs] ${errorType}:`, err.message);
    return { items: [], errorType, message: err.message };
  }
}

async function searchMule(query) {
  try {
    const { data } = await axios.get(MULE_SEARCH(query), {
      headers: { ...HEADERS, Referer: MULE_JOBS },
      timeout: 12_000,
      decompress: true,
    });
    const items = parsePostList(data, `q-${query}`);
    return { items, errorType: null };
  } catch (err) {
    const errorType = classifyAxiosError(err);
    console.error(`[뮬 search:"${query}"] ${errorType}:`, err.message);
    return { items: [], errorType, message: err.message };
  }
}

module.exports = { fetchMuleJobs, searchMule, MULE_JOBS, MULE_SEARCH };
