import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, ShieldCheck, Sprout } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error || !data.user) throw new Error("Imeyili cyangwa ijambo ry'ibanga si byo.");
      const { data: roles, error: roleError } = await (supabase as any).from("user_roles").select("role").eq("user_id", data.user.id);
      if (roleError) throw new Error("Ntibyashobotse kugenzura uburenganzira. Ongera ugerageze.");
      if (!roles?.some((item: { role: string }) => item.role === "admin")) {
        await supabase.auth.signOut();
        throw new Error("Iyi konti ntabwo ifite uburenganzira bw'umuyobozi.");
      }
      toast.success("Winjiye nk'umuyobozi.");
      navigate("/admin", { replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Ntibyashobotse kwinjira.");
    } finally { setLoading(false); }
  };

  return <main className="min-h-screen bg-background px-4 py-8 sm:py-12">
    <Button asChild variant="ghost" className="mb-8"><Link to="/"><ArrowLeft />Ahabanza</Link></Button>
    <section className="mx-auto w-full max-w-md space-y-7 rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
      <Link to="/" className="flex items-center justify-center gap-2"><Sprout className="h-7 w-7 text-primary" /><span className="text-xl font-bold text-foreground">Umuhinzi AI</span></Link>
      <div className="text-center"><span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary"><ShieldCheck className="h-6 w-6" /></span><h1 className="mt-4 text-2xl font-bold">Kwinjira kw'ubuyobozi</h1><p className="mt-1 text-sm text-muted-foreground">Iyi nzira igenewe konti zahawe uruhare rwa admin gusa.</p></div>
      <form onSubmit={submit} className="space-y-4">
        <div><Label htmlFor="admin-email">Imeyili y'umuyobozi</Label><Input id="admin-email" type="email" autoComplete="username" required value={email} onChange={e => setEmail(e.target.value)} /></div>
        <div><Label htmlFor="admin-password">Ijambo ry'ibanga</Label><Input id="admin-password" type="password" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} /></div>
        <Button className="w-full" type="submit" disabled={loading}>{loading && <Loader2 className="h-4 w-4 animate-spin" />}Injira mu buyobozi</Button>
      </form>
      <p className="text-center text-xs text-muted-foreground">Konti y'umuyobozi itangwa n'ubuyobozi bwa system. Nta kwiyandikisha kw'abayobozi kuri uru rupapuro.</p>
    </section>
  </main>;
}
