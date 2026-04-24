/**
 * useSupabaseInstructors — teachers 테이블 조회/등록 공용 훅.
 *
 * 실제 컬럼 (Supabase에서 확인):
 *   id(uuid), name, location, genre, bio,
 *   experience, youtube_url, photo_url, created_at
 */

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export interface InstructorProfile {
  id:          string;   // uuid
  name:        string;
  location:    string;   // DB 컬럼: location
  genre:       string;
  bio:         string;
  experience:  string;   // DB 컬럼: experience (경력 통합)
  photoUrl:    string;   // DB 컬럼: photo_url
  youtubeUrl:  string;   // DB 컬럼: youtube_url
  createdAt:   string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function toProfile(r: any): InstructorProfile {
  return {
    id:          r.id          ?? "",
    name:        r.name        ?? "",
    location:    r.location    ?? "",
    genre:       r.genre       ?? "",
    bio:         r.bio         ?? "",
    experience:  r.experience  ?? "",
    photoUrl:    r.photo_url   ?? "",
    youtubeUrl:  r.youtube_url ?? "",
    createdAt:   r.created_at  ?? "",
  };
}

export function useSupabaseInstructors(limit?: number) {
  const [profiles, setProfiles] = useState<InstructorProfile[]>([]);
  const [loading,  setLoading]  = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    console.log("[DrumHub] teachers 조회 중…");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let q: any = supabase
      .from("teachers")
      .select("*")
      .order("created_at", { ascending: false });
    if (limit) q = q.limit(limit);

    const { data, error } = await q;

    if (error) {
      console.error("[DrumHub] ❌ teachers SELECT 실패", {
        code:    error.code,
        message: error.message,
        hint:    error.hint,
      });
    } else {
      console.log(`[DrumHub] ✅ teachers ${(data ?? []).length}건 로드`);
    }

    setProfiles((data ?? []).map(toProfile));
    setLoading(false);
  }, [limit]);

  useEffect(() => { load(); }, [load]);

  return { profiles, loading, reload: load };
}
