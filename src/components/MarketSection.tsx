import { ShoppingBag, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { MarketPost } from "@/data/mockData";

interface Props {
  items: MarketPost[];
}

const MarketSection = ({ items }: Props) => {
  return (
    <div className="rounded-xl bg-card shadow-card border border-border overflow-hidden">
      <div className="px-3 py-2 border-b border-border flex items-center justify-between">
        <h2 className="text-xs font-bold text-foreground flex items-center gap-1.5">
          <ShoppingBag className="w-3.5 h-3.5 text-accent" />
          커뮤니티/장터
        </h2>
        <span className="text-[10px] text-muted-foreground">{items.length}건</span>
      </div>
      <div className="divide-y divide-border max-h-80 overflow-y-auto">
        {items.map((m, i) => (
          <div
            key={m.id}
            className="px-3 py-2 hover:bg-secondary/40 transition-colors cursor-pointer animate-fade-in"
            style={{ animationDelay: `${i * 40}ms` }}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1">
                  <Badge variant="outline" className="text-[9px] px-1 py-0 border-border">{m.type}</Badge>
                  <p className="text-[11px] font-semibold text-foreground line-clamp-1">{m.title}</p>
                </div>
                <p className="text-[9px] text-muted-foreground mt-0.5">{m.region}</p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[11px] font-bold text-primary">{m.price}</span>
                <p className="text-[9px] text-muted-foreground flex items-center justify-end gap-0.5 mt-0.5">
                  <Clock className="w-2.5 h-2.5" />{m.time}
                </p>
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="px-3 py-6 text-center text-xs text-muted-foreground">해당 조건의 게시물이 없습니다</div>
        )}
      </div>
    </div>
  );
};

export default MarketSection;
