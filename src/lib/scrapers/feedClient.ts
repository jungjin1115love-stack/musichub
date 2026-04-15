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

export type ScrapeErrorType =
  | "403" | "404" | "429"
  | "network" | "timeout" | "unknown"
  | null;

export interface ScrapeResult {
  items:       ScrapedItem[];
  errorType:   ScrapeErrorType;
  message?:    string;
  fallbackUrl?: string;
}

export async function checkServerHealth(): Promise<boolean> {
  try {
    const res = await fetch("/api/health", { signal: AbortSignal.timeout(2000) });
    return res.ok;
  } catch {
    return false;
  }
}

export async function fetchMuleJobs(): Promise<ScrapeResult> {
  const res  = await fetch("/api/mule/jobs");
  const data = await res.json();
  return {
    items:       data.items      ?? [],
    errorType:   data.errorType  ?? null,
    message:     data.message,
    fallbackUrl: data.fallbackUrl,
  };
}

export async function searchFeed(query: string): Promise<ScrapeResult> {
  const res  = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
  const data = await res.json();
  return {
    items:       data.items      ?? [],
    errorType:   data.errorType  ?? null,
    message:     data.message,
    fallbackUrl: data.fallbackUrl,
  };
}
