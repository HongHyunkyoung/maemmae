"use client";

import { useMemo, useState } from "react";

type Device = "mobile" | "tablet" | "desktop";
type Orientation = "portrait" | "landscape";
type NetworkMode = "normal" | "slow" | "offline";

type Viewport = {
  width: number;
  height: number;
  label: string;
};

function getViewport(device: Device, orientation: Orientation): Viewport {
  let width: number;
  let height: number;

  switch (device) {
    case "mobile":
      width = 390;
      height = 844;
      break;
    case "tablet":
      width = 768;
      height = 1024;
      break;
    default:
      width = 1280;
      height = 720;
  }

  if (orientation === "landscape") {
    return {
      width: height,
      height: width,
      label: `${device === "mobile" ? "모바일" : device === "tablet" ? "태블릿" : "데스크톱"} · 가로`,
    };
  }

  return {
    width,
    height,
    label: `${device === "mobile" ? "모바일" : device === "tablet" ? "태블릿" : "데스크톱"} · 세로`,
  };
}

function getNetworkLabel(mode: NetworkMode): string {
  if (mode === "slow") return "느린 3G 정도의 네트워크를 가정한 모드입니다.";
  if (mode === "offline") return "오프라인 상황을 가정한 모드입니다. 실제 네트워크를 끊지는 않습니다.";
  return "일반적인 데스크톱 브라우저 환경을 가정한 모드입니다.";
}

export default function PreviewPage() {
  const [device, setDevice] = useState<Device>("mobile");
  const [orientation, setOrientation] = useState<Orientation>("portrait");
  const [network, setNetwork] = useState<NetworkMode>("normal");

  const viewport = useMemo(
    () => getViewport(device, orientation),
    [device, orientation],
  );

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-6 text-slate-50">
      <main className="mx-auto flex max-w-6xl flex-col gap-6 lg:flex-row">
        <aside className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-xl shadow-black/40">
          <h1 className="text-lg font-semibold tracking-tight">
            미리보기 컨트롤 패널
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            디바이스, 방향, 네트워크 조건을 바꿔가며 현재 사이트의 반응형 상태를
            빠르게 확인할 수 있습니다. 코드 수정 사항은 Next.js 개발 서버의 핫
            리로딩을 통해 자동으로 반영됩니다.
          </p>

          <section className="mt-4 space-y-2">
            <h2 className="text-sm font-medium text-slate-200">디바이스</h2>
            <div className="flex gap-2">
              <ToggleButton
                active={device === "mobile"}
                onClick={() => setDevice("mobile")}
              >
                모바일
              </ToggleButton>
              <ToggleButton
                active={device === "tablet"}
                onClick={() => setDevice("tablet")}
              >
                태블릿
              </ToggleButton>
              <ToggleButton
                active={device === "desktop"}
                onClick={() => setDevice("desktop")}
              >
                데스크톱
              </ToggleButton>
            </div>
          </section>

          <section className="mt-4 space-y-2">
            <h2 className="text-sm font-medium text-slate-200">화면 방향</h2>
            <div className="flex gap-2">
              <ToggleButton
                active={orientation === "portrait"}
                onClick={() => setOrientation("portrait")}
              >
                세로
              </ToggleButton>
              <ToggleButton
                active={orientation === "landscape"}
                onClick={() => setOrientation("landscape")}
              >
                가로
              </ToggleButton>
            </div>
          </section>

          <section className="mt-4 space-y-2">
            <h2 className="text-sm font-medium text-slate-200">네트워크</h2>
            <div className="flex flex-wrap gap-2">
              <ToggleButton
                active={network === "normal"}
                onClick={() => setNetwork("normal")}
              >
                기본
              </ToggleButton>
              <ToggleButton
                active={network === "slow"}
                onClick={() => setNetwork("slow")}
              >
                느린 3G
              </ToggleButton>
              <ToggleButton
                active={network === "offline"}
                onClick={() => setNetwork("offline")}
              >
                오프라인
              </ToggleButton>
            </div>
            <p className="text-xs text-slate-500">
              {getNetworkLabel(network)}
            </p>
          </section>

          <section className="mt-4 space-y-1">
            <h2 className="text-sm font-medium text-slate-200">
              사용 방법 요약
            </h2>
            <ul className="list-disc space-y-1 pl-4 text-xs text-slate-400">
              <li>코드를 수정하면 미리보기 영역이 자동으로 갱신됩니다.</li>
              <li>실제 네트워크 속도·엔진 차이는 브라우저 개발자 도구로 함께 확인하세요.</li>
              <li>여러 브라우저에서 이 페이지를 열면 크로스 브라우저 체크에 활용할 수 있습니다.</li>
            </ul>
          </section>
        </aside>

        <section className="flex flex-1 flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <header className="flex flex-wrap items-center justify-between gap-2">
            <div className="space-y-1">
              <p className="text-xs font-medium text-slate-300">
                {viewport.label}
              </p>
              <p className="text-[11px] text-slate-500">
                {viewport.width} × {viewport.height}px · 네트워크 모드:{" "}
                {network === "normal"
                  ? "기본"
                  : network === "slow"
                    ? "느린 3G"
                    : "오프라인 가정"}
              </p>
            </div>
            <p className="text-[11px] text-slate-500">
              이 프레임은 현재 배포되지 않은 로컬 개발 버전까지 포함해 그대로
              렌더링합니다.
            </p>
          </header>

          <div className="flex flex-1 items-center justify-center overflow-auto rounded-xl bg-slate-950/80 p-4">
            <div
              className="relative overflow-hidden rounded-[1.8rem] border border-slate-700 bg-black shadow-[0_0_0_1px_rgba(15,23,42,0.8),0_40px_80px_rgba(0,0,0,0.8)]"
              style={{
                width: viewport.width,
                height: viewport.height,
                opacity: network === "offline" ? 0.4 : 1,
                transition: "opacity 150ms ease-out",
              }}
            >
              <div className="pointer-events-none absolute inset-x-16 top-0 h-4 rounded-b-3xl bg-slate-900/90" />
              <iframe
                title="Site preview"
                src="/"
                className="h-full w-full border-0 bg-black"
              />
              {network === "slow" && (
                <div className="pointer-events-none absolute inset-x-4 top-4 rounded-lg bg-slate-950/75 px-3 py-1.5 text-center text-[11px] text-slate-200 backdrop-blur">
                  느린 네트워크 모드: 실제 속도는 브라우저 개발자 도구의
                  Throttling 기능과 함께 확인하세요.
                </div>
              )}
              {network === "offline" && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-slate-950/80 px-6 text-center text-xs text-slate-200">
                  오프라인 시나리오를 상상하며 UI만 빠르게 확인하는 모드입니다.
                  서비스 워커나 캐싱 전략을 적용하면 이 상태에서도 동작하도록
                  설계할 수 있습니다.
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

type ToggleButtonProps = {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
};

function ToggleButton({ active, onClick, children }: ToggleButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
        active
          ? "bg-sky-500 text-slate-950 shadow-sm shadow-sky-500/40"
          : "bg-slate-800 text-slate-200 hover:bg-slate-700"
      }`}
    >
      {children}
    </button>
  );
}

