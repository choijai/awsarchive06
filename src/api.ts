import { generatePrompt } from "./prompts";

export interface Concept {
  title: string;
  subtitle: string;
  easy: string;
  points: Array<{
    label: string;
    text: string;
    easy: string;
  }>;
}

export interface Problem {
  question: string;
  constraint: string[];
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  answer: string;
  keywords: string[];  // 핵심 키워드 (bold 처리용)
  goal: string;        // 핵심 목표
  easyMode: {          // 초등학교 5학년 수준 설명
    explanation: string;
    A: string;
    B: string;
    C: string;
    D: string;
  };
  explanation: {
    architecture?: string;  // 전체 아키텍처 흐름 설명
    correct: string;        // 정답인 이유
    service_features?: string;  // AWS 서비스 특징
    trap_A: string;
    trap_B?: string;
    trap_C: string;
    trap_D: string;
  };
  patterns: string[];
}

export async function generateSAAProblem(
  serviceNames: string[],
  difficulty: string,
  locale: "ko" | "ja" | "en" = "ko"
): Promise<Problem> {
  const apiKey = (globalThis as any).__VITE_API_KEY__ || import.meta.env.VITE_ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      locale === "en" ? "API key is not configured. Check .env file." :
      locale === "ja" ? "APIキーが設定されていません。.envファイルを確認してください。" :
      "API 키가 설정되지 않았습니다. .env 파일을 확인하세요."
    );
  }

  const prompt = generatePrompt(serviceNames, difficulty, locale);

  try {
    // Firebase Cloud Functions 프록시로 요청
    const backendUrl = (import.meta as any).env?.VITE_BACKEND_URL || "http://localhost:5000";
    const response = await fetch(`${backendUrl}/api/claudeProxy`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 3000,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`API Error: ${error.error?.message || "Unknown error"}`);
    }

    const data = await response.json();
    const content = data.content[0].text;

    // JSON 추출 (마크다운 코드 블록 처리)
    let jsonStr = content.match(/```json\n?([\s\S]*?)\n?```/)?.[1] ||
                  content.match(/(\{[\s\S]*\})/)?.[1];

    if (!jsonStr) {
      throw new Error("Failed to extract JSON from response");
    }

    // JSON 내 문자열 값의 줄바꿈을 공백으로 치환
    // 더 강력한 정규화 로직
    jsonStr = jsonStr.replace(/\\n/g, ' '); // 이스케이프된 \n을 공백으로

    // 문자열 내 실제 줄바꿈을 공백으로 치환 (JSON 객체 내에서만)
    // "key": "value with
    // newline" → "key": "value with newline"
    jsonStr = jsonStr.replace(/"([^"]*)\n([^"]*)"/g, (_match: string, before: string, after: string) => {
      return `"${before.trim()} ${after.trim()}"`;
    });

    // 배열 내 줄바꿈 정리
    jsonStr = jsonStr.replace(/\[\n\s*/g, '[');
    jsonStr = jsonStr.replace(/\n\s*\]/g, ']');
    jsonStr = jsonStr.replace(/,\n\s*/g, ', ');

    // 마지막 정리: 여러 줄 남은 것들
    jsonStr = jsonStr.replace(/\n/g, '');

    try {
      const problem = JSON.parse(jsonStr) as Problem;
      return problem;
    } catch (parseError) {
      // 파싱 실패 시 더 공격적으로 정리
      console.error("Initial JSON parse failed, attempting aggressive cleanup");

      // 모든 종류의 이스케이프 문자 처리
      let cleaned = jsonStr;

      // 탭과 다중 공백을 단일 공백으로
      cleaned = cleaned.replace(/\t/g, ' ');
      cleaned = cleaned.replace(/\s+/g, ' ');

      // 따옴표 안의 특수 문자 처리
      // "key": "value" 패턴만 추출
      cleaned = cleaned.replace(/: "/g, ':"').replace(/", /g, '",');
      cleaned = cleaned.replace(/": \{/g, '":{').replace(/": \[/g, '":');

      // 마지막 시도
      try {
        const problem = JSON.parse(cleaned) as Problem;
        return problem;
      } catch (secondError) {
        // 디버깅 정보 로깅
        console.error("JSON Parse Error at position:", (parseError as any).message);
        console.error("Failed JSON (first 500 chars):", jsonStr.substring(0, 500));
        console.error("Failed JSON (around error):", jsonStr.substring(Math.max(0, 2100-50), Math.min(jsonStr.length, 2100+50)));
        throw parseError;
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Problem generation failed: ${error.message}`);
    }
    throw error;
  }
}

export async function translateConcept(
  concept: Concept,
  locale: "ja" | "en"
): Promise<Concept> {
  const apiKey = (globalThis as any).__VITE_API_KEY__ || import.meta.env.VITE_ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("API key not configured");
  }

  const targetLang = locale === "ja" ? "Japanese" : "English";
  const prompt = `You are a technical translator. Translate the following AWS concept from Korean to ${targetLang}.
Keep all AWS service names (EC2, S3, Lambda, etc.) in English.
Return ONLY valid JSON in the exact same structure.

Input:
${JSON.stringify(concept)}

Output (JSON only):`;

  try {
    // Firebase Cloud Functions 프록시로 요청
    const backendUrl = (import.meta as any).env?.VITE_BACKEND_URL || "http://localhost:5000";
    const response = await fetch(`${backendUrl}/api/claudeProxy`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 2000,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`API Error: ${error.error?.message || "Unknown error"}`);
    }

    const data = await response.json();
    const content = data.content[0].text;

    // JSON 추출
    const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) ||
                      content.match(/(\{[\s\S]*\})/);

    if (!jsonMatch) {
      throw new Error("Failed to extract JSON from translation response");
    }

    const translatedConcept = JSON.parse(jsonMatch[1]) as Concept;
    return translatedConcept;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Concept translation failed: ${error.message}`);
    }
    throw error;
  }
}
