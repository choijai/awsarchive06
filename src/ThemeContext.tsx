import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Theme = "dark" | "light";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function detectTheme(): Theme {
  // 1. localStorage에서 저장된 설정 읽기
  const saved = localStorage.getItem("aws-quiz-theme") as Theme | null;
  if (saved === "dark" || saved === "light") return saved;

  // 2. 기본값: dark (원본 테마 유지)
  return "dark";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => detectTheme());

  const toggleTheme = () => {
    setTheme(prev => {
      const next = prev === "dark" ? "light" : "dark";
      localStorage.setItem("aws-quiz-theme", next);
      return next;
    });
  };

  useEffect(() => {
    // HTML 루트 요소에 data-theme 속성 부여 → CSS 변수 전환 트리거
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
}
