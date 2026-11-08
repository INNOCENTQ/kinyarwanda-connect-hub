import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sprout, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);

  useEffect(() => {
    if (window.location.hash.includes("type=recovery")) setIsRecovery(true);
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setIsRecovery(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { toast.error("Amajambo y'ibanga ntabwo ahuye"); return; }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success("Ijambo ry'ibanga ryahinduwe! Injira.");
      navigate("/auth");
    } catch (err: any) {
      toast.error(err.message || "Ikibazo ryagaragaye");
    } finally { setLoading(false); }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-border bg-card p-8 shadow-lg">
        <Link to="/" className="flex items-center justify-center gap-2">
          <Sprout className="h-7 w-7 text-primary" />
          <span className="text-center text-xl font-bold text-foreground">Umuhinzi AI</span>
        </Link>
        {isRecovery ? (
          <>
            <div>
              <h1 className="text-center text-2xl font-bold text-foreground">Ijambo ry'ibanga rishya</h1>
              <p className="mt-1 text-center text-sm text-muted-foreground">Andika ijambo ry'ibanga rishya uzajya ukoresha</p>
            </div>
            <form onSubmit={submit} className="space-y-4">
              <div><Label>Ijambo ry'ibanga rishya</Label><Input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} /></div>
              <div><Label>Subiramo ijambo ry'ibanga</Label><Input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required minLength={6} /></div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Hindura ijambo ry'ibanga
              </Button>
            </form>
          </>
        ) : (
          <div className="space-y-4 text-center">
            <h1 className="text-xl font-bold text-foreground">Koresha link yohererejwe muri imeyili</h1>
            <p className="text-sm text-muted-foreground">Uru rupapuro rukora gusa iyo ukoresheje link yoherejwe muri imeyili yawe. Subira kuri paji yo kwinjira ukande "Wibagiwe ijambo ry'ibanga?".</p>
            <Button asChild className="w-full"><Link to="/auth">Subira ku kwinjira</Link></Button>
          </div>
        )}
      </div>
    </div>
  );
}
