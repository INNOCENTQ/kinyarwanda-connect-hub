import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Shield, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { phoneToEmail } from "@/lib/phone-auth";
import { toast } from "sonner";

export default function AdminLogin() {
  const nav = useNavigate();
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const email = id.includes("@") ? id.trim() : phoneToEmail(id);
      if (!email) throw new Error("Andika imeyili cyangwa telefone nyayo");
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error || !data.user) throw new Error("Imeyili cyangwa ijambo ry'ibanga si byo");
      const { data: ok } = await supabase.rpc("has_role", { _user_id: data.user.id, _role: "admin" });
      if (!ok) { await supabase.auth.signOut(); throw new Error("Iyi konti ntabwo ari iy'umuyobozi"); }
      toast.success("Murakaza neza, muyobozi!");
      nav("/admin");
    } catch (err: any) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary to-accent px-4 py-10">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-7 shadow-xl">
        <Link to="/" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground"><ArrowLeft className="h-4 w-4" />Ahabanza</Link>
        <div className="mb-6 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10"><Shield className="h-7 w-7 text-primary" /></span>
          <h1 className="mt-3 font-heading text-2xl font-bold">Kwinjira kw'Ubuyobozi</h1>
          <p className="text-sm text-muted-foreground">Abayobozi ba Umuhinzi AI gusa</p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div><Label htmlFor="admin-id">Imeyili cyangwa telefone</Label><Input id="admin-id" autoComplete="username" value={id} onChange={e => setId(e.target.value)} required /></div>
          <div><Label htmlFor="admin-pw">Ijambo ry'ibanga</Label><Input id="admin-pw" type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} required /></div>
          <Button type="submit" className="w-full" disabled={loading}>{loading && <Loader2 className="h-4 w-4 animate-spin" />}Injira</Button>
        </form>
      </div>
    </div>
  );
}
