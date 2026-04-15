import { Building2, Clock } from "lucide-react";
import type { AcademyPost } from "@/data/mockData";

interface Props {
  academies: AcademyPost[];
}

const AcademySection = ({ academies }: Props) => {
  return (
    <div className="rounded-xl bg-card shadow-card border border-border overflow-hidden">
      <div className="px-3 py-2 border-b border-border flex items-center justify-between">
        <h2 className="text-xs font-bold text-foreground flex items-center gap-1.5">
          <Building2 className="w-3.5 h-3.5 text-primary" />
          학원 홍보
        </h2>
        <span className="text-[10px] text-muted-foreground">{academies.length}건</span>
      </div>
      <div className="divide-y divide-border max-h-80 overflow-y-auto">
        {academies.map((a, i) => (
          <div
            key={a.id}
            className="px-3 py-2.5 hover:bg-secondary/40 transition-colors cursor-pointer animate-fade-in"
            style={{ animationDelay: `${i * 40}ms` }}
          >
            <div className="flex items-center gap-1 mb-0.5">
              <span className="text-[11px] font-semibold text-foreground">{a.name}</span>
              {a.isNew && <span className="badge-new text-[9px] px-1 py-0 rounded font-medium">NEW</span>}
            </div>
            <p className="text-[10px] text-muted-foreground line-clamp-1">{a.event}</p>
            <div className="flex items-center justify-between mt-1">
              <span className="text-[9px] text-muted-foreground">{a.region} · {a.category}</span>
              <span className="text-[9px] text-muted-foreground flex items-center gap-0.5">
                <Clock className="w-2.5 h-2.5" />{a.time}
              </span>
            </div>
          </div>
        ))}
        {academies.length === 0 && (
          <div className="px-3 py-6 text-center text-xs text-muted-foreground">해당 조건의 소식이 없습니다</div>
        )}
      </div>
    </div>
  );
};

export default AcademySection;
