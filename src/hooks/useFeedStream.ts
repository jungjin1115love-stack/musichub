/**
 * useFeedStream — DrumHub 통합 데이터 스트림
 *
 * - 3개 CSE 쿼리를 병렬로 실행
 * - sessionStorage 기반 [NEW] 감지
 * - 섹션 간 URL 중복 제거
 * - Pull-to-Refresh (터치 제스처)
 * - 탭 포커스 복귀 시 자동 재조회
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { useCSESearch, type CSEItem } from "./useCSESearch";

// ── 타입 ─────────────────────────────────────────────────────
export type FeedType = "academy" | "instructor" | "portfolio";

export interface FeedItem extends CSEItem {
  type:  FeedType;
  isNew: boolean;
}

// ── 상수 ─────────────────────────────────────────────────────
const SEEN_KEY      = "drumhub_seen_urls";
const PULL_THRESHOLD = 62;   // px — 이 이상 당기면 새로고침
const PULL_MAX       = 80;   // px — UI 최대 당김 거리

// ── 훅 ───────────────────────────────────────────────────────
export function useFeedStream(searchQuery: string) {
  const [refreshKey,    setRefreshKey]    = useState(0);
  const [lastRefreshed, setLastRefreshed] = useState<number>(Date.now());
  const [newUrlSet,     setNewUrlSet]     = useState<ReadonlySet<string>>(new Set());
  const [pullProgress,  setPullProgress]  = useState(0);   // 0~100

  // 터치 추적용 refs (stale closure 방지)
  const startYRef   = useRef(0);
  const pullingRef  = useRef(false);
  const distRef     = useRef(0);

  // ── 새로고침 트리거 ────────────────────────────────────────
  const refresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
    setLastRefreshed(Date.now());
  }, []);

  // ── 탭 포커스 복귀 시 자동 재조회 ─────────────────────────
  useEffect(() => {
    const handler = () => {
      if (document.visibilityState === "visible") refresh();
    };
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, [refresh]);

  // ── Pull-to-Refresh 터치 이벤트 ───────────────────────────
  useEffect(() => {
    const onStart = (e: TouchEvent) => {
      if (window.scrollY === 0) {
        startYRef.current = e.touches[0].clientY;
      }
    };
    const onMove = (e: TouchEvent) => {
      if (!startYRef.current || window.scrollY > 0) return;
      const d = e.touches[0].clientY - startYRef.current;
      if (d > 0) {
        pullingRef.current = true;
        distRef.current    = Math.min(d, PULL_MAX);
        setPullProgress(Math.min(Math.round((d / PULL_THRESHOLD) * 100), 100));
      }
    };
    const onEnd = () => {
      if (pullingRef.current && distRef.current >= PULL_THRESHOLD) {
        refresh();
      }
      pullingRef.current = false;
      distRef.current    = 0;
      startYRef.current  = 0;
      setPullProgress(0);
    };

    document.addEventListener("touchstart", onStart, { passive: true });
    document.addEventListener("touchmove",  onMove,  { passive: true });
    document.addEventListener("touchend",   onEnd);
    return () => {
      document.removeEventListener("touchstart", onStart);
      document.removeEventListener("touchmove",  onMove);
      document.removeEventListener("touchend",   onEnd);
    };
  }, [refresh]);

  // ── CSE 쿼리 (3개 병렬) ───────────────────────────────────
  const suffix = searchQuery.trim() ? ` ${searchQuery.trim()}` : "";

  const { items: jobItems,  loading: jobLoading  } =
    useCSESearch(`드럼 학원 채용 강사 모집${suffix}`,        refreshKey);
  const { items: instItems, loading: instLoading } =
    useCSESearch(`드럼 강사 레슨 프로필${suffix}`,           refreshKey);
  const { items: portItems, loading: portLoading } =
    useCSESearch(`드럼 강사 포트폴리오 유튜브${suffix}`,     refreshKey);

  const loading = jobLoading || instLoading || portLoading;

  // ── [NEW] 감지: 이전에 없던 URL = 새 항목 ─────────────────
  useEffect(() => {
    if (loading) return;
    const all = [
      ...(jobItems  ?? []),
      ...(instItems ?? []),
      ...(portItems ?? []),
    ];
    if (all.length === 0) return;

    const raw      = sessionStorage.getItem(SEEN_KEY);
    const prevSeen = new Set<string>(raw ? JSON.parse(raw) : []);
    const fresh    = new Set(all.map((i) => i.url).filter((u) => !prevSeen.has(u)));

    setNewUrlSet(fresh);

    // 현재 항목을 seen에 누적
    const updated = [...new Set([...prevSeen, ...all.map((i) => i.url)])];
    sessionStorage.setItem(SEEN_KEY, JSON.stringify(updated));
  }, [loading, jobItems, instItems, portItems]);

  // ── CSEItem → FeedItem 변환 ────────────────────────────────
  const toFeed = (items: CSEItem[] | null, type: FeedType): FeedItem[] =>
    (items ?? []).map((item) => ({
      ...item,
      type,
      isNew: newUrlSet.has(item.url),
    }));

  // ── 섹션 간 URL 중복 제거 ─────────────────────────────────
  const seen = new Set<string>();
  const dedup = (arr: FeedItem[]) =>
    arr.filter(({ url }) => {
      if (seen.has(url)) return false;
      seen.add(url);
      return true;
    });

  const academyItems    = dedup(toFeed(jobItems,  "academy")).slice(0, 5);
  const instructorItems = dedup(toFeed(instItems, "instructor")).slice(0, 5);
  const portfolioItems  = dedup(toFeed(portItems, "portfolio")).slice(0, 4);

  return {
    academyItems,
    instructorItems,
    portfolioItems,
    loading,
    jobLoading,
    instLoading,
    portLoading,
    refresh,
    lastRefreshed,
    pullProgress,   // 0~100, 화면 당김 시각화용
  };
}
