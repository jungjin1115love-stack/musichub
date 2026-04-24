import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./AuthContext";

interface ProfileData {
  nickname:   string;
  avatar_url: string;
  bio:        string;
  region:     string;
}

interface ProfileContextType {
  profile:        ProfileData;
  refreshProfile: () => Promise<void>;
}

const DEFAULT: ProfileData = { nickname: "", avatar_url: "", bio: "", region: "" };

const ProfileContext = createContext<ProfileContextType>({
  profile:        DEFAULT,
  refreshProfile: async () => {},
});

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData>(DEFAULT);

  const fetchProfile = useCallback(async () => {
    if (!user) { setProfile(DEFAULT); return; }
    const { data } = await supabase
      .from("profiles")
      .select("nickname, avatar_url, bio, region")
      .eq("id", user.id)
      .maybeSingle();
    setProfile(data
      ? { nickname: data.nickname ?? "", avatar_url: data.avatar_url ?? "", bio: data.bio ?? "", region: data.region ?? "" }
      : DEFAULT
    );
  }, [user?.id]);

  useEffect(() => {
    fetchProfile();
    if (!user) return;

    const channel = supabase
      .channel(`profile-${user.id}`)
      .on("postgres_changes", {
        event:  "*",
        schema: "public",
        table:  "profiles",
        filter: `id=eq.${user.id}`,
      }, fetchProfile)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user?.id, fetchProfile]);

  return (
    <ProfileContext.Provider value={{ profile, refreshProfile: fetchProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}

export const useProfile = () => useContext(ProfileContext);
