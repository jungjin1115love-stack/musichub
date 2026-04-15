import { CATEGORIES, REGIONS, type Category, type Region } from "@/data/mockData";
import { MapPin } from "lucide-react";

interface FilterBarProps {
  category: Category;
  region: Region;
  onCategoryChange: (c: Category) => void;
  onRegionChange: (r: Region) => void;
}

const FilterBar = ({ category, region, onCategoryChange, onRegionChange }: FilterBarProps) => {
  return (
    <div className="sticky top-12 z-40 bg-background/90 backdrop-blur-xl border-b border-border">
      <div className="max-w-7xl mx-auto px-3 py-2 space-y-1.5">
        {/* Category chips */}
        <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => onCategoryChange(c)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all shrink-0 ${
                category === c
                  ? "gradient-primary text-primary-foreground shadow-primary"
                  : "bg-secondary text-secondary-foreground hover:bg-muted"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        {/* Region */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <MapPin className="w-3 h-3 text-muted-foreground shrink-0" />
          {REGIONS.map((r) => (
            <button
              key={r}
              onClick={() => onRegionChange(r)}
              className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all shrink-0 ${
                region === r
                  ? "bg-primary/20 text-primary border border-primary/30"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
