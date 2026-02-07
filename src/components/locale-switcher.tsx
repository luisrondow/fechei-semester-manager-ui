import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

export function LocaleSwitcher() {
	const { locale, setLocale, t } = useI18n();

	return (
		<div className="flex items-center gap-2">
			<Button
				variant={locale === "en" ? "default" : "outline"}
				size="sm"
				onClick={() => setLocale("en")}
			>
				{t.settings.english}
			</Button>
			<Button
				variant={locale === "pt" ? "default" : "outline"}
				size="sm"
				onClick={() => setLocale("pt")}
			>
				{t.settings.portuguese}
			</Button>
		</div>
	);
}
