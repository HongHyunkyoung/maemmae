"use client";

import { useState } from "react";
import {
  Brain,
  HeartPulse,
  Activity,
  Users,
  Briefcase,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

type CategoryDetail = {
  score: number;
  keywords: string[];
  advice: string;
  detail: string;
};

export type AnalysisData = {
  personality: CategoryDetail;
  emotion: CategoryDetail;
  stress: CategoryDetail;
  relationship: CategoryDetail;
  career: CategoryDetail;
};

const CATEGORY_CONFIG = {
  personality: {
    label: "성격 유형",
    icon: Brain,
    color: "text-purple-400",
    bgColor: "bg-purple-400/10",
    borderColor: "border-purple-400/20",
  },
  emotion: {
    label: "감정 상태",
    icon: HeartPulse,
    color: "text-rose-400",
    bgColor: "bg-rose-400/10",
    borderColor: "border-rose-400/20",
  },
  stress: {
    label: "스트레스 지수",
    icon: Activity,
    color: "text-amber-400",
    bgColor: "bg-amber-400/10",
    borderColor: "border-amber-400/20",
  },
  relationship: {
    label: "대인관계",
    icon: Users,
    color: "text-sky-400",
    bgColor: "bg-sky-400/10",
    borderColor: "border-sky-400/20",
  },
  career: {
    label: "직업 적합도",
    icon: Briefcase,
    color: "text-emerald-400",
    bgColor: "bg-emerald-400/10",
    borderColor: "border-emerald-400/20",
  },
};

export default function AnalysisAccordion({ data }: { data: AnalysisData }) {
  // Independent open states for each section
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleKeyDown = (e: React.KeyboardEvent, key: string) => {
    if (e.key === "Escape" && openSections[key]) {
      toggleSection(key);
    }
  };

  return (
    <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {(Object.keys(CATEGORY_CONFIG) as Array<keyof AnalysisData>).map(
        (key) => {
          const config = CATEGORY_CONFIG[key];
          const item = data[key];
          const isOpen = openSections[key];
          const Icon = config.icon;

          if (!item) return null;

          return (
            <div
              key={key}
              className={`flex flex-col rounded-2xl border transition-all duration-300 ${
                isOpen
                  ? `${config.borderColor} ${config.bgColor}`
                  : "border-slate-800 bg-slate-900/60 hover:bg-slate-900/80"
              }`}
              onKeyDown={(e) => handleKeyDown(e, key)}
            >
              <button
                onClick={() => toggleSection(key)}
                className="flex w-full items-center justify-between p-4 outline-none focus-visible:ring-2 focus-visible:ring-sky-500 rounded-2xl"
                aria-expanded={isOpen}
                aria-controls={`section-${key}`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950/50 ${config.color}`}
                    aria-hidden="true"
                  >
                    <Icon size={20} />
                  </div>
                  <div className="text-left">
                    <h3 className="text-sm font-medium text-slate-200">
                      {config.label}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {isOpen ? "접기" : "분석 결과 보기"}
                    </p>
                  </div>
                </div>
                {isOpen ? (
                  <ChevronUp className="text-slate-500" size={18} />
                ) : (
                  <ChevronDown className="text-slate-500" size={18} />
                )}
              </button>

              <div
                id={`section-${key}`}
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <div className="border-t border-slate-800/50 p-4 pt-2">
                  {/* Score Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                      <span>지수</span>
                      <span className={`font-semibold ${config.color}`}>
                        {item.score}/100
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-950">
                      <div
                        className={`h-full rounded-full opacity-80 ${config.color.replace(
                          "text-",
                          "bg-"
                        )}`}
                        style={{ width: `${item.score}%` }}
                      />
                    </div>
                  </div>

                  {/* Keywords */}
                  <div className="mb-4 flex flex-wrap gap-1.5">
                    {item.keywords.map((k, i) => (
                      <span
                        key={i}
                        className="rounded-md bg-slate-950/60 px-2 py-1 text-[11px] text-slate-300"
                      >
                        #{k}
                      </span>
                    ))}
                  </div>

                  {/* Detail & Advice */}
                  <div className="space-y-3">
                    <p className="text-xs leading-relaxed text-slate-300">
                      {item.detail}
                    </p>
                    <div className={`rounded-lg p-3 text-xs ${config.bgColor}`}>
                      <span className={`font-semibold ${config.color}`}>
                        Tip:
                      </span>{" "}
                      <span className="text-slate-200">{item.advice}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        }
      )}
    </div>
  );
}
