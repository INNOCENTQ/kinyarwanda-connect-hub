import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppNav from "@/components/AppNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { usePlan } from "@/hooks/usePlan";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { KIND, STATUS } from "./Premium";

const db = supabase as any;

export default function Admin() {
  const { user, loading } = useAuth();
  const { isAdmin } = usePlan();
  const nav = useNavigate();
  const [reqs, setReqs] = useState<any[]>([]);
  const [vets, setVets] = useState<any[]>([]);
  const [v, setV] = useState({ name: "", phone: "", district: "", specialty: "", fee: "3000" });

  useEffect(() => { if (!loading && !user) nav("/auth"); }, [loading, user, nav]);
  const load = async () => {
    const [{ data: r }, { data: vs }] = await Promise.all([
      db.from("payment_requests").select("*").order("created_at", { ascending: false }).limit(100),
      db.from("vets").select("*").order("name"),
    ]);
    setReqs(r || []); setVets(vs || []);
  };
  useEffect(() => { if (isAdmin) load(); }, [isAdmin]);

  const review = async (id: string, approve: boolean) => {
    const { error } = await db.rpc("review_payment", { _id: id, _approve: approve });
    if (error) toast.error(error.message); else { toast.success(approve ? "Byemejwe" : "Byanzwe"); load(); }
  };
  const addVet = async () => {
    if (!v.name) return;
    const { error } = await db.from("vets").insert({ ...v, fee: Number(v.fee) || 0 });
    if (error) toast.error(error.message); else { setV({ name: "", phone: "", district: "", specialty: "", fee: "3000" }); load(); }
  };

  if (!isAdmin) return (<div className="min-h-screen bg-background"><AppNav /><p className="py-16 text-center text-muted-foreground">Uru rupapuro ni urw'umuyobozi gusa.</p></div>);

  const approvedTotal = reqs.filter(r => r.status === "approved").reduce((s, r) => s + r.amount, 0);

  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <main className="mx-auto max-w-5xl space-y-8 px-4 py-8">
        <div>
          <h1 className="text-3xl font-bold">Ubuyobozi</h1>
          <p className="text-muted-foreground">Amafaranga yemejwe yose: <b className="text-primary">{approvedTotal.toLocaleString()} RWF</b></p>
        </div>
        <section>
          <h2 className="mb-3 text-xl font-bold">Ubusabe bwo kwishyura</h2>
          <div className="divide-y divide-border rounded-lg border border-border bg-card text-sm">
            {reqs.length === 0 && <p className="p-4 text-muted-foreground">Nta busabe buhari.</p>}
            {reqs.map(r => (
              <div key={r.id} className="flex flex-wrap items-center justify-between gap-2 p-3">
                <div><b>{KIND[r.kind]}</b> — {r.amount.toLocaleString()} RWF · <a className="text-primary" href={`tel:${r.phone}`}>{r.phone}</a><div className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString()}</div></div>
                {r.status === "pending" ? (
                  <div className="flex gap-2"><Button size="sm" onClick={() => review(r.id, true)}>Emeza</Button><Button size="sm" variant="outline" onClick={() => review(r.id, false)}>Anga</Button></div>
                ) : <span className="font-bold">{STATUS[r.status]}</span>}
              </div>
            ))}
          </div>
        </section>
        <section>
          <h2 className="mb-3 text-xl font-bold">Abaveterineri</h2>
          <div className="grid gap-2 sm:grid-cols-6">
            <Input className="sm:col-span-2" placeholder="Izina" value={v.name} onChange={e => setV({ ...v, name: e.target.value })} />
            <Input placeholder="Telefone" value={v.phone} onChange={e => setV({ ...v, phone: e.target.value })} />
            <Input placeholder="Akarere" value={v.district} onChange={e => setV({ ...v, district: e.target.value })} />
            <Input placeholder="Igiciro" type="number" value={v.fee} onChange={e => setV({ ...v, fee: e.target.value })} />
            <Button onClick={addVet}>Ongeraho</Button>
          </div>
          <ul className="mt-3 divide-y divide-border rounded-lg border border-border bg-card text-sm">
            {vets.map(x => <li key={x.id} className="flex justify-between p-3"><span>{x.name} · {x.district} · {x.phone}</span><span>{x.fee.toLocaleString()} RWF</span></li>)}
          </ul>
        </section>
      </main>
    </div>
  );
}
