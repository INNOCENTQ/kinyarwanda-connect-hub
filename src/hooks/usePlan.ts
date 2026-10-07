import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const db = supabase as any;

export const PRICES = { premium: 2000, featured: 1000, ad: 5000 } as const;

/** Premium status, this month's diagnosis count and admin flag — cached and shared across pages. `refreshKey` forces a refetch. */
export function usePlan(refreshKey?: unknown) {
  const { user } = useAuth();
  const uid = user?.id;
  const { data } = useQuery({
    queryKey: ["plan", uid, refreshKey ?? null],
    enabled: !!uid,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const start = new Date(); start.setUTCDate(1); start.setUTCHours(0, 0, 0, 0);
      const [{ data: sub }, { count }, { data: roles }] = await Promise.all([
        db.from("subscriptions").select("active_until").eq("user_id", uid).maybeSingle(),
        db.from("diagnosis_records").select("id", { count: "exact", head: true }).eq("user_id", uid).gte("created_at", start.toISOString()),
        db.from("user_roles").select("role").eq("user_id", uid),
      ]);
      const until: string | null = sub?.active_until ?? null;
      return {
        activeUntil: until,
        premium: !!until && new Date(until) > new Date(),
        used: count ?? 0,
        isAdmin: !!roles?.some((r: any) => r.role === "admin"),
      };
    },
  });
  return data ?? { premium: false, activeUntil: null, used: 0, isAdmin: false };
}
