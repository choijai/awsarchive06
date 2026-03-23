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
