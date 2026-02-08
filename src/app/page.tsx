"use client";

import { useState, type FormEvent } from "react";

type Video = {
  id: string;
  title: string;
  thumbnail: string;
  url: string;
};

type AnalyzeResult = {
  summary: string;
  toughLove: string;
  prescription: string;
  videos: Video[];
  keywords: string[];
};

export default function Home() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalyzeResult | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const trimmed = text.trim();

    if (!trimmed) {
      setError("먼저 고민을 솔직하게 적어 주세요.");
      setResult(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: trimmed }),
      });

      const data = (await response.json().catch(() => null)) as
        | AnalyzeResult
        | { error?: string }
        | null;

      if (!response.ok) {
        const message =
          (data && "error" in data && data.error) ||
          "분석 중에 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.";
        setError(message);
        setResult(null);
        return;
      }

      if (!data || !("summary" in data)) {
        setError("예상치 못한 응답 형식입니다.");
        setResult(null);
        return;
      }

      setResult({
        summary: data.summary,
        toughLove: data.toughLove,
        prescription: data.prescription,
        videos: data.videos ?? [],
        keywords: data.keywords ?? [],
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "요청 처리 중 오류가 발생했습니다.",
      );
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-4 py-10 text-slate-50">
      <main className="mx-auto flex max-w-5xl flex-col gap-8">
        <header className="space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            쓴소리 자판기
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
            누구한테도 못 한 고민, 여기다 던져 보세요. AI가 심리 분석을 하고,
            살짝 아픈 쓴소리와 바로 실행할 수 있는 처방전을 ― 그리고 도움이 될
            만한 YouTube 영상까지 한 번에 뽑아 드립니다.
          </p>
        </header>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1.4fr)]">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl shadow-black/40"
          >
            <div className="flex items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-medium text-slate-200 sm:text-base">
                  고민 입력
                </h2>
                <p className="text-xs text-slate-400 sm:text-[13px]">
                  최대한 구체적으로, 상황과 감정, 내가 이미 해 본 시도까지
                  적어 주세요.
                </p>
              </div>
              <span className="text-xs text-slate-500">
                {text.trim().length}자
              </span>
            </div>

            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="예) 20대 후반 직장인입니다. 회사 일이 너무 바쁜데도 자꾸 미루고, 밤마다 유튜브만 보다가 새벽에 잠들어요..."
              className="min-h-[180px] w-full resize-none rounded-xl border border-slate-800 bg-slate-950/60 px-3.5 py-3 text-sm leading-relaxed text-slate-50 outline-none ring-0 transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/40 sm:text-[15px]"
            />

            {error && (
              <p className="rounded-md border border-red-500/40 bg-red-950/40 px-3 py-2 text-xs text-red-100 sm:text-[13px]">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 inline-flex items-center justify-center rounded-full bg-sky-500 px-5 py-2.5 text-sm font-medium text-slate-950 shadow-lg shadow-sky-500/40 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-slate-600 disabled:shadow-none"
            >
              {loading ? "AI가 쓴소리 준비 중..." : "쓴소리 & 처방전 받기"}
            </button>
          </form>

          <div className="flex flex-col gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <ResultCard
                title="심리 분석 요약"
                description="지금 당신의 심리 상태와 고민의 핵심을 정리합니다."
                body={result?.summary}
                placeholder="고민을 입력하면, AI가 당신의 마음 상태를 요약해 보여줍니다."
              />
              <ResultCard
                title="쓴소리 피드백"
                description="기분이 살짝 상할 수 있는, 하지만 필요한 한마디들."
                body={result?.toughLove}
                placeholder="눈치 안 보고 직설적으로 들을 얘기를 여기에 적어 줍니다."
              />
            </div>

            <div className="grid gap-4 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1.1fr)]">
              <ResultCard
                title="AI 처방전"
                description="오늘부터 당장 실행 가능한 행동 지침."
                body={result?.prescription}
                placeholder="단순한 위로가 아니라, 할 수밖에 없게 만드는 구체적인 액션 플랜을 알려줍니다."
              />

              <div className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                <div>
                  <h2 className="text-sm font-medium text-slate-200 sm:text-base">
                    추천 YouTube 영상
                  </h2>
                  <p className="text-xs text-slate-400 sm:text-[13px]">
                    고민 키워드와 처방전 내용을 바탕으로, 도움이 될 만한 영상들을
                    골라 드렸습니다.
                  </p>
                </div>

                {result && result.videos.length === 0 && (
                  <p className="mt-1 text-xs text-slate-500 sm:text-[13px]">
                    적절한 영상을 찾지 못했어요. 고민을 조금 더 구체적으로
                    적어보는 것도 방법입니다.
                  </p>
                )}

                {!result && (
                  <p className="mt-1 text-xs text-slate-500 sm:text-[13px]">
                    고민을 입력하면, 관련된 자기계발·심리·습관 교정 영상들을
                    추천해 드립니다.
                  </p>
                )}

                {result && result.videos.length > 0 && (
                  <div className="mt-2 flex flex-col gap-3">
                    {/* 키워드 태그 표시 (투명성 확보) */}
                    {result.keywords && result.keywords.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {result.keywords.map((keyword, i) => (
                          <a
                            key={i}
                            href={`https://www.youtube.com/results?search_query=${encodeURIComponent(
                              keyword
                            )}`}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-md bg-slate-800/80 px-2 py-1 text-[11px] text-slate-300 hover:bg-slate-700 hover:text-sky-300 transition-colors"
                          >
                            #{keyword}
                          </a>
                        ))}
                      </div>
                    )}

                    <ul className="flex flex-col gap-3">
                      {result.videos.map((video) => (
                        <li
                          key={video.id}
                          className="flex gap-3 rounded-xl border border-slate-800/70 bg-slate-900/70 p-2.5"
                        >
                        <div className="h-20 w-32 flex-shrink-0 overflow-hidden rounded-lg bg-slate-800">
                          {video.thumbnail && (
                            <img
                              src={video.thumbnail}
                              alt={video.title}
                              className="h-full w-full object-cover"
                            />
                          )}
                        </div>
                        <div className="flex min-w-0 flex-1 flex-col justify-between gap-1">
                          <p className="line-clamp-2 text-xs font-medium text-slate-100 sm:text-[13px]">
                            {video.title}
                          </p>
                          <a
                            href={video.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex w-fit text-xs font-medium text-sky-400 hover:text-sky-300"
                          >
                            YouTube에서 열기
                          </a>
                        </div>
                      </li>
                    ))}
                  </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

type ResultCardProps = {
  title: string;
  description: string;
  body?: string;
  placeholder: string;
};

function ResultCard({ title, description, body, placeholder }: ResultCardProps) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
      <div>
        <h2 className="text-sm font-medium text-slate-200 sm:text-base">
          {title}
        </h2>
        <p className="text-xs text-slate-400 sm:text-[13px]">{description}</p>
      </div>
      <div className="flex-1 rounded-xl bg-slate-950/40 p-3 text-xs leading-relaxed text-slate-100 sm:text-[13px]">
        {body ? (
          <p className="whitespace-pre-line">{body}</p>
        ) : (
          <p className="text-slate-500">{placeholder}</p>
        )}
      </div>
    </div>
  );
}
