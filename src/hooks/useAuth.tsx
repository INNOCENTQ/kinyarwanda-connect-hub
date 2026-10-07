import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";

type AuthCtx = { user: User | null; session: Session | null; loading: boolean; signOut: () => Promise<void> };
const Ctx = createContext<AuthCtx>({ user: null, session: null, loading: true, signOut: async () => {} });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      // Only replace state when the user actually changes, so pages don't reload data on token refresh
      setSession(prev => (prev?.user?.id === s?.user?.id && prev?.access_token === s?.access_token ? prev : s));
      setLoading(false);
    });
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setLoading(false); });
    return () => sub.subscription.unsubscribe();
  }, []);

  const userId = session?.user?.id;
  // Stable user object per account id
  const user = useMemo(() => session?.user ?? null, [userId]); // eslint-disable-line react-hooks/exhaustive-deps
  const value = useMemo(() => ({ user, session, loading, signOut: async () => { await supabase.auth.signOut(); } }), [user, session, loading]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
