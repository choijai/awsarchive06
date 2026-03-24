import { generatePrompt } from "./prompts";

// Gemini API 호출 함수
async function callGeminiAPI(prompt: string, maxTokens: number, locale: "ko" | "ja" | "en" = "ko"): Promise<string> {
  const env = (import.meta as any).env;
  const geminiKey = (globalThis as any).__VITE_GEMINI_API_KEY__ || env.VITE_GEMINI_API_KEY;

  if (!geminiKey) {
    throw new Error(
      locale === "en" ? "Gemini API key is not configured." :
      locale === "ja" ? "Gemini APIキーが設定されていません。" :
      "Gemini API 키가 설정되지 않았습니다."
    );
  }

  const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": geminiKey,
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
      generationConfig: {
        maxOutputTokens: maxTokens,
        temperature: 1,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Gemini API Error: ${error.error?.message || "Unknown error"}`);
  }

  const data = await response.json();
  const content = data.candidates[0].content.parts[0].text;
  return content;
}

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
    correct: string;        // 정답인 이유
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
  const env = (import.meta as any).env;
  const apiKey = (globalThis as any).__VITE_API_KEY__ || env.VITE_ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      locale === "en" ? "API key is not configured. Check .env file." :
      locale === "ja" ? "APIキーが設定されていません。.envファイルを確認してください。" :
      "API 키가 설정되지 않았습니다. .env 파일을 확인하세요."
    );
  }

  const prompt = generatePrompt(serviceNames, difficulty, locale);

  let content: string;

  // ⚠️ 테스트 모드: Gemini API로 먼저 시도 (Claude는 주석 처리)
  // 프로덕션: 아래 Claude 부분을 주석 제거하고 Gemini 부분을 주석 처리

  try {
    // 2단계: Gemini API로 테스트 (테스트 모드)
    content = await callGeminiAPI(prompt, 3500, locale);

  } catch (geminiError) {
    // 폴백: 실패 시 Claude API 시도

    // 🚨 오류 알림: Firebase Cloud Function으로 메일 발송
    try {
      const adminEmail = env?.VITE_ADMIN_EMAIL;
      const backendUrl = env?.VITE_BACKEND_URL || "http://localhost:5000";

      if (adminEmail) {
        const errorMsg = geminiError instanceof Error ? geminiError.message : String(geminiError);
        await fetch(`${backendUrl}/api/notifyError`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            to: adminEmail,
            subject: "🚨 Gemini API Error - AWS SAA-C03",
            error: errorMsg,
            apiType: "gemini",
            timestamp: new Date().toISOString(),
            difficulty: difficulty,
            services: serviceNames.join(", "),
          }),
        });
      }
    } catch (notifyError) {
    }

    try {
      // 1단계: Claude API 시도 (폴백)
      const backendUrl = env?.VITE_BACKEND_URL || "http://localhost:5000";
      const response = await fetch(`${backendUrl}/api/claudeProxy`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 3500,
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`Claude API Error: ${response.status}`);
      }

      const data = await response.json();
      content = data.content[0].text;

    } catch (claudeError) {
      // 🚨 오류 알림: Claude API 오류 메일 발송
      try {
        const adminEmail = env?.VITE_ADMIN_EMAIL;
        const backendUrl = env?.VITE_BACKEND_URL || "http://localhost:5000";

        if (adminEmail) {
          const errorMsg = claudeError instanceof Error ? claudeError.message : String(claudeError);
          await fetch(`${backendUrl}/api/notifyError`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              to: adminEmail,
              subject: "🚨 Claude API Error - AWS SAA-C03",
              error: errorMsg,
              apiType: "claude",
              timestamp: new Date().toISOString(),
              difficulty: difficulty,
              services: serviceNames.join(", "),
            }),
          });
        }
      } catch (notifyError) {
      }

      throw new Error(
        locale === "en" ? `Both Gemini and Claude APIs failed. Gemini: ${geminiError}, Claude: ${claudeError}` :
        locale === "ja" ? `GeminiとClaude APIの両方が失敗しました。Gemini: ${geminiError}, Claude: ${claudeError}` :
        `Gemini와 Claude API 모두 실패했습니다. Gemini: ${geminiError}, Claude: ${claudeError}`
      );
    }
  }

  try {

    // JSON 추출 (마크다운 코드 블록 처리)
    // 마크다운 코드 블록부터 시도
    let jsonStr = content.match(/```json\s*([\s\S]*?)\s*```/)?.[1];

    // 마크다운이 없으면 가장 첫 { 부터 마지막 } 까지
    if (!jsonStr) {
      const startIdx = content.indexOf('{');
      const lastIdx = content.lastIndexOf('}');

      if (startIdx !== -1 && lastIdx !== -1 && lastIdx > startIdx) {
        jsonStr = content.substring(startIdx, lastIdx + 1);
      }
    }

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
  const env = (import.meta as any).env;
  const apiKey = (globalThis as any).__VITE_API_KEY__ || env.VITE_ANTHROPIC_API_KEY;
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

  let content: string;

  // ⚠️ 테스트 모드: Gemini API로 먼저 시도 (테스트용)
  try {
    // 2단계: Gemini API로 번역 시도 (테스트 모드)
    content = await callGeminiAPI(prompt, 2500, locale);

  } catch (geminiError) {
    // 폴백: 실패 시 Claude API 시도
    try {
      // 1단계: Claude API 시도 (폴백)
      const backendUrl = env?.VITE_BACKEND_URL || "http://localhost:5000";
      const response = await fetch(`${backendUrl}/api/claudeProxy`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 2500,
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`Claude API Error: ${response.status}`);
      }

      const data = await response.json();
      content = data.content[0].text;

    } catch (claudeError) {
      // 🚨 오류 알림: Claude API 오류 메일 발송
      try {
        const adminEmail = env?.VITE_ADMIN_EMAIL;
        const backendUrl = env?.VITE_BACKEND_URL || "http://localhost:5000";

        if (adminEmail) {
          const errorMsg = claudeError instanceof Error ? claudeError.message : String(claudeError);
          await fetch(`${backendUrl}/api/notifyError`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              to: adminEmail,
              subject: "🚨 Claude API Error - AWS SAA-C03 Translation",
              error: errorMsg,
              apiType: "claude",
              timestamp: new Date().toISOString(),
              locale: locale,
            }),
          });
        }
      } catch (notifyError) {
      }

      throw new Error(`Both Gemini and Claude APIs failed for translation. Gemini: ${geminiError}, Claude: ${claudeError}`);
    }
  }

  try {

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
