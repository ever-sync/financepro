import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

export function LanguageSwitcher({ className }: { className?: string }) {
  const { i18n } = useTranslation();

  const currentLang = i18n.language || "pt-BR";

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className={cn("grid min-w-0 grid-cols-2 gap-2", className)}>
      <button
        onClick={() => changeLanguage("pt-BR")}
        className={`min-w-0 rounded-xl px-2.5 py-2 text-xs font-semibold transition-colors sm:text-sm ${
          currentLang === "pt-BR"
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground hover:bg-muted/80"
        }`}
      >
        PT-BR
      </button>
      <button
        onClick={() => changeLanguage("en")}
        className={`min-w-0 rounded-xl px-2.5 py-2 text-xs font-semibold transition-colors sm:text-sm ${
          currentLang === "en"
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground hover:bg-muted/80"
        }`}
      >
        EN
      </button>
    </div>
  );
}
