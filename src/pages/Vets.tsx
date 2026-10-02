import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Stethoscope } from "lucide-react";
import AppNav from "@/components/AppNav";
import PayDialog from "@/components/PayDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Vet = { id: string; name: string; district: string | null; specialty: string | null; fee: number };

export default function Vets() {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const [vets, setVets] = useState<Vet[]>([]);
  const [pick, setPick] = useState<Vet | null>(null);
  const [desc, setDesc] = useState("");
  const [phone, setPhone] = useState("");
  const [pay, setPay] = useState<{ id: string; fee: number } | null>(null);

  useEffect(() => { if (!loading && !user) nav("/auth"); }, [loading, user, nav]);
  useEffect(() => {
    if (user) (supabase as any).from("vets").select("id,name,district,specialty,fee").eq("active", true).order("name").then(({ data }: any) => setVets(data || []));
  }, [user]);

  const request = async () => {
    if (!user || !pick || !desc.trim() || !phone.trim()) { toast.error("Uzuza ikibazo na telefone"); return; }
    const { data, error } = await (supabase as any).from("vet_consultations").insert({ user_id: user.id, vet_id: pick.id, description: desc, phone }).select("id").single();
    if (error) { toast.error(error.message); return; }
    setPay({ id: data.id, fee: pick.fee }); setPick(null); setDesc("");
  };

  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="flex items-center gap-2 text-3xl font-bold"><Stethoscope className="h-7 w-7 text-primary" />Abaveterineri</h1>
        <p className="mt-1 text-muted-foreground">Hitamo muganga w'amatungo, umusobanurire ikibazo, azaguhamagara.</p>
        {vets.length === 0 ? <p className="py-12 text-center text-muted-foreground">Nta baveterineri baraboneka ubu. Garuka vuba.</p> : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {vets.map(v => (
              <div key={v.id} className="rounded-lg border border-border bg-card p-5">
                <h2 className="font-bold">{v.name}</h2>
                {v.specialty && <p className="text-sm text-muted-foreground">{v.specialty}</p>}
                {v.district && <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3" />{v.district}</p>}
                <div className="mt-4 flex items-center justify-between">
                  <span className="font-bold text-primary">{v.fee.toLocaleString()} RWF</span>
                  <Button size="sm" onClick={() => setPick(v)}>Saba inama</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Dialog open={!!pick} onOpenChange={o => !o && setPick(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Saba inama kwa {pick?.name}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Ikibazo cy'itungo</Label><Textarea rows={3} value={desc} onChange={e => setDesc(e.target.value)} /></div>
            <div><Label>Telefone yawe</Label><Input inputMode="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="078..." /></div>
            <Button className="w-full" onClick={request}>Komeza</Button>
          </div>
        </DialogContent>
      </Dialog>
      <PayDialog open={!!pay} onOpenChange={o => !o && setPay(null)} kind="vet" amount={pay?.fee ?? 0} referenceId={pay?.id} title="Kwishyura inama ya veterineri" />
    </div>
  );
}
