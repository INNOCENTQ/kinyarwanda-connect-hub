import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const db = supabase as any;

export const PRICES = { premium: 2000, featured: 1000, ad: 5000 } as const;

/** Returns premium status, this month's diagnosis count and admin flag. `refreshKey` re-fetches. */
export function usePlan(refreshKey?: unknown) {
  const { user } = useAuth();
  const [premium, setPremium] = useState(false);
  const [activeUntil, setActiveUntil] = useState<string | null>(null);
  const [used, setUsed] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!user) return;
    const start = new Date(); start.setUTCDate(1); start.setUTCHours(0, 0, 0, 0);
    (async () => {
      const [{ data: sub }, { count }, { data: roles }] = await Promise.all([
        db.from("subscriptions").select("active_until").eq("user_id", user.id).maybeSingle(),
        db.from("diagnosis_records").select("id", { count: "exact", head: true }).eq("user_id", user.id).gte("created_at", start.toISOString()),
        db.from("user_roles").select("role").eq("user_id", user.id),
      ]);
      const until = sub?.active_until ?? null;
      setActiveUntil(until);
      setPremium(!!until && new Date(until) > new Date());
      setUsed(count ?? 0);
      setIsAdmin(!!roles?.some((r: any) => r.role === "admin"));
    })();
  }, [user, refreshKey]);

  return { premium, activeUntil, used, isAdmin };
}
