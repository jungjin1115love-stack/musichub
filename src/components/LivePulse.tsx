import { TrendingUp, Users, FileText, Zap } from "lucide-react";

const stats = [
  { icon: FileText, label: "모집 공고", value: "128건", color: "text-primary" },
  { icon: Users, label: "신규 프로필", value: "15명", color: "text-accent" },
  { icon: Zap, label: "급구", value: "23건", suffix: "badge-urgent" },
  { icon: TrendingUp, label: "오늘 매칭", value: "47건", color: "text-primary" },
];

const LivePulse = () => {
  return (
    <div className="gradient-header border-b border-border">
      <div className="max-w-7xl mx-auto px-3 py-2 flex items-center gap-1 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1.5 shrink-0 mr-2">
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-dot" />
          <span className="text-[11px] font-semibold text-accent">LIVE</span>
        </div>
        {stats.map((s, i) => (
          <div
            key={i}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-secondary/60 shrink-0"
          >
            <s.icon className={`w-3 h-3 ${s.color || "text-foreground"}`} />
            <span className="text-[10px] text-muted-foreground">{s.label}</span>
            <span className="text-[11px] font-bold text-foreground">{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LivePulse;
