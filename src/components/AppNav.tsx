import { Link, useLocation, useNavigate } from "react-router-dom";
import { Sprout, MessageCircle, Stethoscope, Store, LogOut, LogIn, Menu, CloudSun } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const links = [
  { to: "/", label: "Ahabanza", icon: Sprout },
  { to: "/weather", label: "Ikirere", icon: CloudSun },
  { to: "/chat", label: "AI Chat", icon: MessageCircle },
  { to: "/diagnose", label: "Gusuzuma", icon: Stethoscope },
  { to: "/marketplace", label: "Isoko", icon: Store },
];

export default function AppNav() {
  const { user, signOut } = useAuth();
  const loc = useLocation();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 font-bold text-foreground">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary"><Sprout className="h-5 w-5 text-secondary" /></span>
          <span className="font-heading text-lg">Umuhinzi AI</span>
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          {links.map(l => (
            <Link key={l.to} to={l.to} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm ${loc.pathname === l.to ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}>
              <l.icon className="h-4 w-4" />{l.label}
            </Link>
          ))}
          {user ? (
            <Button size="sm" variant="ghost" onClick={async () => { await signOut(); nav("/"); }}><LogOut className="h-4 w-4" />Sohoka</Button>
          ) : (
            <Button size="sm" onClick={() => nav("/auth")}><LogIn className="h-4 w-4" />Injira</Button>
          )}
        </nav>
        <Button variant="ghost" size="icon" className="md:hidden" aria-label={open ? "Funga urutonde" : "Fungura urutonde"} onClick={() => setOpen(!open)}><Menu className="h-5 w-5" /></Button>
      </div>
      {open && (
        <div className="md:hidden border-t border-border bg-card px-4 py-2 space-y-1">
          {links.map(l => (
            <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm ${loc.pathname === l.to ? "bg-primary/10 text-primary" : "text-foreground"}`}>
              <l.icon className="h-4 w-4" />{l.label}
            </Link>
          ))}
          {user ? (
            <Button variant="ghost" onClick={async () => { await signOut(); setOpen(false); nav("/"); }} className="w-full justify-start"><LogOut className="h-4 w-4" />Sohoka</Button>
          ) : (
            <Link to="/auth" onClick={() => setOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-primary"><LogIn className="h-4 w-4" />Injira</Link>
          )}
        </div>
      )}
    </header>
  );
}
