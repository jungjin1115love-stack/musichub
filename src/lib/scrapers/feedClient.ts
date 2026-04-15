/**
 * 스크래핑 프록시 서버(localhost:3001)를 호출하는 클라이언트
 *
 * Vite 프록시 설정 덕분에 React 앱에서 /api/* 로 요청하면
 * 자동으로 localhost:3001 로 전달됩니다.
 */

export interface ScrapedItem {
  id:       string;
  platform: "뮬" | "당근" | "숨고" | "크몽";
  title:    string;
  url:      string;
  time:     string;
  views:    string;
  region:   string;
  category: string;
  desc:     string;
}

interface ApiResponse {
  success: boolean;
  count:   number;
  items:   ScrapedItem[];
  error?:  string;
  hint?:   string;
}

/** 스크래핑 서버가 켜져 있는지 확인 */
export async function checkServerHealth(): Promise<boolean> {
  try {
    const res = await fetch("/api/health", { signal: AbortSignal.timeout(2000) });
    return res.ok;
  } catch {
    return false;
  }
}

/** 뮬 구인/구직 최신 목록 가져오기 */
export async function fetchMuleJobs(): Promise<ScrapedItem[]> {
  const res  = await fetch("/api/mule/jobs");
  const data: ApiResponse = await res.json();
  if (!data.success) throw new Error(data.error ?? "서버 오류");
  return data.items;
}

/** 통합 검색: 키워드로 외부 플랫폼 검색 */
export async function searchFeed(
  query: string,
  platforms = "mule"
): Promise<ScrapedItem[]> {
  const params = new URLSearchParams({ q: query, platforms });
  const res    = await fetch(`/api/search?${params}`);
  const data: ApiResponse = await res.json();
  if (!data.success) throw new Error(data.error ?? "서버 오류");
  return data.items;
}
