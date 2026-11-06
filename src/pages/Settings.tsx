import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import AppNav from "@/components/AppNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Lock, ShieldCheck, Languages, Loader2, MapPin } from "lucide-react";
import { toast } from "sonner";
import { isPhoneAccount } from "@/lib/phone-auth";
import { useQueryClient } from "@tanstack/react-query";

export default function Settings() {
  const queryClient = useQueryClient();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Profile
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [district, setDistrict] = useState("");
  const [sector, setSector] = useState("");
  const [village, setVillage] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [locating, setLocating] = useState(false);

  // Password
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [savingPw, setSavingPw] = useState(false);

  // Privacy
  const [shareLocation, setShareLocation] = useState(true);
  const [savingPrivacy, setSavingPrivacy] = useState(false);

  // Language (stored locally)
  const [lang, setLang] = useState(localStorage.getItem("umuhinzi_lang") || "rw");

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle().then(({ data }) => {
      if (data) {
        setFullName(data.full_name || "");
        setPhone(data.phone || "");
        setDistrict(data.district || "");
        setSector(data.sector || "");
        setVillage(data.village || "");
        setShareLocation(data.share_location ?? true);
      }
    });
  }, [user]);

  const saveProfile = async () => {
    if (!user) return;
    setSavingProfile(true);
    const { error } = await supabase.from("profiles").update({
      full_name: fullName, phone, district, sector, village,
    }).eq("user_id", user.id);
    setSavingProfile(false);
    if (error) toast.error("Ntibyashoboye kubika"); else toast.success("Umwirondoro wabitswe!");
  };

  const updateGps = () => {
    if (!user) return;
    if (!shareLocation) { toast.error("Banza wemerere ikoreshwa rya GPS mu buzima bwite"); return; }
    const userId = user.id;
    if (!navigator.geolocation) { toast.error("Telefoni yawe ntifite GPS"); return; }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { error } = await supabase.from("profiles").update({
        latitude: pos.coords.latitude, longitude: pos.coords.longitude,
      }).eq("user_id", userId);
      setLocating(false);
      if (error) toast.error("Ntibyashoboye kubika aho uri"); else toast.success("Aho uri byabitswe!");
    }, () => { setLocating(false); toast.error("Ntwashoboye kubona aho uri"); },
      { enableHighAccuracy: true, timeout: 10000 });
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPw !== confirmPw) { toast.error("Amajambo y'ibanga mashya ntabwo ahuye"); return; }
    setSavingPw(true);
    const { error } = await supabase.auth.updateUser({ password: newPw, current_password: currentPw });
    setSavingPw(false);
    if (error) toast.error(error.message || "Ntibyashoboye guhindura");
    else { toast.success("Ijambo ry'ibanga ryahinduwe!"); setCurrentPw(""); setNewPw(""); setConfirmPw(""); }
  };

  const savePrivacy = async (value: boolean) => {
    if (!user) return;
    const previous = shareLocation;
    setShareLocation(value);
    setSavingPrivacy(true);
    const { error } = await supabase.from("profiles").update({ share_location: value }).eq("user_id", user.id);
    setSavingPrivacy(false);
    if (error) { setShareLocation(previous); toast.error("Ntibyashoboye kubika"); } else {
      queryClient.setQueryData(["location-preference", user.id], value);
      toast.success("Igenamiterere ryabitswe!");
    }
  };

  const changeLang = (v: string) => {
    setLang(v);
    localStorage.setItem("umuhinzi_lang", v);
    toast.success(v === "rw" ? "Ururimi rwahinduwe: Ikinyarwanda" : "Language changed: English");
  };

  if (authLoading || !user) return null;

  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Igenamiterere</h1>

        {/* Profile */}
        <section className="border-t border-border py-6 space-y-4">
          <h2 className="flex items-center gap-2 font-semibold text-foreground"><User className="h-5 w-5 text-primary" />Umwirondoro</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><Label>Amazina yombi</Label><Input value={fullName} onChange={e => setFullName(e.target.value)} /></div>
            <div><Label>Telefoni</Label><Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="07XXXXXXXX" /></div>
            <div><Label>Akarere</Label><Input value={district} onChange={e => setDistrict(e.target.value)} /></div>
            <div><Label>Umurenge</Label><Input value={sector} onChange={e => setSector(e.target.value)} /></div>
            <div><Label>Umudugudu</Label><Input value={village} onChange={e => setVillage(e.target.value)} /></div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={saveProfile} disabled={savingProfile}>
              {savingProfile && <Loader2 className="h-4 w-4 animate-spin" />}Bika umwirondoro
            </Button>
            <Button variant="outline" onClick={updateGps} disabled={locating}>
              {locating ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}Koresha GPS yanjye
            </Button>
          </div>
        </section>

        {/* Password */}
        <section className="border-t border-border py-6 space-y-4">
          <h2 className="flex items-center gap-2 font-semibold text-foreground"><Lock className="h-5 w-5 text-primary" />Ijambo ry'ibanga</h2>
          <form onSubmit={changePassword} className="space-y-4">
            <div><Label>Ijambo ry'ibanga uri gukoresha</Label><Input type="password" value={currentPw} onChange={e => setCurrentPw(e.target.value)} required /></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><Label>Ijambo ry'ibanga rishya</Label><Input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} required minLength={6} /></div>
              <div><Label>Subiramo irishya</Label><Input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} required minLength={6} /></div>
            </div>
            <Button type="submit" disabled={savingPw}>
              {savingPw && <Loader2 className="h-4 w-4 animate-spin" />}Hindura ijambo ry'ibanga
            </Button>
          </form>
        </section>

        {/* Privacy */}
        <section className="border-t border-border py-6 space-y-4">
          <h2 className="flex items-center gap-2 font-semibold text-foreground"><ShieldCheck className="h-5 w-5 text-primary" />Ubuzima bwite</h2>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-foreground">Emerera ikoreshwa ry'aho ndi (GPS)</p>
              <p className="text-xs text-muted-foreground">Bifasha ikirere n'isoko kukwereka amakuru y'aho uri hafi</p>
            </div>
            <Switch aria-label="Emerera ikoreshwa ry’aho ndi" checked={shareLocation} onCheckedChange={savePrivacy} disabled={savingPrivacy} />
          </div>
        </section>

        {/* Language */}
        <section className="border-t border-border py-6 space-y-4">
          <h2 className="flex items-center gap-2 font-semibold text-foreground"><Languages className="h-5 w-5 text-primary" />Ururimi</h2>
          <div className="max-w-xs">
            <Label>Hitamo ururimi</Label>
            <Select value={lang} onValueChange={changeLang}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="rw">Ikinyarwanda</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <p className="text-xs text-muted-foreground">Konti: {isPhoneAccount(user.email) ? `Telefoni ${phone}` : user.email}</p>
        </section>
      </main>
    </div>
  );
}
