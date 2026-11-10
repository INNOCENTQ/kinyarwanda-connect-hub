import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Shield, Loader2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { phoneToEmail } from "@/lib/phone-auth";
import { toast } from "sonner";

export default function AdminRegister() {
  const [name, setName] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [emailConfirmation, setEmailConfirmation] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (password !== confirmation) { toast.error("Amagambo y'ibanga ntabwo ahuye"); return; }
    setBusy(true);
    try {
      const id = identifier.trim();
      const full_name = name.trim();
      if (!full_name) throw new Error("Andika amazina yawe");
      if (id.includes("@")) {
        const { data, error } = await supabase.auth.signUp({
          email: id, password,
          options: { emailRedirectTo: `${window.location.origin}/admin/login`, data: { full_name } },
        });
        if (error) throw error;
        if (data.user?.identities?.length === 0) throw new Error("Iyi konti isanzwe ibaho. Jya ku rupapuro rwo kwinjira.");
        setEmailConfirmation(!data.session);
      } else {
        if (!phoneToEmail(id)) throw new Error("Andika telefone nyayo (07XXXXXXXX) cyangwa imeyili");
        const { data, error } = await supabase.functions.invoke("phone-signup", { body: { phone: id, password, full_name } });
        if (error || data?.error) {
          let message = data?.error;
          if (!message && error && "context" in error) {
            try { message = (await error.context.json()).error; } catch { /* Use the fallback message. */ }
          }
          throw new Error(message || "Ntibyashobotse gufungura konti. Ongera ugerageze.");
        }
      }
      setPassword(""); setConfirmation(""); setDone(true);
    } catch (error) { toast.error(error instanceof Error ? error.message : "Ntibyashobotse gufungura konti"); }
    finally { setBusy(false); }
  };

  return <main className="min-h-screen bg-background px-4 py-8 sm:py-12">
    <div className="mx-auto w-full max-w-md space-y-6">
      <Button asChild variant="ghost"><Link to="/admin/login"><ArrowLeft className="h-4 w-4" />Kwinjira kw'Ubuyobozi</Link></Button>
      <header className="space-y-3 text-center">
        <Shield className="mx-auto h-10 w-10 text-primary" />
        <p className="font-semibold text-primary">Umuhinzi AI</p>
        <h1 className="font-heading text-2xl font-bold">Konti nshya y'umuyobozi</h1>
      </header>
      {done ? <div role="status" className="space-y-4 border-t border-border pt-6">
        <h2 className="text-xl font-semibold">Kwiyandikisha byakunze</h2>
        {emailConfirmation && <p className="text-muted-foreground">Banza wemeze konti ukoresheje ubutumwa woherejwe kuri imeyili.</p>}
        <p className="text-muted-foreground">Konti yawe ntiragira ubuyobozi. Umuyobozi uriho agomba kubuguha muri Ubuyobozi → Abakoresha → Gira umuyobozi.</p>
        <Button asChild className="w-full"><Link to="/admin/login">Jya kwinjira</Link></Button>
      </div> : <>
        <p className="text-center text-sm text-muted-foreground">Nyuma yo kwiyandikisha, umuyobozi uriho azabanza aguhe uburenganzira bw'ubuyobozi.</p>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2"><Label htmlFor="register-name">Amazina yombi</Label><Input id="register-name" autoComplete="name" maxLength={100} required value={name} onChange={e => setName(e.target.value)} /></div>
          <div className="space-y-2"><Label htmlFor="register-id">Imeyili cyangwa telefone</Label><Input id="register-id" autoComplete="username" required value={identifier} onChange={e => setIdentifier(e.target.value)} /></div>
          <div className="space-y-2"><Label htmlFor="register-password">Ijambo ry'ibanga</Label><div className="relative"><Input id="register-password" className="pr-12" type={showPassword ? "text" : "password"} autoComplete="new-password" minLength={6} required value={password} onChange={e => setPassword(e.target.value)} /><Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0" aria-label={showPassword ? "Hisha ijambo ry'ibanga" : "Erekana ijambo ry'ibanga"} onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</Button></div></div>
          <div className="space-y-2"><Label htmlFor="register-confirm">Subiramo ijambo ry'ibanga</Label><Input id="register-confirm" type="password" autoComplete="new-password" minLength={6} required value={confirmation} onChange={e => setConfirmation(e.target.value)} /></div>
          <Button type="submit" className="w-full" disabled={busy}>{busy && <Loader2 className="h-4 w-4 animate-spin" />}Fungura konti nshya</Button>
        </form>
        <Button asChild variant="link" className="w-full whitespace-normal"><Link to="/admin/login">Usanzwe ufite konti? Injira</Link></Button>
      </>}
    </div>
  </main>;
}