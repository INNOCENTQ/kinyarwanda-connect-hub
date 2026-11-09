import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Trash2, Shield, ShieldOff, Eye, EyeOff, Power, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const db = supabase as any;
const d = (s: string | null) => (s ? new Date(s).toLocaleDateString("en-GB") : "—");
const shown = (email: string | null, phone: string | null) => email?.endsWith("@phone.umuhinzi.app") ? (phone || "0" + email.slice(3, 12)) : email;

export function UsersPanel({ me }: { me: string }) {
  const [q, setQ] = useState("");
  const { data = [], isLoading, refetch } = useQuery({ queryKey: ["admin-users"], queryFn: async () => { const { data, error } = await db.rpc("admin_list_users"); if (error) throw error; return data as any[]; } });
  const toggle = async (id: string, make: boolean) => {
    if (!confirm(make ? "Uyu mukoresha abe umuyobozi?" : "Kumwambura ububasha bw'ubuyobozi?")) return;
    const { error } = await db.rpc("admin_set_admin", { _user: id, _make: make });
    if (error) toast.error("Ntibyakunze"); else { toast.success("Byahinduwe"); refetch(); }
  };
  const [f, setF] = useState({ full_name: "", identifier: "", password: "", make_admin: false });
  const [creating, setCreating] = useState(false);
  const create = async (e: React.FormEvent) => {
    e.preventDefault(); setCreating(true);
    try {
      const { data: r, error } = await supabase.functions.invoke("admin-create-user", { body: f });
      let msg = r?.error; if (error && !msg) { try { msg = (await (error as any).context.json()).error; } catch { msg = "Ntibyakunze"; } }
      if (msg) throw new Error(msg);
      toast.success("Konti nshya yafunguwe"); setF({ full_name: "", identifier: "", password: "", make_admin: false }); refetch();
    } catch (err: any) { toast.error(err.message); } finally { setCreating(false); }
  };
  const list = data.filter(u => `${u.full_name} ${u.email} ${u.phone} ${u.district}`.toLowerCase().includes(q.toLowerCase()));
  return <div className="space-y-4">
    <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-bold">Abakoresha bose ({data.length})</h2><div className="relative w-full sm:w-64"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input className="pl-9" placeholder="Shaka izina, telefone..." value={q} onChange={e => setQ(e.target.value)} /></div></div>
    <form onSubmit={create} className="space-y-3 rounded-2xl border border-border bg-card p-5 shadow-sm">
      <h3 className="flex items-center gap-2 font-semibold"><UserPlus className="h-4 w-4 text-primary" />Fungura konti nshya</h3>
      <div className="grid gap-3 sm:grid-cols-3">
        <div><Label htmlFor="nu-name">Amazina</Label><Input id="nu-name" required value={f.full_name} onChange={e => setF({ ...f, full_name: e.target.value })} /></div>
        <div><Label htmlFor="nu-id">Telefone cyangwa imeyili</Label><Input id="nu-id" required placeholder="07XXXXXXXX" value={f.identifier} onChange={e => setF({ ...f, identifier: e.target.value })} /></div>
        <div><Label htmlFor="nu-pw">Ijambo ry'ibanga</Label><Input id="nu-pw" type="text" minLength={6} required value={f.password} onChange={e => setF({ ...f, password: e.target.value })} /></div>
      </div>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.make_admin} onChange={e => setF({ ...f, make_admin: e.target.checked })} />Agire umuyobozi</label>
      <Button type="submit" disabled={creating}>{creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}Fungura konti</Button>
    </form>
    <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
      <table className="w-full min-w-[760px] text-sm"><thead className="bg-muted/50 text-muted-foreground"><tr>{["Izina", "Konti", "Akarere", "Ibicuruzwa", "Isuzuma", "Yiyandikishije", "Aheruka kwinjira", "Uruhare"].map(h => <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>)}</tr></thead>
        <tbody className="divide-y divide-border">{list.map(u => <tr key={u.user_id} className="hover:bg-muted/40">
          <td className="px-4 py-3 font-semibold">{u.full_name || "—"}</td><td className="px-4 py-3 break-all">{shown(u.email, u.phone)}</td><td className="px-4 py-3">{u.district || "—"}</td>
          <td className="px-4 py-3">{u.listings}</td><td className="px-4 py-3">{u.diagnoses}</td><td className="px-4 py-3 text-muted-foreground">{d(u.created_at)}</td><td className="px-4 py-3 text-muted-foreground">{d(u.last_sign_in_at)}</td>
          <td className="px-4 py-3">{u.is_admin ? <Button size="sm" variant="outline" disabled={u.user_id === me} onClick={() => toggle(u.user_id, false)}><ShieldOff className="h-4 w-4" />Umuyobozi</Button> : <Button size="sm" variant="ghost" onClick={() => toggle(u.user_id, true)}><Shield className="h-4 w-4" />Gira umuyobozi</Button>}</td>
        </tr>)}</tbody></table>
      {isLoading && <p className="p-8 text-center text-muted-foreground"><Loader2 className="mx-auto h-5 w-5 animate-spin" /></p>}
    </div>
  </div>;
}

