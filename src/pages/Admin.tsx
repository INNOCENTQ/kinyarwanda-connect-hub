import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useIsFetching, useQuery } from "@tanstack/react-query";
import { Check, X, RefreshCw, Search, Wallet, Clock, Stethoscope, Shield, Plus, Loader2 } from "lucide-react";
import AppNav from "@/components/AppNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { usePlan } from "@/hooks/usePlan";
import { supabase } from "@/integrations/supabase/client";
import { summarizePayments, type Payment } from "@/lib/admin-summary";
import { toast } from "sonner";
import { KIND, STATUS } from "./Premium";

type Vet = { id: string; name: string; phone: string | null; district: string | null; specialty: string | null; fee: number; active: boolean };
const money = (amount: number) => `${amount.toLocaleString()} RWF`;
const emptyVet = { name: "", phone: "", district: "", specialty: "", fee: "3000" };

export default function Admin() {
  const { user, loading } = useAuth();
  const { isAdmin } = usePlan();
  const planLoading = useIsFetching({ queryKey: ["plan", user?.id] }) > 0;
  const nav = useNavigate();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [busy, setBusy] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [v, setV] = useState(emptyVet);
  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ["admin-dashboard", user?.id], enabled: !!user && isAdmin,
    queryFn: async () => {
      const payments: Payment[] = [];
      for (let offset = 0; ; offset += 1000) {
        const result = await supabase.from("payment_requests").select("id,kind,amount,phone,status,created_at").order("created_at", { ascending: false }).order("id").range(offset, offset + 999);
        if (result.error) throw result.error;
        payments.push(...result.data);
        if (result.data.length < 1000) break;
      }
      const result = await supabase.from("vets").select("*").order("name");
      if (result.error) throw result.error;
      return { payments, vets: result.data as Vet[] };
    },
  });
  useEffect(() => { if (!loading && !user) nav("/auth"); }, [loading, user, nav]);
  const review = async (id: string, approve: boolean) => {
    setBusy(id);
    try {
      const { error } = await supabase.rpc("review_payment", { _id: id, _approve: approve });
      if (error) throw error;
      toast.success(approve ? "Byemejwe" : "Byanzwe");
      await refetch();
    } catch { toast.error("Ntibyashoboye guhindura ubusabe. Ongera ugerageze."); }
    finally { setBusy(null); }
  };
  const addVet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!v.name.trim()) return;
    setAdding(true);
    try {
      const { error } = await supabase.from("vets").insert({ ...v, name: v.name.trim(), fee: Number(v.fee) });
      if (error) throw error;
      setV(emptyVet); toast.success("Umuveterineri yongewemo"); await refetch();
    } catch { toast.error("Ntibyashoboye kongeraho umuveterineri."); }
    finally { setAdding(false); }
  };
  if (loading || planLoading) return <div className="min-h-screen bg-background"><AppNav /><div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div></div>;
  if (!isAdmin) return <div className="min-h-screen bg-background"><AppNav /><div className="mx-auto max-w-md px-4 py-20 text-center"><Shield className="mx-auto mb-4 h-10 w-10 text-muted-foreground" /><h1 className="text-xl font-bold">Ubuyobozi gusa</h1><p className="mt-2 text-muted-foreground">Ntabwo wemerewe gufungura uru rupapuro.</p></div></div>;
  const payments = data?.payments ?? [];
  const vets = data?.vets ?? [];
  const summary = summarizePayments(payments);
  const filtered = payments.filter(p => (status === "all" || p.status === status) && `${p.phone} ${KIND[p.kind] ?? p.kind}`.toLowerCase().includes(search.toLowerCase()));
  return <div className="min-h-screen bg-background">
    <AppNav />
    <main className="mx-auto max-w-6xl px-4 py-8 space-y-8">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-accent p-6 text-primary-foreground shadow-lg sm:p-8 flex flex-wrap items-center justify-between gap-4">
        <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-secondary/30 blur-2xl" />
        <div className="relative"><p className="flex items-center gap-2 text-sm font-semibold text-secondary"><Shield className="h-4 w-4" />Umuhinzi AI</p><h1 className="mt-2 font-heading text-3xl font-bold">Dashboard y’umuyobozi</h1><p className="mt-1 text-sm opacity-80">Kurikirana ubwishyu n’abaveterineri ahantu hamwe.</p></div>
        <Button variant="secondary" className="relative" onClick={() => refetch()} disabled={isFetching}><RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />Vugurura</Button>
      </div>
      {error && <div role="alert" className="border border-destructive rounded-lg p-4 text-destructive">Amakuru ntiyabonetse. Kanda Vugurura wongere ugerageze.</div>}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Amafaranga yemejwe", value: money(summary.approvedAmount), icon: Wallet, tone: "bg-primary/10 text-primary" },
          { label: "Ubusabe butegereje", value: summary.pending, icon: Clock, tone: "bg-secondary/25 text-secondary-foreground" },
          { label: "Ubwishyu bwemejwe", value: summary.approved, icon: Check, tone: "bg-accent/15 text-accent" },
          { label: "Abaveterineri bakora", value: vets.filter(x => x.active).length, icon: Stethoscope, tone: "bg-primary/10 text-primary" },
        ].map(stat => <div key={stat.label} className="rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"><div className="flex items-center justify-between gap-2"><p className="text-sm text-muted-foreground">{stat.label}</p><span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${stat.tone}`}><stat.icon className="h-5 w-5" /></span></div><p className="mt-3 font-heading text-2xl font-bold break-words">{isLoading ? "—" : stat.value}</p></div>)}
      </div>
      <Tabs defaultValue="payments">
        <TabsList><TabsTrigger value="payments">Ubwishyu</TabsTrigger><TabsTrigger value="vets">Abaveterineri</TabsTrigger></TabsList>
        <TabsContent value="payments" className="mt-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-bold">Ubusabe bwo kwishyura <span className="text-sm font-normal text-muted-foreground">({filtered.length})</span></h2><div className="flex w-full flex-wrap gap-2 sm:w-auto"><div className="relative flex-1 sm:w-56"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input aria-label="Shaka ubusabe" placeholder="Shaka telefone cyangwa serivisi" className="pl-9" value={search} onChange={e => setSearch(e.target.value)} /></div><Select value={status} onValueChange={setStatus}><SelectTrigger className="w-40" aria-label="Imimerere y’ubusabe"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Byose</SelectItem><SelectItem value="pending">Bitegereje</SelectItem><SelectItem value="approved">Byemejwe</SelectItem><SelectItem value="rejected">Byanzwe</SelectItem></SelectContent></Select></div></div>
          <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
            <table className="w-full min-w-[650px] text-sm"><thead className="bg-muted/50 text-muted-foreground"><tr>{["Serivisi", "Telefone", "Amafaranga", "Itariki", "Imimerere", "Icyemezo"].map(h => <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>)}</tr></thead><tbody className="divide-y divide-border">{filtered.map(p => <tr key={p.id} className="transition-colors hover:bg-muted/40"><td className="px-4 py-4 font-semibold">{KIND[p.kind] ?? p.kind}</td><td className="px-4 py-4"><a className="text-primary" href={`tel:${p.phone}`}>{p.phone}</a></td><td className="px-4 py-4 whitespace-nowrap font-medium">{money(p.amount)}</td><td className="px-4 py-4 whitespace-nowrap text-muted-foreground">{new Date(p.created_at).toLocaleDateString("en-GB")}</td><td className="px-4 py-4"><span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${p.status === "approved" ? "bg-primary/10 text-primary" : p.status === "rejected" ? "bg-destructive/10 text-destructive" : "bg-secondary/25 text-secondary-foreground"}`}>{p.status === "approved" ? <Check className="h-3 w-3" /> : p.status === "pending" ? <Clock className="h-3 w-3" /> : <X className="h-3 w-3" />}{STATUS[p.status] ?? p.status}</span></td><td className="px-4 py-4">{p.status === "pending" ? <div className="flex gap-2"><Button size="sm" disabled={busy !== null} onClick={() => review(p.id, true)}><Check className="h-4 w-4" />Emeza</Button><Button size="sm" variant="outline" disabled={busy !== null} onClick={() => review(p.id, false)}><X className="h-4 w-4" />Anga</Button></div> : "—"}</td></tr>)}</tbody></table>
            {isLoading ? <p className="p-10 text-center text-muted-foreground">Amakuru arimo kuza…</p> : filtered.length === 0 && <div className="py-12 text-center"><Wallet className="mx-auto mb-3 h-8 w-8 text-muted-foreground" /><p className="text-muted-foreground">{payments.length ? "Nta busabe buhuye n’ibyo washakishije." : "Nta busabe bwo kwishyura buhari."}</p></div>}
          </div>
        </TabsContent>
        <TabsContent value="vets" className="mt-6 space-y-6">
          <h2 className="text-xl font-bold">Abaveterineri ({vets.length})</h2>
          <form onSubmit={addVet} className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-sm"><h3 className="font-semibold">Ongeraho umuveterineri</h3><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{[{ key: "name", label: "Izina" }, { key: "phone", label: "Telefone" }, { key: "district", label: "Akarere" }, { key: "specialty", label: "Umwihariko" }, { key: "fee", label: "Igiciro (RWF)" }].map(f => <div key={f.key}><Label htmlFor={`vet-${f.key}`}>{f.label}</Label><Input id={`vet-${f.key}`} type={f.key === "fee" ? "number" : "text"} min={f.key === "fee" ? 0 : undefined} required={f.key === "name" || f.key === "fee"} value={v[f.key as keyof typeof v]} onChange={e => setV({ ...v, [f.key]: e.target.value })} /></div>)}</div><Button type="submit" disabled={adding}>{adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}Ongeraho</Button></form>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{vets.map(x => <div key={x.id} className="rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"><div className="flex items-start justify-between gap-3"><h3 className="font-bold break-words">{x.name}</h3><Stethoscope className="h-5 w-5 shrink-0 text-primary" /></div><p className="mt-1 text-sm text-muted-foreground">{x.district || "—"} · {x.specialty || "—"}</p><div className="mt-5 flex flex-wrap justify-between gap-2 text-sm"><a href={`tel:${x.phone ?? ""}`} className="text-primary">{x.phone || "—"}</a><span className="font-semibold">{money(x.fee)}</span></div><p className="mt-2 text-xs text-muted-foreground">{x.active ? "Arakora" : "Ntari gukora"}</p></div>)}</div>{!isLoading && !vets.length && <p className="py-8 text-center text-muted-foreground">Nta baveterineri barongerwamo.</p>}
        </TabsContent>
      </Tabs>
    </main>
  </div>;
}
