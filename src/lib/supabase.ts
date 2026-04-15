import { createClient } from "@supabase/supabase-js";

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseKey  = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseKey);

// ── 타입 ─────────────────────────────────────────────────────
export interface FeedPost {
  id:         number;
  title:      string;
  place:      string;
  region:     string;
  category:   string;
  salary:     string;
  desc:       string;
  urgent:     boolean;
  posted_at:  string;   // ISO date string
  source:     string;
}
