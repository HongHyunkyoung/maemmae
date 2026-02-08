import { NextRequest, NextResponse } from "next/server";

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

const YOUTUBE_SEARCH_URL = "https://www.googleapis.com/youtube/v3/search";

type CategoryDetail = {
  score: number;
  keywords: string[];
  advice: string;
  detail: string;
};

type GeminiStructuredResponse = {
  analysis: {
    personality: CategoryDetail;
    emotion: CategoryDetail;
    stress: CategoryDetail;
    relationship: CategoryDetail;
    career: CategoryDetail;
  };
  toughLove: string;
  prescription: string;
  keywords: string[];
  category: "depression" | "anxiety" | "relationship" | "career" | "lazy" | "eating" | "general";
  searchQuery: string;
};

type YouTubeVideo = {
  id: string;
  title: string;
  thumbnail: string;
  url: string;
};

type AnalyzeResponse = {
  analysis: {
    personality: CategoryDetail;
    emotion: CategoryDetail;
    stress: CategoryDetail;
    relationship: CategoryDetail;
    career: CategoryDetail;
  };
  toughLove: string;
  prescription: string;
  videos: YouTubeVideo[];
  keywords: string[];
  debug?: {
    source: "youtube_api" | "mock_data";
    searchQuery: string;
  };
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
  eating: [
    {
      id: "mock9",
      title: "가짜 배고픔 vs 진짜 배고픔 구분하는 법",
      thumbnail: "https://img.youtube.com/vi/mock9/hqdefault.jpg",
      url: "https://www.youtube.com/results?search_query=가짜+배고픔+구분",
    },
    {
      id: "mock10",
      title: "폭식증 고치는 가장 현실적인 방법 (식이장애 극복)",
      thumbnail: "https://img.youtube.com/vi/mock10/hqdefault.jpg",
      url: "https://www.youtube.com/results?search_query=폭식증+극복",
    },
    {
      id: "mock11",
      title: "배부른데 계속 들어가는 이유? 감정적 허기 해결법",
      thumbnail: "https://img.youtube.com/vi/mock11/hqdefault.jpg",
      url: "https://www.youtube.com/results?search_query=감정적+허기",
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
    '  "analysis": {',
    '    "personality": { "score": 0~100 (정수), "keywords": ["키워드1", "키워드2", "키워드3"], "advice": "한줄 조언", "detail": "성격 유형 상세 분석 (2~3문장)" },',
    '    "emotion": { "score": 0~100 (부정적 감정 수치), "keywords": ["감정1", "감정2", "감정3"], "advice": "한줄 조언", "detail": "현재 감정 상태 상세 분석 (2~3문장)" },',
    '    "stress": { "score": 0~100 (스트레스 지수), "keywords": ["원인1", "원인2", "증상1"], "advice": "한줄 조언", "detail": "스트레스 원인 및 수준 분석 (2~3문장)" },',
    '    "relationship": { "score": 0~100 (관계 만족도), "keywords": ["관계1", "태도1", "성향1"], "advice": "한줄 조언", "detail": "대인관계 성향 분석 (2~3문장)" },',
    '    "career": { "score": 0~100 (직업 적합도/만족도), "keywords": ["적성1", "능력1", "태도1"], "advice": "한줄 조언", "detail": "진로 및 직업 성향 분석 (2~3문장)" }',
    '  },',
    '  "toughLove": "사용자의 고민 속에 숨어있는 \'의존심\'과 \'책임 회피\'를 정확히 타격하는 냉철한 쓴소리 (반말 모드). \'돈으로 의지를 살 생각 마라\', \'시스템이 널 구원하지 않는다\', \'그건 명백한 회피야\' 같이 사용자가 믿고 있는 핑계를 산산조각 낼 것. 감정적 위로는 일절 배제하고, 오직 팩트와 논리로만 사용자가 스스로의 모순을 직시하게 만들 것. (4~7문장).",',
    '  "prescription": "오늘부터 당장 실행 가능한 현실적이고 구체적인 행동 지침 (번호 목록 형태, 최소 3개). 첫 문단에 요약 텍스트나 제목 절대 넣지 말 것. 바로 1번부터 시작할 것. 단순히 \'물 마시기\' 같은 가벼운 행동보다는, 고민의 원인을 객관적으로 분석하거나, 채용 공고를 분석하고, 커리큘럼을 비교하는 등 **문제 해결에 직접적으로 도움이 되는 실질적인 솔루션**을 제시할 것. 내용은 날카롭고 현실적이어야 하지만, **말투는 사용자를 응원하는 따뜻하고 지지적인 어조**를 유지할 것 (\'~해볼까요?\', \'작은 목표부터 달성해봐요\', \'당신은 충분히 해낼 수 있어요\').",',
    '  "category": "고민의 종류를 다음 중 하나로 분류. 우선순위: 1.eating(식욕/폭식/다이어트), 2.depression(우울), 3.anxiety(불안), 4.relationship(관계), 5.career(진로), 6.lazy(무기력/게으름), 7.general(기타). (예: \'먹는 것\'과 관련된 단어가 있으면 무조건 eating으로 분류)",',
    '  "searchQuery": "사용자의 고민을 해결해 줄 수 있는 YouTube 영상 검색어. 고민의 핵심 명사와 해결책을 조합하여 검색 정확도를 높일 것. (예: \'배부름\' + \'폭식\' -> \'가짜 배고픔 해결법\', \'감정적 허기 다스리기\').",',
    '  "keywords": ["사용자의 고민에서 추출한 핵심 명사 키워드 3~5개 (예: 폭식, 감정기복, 다이어트)"]',
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
    generationConfig: {
      responseMimeType: "application/json",
    },
  };

  let retries = 3;
  let delay = 500; // 초기 대기 시간 0.5초 (사용자 경험 개선)

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

        // Default fallback object if analysis part is missing
        const defaultDetail = { score: 50, keywords: ["분석불가"], advice: "데이터가 부족합니다.", detail: "분석을 완료하지 못했습니다." };

        return {
          analysis: parsed.analysis || {
            personality: defaultDetail,
            emotion: defaultDetail,
            stress: defaultDetail,
            relationship: defaultDetail,
            career: defaultDetail
          },
          toughLove: parsed.toughLove ?? "",
          prescription: Array.isArray(parsed.prescription)
            ? parsed.prescription.join("\n")
            : parsed.prescription ?? "",
          keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [],
          category: parsed.category ?? "general",
          searchQuery: parsed.searchQuery ?? "",
        };
      } catch (parseError) {
        console.error("JSON Parse Error:", parseError, "Raw content:", content);
        
        // Fallback: 정규식으로 각 섹션 추출 시도 (JSON이 깨졌을 경우를 대비)
        // Note: With the new complex structure, regex fallback is very hard. 
        // We will try to return a basic error structure or the demo fallback if available.
        // For now, let's just return a safe empty object to avoid crash.
        
        const defaultDetail = { score: 0, keywords: [], advice: "오류 발생", detail: "데이터를 불러오지 못했습니다." };
        const toughLoveMatch = content.match(/"toughLove"\s*:\s*"([^"]*)"/);

        return {
          analysis: {
             personality: defaultDetail,
             emotion: defaultDetail,
             stress: defaultDetail,
             relationship: defaultDetail,
             career: defaultDetail
          },
          toughLove: toughLoveMatch ? toughLoveMatch[1] : "죄송합니다. 쓴소리 데이터를 불러오지 못했습니다.",
          prescription: "처방전 데이터를 불러오는 중 오류가 발생했습니다. 다시 시도해주세요.", 
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

function findBestMockVideos(query: string, category: string): YouTubeVideo[] {
  const allVideos = Object.values(MOCK_VIDEOS).flat();
  // 검색어에서 의미있는 단어 추출 (단순 공백 분리)
  const keywords = query.split(/\s+/).filter(k => k.length > 1).map(k => k.toLowerCase());

  if (keywords.length === 0) {
     return MOCK_VIDEOS[category] || MOCK_VIDEOS["general"];
  }

  // 1. 키워드 매칭 점수 계산
  const scored = allVideos.map(video => {
    let score = 0;
    const title = video.title.toLowerCase();
    keywords.forEach(k => {
      if (title.includes(k)) score += 1;
    });
    return { video, score };
  });

  // 2. 점수 내림차순 정렬
  scored.sort((a, b) => b.score - a.score);

  // 3. 매칭된 영상이 있으면 상위 2개 반환 (점수가 0보다 큰 경우만)
  if (scored.length > 0 && scored[0].score > 0) {
    // 중복 제거 (Set 사용)
    const uniqueVideos = new Set();
    const result: YouTubeVideo[] = [];
    for (const s of scored) {
        if (s.score > 0 && !uniqueVideos.has(s.video.id)) {
            uniqueVideos.add(s.video.id);
            result.push(s.video);
            if (result.length >= 2) break;
        }
    }
    return result;
  }

  // 4. 없으면 카테고리 기반 반환 (기존 로직)
  return MOCK_VIDEOS[category] || MOCK_VIDEOS["general"];
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
    let source: "youtube_api" | "mock_data" = "mock_data";

    try {
      // 2. 하이브리드 검색 로직: API 키가 있으면 실제 검색, 없으면 스마트 더미 데이터 사용
      if (process.env.YOUTUBE_API_KEY) {
        videos = await searchYouTube(searchString);
        source = "youtube_api";
      } else {
        console.warn("YOUTUBE_API_KEY is missing, using smart mock search.");
        videos = findBestMockVideos(searchString, gemini.category || "general");
        source = "mock_data";
      }
    } catch (ytError) {
      console.error("YouTube search failed:", ytError);
      // 3. API 호출 실패 시에도 스마트 더미 데이터로 폴백
      videos = findBestMockVideos(searchString, gemini.category || "general");
      source = "mock_data";
    }

    const response: AnalyzeResponse = {
      analysis: gemini.analysis,
      toughLove: gemini.toughLove,
      prescription: gemini.prescription,
      videos,
      keywords: gemini.keywords || [],
      debug: {
        source,
        searchQuery: searchString,
      }
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

