import { NextRequest, NextResponse } from "next/server";

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

const YOUTUBE_SEARCH_URL = "https://www.googleapis.com/youtube/v3/search";

type GeminiStructuredResponse = {
  summary: string;
  toughLove: string;
  prescription: string;
  keywords: string[];
  category: "depression" | "anxiety" | "relationship" | "career" | "lazy" | "general";
  searchQuery: string;
};

type YouTubeVideo = {
  id: string;
  title: string;
  thumbnail: string;
  url: string;
};

type AnalyzeResponse = {
  summary: string;
  toughLove: string;
  prescription: string;
  videos: YouTubeVideo[];
};

const MOCK_VIDEOS: Record<string, YouTubeVideo[]> = {
  lazy: [
    {
      id: "mock1",
      title: "[동기부여] 무기력을 이겨내는 가장 현실적인 방법 (조던 피터슨)",
      thumbnail: "https://img.youtube.com/vi/mock1/hqdefault.jpg",
      url: "https://www.youtube.com/results?search_query=무기력+극복",
    },
    {
      id: "mock2",
      title: "침대에서 못 일어나는 당신을 위한 5분 루틴",
      thumbnail: "https://img.youtube.com/vi/mock2/hqdefault.jpg",
      url: "https://www.youtube.com/results?search_query=게으름+탈출",
    },
  ],
  depression: [
    {
      id: "mock3",
      title: "우울증 전문가가 말하는 '지금 당장 해야 할 1가지'",
      thumbnail: "https://img.youtube.com/vi/mock3/hqdefault.jpg",
      url: "https://www.youtube.com/results?search_query=우울증+극복",
    },
    {
      id: "mock4",
      title: "마음이 힘들 때 위로가 되는 명상 음악",
      thumbnail: "https://img.youtube.com/vi/mock4/hqdefault.jpg",
      url: "https://www.youtube.com/results?search_query=힐링+명상",
    },
  ],
  anxiety: [
    {
      id: "mock5",
      title: "불안을 잠재우는 뇌과학적 방법",
      thumbnail: "https://img.youtube.com/vi/mock5/hqdefault.jpg",
      url: "https://www.youtube.com/results?search_query=불안장애+극복",
    },
  ],
  career: [
    {
      id: "mock6",
      title: "30대 진로 고민, 늦지 않았습니다 (김미경 강사)",
      thumbnail: "https://img.youtube.com/vi/mock6/hqdefault.jpg",
      url: "https://www.youtube.com/results?search_query=진로+고민",
    },
  ],
  relationship: [
    {
      id: "mock7",
      title: "인간관계에 지친 당신에게 (오은영 박사)",
      thumbnail: "https://img.youtube.com/vi/mock7/hqdefault.jpg",
      url: "https://www.youtube.com/results?search_query=인간관계+스트레스",
    },
  ],
  general: [
    {
      id: "mock8",
      title: "인생을 바꾸는 아주 작은 습관의 힘",
      thumbnail: "https://img.youtube.com/vi/mock8/hqdefault.jpg",
      url: "https://www.youtube.com/results?search_query=습관+만들기",
    },
  ],
};

