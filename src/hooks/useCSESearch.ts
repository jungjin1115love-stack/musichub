/**
 * useCSESearch — Google Custom Search API 훅
 * VITE_GOOGLE_API_KEY + VITE_GOOGLE_CX 미설정 시 items = [] 반환
 */

import { useState, useEffect, useRef } from "react";

const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY as string | undefined;
const CX      = import.meta.env.VITE_GOOGLE_CX      as string | undefined;

export interface CSEItem {
  id:      string;
  title:   string;
  snippet: string;
  url:     string;
}

export function useCSESearch(query: string, refreshKey = 0) {
  const [items,   setItems]   = useState<CSEItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!query.trim()) {
      setItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setItems(null);
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    if (!API_KEY || !CX) {
      // API 키 미설정 → 빈 결과
      const t = setTimeout(() => {
        setItems([]);
        setLoading(false);
      }, 500);
      return () => clearTimeout(t);
    }

    const url =
      `https://www.googleapis.com/customsearch/v1` +
      `?key=${API_KEY}&cx=${CX}` +
      `&q=${encodeURIComponent(query)}&num=8`;

    fetch(url, { signal: abortRef.current.signal })
      .then((r) => {
        if (!r.ok) throw new Error(`CSE ${r.status}`);
        return r.json();
      })
      .then((data) => {
        const mapped: CSEItem[] = (data.items ?? []).map(
          (it: { title: string; link: string; snippet: string }, i: number) => ({
            id:      `${query}-${i}`,
            title:   it.title,
            snippet: it.snippet,
            url:     it.link,
          })
        );
        setItems(mapped);
      })
      .catch((e: unknown) => {
        if (e instanceof Error && e.name === "AbortError") return;
        setItems([]);
      })
      .finally(() => setLoading(false));

    return () => { abortRef.current?.abort(); };
  // refreshKey 변경 시 같은 쿼리도 재호출
  }, [query, refreshKey]);

  return { items, loading };
}
