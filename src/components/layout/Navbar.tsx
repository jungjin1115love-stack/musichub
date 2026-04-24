import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogOut, LogIn, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/contexts/ProfileContext";
import { supabase } from "@/lib/supabase";

const GOLD       = "#D4AF37";
const GOLD_LIGHT = "#F5E27A";

const NAV_ITEMS = [
  { path: "/",            label: "홈",        emoji: "🏠" },
  { path: "/feed",        label: "학원 찾기",  emoji: "🏫" },
  { path: "/instructors", label: "선생님 찾기", emoji: "🥁" },
  { path: "/studios",     label: "연습실 찾기", emoji: "🎸" },
];

const Navbar = () => {
  const { pathname }      = useLocation();
  const navigate          = useNavigate();
  const { user, loading } = useAuth();
  const { profile }       = useProfile();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const displayName =
    profile.nickname ||
    user?.email?.split("@")[0]?.slice(0, 10) ||
    "유저";

  const authSlot = loading ? (
    <div className="w-20 h-8 rounded-full animate-pulse"
      style={{ background: "rgba(255,255,255,0.06)" }} />
  ) : user ? (
    <div className="flex items-center gap-2">
      <Link to="/profile">
        <div className="flex items-center gap-1.5 rounded-full px-3 h-8 hover:opacity-80 transition-opacity"
          style={{ background: `${GOLD}15`, border: `1px solid ${GOLD}35` }}>
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt="프로필"
              className="w-5 h-5 rounded-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          ) : (
            <User size={11} style={{ color: GOLD }} />
          )}
          <span className="text-xs font-bold" style={{ color: GOLD }}>{displayName}</span>
        </div>
      </Link>
      <button
        onClick={handleLogout}
        className="flex items-center gap-1.5 rounded-full px-3 h-8 text-xs font-bold transition-opacity hover:opacity-70"
        style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.1)" }}>
        <LogOut size={12} /> 로그아웃
      </button>
    </div>
  ) : (
    <Link to="/auth">
      <button
        className="flex items-center gap-1.5 text-[#0d0f1a] font-bold text-sm rounded-full px-5 h-9 hover:opacity-90 transition-opacity"
        style={{ background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})` }}>
        <LogIn size={14} /> 로그인
      </button>
    </Link>
  );

  return (
    <header className="sticky top-0 z-50 bg-[#0d0f1a] border-b border-[#D4AF37]/20 shadow-lg shadow-black/40">
      {/* Row 1: Logo + Auth */}
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl">🥁</span>
          <span className="text-xl font-extrabold" style={{ color: GOLD }}>DrumHub</span>
        </Link>
        {authSlot}
      </div>

      {/* Row 2: Nav Tabs */}
      <div className="max-w-2xl mx-auto flex">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.path === "/"
              ? pathname === "/"
              : pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-xs font-bold transition-colors border-b-2 ${
                isActive
                  ? "border-[#D4AF37] text-[#D4AF37]"
                  : "border-transparent text-gray-500 hover:text-gray-300"
              }`}
            >
              <span className="text-xl leading-none">{item.emoji}</span>
              <span className="leading-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </header>
  );
};

export default Navbar;
