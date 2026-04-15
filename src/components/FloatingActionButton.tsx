import { Plus, X, Briefcase, Music, Building2, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

const postTypes = [
  { icon: Briefcase, label: "구인 공고", color: "gradient-primary" },
  { icon: Music, label: "레슨 등록", color: "gradient-accent" },
  { icon: Building2, label: "학원 홍보", color: "gradient-primary" },
  { icon: ShoppingBag, label: "장터 글쓰기", color: "gradient-accent" },
];

const FloatingActionButton = () => {
  const [open, setOpen] = useState(false);

  const handlePost = (label: string) => {
    setOpen(false);
    toast({
      title: `${label} 작성 화면`,
      description: "이 기능은 곧 추가될 예정입니다.",
    });
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-2">
      {open && (
        <div className="flex flex-col gap-2 animate-slide-up">
          {postTypes.map((p) => (
            <button
              key={p.label}
              onClick={() => handlePost(p.label)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-card border border-border shadow-card hover:shadow-card-hover transition-all"
            >
              <div className={`w-7 h-7 rounded-lg ${p.color} flex items-center justify-center`}>
                <p.icon className="w-3.5 h-3.5 text-primary-foreground" />
              </div>
              <span className="text-xs font-medium text-foreground whitespace-nowrap">{p.label}</span>
            </button>
          ))}
        </div>
      )}
      <button
        onClick={() => setOpen(!open)}
        className={`w-12 h-12 rounded-full gradient-primary shadow-fab flex items-center justify-center transition-transform ${open ? "rotate-45" : ""}`}
      >
        {open ? <X className="w-5 h-5 text-primary-foreground" /> : <Plus className="w-5 h-5 text-primary-foreground" />}
      </button>
    </div>
  );
};

export default FloatingActionButton;
