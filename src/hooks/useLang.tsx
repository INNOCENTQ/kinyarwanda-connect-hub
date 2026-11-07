import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Lang = "rw" | "en";

const dict: Record<string, { rw: string; en: string }> = {
  home: { rw: "Ahabanza", en: "Home" },
  weather: { rw: "Ikirere", en: "Weather" },
  chat: { rw: "AI Chat", en: "AI Chat" },
  diagnose: { rw: "Gusuzuma", en: "Diagnose" },
  market: { rw: "Isoko", en: "Market" },
  premium: { rw: "Premium", en: "Premium" },
  admin: { rw: "Ubuyobozi", en: "Admin" },
  settings: { rw: "Igenamiterere", en: "Settings" },
  signOut: { rw: "Sohoka", en: "Sign out" },
  signIn: { rw: "Injira", en: "Sign in" },
  hello: { rw: "Muraho", en: "Hello" },
  language: { rw: "Ururimi", en: "Language" },
  chooseLang: { rw: "Hitamo ururimi", en: "Choose language" },
};

const Ctx = createContext<{ lang: Lang; setLang: (l: Lang) => void; t: (k: string) => string }>({
  lang: "rw", setLang: () => {}, t: (k) => dict[k]?.rw ?? k,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => (localStorage.getItem("umuhinzi_lang") === "en" ? "en" : "rw"));
  useEffect(() => { document.documentElement.lang = lang; }, [lang]);
  const setLang = (l: Lang) => { setLangState(l); localStorage.setItem("umuhinzi_lang", l); };
  const t = (k: string) => dict[k]?.[lang] ?? k;
  return <Ctx.Provider value={{ lang, setLang, t }}>{children}</Ctx.Provider>;
}

export const useLang = () => useContext(Ctx);
