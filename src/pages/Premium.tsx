import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Check, Crown, Megaphone, Star, Stethoscope } from "lucide-react";
import AppNav from "@/components/AppNav";
import PayDialog from "@/components/PayDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { PRICES, usePlan } from "@/hooks/usePlan";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function Premium() {
  const { user } = useAuth();
  const nav = useNavigate();
  const { premium, activeUntil } = usePlan();
  const [payOpen, setPayOpen] = useState(false);
  const [adOpen, setAdOpen] = useState(false);
  const [adPay, setAdPay] = useState<string | null>(null);
  const [requests, setRequests] = useState<any[]>([]);

  const loadReq = () => user && (supabase as any).from("payment_requests").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(5).then(({ data }: any) => setRequests(data || []));
  useEffect(() => { loadReq(); }, [user]);

  const need = (fn: () => void) => () => (user ? fn() : nav("/auth"));

  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="text-3xl font-bold text-foreground">Ibiciro na serivisi</h1>
        <p className="mt-1 text-muted-foreground">Koresha ubuntu, cyangwa wongere ubushobozi bwawe.</p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-xl font-bold">Ubuntu</h2>
            <p className="mt-1 text-3xl font-bold">0 RWF</p>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              {["Ikirere cy'aho uri", "AI Chat", "Gusuzuma 10 buri kwezi", "Isoko"].map(t => <li key={t} className="flex gap-2"><Check className="h-4 w-4 text-primary" />{t}</li>)}
            </ul>
          </div>
          <div className="rounded-lg border-2 border-primary bg-card p-6">
            <h2 className="flex items-center gap-2 text-xl font-bold"><Crown className="h-5 w-5 text-secondary" />Premium</h2>
            <p className="mt-1 text-3xl font-bold">{PRICES.premium.toLocaleString()} RWF<span className="text-sm font-normal text-muted-foreground"> / ukwezi</span></p>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              {["Byose biri mu buntu", "Gusuzuma nta mupaka", "Ubufasha bwihuse"].map(t => <li key={t} className="flex gap-2"><Check className="h-4 w-4 text-primary" />{t}</li>)}
            </ul>
            {premium ? <p className="mt-5 font-bold text-primary">Uri Premium kugeza {new Date(activeUntil!).toLocaleDateString("rw-RW")}</p>
              : <Button className="mt-5 w-full" onClick={need(() => setPayOpen(true))}>Fata Premium</Button>}
          </div>
        </div>

        <h2 className="mt-10 text-2xl font-bold">Ku bacuruzi n'abaganga</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-border bg-card p-5">
            <Star className="h-6 w-6 text-secondary" />
            <h3 className="mt-2 font-bold">Kwamamaza igicuruzwa</h3>
            <p className="mt-1 text-sm text-muted-foreground">Igicuruzwa cyawe kiza imbere ku Isoko iminsi 7 — {PRICES.featured.toLocaleString()} RWF.</p>
            <Button asChild variant="outline" className="mt-4 w-full"><Link to="/marketplace">Jya ku Isoko</Link></Button>
          </div>
          <div className="rounded-lg border border-border bg-card p-5">
            <Megaphone className="h-6 w-6 text-secondary" />
            <h3 className="mt-2 font-bold">Itangazo ry'ubucuruzi</h3>
            <p className="mt-1 text-sm text-muted-foreground">Amaduka y'imiti, imbuto n'ifumbire agaragara ku rubuga iminsi 30 — {PRICES.ad.toLocaleString()} RWF.</p>
            <Button variant="outline" className="mt-4 w-full" onClick={need(() => setAdOpen(true))}>Shyiraho itangazo</Button>
          </div>
          <div className="rounded-lg border border-border bg-card p-5">
            <Stethoscope className="h-6 w-6 text-secondary" />
            <h3 className="mt-2 font-bold">Kugisha veterineri</h3>
            <p className="mt-1 text-sm text-muted-foreground">Vugana na muganga w'amatungo wemewe.</p>
            <Button asChild variant="outline" className="mt-4 w-full"><Link to="/vets">Reba abaveterineri</Link></Button>
          </div>
        </div>

        {requests.length > 0 && (
          <div className="mt-10">
            <h2 className="text-lg font-bold">Ubusabe bwawe</h2>
            <ul className="mt-2 divide-y divide-border rounded-lg border border-border bg-card text-sm">
              {requests.map(r => <li key={r.id} className="flex justify-between p-3"><span>{KIND[r.kind]} — {r.amount.toLocaleString()} RWF</span><span className="font-bold">{STATUS[r.status]}</span></li>)}
            </ul>
          </div>
        )}
      </main>

      <PayDialog open={payOpen} onOpenChange={setPayOpen} kind="premium" amount={PRICES.premium} title="Fata Premium (ukwezi 1)" onDone={loadReq} />
      <AdDialog open={adOpen} onOpenChange={setAdOpen} onCreated={id => { setAdOpen(false); setAdPay(id); }} />
      <PayDialog open={!!adPay} onOpenChange={o => !o && setAdPay(null)} kind="ad" amount={PRICES.ad} referenceId={adPay ?? undefined} title="Kwishyura itangazo" onDone={loadReq} />
    </div>
  );
}

export const KIND: Record<string, string> = { premium: "Premium", featured: "Kwamamaza igicuruzwa", ad: "Itangazo", vet: "Veterineri" };
export const STATUS: Record<string, string> = { pending: "Birategereje", approved: "Byemejwe", rejected: "Byanzwe" };

function AdDialog({ open, onOpenChange, onCreated }: { open: boolean; onOpenChange: (o: boolean) => void; onCreated: (id: string) => void }) {
  const { user } = useAuth();
  const [f, setF] = useState({ business_name: "", title: "", description: "", phone: "", link_url: "" });
  const submit = async () => {
    if (!user || !f.business_name || !f.title) { toast.error("Uzuza izina n'umutwe"); return; }
    const { data, error } = await (supabase as any).from("ads").insert({ ...f, user_id: user.id, link_url: f.link_url || null }).select("id").single();
    if (error) { toast.error(error.message); return; }
    onCreated(data.id);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Itangazo rishya</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><Label>Izina ry'ubucuruzi</Label><Input value={f.business_name} onChange={e => setF({ ...f, business_name: e.target.value })} /></div>
          <div><Label>Umutwe</Label><Input value={f.title} onChange={e => setF({ ...f, title: e.target.value })} placeholder="urugero: Imiti y'amatungo ku giciro gito" /></div>
          <div><Label>Ibisobanuro</Label><Textarea rows={2} value={f.description} onChange={e => setF({ ...f, description: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Telefone</Label><Input value={f.phone} onChange={e => setF({ ...f, phone: e.target.value })} /></div>
            <div><Label>Link (si ngombwa)</Label><Input value={f.link_url} onChange={e => setF({ ...f, link_url: e.target.value })} /></div>
          </div>
          <Button className="w-full" onClick={submit}>Komeza</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
