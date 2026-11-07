import { Link, useLocation, useNavigate } from "react-router-dom";
import { Sprout, MessageCircle, Stethoscope, Store, LogOut, LogIn, Menu, X, CloudSun, Crown, Shield, Settings } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { usePlan } from "@/hooks/usePlan";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/ThemeToggle";
import LanguageToggle from "@/components/LanguageToggle";
import { useLang } from "@/hooks/useLang";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const baseLinks = [
  { to: "/", label: "home", icon: Sprout },
  { to: "/weather", label: "weather", icon: CloudSun },
  { to: "/chat", label: "chat", icon: MessageCircle },
  { to: "/diagnose", label: "diagnose", icon: Stethoscope },
  { to: "/marketplace", label: "market", icon: Store },
  { to: "/premium", label: "premium", icon: Crown },
];

export default function AppNav() {
  const { user, signOut } = useAuth();
  const { isAdmin } = usePlan();
  const links = isAdmin ? [...baseLinks, { to: "/admin", label: "admin", icon: Shield }] : baseLinks;
  const { t } = useLang();
  const loc = useLocation();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const { data: profileName } = useQuery({
    queryKey: ["profile-name", user?.id],
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("full_name").eq("user_id", user!.id).maybeSingle();
      return data?.full_name || "";
    },
  });
  const displayName = profileName || (user?.user_metadata as any)?.full_name || "";
  const firstName = displayName.split(" ")[0];

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-2 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex shrink-0 items-center gap-3 font-bold text-foreground">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary"><Sprout className="h-5 w-5 text-secondary" /></span>
          <span className="font-heading text-sm leading-tight sm:text-base">Ubuhinzi <span className="text-primary">&amp;</span> Ubworozi AI</span>
        </Link>
        <nav aria-label="Serivisi" className="ml-auto hidden items-center gap-1 lg:flex">
          {links.map(l => (
            <Link key={l.to} to={l.to} aria-current={loc.pathname === l.to ? "page" : undefined} className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm ${loc.pathname === l.to ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}>
              <l.icon className="h-4 w-4" />{t(l.label)}
            </Link>
          ))}
          {user ? (
            <>
              <Link to="/settings" aria-label="Igenamiterere" className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm ${loc.pathname === "/settings" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}>
                <Settings className="h-4 w-4" />
              </Link>
              <Button size="sm" variant="ghost" onClick={async () => { await signOut(); nav("/"); }}><LogOut className="h-4 w-4" />{t("signOut")}</Button>
            </>
          ) : (
            <Button size="sm" onClick={() => nav("/auth")}><LogIn className="h-4 w-4" />{t("signIn")}</Button>
          )}
          <LanguageToggle className="ml-1" /><ThemeToggle />
        </nav>
        {user && displayName && (
          <Link to="/settings" title={displayName} className="ml-auto flex max-w-[150px] items-center gap-2 rounded-full bg-primary/10 py-1 pl-1 pr-3 text-sm font-semibold text-primary lg:ml-2">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">{displayName.charAt(0).toUpperCase()}</span>
            <span className="truncate">{t("hello")}, {firstName}</span>
          </Link>
        )}
        <div className="ml-auto flex items-center gap-1 lg:hidden">
          <LanguageToggle /><ThemeToggle />
          <Button variant="ghost" size="icon" aria-expanded={open} aria-controls="mobile-navigation" aria-label={open ? "Funga urutonde" : "Fungura urutonde"} onClick={() => setOpen(!open)}>{open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</Button>
        </div>
      </div>
      {open && (
        <nav id="mobile-navigation" aria-label="Serivisi" className="space-y-1 border-t border-border bg-card px-4 py-2 lg:hidden">
          {links.map(l => (
            <Link key={l.to} to={l.to} aria-current={loc.pathname === l.to ? "page" : undefined} onClick={() => setOpen(false)} className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm ${loc.pathname === l.to ? "bg-primary/10 text-primary" : "text-foreground"}`}>
              <l.icon className="h-4 w-4" />{t(l.label)}
            </Link>
          ))}
          {user ? (
            <>
              <Link to="/settings" onClick={() => setOpen(false)} className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm ${loc.pathname === "/settings" ? "bg-primary/10 text-primary" : "text-foreground"}`}>
                <Settings className="h-4 w-4" />{t("settings")}
              </Link>
              <Button variant="ghost" onClick={async () => { await signOut(); setOpen(false); nav("/"); }} className="w-full justify-start"><LogOut className="h-4 w-4" />{t("signOut")}</Button>
            </>
          ) : (
            <Link to="/auth" onClick={() => setOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-primary"><LogIn className="h-4 w-4" />{t("signIn")}</Link>
          )}
        </nav>
      )}
    </header>
  );
}
