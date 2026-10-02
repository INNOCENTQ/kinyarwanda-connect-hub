import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

type Kind = "premium" | "featured" | "ad" | "vet";

export default function PayDialog({ open, onOpenChange, kind, amount, referenceId, title, onDone }: {
  open: boolean; onOpenChange: (o: boolean) => void; kind: Kind; amount: number; referenceId?: string; title: string; onDone?: () => void;
}) {
  const { user } = useAuth();
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!user) return;
    if (!/^0?7\d{8}$/.test(phone.replace(/\s/g, ""))) { toast.error("Andika nimero ya telefone nyayo (07...)"); return; }
    setSaving(true);
    const { error } = await (supabase as any).from("payment_requests").insert({ user_id: user.id, kind, amount, phone, reference_id: referenceId ?? null });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Ubusabe bwakiriwe! Tuzaguhamagara tukwereke uko wishyura.");
    onOpenChange(false);
    onDone?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>Igiciro: <b className="text-foreground">{amount.toLocaleString()} RWF</b>. Tanga nimero yawe, tuzaguhamagara twemeze kwishyura. Bikimara kwemezwa, serivisi ihita ikora.</DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="pay-phone">Nimero ya telefone</Label>
          <Input id="pay-phone" inputMode="tel" placeholder="078..." value={phone} onChange={e => setPhone(e.target.value)} />
        </div>
        <Button onClick={submit} disabled={saving} className="w-full">{saving && <Loader2 className="h-4 w-4 animate-spin" />}Ohereza ubusabe</Button>
      </DialogContent>
    </Dialog>
  );
}
