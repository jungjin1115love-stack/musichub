/**
 * useSupabasePosts — feed_posts 테이블에서 최신 공고를 불러오는 공용 훅.
 * Index(홈)와 FeedSearch(공고 모아보기) 양쪽에서 사용.
 */

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export interface DbPost {
  id:          number;
  title:       string;
  place:       string;
  region:      string;
  category:    string;
  salary:      string;
  description: string;
  urgent:      boolean;
  postedAt:    string;
  source:      string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toDbPost(r: any): DbPost {
  return {
    id:          r.id,
    title:       r.title,
    place:       r.place,
    region:      r.region,
    category:    r.category,
    salary:      r.salary,
    description: r.description ?? "",
    urgent:      r.urgent,
    postedAt:    r.posted_at,
    source:      r.source,
  };
}

export function useSupabasePosts(limit?: number) {
  const [posts,   setPosts]   = useState<DbPost[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let q: any = supabase
      .from("feed_posts")
      .select("*")
      .order("posted_at", { ascending: false });
    if (limit) q = q.limit(limit);

    const { data } = await q;
    setPosts((data ?? []).map(toDbPost));
    setLoading(false);
  }, [limit]);

  useEffect(() => { load(); }, [load]);

  return { posts, loading, reload: load };
}
