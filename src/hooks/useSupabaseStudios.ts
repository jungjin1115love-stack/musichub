/**
 * useSupabaseStudios — studios 테이블 조회/등록 공용 훅.
 *
 * studios 컬럼:
 *   id(uuid), name, location, price, equipment,
 *   photo_url, description, contact, created_at
 */

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export interface Studio {
  id:          string;
  name:        string;
  location:    string;
  price:       string;   // 예: "시간당 10,000원"
  equipment:   string;   // 예: "드럼 세트 2대, 심벌 포함"
  photoUrl:    string;
  description: string;
  contact:     string;
  createdAt:   string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function toStudio(r: any): Studio {
  return {
    id:          r.id          ?? "",
    name:        r.name        ?? "",
    location:    r.location    ?? "",
    price:       r.price       ?? "",
    equipment:   r.equipment   ?? "",
    photoUrl:    r.photo_url   ?? "",
    description: r.description ?? "",
    contact:     r.contact     ?? "",
    createdAt:   r.created_at  ?? "",
  };
}

export function useSupabaseStudios(limit?: number) {
  const [studios, setStudios] = useState<Studio[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    console.log("[DrumHub] studios 조회 중…");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let q: any = supabase
      .from("studios")
      .select("*")
      .order("created_at", { ascending: false });
    if (limit) q = q.limit(limit);

    const { data, error } = await q;

    if (error) {
      console.error("[DrumHub] ❌ studios SELECT 실패", {
        code: error.code, message: error.message, hint: error.hint,
      });
    } else {
      console.log(`[DrumHub] ✅ studios ${(data ?? []).length}건 로드`);
    }

    setStudios((data ?? []).map(toStudio));
    setLoading(false);
  }, [limit]);

  useEffect(() => { load(); }, [load]);

  return { studios, loading, reload: load };
}
