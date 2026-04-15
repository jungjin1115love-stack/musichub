import { Link, useLocation } from "react-router-dom";

const NAV_ITEMS = [
  { path: "/instructors", label: "선생님 찾기", emoji: "🎓" },
  { path: "/jobs",        label: "학원 일자리", emoji: "💼" },
  { path: "/academies",   label: "내 주변 학원", emoji: "🏫" },
  { path: "/feed",        label: "모아보기",    emoji: "📋" },
];

const Navbar = () => {
  const { pathname } = useLocation();

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      {/* Row 1: Logo + Login */}
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between border-b border-gray-100">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl">🎵</span>
          <span className="text-xl font-extrabold text-[#ff8a3d]">MusicHub</span>
        </Link>
        <button className="bg-[#ff8a3d] text-white rounded-full px-5 h-9 font-bold text-sm hover:bg-[#e07030] transition-colors">
          로그인
        </button>
      </div>

      {/* Row 2: 3 Nav Tabs */}
      <div className="max-w-2xl mx-auto flex">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-xs font-bold transition-colors border-b-2 ${
                isActive
                  ? "text-[#ff8a3d] border-[#ff8a3d] bg-orange-50"
                  : "text-gray-400 border-transparent hover:text-gray-600"
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
