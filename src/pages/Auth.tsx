import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sprout, Loader2, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { phoneToEmail } from "@/lib/phone-auth";

export default function Auth() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [method, setMethod] = useState<"phone" | "email">("phone");

  useEffect(() => { if (user) navigate("/"); }, [user, navigate]);

  const forgotPassword = async () => {
    if (!email) { toast.error("Andika imeyili yawe mbere"); return; }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setResetSent(true);
      toast.success("Imeyili yo guhindura ijambo ry'ibanga yoherejwe! Reba muri imeyili yawe.");
    } catch (err: any) {
      toast.error(err.message || "Ikibazo ryagaragaye");
    } finally { setLoading(false); }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (method === "phone") {
        const loginEmail = phoneToEmail(phone);
        if (!loginEmail) throw new Error("Andika nimero ya telefoni nyayo (07XXXXXXXX)");
        if (mode === "signup") {
          const { data, error } = await supabase.functions.invoke("phone-signup", { body: { phone, password, full_name: fullName } });
          if (error || data?.error) {
            let msg = data?.error;
            try { msg = msg || (await (error as any)?.context?.json())?.error; } catch { /* ignore */ }
            throw new Error(msg || "Ntibyashobotse gufungura konti");
          }
        }
        const { error } = await supabase.auth.signInWithPassword({ email: loginEmail, password });
        if (error) throw new Error("Nimero cyangwa ijambo ry'ibanga si byo");
        toast.success("Murakaza neza!");
        navigate("/");
      } else if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: window.location.origin, data: { full_name: fullName, phone } },
        });
        if (error) throw error;
        toast.success("Konti yawe yashyizweho. Reba imeyili yawe niba usabwa kuyemeza.");
        setMode("signin");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Murakaza neza!");
        navigate("/");
      }
    } catch (err: any) {
      toast.error(err.message || "Ikibazo ryagaragaye");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-background px-4 py-8 sm:py-12">
      <Button asChild variant="ghost" className="mb-8"><Link to="/"><ArrowLeft />Ahabanza</Link></Button>
      <div className="mx-auto w-full max-w-md space-y-7 py-4 sm:py-10">
        <Link to="/" className="flex items-center gap-2 justify-center">
          <Sprout className="h-7 w-7 text-primary" />
          <span className="text-2xl font-bold text-foreground">Umuhinzi AI</span>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-center text-foreground">{mode === "signin" ? "Injira" : "Iyandikishe"}</h1>
          <p className="text-sm text-muted-foreground text-center mt-1">
            {mode === "signin" ? "Garuka muri konti yawe" : "Fungura konti nshya y'ubuntu"}
          </p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div role="tablist" aria-label="Uburyo bwo kwinjira" className="grid grid-cols-2 gap-1 rounded-lg bg-muted p-1">
            {(["phone", "email"] as const).map(m => (
              <button key={m} type="button" role="tab" aria-selected={method === m} onClick={() => { setMethod(m); setResetSent(false); }}
                className={`rounded-md py-2 text-sm font-medium transition-colors ${method === m ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"}`}>
                {m === "phone" ? "Telefoni" : "Imeyili"}
              </button>
            ))}
          </div>
          {mode === "signup" && (
            <div><Label htmlFor="full-name">Amazina yombi</Label><Input id="full-name" autoComplete="name" value={fullName} onChange={e => setFullName(e.target.value)} required /></div>
          )}
          {(method === "phone" || mode === "signup") && (
            <div><Label htmlFor="phone">Nimero ya telefoni</Label><Input id="phone" type="tel" inputMode="tel" autoComplete="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="07XXXXXXXX" required /></div>
          )}
          {method === "email" && (
            <div><Label htmlFor="email">Imeyili</Label><Input id="email" autoComplete="email" placeholder="izina@example.com" type="email" value={email} onChange={e => setEmail(e.target.value)} required /></div>
          )}
          <div className="space-y-2"><Label htmlFor="password">Ijambo ry'ibanga</Label><div className="relative"><Input id="password" className="pr-12" autoComplete={mode === "signin" ? "current-password" : "new-password"} type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required minLength={6} /><Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0" aria-label={showPassword ? "Hisha ijambo ry'ibanga" : "Erekana ijambo ry'ibanga"} onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff /> : <Eye />}</Button></div></div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === "signin" ? "Injira" : "Iyandikishe"}
          </Button>
        </form>
        {mode === "signin" && method === "email" && (
          <Button type="button" variant="link" onClick={forgotPassword} disabled={loading} className="h-auto w-full whitespace-normal text-center text-muted-foreground">
            {resetSent ? "Imeyili yoherejwe — reba muri imeyili yawe" : "Wibagiwe ijambo ry'ibanga?"}
          </Button>
        )}
        {mode === "signin" && method === "phone" && (
          <p className="text-center text-xs text-muted-foreground">Wibagiwe ijambo ry'ibanga? Vugana n'ubuyobozi bw'Umuhinzi AI bakagufasha.</p>
        )}
        <Button variant="link" disabled={loading} onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setResetSent(false); }} className="w-full whitespace-normal">
          {mode === "signin" ? "Nta konti ufite? Iyandikishe" : "Usanzwe ufite konti? Injira"}
        </Button>
      </div>
    </div>
  );
}
