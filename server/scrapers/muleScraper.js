/**
 * 뮬(Mule) 스크래퍼 — 프로토타입
 *
 * ⚠️  주의사항
 * 1. 외부 사이트 스크래핑 전 반드시 해당 사이트의 이용약관(ToS)을 확인하세요.
 * 2. robots.txt 를 준수하세요: https://www.mule.co.kr/robots.txt
 * 3. 과도한 요청은 IP 차단의 원인이 됩니다. 요청 간격을 두세요.
 * 4. 아래의 CSS 셀렉터는 실제 사이트 DOM 구조에 맞게 수정이 필요합니다.
 *    → Chrome DevTools > Elements 탭에서 게시글 목록 요소를 직접 확인하세요.
 *
 * 뮬 게시판 구조 파악 방법:
 *   1. https://www.mule.co.kr 접속
 *   2. 구인/구직 게시판 이동
 *   3. F12 → Elements → 게시글 row 우클릭 → "Copy selector"
 *   4. 아래 SELECTORS 객체의 값을 교체
 */

const axios   = require("axios");
const cheerio = require("cheerio");

// ── 사이트별 셀렉터 설정 ───────────────────────────────────────
// 실제 DOM 확인 후 수정 필요
const SELECTORS = {
  // 게시글 목록의 각 row 요소
  row:    "tr.list-row, li.board-item, .post-item, article",
  // 제목 텍스트
  title:  "td.subject a, .title a, h3 a, .post-title",
  // 링크 (href)
  link:   "td.subject a, .title a, h3 a",
  // 날짜/시간
  date:   "td.date, .created-at, time, .post-date",
  // 조회수
  views:  "td.views, .view-count, .hit",
  // 지역 (있을 경우)
  region: "td.region, .location, .area",
};

// ── 뮬 구인/구직 게시판 URL ───────────────────────────────────
const MULE_BASE    = "https://www.mule.co.kr";
const MULE_JOBS    = `${MULE_BASE}/bbs/board.php?bo_table=job`;        // 구인/구직
const MULE_SEARCH  = (q) => `${MULE_BASE}/bbs/search.php?sfl=wr_subject&stx=${encodeURIComponent(q)}`;

// ── 공통 HTTP 헤더 (봇 차단 완화) ────────────────────────────
const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
    "AppleWebKit/537.36 (KHTML, like Gecko) " +
    "Chrome/124.0.0.0 Safari/537.36",
  "Accept-Language": "ko-KR,ko;q=0.9,en;q=0.8",
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Referer": MULE_BASE,
};

/**
 * HTML 페이지에서 게시글 목록을 파싱해 배열로 반환
 * @param {string} html  - axios로 받아온 HTML 문자열
 * @param {string} queryTag - 어떤 요청인지 구분용 (로깅)
 * @returns {Array} FeedItem[]
 */
function parsePostList(html, queryTag = "") {
  const $     = cheerio.load(html);
  const items = [];

  $(SELECTORS.row).each((i, el) => {
    const titleEl = $(el).find(SELECTORS.title).first();
    const title   = titleEl.text().trim();
    if (!title || title.length < 2) return; // 빈 row 스킵

    const href   = $(el).find(SELECTORS.link).first().attr("href") || "";
    const url    = href.startsWith("http") ? href : `${MULE_BASE}${href}`;
    const date   = $(el).find(SELECTORS.date).first().text().trim()  || "날짜 없음";
    const views  = $(el).find(SELECTORS.views).first().text().trim() || "-";
    const region = $(el).find(SELECTORS.region).first().text().trim() || "전국";

    items.push({
      id:       `mule-${queryTag}-${i}`,
      platform: "뮬",
      title,
      url,
      time:     date,
      views,
      region,
      category: detectCategory(title), // 제목에서 카테고리 추론
      desc:     "",                    // 목록 페이지엔 설명 없음
    });
  });

  return items;
}

/**
 * 제목 키워드로 카테고리를 추론 (정확도 낮음 — 보조 용도)
 */
function detectCategory(title) {
  const t = title.toLowerCase();
  if (/보컬|vocal|노래|싱어/.test(t)) return "보컬";
  if (/기타|guitar|베이스|bass/.test(t)) return "기타";
  if (/피아노|piano|건반|keyboard|재즈/.test(t)) return "건반";
  if (/드럼|drum|퍼커션/.test(t)) return "드럼";
  if (/작곡|미디|midi|프로듀/.test(t)) return "작곡";
  return "기타";
}

// ── Public API ────────────────────────────────────────────────

/**
 * 뮬 구인/구직 게시판 최신 목록 가져오기
 */
async function fetchMuleJobs() {
  const { data } = await axios.get(MULE_JOBS, {
    headers: HEADERS,
    timeout: 10_000,
  });
  return parsePostList(data, "jobs");
}

/**
 * 뮬에서 검색어로 게시글 검색
 * @param {string} query - 검색 키워드 (예: "기타 강사")
 */
async function searchMule(query) {
  const url = MULE_SEARCH(query);
  const { data } = await axios.get(url, {
    headers: HEADERS,
    timeout: 10_000,
  });
  return parsePostList(data, `search-${query}`);
}

module.exports = { fetchMuleJobs, searchMule };
