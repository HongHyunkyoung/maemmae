"use client";

import { useEffect, useState } from "react";
import { Brain, FileText, Pill, Stethoscope, Loader2 } from "lucide-react";

const LOADING_STEPS = [
  { text: "고민을 읽고 있습니다...", icon: FileText },
  { text: "심리 상태를 분석하는 중...", icon: Brain },
  { text: "따끔한 쓴소리를 준비 중...", icon: Stethoscope },
  { text: "맞춤형 처방전을 작성하고 있습니다...", icon: Pill },
];

export default function LoadingState() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => (prev + 1) % LOADING_STEPS.length);
    }, 2000); // Change text every 2 seconds

    return () => clearInterval(interval);
  }, []);

  const CurrentIcon = LOADING_STEPS[step].icon;

  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/60 p-12 text-center shadow-inner transition-all duration-500">
      <div className="relative mb-6">
        <div className="absolute inset-0 animate-ping rounded-full bg-sky-500/20 duration-1000"></div>
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-950 shadow-xl shadow-sky-500/20 ring-1 ring-slate-800">
          <CurrentIcon
            size={32}
            className="animate-pulse text-sky-400 transition-all duration-500"
          />
        </div>
        <div className="absolute -bottom-1 -right-1 rounded-full bg-slate-900 p-1 ring-1 ring-slate-800">
            <Loader2 size={14} className="animate-spin text-slate-400" />
        </div>
      </div>
      
      <h3 className="mb-2 text-lg font-medium text-slate-200">
        AI 분석 진행 중
      </h3>
      
      <div className="h-6 overflow-hidden">
        <p className="animate-fade-in text-sm text-slate-400 transition-all duration-500 key={step}">
          {LOADING_STEPS[step].text}
        </p>
      </div>

      <div className="mt-8 flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1.5 w-1.5 rounded-full transition-all duration-500 ${
              i === step ? "bg-sky-500 w-4" : "bg-slate-800"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
