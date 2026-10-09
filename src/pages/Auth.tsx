import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sprout, Loader2 } from "lucide-react";
import { toast } from "sonner";

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
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: window.location.origin, data: { full_name: fullName, phone } },
        });
        if (error) throw error;
        toast.success("Konti yawe yashyizweho! Injira.");
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
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md bg-card border border-border rounded-2xl p-8 space-y-6 shadow-lg">
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
          {mode === "signup" && (
            <>
              <div><Label>Amazina yombi</Label><Input value={fullName} onChange={e => setFullName(e.target.value)} required /></div>
              <div><Label>Telefoni</Label><Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="07XXXXXXXX" required /></div>
            </>
          )}
          <div><Label>Imeyili</Label><Input type="email" value={email} onChange={e => setEmail(e.target.value)} required /></div>
          <div><Label>Ijambobanga</Label><Input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} /></div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === "signin" ? "Injira" : "Iyandikishe"}
          </Button>
        </form>
        {mode === "signin" && (
          <button type="button" onClick={forgotPassword} disabled={loading} className="w-full text-sm text-muted-foreground hover:text-primary hover:underline">
            {resetSent ? "Imeyili yoherejwe — reba muri imeyili yawe" : "Wibagiwe ijambo ry'ibanga?"}
          </button>
        )}
        <button onClick={() => setMode(mode === "signin" ? "signup" : "signin")} className="w-full text-sm text-primary hover:underline">
          {mode === "signin" ? "Nta konti ufite? Iyandikishe" : "Usanzwe ufite konti? Injira"}
        </button>
      </div>
    </div>
  );
}
