import { useEffect, useState } from "react";
import AppNav from "@/components/AppNav";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, MapPin, Loader2, Store, MessageCircle, Star } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import AdBanner from "@/components/AdBanner";
import PayDialog from "@/components/PayDialog";
import { PRICES } from "@/hooks/usePlan";

type Listing = { id: string; user_id: string; title: string; description: string; category: string; product_type: string; quantity: number; unit: string; price: number; district: string; sector: string; image_urls: string[]; created_at: string; featured_until?: string | null };

export default function Marketplace() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<string>("all");
  const [promote, setPromote] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    let q = supabase.from("listings").select("*").eq("status", "active").order("created_at", { ascending: false });
    if (filter !== "all") q = q.eq("category", filter);
    const { data } = await q;
    const now = Date.now();
    const isF = (l: any) => l.featured_until && new Date(l.featured_until).getTime() > now;
    setListings(((data as Listing[]) || []).sort((a, b) => Number(isF(b)) - Number(isF(a))));
    setLoading(false);
  };
  useEffect(() => { load(); }, [filter]);

  const contact = async (l: Listing) => {
    if (!user) { nav("/auth"); return; }
    if (l.user_id === user.id) { toast.info("Ibi ni ibyawe"); return; }
    const { data: existing } = await supabase.from("chat_rooms").select("id").eq("listing_id", l.id).eq("buyer_id", user.id).maybeSingle();
    let roomId = existing?.id;
    if (!roomId) {
      const { data, error } = await supabase.from("chat_rooms").insert({ listing_id: l.id, buyer_id: user.id, seller_id: l.user_id }).select("id").single();
      if (error) { toast.error(error.message); return; }
      roomId = data.id;
    }
    nav(`/chat-room/${roomId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2"><Store className="h-7 w-7 text-primary" /> Isoko ry'Abahinzi</h1>
            <p className="text-muted-foreground">Guranisha cyangwa hindurana ibihingwa n'amatungo</p>
          </div>
          <div className="flex gap-2">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Byose</SelectItem>
                <SelectItem value="crops">Ibihingwa</SelectItem>
                <SelectItem value="livestock">Amatungo</SelectItem>
                <SelectItem value="exchange">Guhindurana</SelectItem>
              </SelectContent>
            </Select>
            {user && (
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild><Button><Plus className="h-4 w-4" />Ongeraho</Button></DialogTrigger>
                <NewListingDialog onDone={() => { setOpen(false); load(); }} />
              </Dialog>
            )}
          </div>
        </div>

        {loading ? <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div> : (
          listings.length === 0 ? <p className="text-center text-muted-foreground py-12">Nta bicuruzwa biriho ubu.</p> : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {listings.map(l => { const featured = l.featured_until && new Date(l.featured_until) > new Date(); return (
                <div key={l.id} className={`bg-card border rounded-xl overflow-hidden hover:shadow-md transition-shadow ${featured ? "border-secondary border-2" : "border-border"}`}>
                  {l.image_urls?.[0] && <img src={l.image_urls[0]} alt={l.title} className="w-full h-44 object-cover" />}
                  <div className="p-4 space-y-2">
                    {featured && <span className="inline-flex items-center gap-1 rounded bg-secondary px-2 py-0.5 text-xs font-bold text-secondary-foreground"><Star className="h-3 w-3" />Byamamajwe</span>}
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-bold text-foreground">{l.title}</h3>
                      <span className="text-primary font-bold text-sm">{l.price ? `${l.price} RWF` : "Guhindurana"}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{l.product_type} • {l.quantity} {l.unit}</p>
                    {l.description && <p className="text-sm text-muted-foreground line-clamp-2">{l.description}</p>}
                    {l.district && <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" />{l.district} {l.sector && `, ${l.sector}`}</p>}
                    {user?.id === l.user_id
                      ? <Button size="sm" variant="outline" className="w-full" onClick={() => setPromote(l.id)}><Star className="h-4 w-4" />Yamamaze ({PRICES.featured} RWF)</Button>
                      : <Button size="sm" className="w-full" onClick={() => contact(l)}><MessageCircle className="h-4 w-4" />Vugana na nyiri</Button>}
                  </div>
                </div>
              ); })}
            </div>
          )
        )}
        <div className="mt-8"><AdBanner /></div>
      </main>
      <PayDialog open={!!promote} onOpenChange={o => !o && setPromote(null)} kind="featured" amount={PRICES.featured} referenceId={promote ?? undefined} title="Kwamamaza igicuruzwa (iminsi 7)" />
    </div>
  );
}

function NewListingDialog({ onDone }: { onDone: () => void }) {
  const { user } = useAuth();
  const [form, setForm] = useState({ title: "", description: "", category: "crops", product_type: "", quantity: "", unit: "kg", price: "", district: "", sector: "" });
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!user) return;
    setSaving(true);
    let uploadedPath: string | null = null;
    try {
      let image_urls: string[] = [];
      if (file) {
        const path = `${user.id}/${Date.now()}-${file.name}`;
        const { error: upErr } = await supabase.storage.from("listing-images").upload(path, file);
        if (upErr) throw upErr;
        uploadedPath = path;
        const { data: pub } = supabase.storage.from("listing-images").getPublicUrl(path);
        image_urls = [pub.publicUrl];
      }
      const { error } = await supabase.from("listings").insert({
        user_id: user.id,
        title: form.title, description: form.description, category: form.category, product_type: form.product_type,
        quantity: form.quantity ? Number(form.quantity) : null, unit: form.unit,
        price: form.price ? Number(form.price) : null,
        district: form.district, sector: form.sector, image_urls,
      });
      if (error) throw error;
      toast.success("Byongewemo!");
      onDone();
    } catch (e: any) {
      if (uploadedPath) await supabase.storage.from("listing-images").remove([uploadedPath]);
      toast.error(e.message);
    } finally { setSaving(false); }
  };

  return (
    <DialogContent className="max-h-[90vh] overflow-y-auto">
      <DialogHeader><DialogTitle>Ongeraho ku isoko</DialogTitle></DialogHeader>
      <div className="space-y-3">
        <div><Label>Izina</Label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="urugero: Ibigori bishya" /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Icyiciro</Label>
            <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="crops">Ibihingwa</SelectItem>
                <SelectItem value="livestock">Amatungo</SelectItem>
                <SelectItem value="exchange">Guhindurana</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div><Label>Ubwoko</Label><Input value={form.product_type} onChange={e => setForm({ ...form, product_type: e.target.value })} placeholder="ibigori" /></div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div><Label>Ingano</Label><Input type="number" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} /></div>
          <div><Label>Igipimo</Label><Input value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} /></div>
          <div><Label>Igiciro (RWF)</Label><Input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} /></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Akarere</Label><Input value={form.district} onChange={e => setForm({ ...form, district: e.target.value })} /></div>
          <div><Label>Umurenge</Label><Input value={form.sector} onChange={e => setForm({ ...form, sector: e.target.value })} /></div>
        </div>
        <div><Label>Ibisobanuro</Label><Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} /></div>
        <div><Label>Ifoto</Label><Input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} /></div>
        <Button onClick={submit} disabled={saving || !form.title} className="w-full">
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}Ohereza
        </Button>
      </div>
    </DialogContent>
  );
}
