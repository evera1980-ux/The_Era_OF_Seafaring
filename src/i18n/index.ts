import { zh } from "./locales/zh";
import { en } from "./locales/en";
import { SupportedLanguage, TranslationDictionary } from "./types";
import { useGameStore } from "../store";

export const translations: Record<SupportedLanguage, TranslationDictionary> = {
  zh,
  en,
};

/**
 * 强类型全局翻译 Hook
 */
export function useTranslation() {
  const language = useGameStore((state) => (state as any).language || "zh") as SupportedLanguage;
  const setLanguage = useGameStore((state) => (state as any).setLanguage) as (lang: SupportedLanguage) => void;

  const t = translations[language] || translations.zh;

  const toggleLanguage = () => {
    const nextLang: SupportedLanguage = language === "zh" ? "en" : "zh";
    setLanguage(nextLang);
  };

  return {
    t,
    language,
    setLanguage,
    toggleLanguage,
  };
}

export * from "./types";
