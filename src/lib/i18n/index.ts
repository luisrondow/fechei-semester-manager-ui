import { createContext, useContext } from "react";
import type { Locale } from "@/lib/types";
import { en, type Translations } from "./en";
import { pt } from "./pt";

const translations: Record<Locale, Translations> = { en, pt };

interface I18nContextValue {
	locale: Locale;
	setLocale: (locale: Locale) => void;
	t: Translations;
}

export const I18nContext = createContext<I18nContextValue>({
	locale: "en",
	setLocale: () => {},
	t: en,
});

export function useI18n() {
	return useContext(I18nContext);
}

export function getTranslations(locale: Locale): Translations {
	return translations[locale];
}

export function detectLocale(): Locale {
	if (typeof window === "undefined") return "en";
	const stored = localStorage.getItem("fechei-locale");
	if (stored === "en" || stored === "pt") return stored;
	const browserLang = navigator.language.toLowerCase();
	if (browserLang.startsWith("pt")) return "pt";
	return "en";
}
