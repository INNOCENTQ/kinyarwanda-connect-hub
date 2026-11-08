import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useIsFetching, useQuery } from "@tanstack/react-query";
import { Check, X, RefreshCw, Search, Wallet, Clock, Stethoscope, Shield, Plus, Loader2, ClipboardList, UserRound, Power } from "lucide-react";
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
type Consultation = { id: string; user_id: string; vet_id: string | null; description: string; phone: string; status: string; created_at: string };
const money = (amount: number) => `${amount.toLocaleString()} RWF`;
const emptyVet = { name: "", phone: "", district: "", specialty: "", fee: "3000" };
const db = supabase as any;

export default function Admin() {
  const { user, loading } = useAuth();
  const { isAdmin } = usePlan();
  const planLoading = useIsFetching({ queryKey: ["plan", user?.id] }) > 0;
  const nav = useNavigate();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [consultStatus, setConsultStatus] = useState("all");
  const [busy, setBusy] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [v, setV] = useState(emptyVet);
  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ["admin-dashboard", user?.id], enabled: !!user && isAdmin,
    queryFn: async () => {
      // Read every page: totals and filters must not silently omit older payments.
      const payments: Payment[] = [];
      for (let offset = 0; ; offset += 1000) {
        const result = await supabase.from("payment_requests").select("id,kind,amount,phone,status,created_at").order("created_at", { ascending: false }).order("id").range(offset, offset + 999);
        if (result.error) throw result.error;
        payments.push(...(result.data ?? []));
        if ((result.data ?? []).length < 1000) break;
      }
      const [vetResult, consultationResult] = await Promise.all([
        supabase.from("vets").select("*").order("name"),
        db.from("vet_consultations").select("id,user_id,vet_id,description,phone,status,created_at").order("created_at", { ascending: false }),
      ]);
      if (vetResult.error) throw vetResult.error;
      if (consultationResult.error) throw consultationResult.error;
      return { payments, vets: vetResult.data as Vet[], consultations: consultationResult.data as Consultation[] };
    },
  });

  useEffect(() => { if (!loading && !user) nav("/admin/login", { replace: true }); }, [loading, user, nav]);

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

  const reviewConsultation = async (id: string, nextStatus: "confirmed" | "rejected") => {
    setBusy(id);
    try {
      const { error } = await db.rpc("review_vet_consultation", { _id: id, _status: nextStatus });
      if (error) throw error;
      toast.success(nextStatus === "confirmed" ? "Inama yemejwe" : "Inama yanze");
      await refetch();
    } catch { toast.error("Ntibyashobotse guhindura ubusabe bw'inama."); }
    finally { setBusy(null); }
  };

  const addVet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!v.name.trim() || !Number.isFinite(Number(v.fee)) || Number(v.fee) < 0) return;
    setAdding(true);
    try {
      const { error } = await supabase.from("vets").insert({ ...v, name: v.name.trim(), fee: Number(v.fee), phone: v.phone.trim() || null, district: v.district.trim() || null, specialty: v.specialty.trim() || null });
      if (error) throw error;
      setV(emptyVet); toast.success("Umuveterineri yongewemo"); await refetch();
    } catch { toast.error("Ntibyashoboye kongeraho umuveterineri."); }
    finally { setAdding(false); }
  };

  const toggleVet = async (vet: Vet) => {
    setBusy(vet.id);
    try {
      const { error } = await supabase.from("vets").update({ active: !vet.active }).eq("id", vet.id);
      if (error) throw error;
      toast.success(vet.active ? "Umuveterineri yahagaritswe" : "Umuveterineri yongeye gukora");
      await refetch();
    } catch { toast.error("Ntibyashobotse kuvugurura umuveterineri."); }
    finally { setBusy(null); }
  };

  const payments = data?.payments ?? [];
  const vets = data?.vets ?? [];
  const consultations = data?.consultations ?? [];
  const summary = summarizePayments(payments);
  const filtered = payments.filter(p => (status === "all" || p.status === status) && `${p.phone} ${KIND[p.kind] ?? p.kind}`.toLowerCase().includes(search.toLowerCase()));
  const filteredConsultations = useMemo(() => consultations.filter(c => consultStatus === "all" || c.status === consultStatus), [consultations, consultStatus]);
  const vetNames = useMemo(() => Object.fromEntries(vets.map(vet => [vet.id, vet.name])), [vets]);

  if (loading || planLoading) return <div className="min-h-screen bg-background"><AppNav /><div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div></div>;
  if (!isAdmin) return <div className="min-h-screen bg-background"><AppNav /><main className="mx-auto max-w-md px-4 py-20 text-center"><Shield className="mx-auto mb-4 h-10 w-10 text-muted-foreground" /><h1 className="text-xl font-bold">Ubuyobozi gusa</h1><p className="mt-2 text-muted-foreground">Konti yawe ntiyemerewe gufungura uru rupapuro.</p><Button className="mt-5" onClick={() => nav("/admin/login")}>Injira nk'umuyobozi</Button></main></div>;

  return <div className="min-h-screen bg-background">
    <AppNav />
    <main className="mx-auto max-w-6xl px-4 py-8 space-y-8">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-accent p-6 text-primary-foreground shadow-lg sm:p-8 flex flex-wrap items-center justify-between gap-4">
        <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-secondary/30 blur-2xl" />
        <div className="relative"><p className="flex items-center gap-2 text-sm font-semibold text-secondary"><Shield className="h-4 w-4" />Umuhinzi AI · Ubuyobozi</p><h1 className="mt-2 font-heading text-3xl font-bold">Dashboard y’umuyobozi</h1><p className="mt-1 text-sm opacity-80">Kurikirana ubwishyu, ubusabe bw'ubuveterineri n'abaganga.</p></div>
        <Button variant="secondary" className="relative" onClick={() => refetch()} disabled={isFetching}><RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />Vugurura</Button>
      </div>
      {error && <div role="alert" className="border border-destructive rounded-lg p-4 text-destructive">Amakuru ntiyabonetse. Kanda Vugurura wongere ugerageze.</div>}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Amafaranga yemejwe", value: money(summary.approvedAmount), icon: Wallet, tone: "bg-primary/10 text-primary" },
          { label: "Ubusabe bwo kwishyura", value: summary.pending, icon: Clock, tone: "bg-secondary/25 text-secondary-foreground" },
          { label: "Inama zitegereje", value: consultations.filter(c => c.status === "pending").length, icon: ClipboardList, tone: "bg-accent/15 text-accent" },
          { label: "Abaveterineri bakora", value: vets.filter(x => x.active).length, icon: Stethoscope, tone: "bg-primary/10 text-primary" },
        ].map(stat => <div key={stat.label} className="rounded-2xl border border-border bg-card p-5 shadow-sm"><div className="flex items-center justify-between gap-2"><p className="text-sm text-muted-foreground">{stat.label}</p><span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${stat.tone}`}><stat.icon className="h-5 w-5" /></span></div><p className="mt-3 font-heading text-2xl font-bold break-words">{isLoading ? "—" : stat.value}</p></div>)}
      </div>
      <Tabs defaultValue="payments">
        <TabsList className="h-auto flex-wrap"><TabsTrigger value="payments">Ubwishyu</TabsTrigger><TabsTrigger value="consultations">Inama za veterineri</TabsTrigger><TabsTrigger value="vets">Abaveterineri</TabsTrigger></TabsList>
        <TabsContent value="payments" className="mt-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-bold">Ubusabe bwo kwishyura <span className="text-sm font-normal text-muted-foreground">({filtered.length})</span></h2><div className="flex w-full flex-wrap gap-2 sm:w-auto"><div className="relative flex-1 sm:w-56"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input aria-label="Shaka ubusabe" placeholder="Shaka telefone cyangwa serivisi" className="pl-9" value={search} onChange={e => setSearch(e.target.value)} /></div><Select value={status} onValueChange={setStatus}><SelectTrigger className="w-40" aria-label="Imimerere y’ubusabe"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Byose</SelectItem><SelectItem value="pending">Bitegereje</SelectItem><SelectItem value="approved">Byemejwe</SelectItem><SelectItem value="rejected">Byanzwe</SelectItem></SelectContent></Select></div></div>
          <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm"><table className="w-full min-w-[650px] text-sm"><thead className="bg-muted/50 text-muted-foreground"><tr>{["Serivisi", "Telefone", "Amafaranga", "Itariki", "Imimerere", "Icyemezo"].map(h => <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>)}</tr></thead><tbody className="divide-y divide-border">{filtered.map(p => <tr key={p.id} className="hover:bg-muted/40"><td className="px-4 py-4 font-semibold">{KIND[p.kind] ?? p.kind}</td><td className="px-4 py-4"><a className="text-primary" href={`tel:${p.phone}`}>{p.phone}</a></td><td className="px-4 py-4 whitespace-nowrap font-medium">{money(p.amount)}</td><td className="px-4 py-4 whitespace-nowrap text-muted-foreground">{new Date(p.created_at).toLocaleDateString("en-GB")}</td><td className="px-4 py-4">{STATUS[p.status] ?? p.status}</td><td className="px-4 py-4">{p.status === "pending" ? <div className="flex gap-2"><Button size="sm" disabled={busy !== null} onClick={() => review(p.id, true)}><Check className="h-4 w-4" />Emeza</Button><Button size="sm" variant="outline" disabled={busy !== null} onClick={() => review(p.id, false)}><X className="h-4 w-4" />Anga</Button></div> : "—"}</td></tr>)}</tbody></table>{isLoading ? <p className="p-10 text-center text-muted-foreground">Amakuru arimo kuza…</p> : filtered.length === 0 && <p className="py-12 text-center text-muted-foreground">Nta busabe buhari.</p>}</div>
        </TabsContent>
        <TabsContent value="consultations" className="mt-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-bold">Ubusabe bw'inama za veterineri</h2><p className="text-sm text-muted-foreground">Reba ikibazo, hamagara umukiriya, wemeze cyangwa wange ubusabe.</p></div><Select value={consultStatus} onValueChange={setConsultStatus}><SelectTrigger className="w-44" aria-label="Shungura inama"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Imimerere yose</SelectItem><SelectItem value="pending">Bitegereje</SelectItem><SelectItem value="confirmed">Byemejwe</SelectItem><SelectItem value="rejected">Byanzwe</SelectItem></SelectContent></Select></div>
          <div className="grid gap-4">{filteredConsultations.map(c => <article key={c.id} className="rounded-2xl border border-border bg-card p-5 shadow-sm"><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-semibold">{vetNames[c.vet_id ?? ""] ?? "Umuveterineri utazwi"}</h3><p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground"><UserRound className="h-4 w-4" />Umukiriya · {c.user_id.slice(0, 8)}</p></div><span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold">{STATUS[c.status] ?? c.status}</span></div><p className="mt-4 whitespace-pre-wrap text-sm">{c.description}</p><div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4"><div className="text-sm"><a className="font-semibold text-primary" href={`tel:${c.phone}`}>{c.phone}</a><p className="text-xs text-muted-foreground">{new Date(c.created_at).toLocaleString("rw-RW")}</p></div>{c.status === "pending" && <div className="flex gap-2"><Button size="sm" disabled={busy !== null} onClick={() => reviewConsultation(c.id, "confirmed")}><Check className="h-4 w-4" />Emeza</Button><Button size="sm" variant="outline" disabled={busy !== null} onClick={() => reviewConsultation(c.id, "rejected")}><X className="h-4 w-4" />Anga</Button></div>}</div></article>)}{!isLoading && filteredConsultations.length === 0 && <p className="rounded-xl border border-dashed border-border py-12 text-center text-muted-foreground">Nta busabe bw'inama buhari.</p>}</div>
        </TabsContent>
        <TabsContent value="vets" className="mt-6 space-y-6">
          <h2 className="text-xl font-bold">Abaveterineri ({vets.length})</h2>
          <form onSubmit={addVet} className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-sm"><h3 className="font-semibold">Ongeraho umuveterineri</h3><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{[{ key: "name", label: "Izina" }, { key: "phone", label: "Telefone" }, { key: "district", label: "Akarere" }, { key: "specialty", label: "Umwihariko" }, { key: "fee", label: "Igiciro (RWF)" }].map(f => <div key={f.key}><Label htmlFor={`vet-${f.key}`}>{f.label}</Label><Input id={`vet-${f.key}`} type={f.key === "fee" ? "number" : "text"} min={f.key === "fee" ? 0 : undefined} required={f.key === "name" || f.key === "fee"} value={v[f.key as keyof typeof v]} onChange={e => setV({ ...v, [f.key]: e.target.value })} /></div>)}</div><Button type="submit" disabled={adding}>{adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}Ongeraho</Button></form>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{vets.map(x => <div key={x.id} className="rounded-2xl border border-border bg-card p-5 shadow-sm"><div className="flex items-start justify-between gap-3"><h3 className="font-bold break-words">{x.name}</h3><Stethoscope className="h-5 w-5 shrink-0 text-primary" /></div><p className="mt-1 text-sm text-muted-foreground">{x.district || "—"} · {x.specialty || "—"}</p><div className="mt-5 flex flex-wrap justify-between gap-2 text-sm"><a href={`tel:${x.phone ?? ""}`} className="text-primary">{x.phone || "Nta telefone"}</a><span className="font-semibold">{money(x.fee)}</span></div><div className="mt-4 flex items-center justify-between border-t border-border pt-3"><span className={`text-xs font-medium ${x.active ? "text-primary" : "text-muted-foreground"}`}>{x.active ? "Arakora" : "Yahagaritswe"}</span><Button variant="outline" size="sm" disabled={busy !== null} onClick={() => toggleVet(x)}><Power className="h-4 w-4" />{x.active ? "Hagarika" : "Ongera ukore"}</Button></div></div>)}</div>{!isLoading && !vets.length && <p className="py-8 text-center text-muted-foreground">Nta baveterineri barongerwamo.</p>}
        </TabsContent>
      </Tabs>
    </main>
  </div>;
}