async function callGemini(userText: string): Promise<GeminiStructuredResponse> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const prompt = [
    "너는 한국어를 쓰는 심리 코치다.",
    "다음 사용자의 고민을 읽고 JSON 형식으로만 답변해라.",
    "전체적으로 솔직하고 직설적인 분석을 제공하되, 해결책(처방전) 부분만큼은 따뜻한 격려와 '할 수 있다'는 용기를 주는 어조로 작성해라.",
    "",
    "JSON 스키마는 다음과 같다:",
    "{",
    '  "summary": "심리 상태와 핵심 고민을 3~4문장으로 요약 (객관적 분석)",',
    '  "toughLove": "쓴소리 스타일의 직설적인 피드백 (4~7문장, 팩트 폭격 스타일)",',
    '  "prescription": "오늘부터 바로 실행할 수 있는 구체적 행동 지침 (번호 목록 형태, 최소 3개). 단, 이 부분의 말투는 매우 친절하고, 격려하며, 할 수 있다는 용기를 주는 따뜻한 문체여야 함 (예: ~해보세요, 충분히 할 수 있어요, 당신을 믿어요)",',
    '  "category": "고민의 종류를 다음 중 하나로 분류: depression(우울), anxiety(불안), relationship(관계), career(진로), lazy(무기력/게으름), general(기타)",',
    '  "searchQuery": "YouTube에서 가장 적절한 영상을 찾기 위한 최적화된 검색어 (예: 무기력 극복 동기부여, 자존감 높이는 법)",',
    '  "keywords": ["YouTube에서 검색하면 도움 될만한 한국어 키워드 3~5개"]',
    "}",
    "",
    "반드시 위 JSON 형식만 반환하고, 설명 문장이나 코드 블록 표시는 절대 포함하지 마라.",
  ].join("\n");

  const body = {
    contents: [
      {
        role: "user",
        parts: [
          {
            text: [prompt, "", "사용자 고민:", userText].join("\n"),
          },
        ],
      },
    ],
  };

  let retries = 3;
  let delay = 1000; // 초기 대기 시간 1초

  while (retries > 0) {
    try {
      const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      // 503 Service Unavailable (Model Overloaded) 처리
      if (response.status === 503) {
        console.warn(
          `Gemini API 503 Overloaded. Retrying in ${delay}ms... (Remaining retries: ${
            retries - 1
          })`
        );
        retries--;
        if (retries === 0) {
          throw new Error(
            "현재 사용자가 많아 AI 모델이 응답하지 않습니다. 잠시 후 다시 시도해 주세요."
          );
        }
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2; // 지수 백오프 (1s -> 2s -> 4s)
        continue;
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Gemini API error: ${response.status} ${response.statusText} - ${errorText}`
        );
      }

      const data = (await response.json()) as {
        candidates?: {
          content?: {
            parts?: { text?: string }[];
          };
        }[];
      };

      const content =
        data.candidates?.[0]?.content?.parts
          ?.map((p) => p.text ?? "")
          .join("") ?? "";

      if (!content) {
        throw new Error("Gemini 응답이 비어 있습니다.");
      }

      try {
        const cleaned = content.replace(/```json\s*|\s*```/g, "");
        const parsed = JSON.parse(cleaned) as GeminiStructuredResponse;

        return {
          summary: parsed.summary ?? "",
          toughLove: parsed.toughLove ?? "",
          prescription: Array.isArray(parsed.prescription)
            ? parsed.prescription.join("\n")
            : parsed.prescription ?? "",
          keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [],
          category: parsed.category ?? "general",
          searchQuery: parsed.searchQuery ?? "",
        };
      } catch {
        return {
          summary: content,
          toughLove: "",
          prescription: "",
          keywords: [],
          category: "general",
          searchQuery: "",
        };
      }
    } catch (error: unknown) {
      // 네트워크 에러 등으로 인한 fetch 실패 시에도 재시도 고려 가능
      // 여기서는 503 에러가 throw된 경우 루프를 빠져나가지 않고 위에서 처리했으므로,
      // 그 외의 치명적 에러는 바로 throw
      if (
        error instanceof Error &&
        (error.message.includes("503") ||
          error.message.includes("현재 사용자가 많아"))
      ) {
        throw error;
      }
      
      // 일시적인 네트워크 오류일 수 있으므로 재시도 시도 (선택적)
      if (retries > 1 && error instanceof Error && error.name === 'TypeError') { // fetch network error
         console.warn(`Network error during Gemini call. Retrying... ${error.message}`);
         retries--;
         await new Promise((resolve) => setTimeout(resolve, delay));
         delay *= 2;
         continue;
      }

      throw error;
    }
  }
  
  throw new Error("Gemini API 호출에 실패했습니다.");
}

async function searchYouTube(
  query: string,
  maxResults = 4,
): Promise<YouTubeVideo[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    throw new Error("YOUTUBE_API_KEY is not configured");
  }

  const url = new URL(YOUTUBE_SEARCH_URL);
  url.searchParams.set("part", "snippet");
  url.searchParams.set("q", query);
  url.searchParams.set("type", "video");
  url.searchParams.set("maxResults", String(maxResults));
  url.searchParams.set("key", apiKey);
  url.searchParams.set("safeSearch", "moderate");

  const response = await fetch(url.toString(), {
    method: "GET",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `YouTube API error: ${response.status} ${response.statusText} - ${errorText}`,
    );
  }

  const data = (await response.json()) as {
    items?: {
      id?: { videoId?: string };
      snippet?: {
        title?: string;
        thumbnails?: {
          high?: { url?: string };
          medium?: { url?: string };
          default?: { url?: string };
        };
      };
    }[];
  };

  const items = data.items ?? [];

  return items
    .map((item) => {
      const videoId = item.id?.videoId;
      const title = item.snippet?.title ?? "";
      const thumb =
        item.snippet?.thumbnails?.high?.url ??
        item.snippet?.thumbnails?.medium?.url ??
        item.snippet?.thumbnails?.default?.url ??
        "";

      if (!videoId) {
        return null;
      }

      return {
        id: videoId,
        title,
        thumbnail: thumb,
        url: `https://www.youtube.com/watch?v=${videoId}`,
      };
    })
    .filter((v): v is YouTubeVideo => v !== null);
}

// --- API Route Handler ---

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => null)) as {
      text?: string;
    } | null;

    const text = body?.text?.trim();

    if (!text) {
      return NextResponse.json(
        { error: "고민 내용을 입력해 주세요." },
        { status: 400 },
      );
    }

    const gemini = await callGemini(text);

    // 1. 검색어 결정: GEMINI가 만든 최적화된 쿼리 우선 사용
    const searchString = gemini.searchQuery || gemini.keywords?.join(" ") || text.slice(0, 30);

    let videos: YouTubeVideo[] = [];

    try {
      // 2. 하이브리드 검색 로직: API 키가 있으면 실제 검색, 없으면 더미 데이터 사용
      if (process.env.YOUTUBE_API_KEY) {
        videos = await searchYouTube(searchString);
      } else {
        console.warn("YOUTUBE_API_KEY is missing, using mock data based on category.");
        const category = gemini.category || "general";
        videos = MOCK_VIDEOS[category] || MOCK_VIDEOS["general"];
      }
    } catch (ytError) {
      console.error("YouTube search failed:", ytError);
      // 3. API 호출 실패 시에도 더미 데이터로 폴백(Fallback)하여 UX 유지
      const category = gemini.category || "general";
      videos = MOCK_VIDEOS[category] || MOCK_VIDEOS["general"];
    }

    const response: AnalyzeResponse = {
      summary: gemini.summary,
      toughLove: gemini.toughLove,
      prescription: gemini.prescription,
      videos,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Analyze API Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "알 수 없는 오류가 발생했습니다.",
      },
      { status: 500 },
    );
  }
}

