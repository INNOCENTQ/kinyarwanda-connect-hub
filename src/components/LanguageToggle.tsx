import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLang } from "@/hooks/useLang";

export default function LanguageToggle({ className = "" }: { className?: string }) {
  const { lang, setLang, t } = useLang();
  return (
    <Button variant="ghost" size="sm" className={className} aria-label={t("chooseLang")}
      onClick={() => setLang(lang === "rw" ? "en" : "rw")}>
      <Languages className="h-4 w-4" />{lang === "rw" ? "EN" : "RW"}
    </Button>
  );
}
