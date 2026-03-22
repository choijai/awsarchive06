import { generatePrompt } from "./prompts";
import { CONCEPTS } from "./data";

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
  // Vite 환경변수 접근 (빌드 타임에 결정됨)
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
    // 백엔드 프록시 서버로 요청 (CORS 우회)
    const response = await fetch("http://localhost:5000/api/claude", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-3-5-haiku-20241022",
        max_tokens: 3000,  // 상세한 설명을 위해 2000에서 3000으로 증가
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
    const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) ||
                      content.match(/(\{[\s\S]*\})/);

    if (!jsonMatch) {
      throw new Error("Failed to extract JSON from response");
    }

    const problem = JSON.parse(jsonMatch[1]) as Problem;
    return problem;
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
    // 백엔드 프록시 서버로 요청 (CORS 우회)
    const response = await fetch("http://localhost:5000/api/claude", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-3-5-haiku-20241022",
        max_tokens: 1500,
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
