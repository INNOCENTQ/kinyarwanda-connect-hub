import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, MessageCircle, CheckCircle2, Trash2, RotateCcw, Star, Package, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

type MyListing = { id: string; title: string; price: number | null; quantity: number | null; unit: string | null; status: string; image_urls: string[] | null; featured_until: string | null; created_at: string };
type Room = { id: string; buyer_id: string; seller_id: string; created_at: string; listing: { id: string; title: string; price: number | null; image_urls: string[] | null; status: string } | null };

function useRooms(role: "buyer" | "seller") {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!user) return;
    setLoading(true);
    supabase
      .from("chat_rooms")
      .select("id, buyer_id, seller_id, created_at, listing:listings(id, title, price, image_urls, status)")
      .eq(role === "buyer" ? "buyer_id" : "seller_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) toast.error("Ibiganiro ntibyabonetse. Ongera ugerageze.");
        setRooms((data as unknown as Room[]) || []);
        setLoading(false);
      });
  }, [user, role]);
  return { rooms, loading };
}

function RoomList({ role }: { role: "buyer" | "seller" }) {
  const { rooms, loading } = useRooms(role);
  const nav = useNavigate();
  if (loading) return <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>;
  if (rooms.length === 0)
    return <p className="text-sm text-muted-foreground py-6 text-center">{role === "buyer" ? "Nturavugana n'umucuruzi n'umwe." : "Nta muguzi urakwandikira."}</p>;
  return (
    <ul className="divide-y divide-border rounded-xl border border-border bg-card">
      {rooms.map((r) => (
        <li key={r.id}>
          <button onClick={() => nav(`/chat-room/${r.id}`)} className="flex w-full items-center gap-3 p-3 text-left hover:bg-muted transition-colors">
            {r.listing?.image_urls?.[0]
              ? <img src={r.listing.image_urls[0]} alt="" className="h-12 w-12 rounded-lg object-cover" />
              : <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted"><Package className="h-5 w-5 text-muted-foreground" /></span>}
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-foreground">{r.listing?.title ?? "Igicuruzwa cyavuyeho"}</p>
              <p className="text-xs text-muted-foreground">
                {role === "buyer" ? "Umucuruzi" : "Umuguzi"} • {new Date(r.created_at).toLocaleDateString("rw-RW")}
                {r.listing?.status === "sold" && " • Cyagurishijwe"}
              </p>
            </div>
            <MessageCircle className="h-5 w-5 text-primary shrink-0" />
          </button>
        </li>
      ))}
    </ul>
  );
}

export function SellerPanel({ onPromote, onChanged }: { onPromote: (id: string) => void; onChanged: () => void }) {
  const { user } = useAuth();
  const [items, setItems] = useState<MyListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("listings")
      .select("id, title, price, quantity, unit, status, image_urls, featured_until, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (error) toast.error("Ibicuruzwa byawe ntibyabonetse.");
    setItems((data as MyListing[]) || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, [user]);

  const setStatus = async (id: string, status: "active" | "sold") => {
    setBusy(id);
    const { error } = await supabase.from("listings").update({ status }).eq("id", id);
    setBusy(null);
    if (error) return toast.error("Ntibyakunze. Ongera ugerageze.");
    toast.success(status === "sold" ? "Byanditswe ko byagurishijwe" : "Byasubijwe ku isoko");
    load(); onChanged();
  };

  const remove = async (id: string) => {
    if (!confirm("Urashaka gusiba iki gicuruzwa burundu?")) return;
    setBusy(id);
    const { error } = await supabase.from("listings").delete().eq("id", id);
    setBusy(null);
    if (error) return toast.error("Ntibyasibwe. Niba gifite ibiganiro, kandika ko cyagurishijwe.");
    toast.success("Byasibwe");
    load(); onChanged();
  };

  const active = items.filter((i) => i.status === "active").length;
  const sold = items.filter((i) => i.status === "sold").length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-3">
        {[["Byose", items.length], ["Ku isoko", active], ["Byagurishijwe", sold]].map(([l, v]) => (
          <div key={l as string} className="rounded-xl border border-border bg-card p-3 text-center">
            <p className="text-2xl font-bold text-foreground">{v}</p>
            <p className="text-xs text-muted-foreground">{l}</p>
          </div>
        ))}
      </div>

      <section className="space-y-3">
        <h2 className="font-heading text-lg font-semibold text-foreground">Ibicuruzwa byanjye</h2>
        {loading ? <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
          : items.length === 0 ? <p className="text-sm text-muted-foreground py-6 text-center">Nturashyira igicuruzwa ku isoko. Kanda "Ongeraho".</p>
          : (
            <ul className="space-y-3">
              {items.map((i) => {
                const featured = i.featured_until && new Date(i.featured_until) > new Date();
                return (
                  <li key={i.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-3">
                    {i.image_urls?.[0]
                      ? <img src={i.image_urls[0]} alt="" className="h-14 w-14 rounded-lg object-cover" />
                      : <span className="flex h-14 w-14 items-center justify-center rounded-lg bg-muted"><Package className="h-5 w-5 text-muted-foreground" /></span>}
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-foreground">{i.title}</p>
                      <p className="text-xs text-muted-foreground">{i.price ? `${i.price} RWF` : "Guhindurana"}{i.quantity ? ` • ${i.quantity} ${i.unit ?? ""}` : ""}</p>
                      <div className="mt-1 flex gap-1">
                        <Badge variant={i.status === "active" ? "default" : "secondary"}>{i.status === "active" ? "Ku isoko" : "Byagurishijwe"}</Badge>
                        {featured && <Badge variant="outline"><Star className="h-3 w-3 mr-1" />Byamamajwe</Badge>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {i.status === "active" ? (
                        <>
                          {!featured && <Button size="sm" variant="outline" onClick={() => onPromote(i.id)}><Star className="h-4 w-4" /><span className="hidden sm:inline">Yamamaze</span></Button>}
                          <Button size="sm" variant="outline" disabled={busy === i.id} onClick={() => setStatus(i.id, "sold")}><CheckCircle2 className="h-4 w-4" /><span className="hidden sm:inline">Byagurishijwe</span></Button>
                        </>
                      ) : (
                        <Button size="sm" variant="outline" disabled={busy === i.id} onClick={() => setStatus(i.id, "active")}><RotateCcw className="h-4 w-4" /><span className="hidden sm:inline">Subiza ku isoko</span></Button>
                      )}
                      <Button size="sm" variant="ghost" aria-label="Siba" disabled={busy === i.id} onClick={() => remove(i.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
      </section>

      <section className="space-y-3">
        <h2 className="font-heading text-lg font-semibold text-foreground">Abaguzi banyandikiye</h2>
        <RoomList role="seller" />
      </section>
    </div>
  );
}

export function CustomerPanel() {
  const nav = useNavigate();
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-heading text-lg font-semibold text-foreground">Abacuruzi navuganye nabo</h2>
      </div>
      <RoomList role="buyer" />
      <p className="text-sm text-muted-foreground flex items-center gap-2">
        <ShoppingBag className="h-4 w-4" /> Ushaka ikindi? Kanda "Isoko" ugashaka, hanyuma "Vugana na nyiri".
      </p>
    </div>
  );
}
