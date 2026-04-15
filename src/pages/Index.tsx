import { useState, useMemo } from "react";
import { type Category, type Region, mockJobs, mockLessons, mockAcademies, mockMarket } from "@/data/mockData";
import LivePulse from "@/components/LivePulse";
import FilterBar from "@/components/FilterBar";
import JobSection from "@/components/JobSection";
import LessonSection from "@/components/LessonSection";
import AcademySection from "@/components/AcademySection";
import MarketSection from "@/components/MarketSection";
import FloatingActionButton from "@/components/FloatingActionButton";

const Index = () => {
  const [category, setCategory] = useState<Category>("전체");
  const [region, setRegion] = useState<Region>("전체");

  const filter = <T extends { category: Category | "전체"; region: Region | "전체" }>(items: T[]) =>
    items.filter(
      (item) =>
        (category === "전체" || item.category === category) &&
        (region === "전체" || item.region === region)
    );

  const jobs = useMemo(() => filter(mockJobs), [category, region]);
  const lessons = useMemo(() => filter(mockLessons), [category, region]);
  const academies = useMemo(() => filter(mockAcademies), [category, region]);
  const market = useMemo(() => filter(mockMarket), [category, region]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-3 h-12 flex items-center justify-between">
          <h1 className="text-sm font-bold text-foreground tracking-tight flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full gradient-primary inline-block" />
            실음허브
            <span className="text-[10px] font-normal text-muted-foreground ml-1">실용음악 통합 대시보드</span>
          </h1>
        </div>
      </header>

      <LivePulse />
      <FilterBar
        category={category}
        region={region}
        onCategoryChange={setCategory}
        onRegionChange={setRegion}
      />

      {/* Dashboard Grid */}
      <main className="max-w-7xl mx-auto px-3 py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <JobSection jobs={jobs} />
          <LessonSection lessons={lessons} />
          <AcademySection academies={academies} />
          <MarketSection items={market} />
        </div>
      </main>

      <FloatingActionButton />
    </div>
  );
};

export default Index;