export function ListingsPanel() {
  const { data = [], refetch } = useQuery({ queryKey: ["admin-listings"], queryFn: async () => { const { data, error } = await db.from("listings").select("id,title,category,price,currency,district,status,created_at").order("created_at", { ascending: false }).limit(500); if (error) throw error; return data as any[]; } });
  const setStatus = async (id: string, status: string) => { const { error } = await db.from("listings").update({ status }).eq("id", id); if (error) toast.error("Ntibyakunze"); else refetch(); };
  const del = async (id: string) => { if (!confirm("Gusiba iki gicuruzwa burundu?")) return; const { error } = await db.from("listings").delete().eq("id", id); if (error) toast.error("Ntibyakunze"); else { toast.success("Cyasibwe"); refetch(); } };
  return <div className="space-y-4"><h2 className="text-xl font-bold">Ibicuruzwa byose ({data.length})</h2>
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{data.map(l => <div key={l.id} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="flex justify-between gap-2"><h3 className="font-bold break-words">{l.title}</h3><span className="text-xs text-muted-foreground">{l.status === "active" ? "Ku isoko" : l.status === "hidden" ? "Cyahishwe" : "Cyagurishijwe"}</span></div>
      <p className="text-sm text-muted-foreground">{l.category} · {l.district || "—"} · {l.price ? `${Number(l.price).toLocaleString()} ${l.currency}` : "—"}</p>
      <div className="mt-3 flex gap-2">{l.status === "hidden" ? <Button size="sm" variant="outline" onClick={() => setStatus(l.id, "active")}><Eye className="h-4 w-4" />Garura</Button> : <Button size="sm" variant="outline" onClick={() => setStatus(l.id, "hidden")}><EyeOff className="h-4 w-4" />Hisha</Button>}<Button size="sm" variant="destructive" onClick={() => del(l.id)}><Trash2 className="h-4 w-4" />Siba</Button></div>
    </div>)}</div>{!data.length && <p className="py-8 text-center text-muted-foreground">Nta bicuruzwa.</p>}</div>;
}

export function AdsPanel() {
  const { data = [], refetch } = useQuery({ queryKey: ["admin-ads"], queryFn: async () => { const { data, error } = await db.from("ads").select("*").order("created_at", { ascending: false }); if (error) throw error; return data as any[]; } });
  const toggle = async (a: any) => { const { error } = await db.from("ads").update({ active: !a.active, active_until: !a.active ? new Date(Date.now() + 30 * 864e5).toISOString() : a.active_until }).eq("id", a.id); if (error) toast.error("Ntibyakunze"); else refetch(); };
  const del = async (id: string) => { if (!confirm("Gusiba iri tangazo?")) return; const { error } = await db.from("ads").delete().eq("id", id); if (error) toast.error("Ntibyakunze"); else refetch(); };
  return <div className="space-y-4"><h2 className="text-xl font-bold">Amatangazo ({data.length})</h2>
    <div className="grid gap-3 sm:grid-cols-2">{data.map(a => <div key={a.id} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <h3 className="font-bold">{a.title}</h3><p className="text-sm text-muted-foreground">{a.business_name} · {a.active ? `Arakora kugeza ${d(a.active_until)}` : "Ntarakora"}</p>
      <div className="mt-3 flex gap-2"><Button size="sm" variant={a.active ? "outline" : "default"} onClick={() => toggle(a)}><Power className="h-4 w-4" />{a.active ? "Hagarika" : "Tangiza (iminsi 30)"}</Button><Button size="sm" variant="destructive" onClick={() => del(a.id)}><Trash2 className="h-4 w-4" />Siba</Button></div>
    </div>)}</div>{!data.length && <p className="py-8 text-center text-muted-foreground">Nta matangazo.</p>}</div>;
}

export async function vetAction(id: string, action: "toggle" | "delete", active?: boolean) {
  if (action === "delete") { if (!confirm("Gusiba uyu muveterineri?")) return false; const { error } = await db.from("vets").delete().eq("id", id); if (error) { toast.error("Ntibyakunze (ashobora kuba afite inama)"); return false; } return true; }
  const { error } = await db.from("vets").update({ active: !active }).eq("id", id); if (error) { toast.error("Ntibyakunze"); return false; } return true;
}
