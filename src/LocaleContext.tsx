import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { ko } from "./locales/ko";
import { en } from "./locales/en";
import { ja } from "./locales/ja";
import type { Strings } from "./locales/ko";

type Locale = "ko" | "ja" | "en";

interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: keyof Strings) => string;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

const locales: Record<Locale, Strings> = { ko, en, ja };

function detectLocale(): Locale {
  // 1. URL query parameter
  const urlParams = new URLSearchParams(window.location.search);
  const urlLocale = urlParams.get("lang") as Locale | null;
  if (urlLocale && urlLocale in locales) return urlLocale;

  // 2. localStorage
  const savedLocale = localStorage.getItem("aws-quiz-locale") as Locale | null;
  if (savedLocale && savedLocale in locales) return savedLocale;

  // 3. navigator.language
  const navLang = navigator.language.split("-")[0];
  if (navLang === "ja") return "ja";
  if (navLang === "ko") return "ko";

  // 4. default
  return "en";
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    // 초기값을 detectLocale()로 설정
    const detectedLocale = detectLocale();
    // localStorage 초기화
    localStorage.setItem("aws-quiz-locale", detectedLocale);
    return detectedLocale;
  });

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem("aws-quiz-locale", newLocale);
    window.history.replaceState({}, "", `?lang=${newLocale}`);
  };

  const t = (key: keyof Strings): string => {
    return locales[locale][key] as string;
  };

  // Update document lang, title, meta description
  useEffect(() => {
    document.documentElement.lang = locale;
    document.title = locales[locale].pageTitle;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", locales[locale].pageDescription);
    }
  }, [locale]);

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error("useLocale must be used within LocaleProvider");
  }
  return context;
}
