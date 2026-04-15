import { Briefcase, BadgeCheck, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { JobPost } from "@/data/mockData";

interface Props {
  jobs: JobPost[];
}

const JobSection = ({ jobs }: Props) => {
  return (
    <div className="rounded-xl bg-card shadow-card border border-border overflow-hidden">
      <div className="px-3 py-2 border-b border-border flex items-center justify-between">
        <h2 className="text-xs font-bold text-foreground flex items-center gap-1.5">
          <Briefcase className="w-3.5 h-3.5 text-primary" />
          구인/구직
        </h2>
        <span className="text-[10px] text-muted-foreground">{jobs.length}건</span>
      </div>
      <div className="divide-y divide-border max-h-80 overflow-y-auto">
        {jobs.map((job, i) => (
          <div
            key={job.id}
            className="px-3 py-2 hover:bg-secondary/40 transition-colors cursor-pointer animate-fade-in"
            style={{ animationDelay: `${i * 40}ms` }}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1 flex-wrap">
                  {job.urgent && <span className="badge-urgent text-[9px] px-1 py-0 rounded font-bold">급구</span>}
                  {job.verified && <BadgeCheck className="w-3 h-3 text-accent shrink-0" />}
                  {job.isNew && <span className="badge-new text-[9px] px-1 py-0 rounded font-medium">NEW</span>}
                </div>
                <p className="text-xs font-semibold text-foreground mt-0.5 line-clamp-1">{job.title}</p>
                <p className="text-[10px] text-muted-foreground line-clamp-1">{job.academy} · {job.region}</p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[11px] font-bold text-primary">{job.salary}</span>
                <p className="text-[9px] text-muted-foreground flex items-center justify-end gap-0.5 mt-0.5">
                  <Clock className="w-2.5 h-2.5" />{job.time}
                </p>
              </div>
            </div>
          </div>
        ))}
        {jobs.length === 0 && (
          <div className="px-3 py-6 text-center text-xs text-muted-foreground">해당 조건의 공고가 없습니다</div>
        )}
      </div>
    </div>
  );
};

export default JobSection;
