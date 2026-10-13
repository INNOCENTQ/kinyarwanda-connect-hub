import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export function useLocationPreference() {
  const { user, loading: authLoading } = useAuth();
  const query = useQuery({
    queryKey: ["location-preference", user?.id],
    enabled: !!user,
    queryFn: async () => {
      if (!user) return true;
      const { data, error } = await supabase.from("profiles").select("share_location").eq("user_id", user.id).maybeSingle();
      if (error) throw error;
      return data?.share_location !== false;
    },
  });
  return {
    loading: authLoading || (!!user && query.isPending),
    allowed: !authLoading && (!user || (!query.isPending && !query.isError && query.data === true)),
  };
}