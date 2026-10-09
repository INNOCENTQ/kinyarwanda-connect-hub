import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sprout, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);

  useEffect(() => {
    // Recovery links carry type=recovery in the URL hash
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
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md bg-card border border-border rounded-2xl p-8 space-y-6 shadow-lg">
        <Link to="/" className="flex items-center gap-2 justify-center">
          <Sprout className="h-7 w-7 text-primary" />
          <span className="text-2xl font-bold text-foreground">Umuhinzi AI</span>
        </Link>
        {isRecovery ? (
          <>
            <div>
              <h1 className="text-2xl font-bold text-center text-foreground">Ijambo ry'ibanga rishya</h1>
              <p className="text-sm text-muted-foreground text-center mt-1">Andika ijambo ry'ibanga rishya uzajya ukoresha</p>
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
          <div className="text-center space-y-4">
            <h1 className="text-xl font-bold text-foreground">Koresha link yohererejwe muri imeyili</h1>
            <p className="text-sm text-muted-foreground">
              Uru rupapuro rukora gusa iyo ukoresheje link yoherejwe muri imeyili yawe. Subira kuri paji yo kwinjira ukande "Wibagiwe ijambo ry'ibanga?".
            </p>
            <Button onClick={() => navigate("/auth")} className="w-full">Subira kwinjira</Button>
          </div>
        )}
      </div>
    </div>
  );
}
