import { forwardRef, useEffect, useState } from "react";
import { Megaphone, Phone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Ad = { id: string; business_name: string; title: string; description: string | null; phone: string | null; link_url: string | null; image_url: string | null };

const safeUrl = (u: string | null) => (u && /^https?:\/\//i.test(u) ? u : null);

const AdBanner = forwardRef<HTMLElement, { limit?: number }>(function AdBanner({ limit = 3 }, ref) {
  const [ads, setAds] = useState<Ad[]>([]);
  useEffect(() => {
    (supabase as any).from("ads").select("id,business_name,title,description,phone,link_url,image_url").eq("active", true).order("created_at", { ascending: false }).limit(limit)
      .then(({ data }: any) => setAds((data || []).filter((a: any) => a)));
  }, [limit]);
  if (!ads.length) return null;
  return (
    <section ref={ref} aria-label="Amatangazo" className="space-y-2">
      <p className="flex items-center gap-1 text-xs font-bold uppercase text-muted-foreground"><Megaphone className="h-3 w-3" /> Amatangazo</p>
      <div className="grid gap-3 sm:grid-cols-3">
        {ads.map(a => (
          <div key={a.id} className="flex gap-3 rounded-lg border border-secondary/60 bg-secondary/10 p-3">
            {a.image_url && <img src={a.image_url} alt={a.business_name} className="h-14 w-14 rounded object-cover" loading="lazy" />}
            <div className="min-w-0 text-sm">
              <p className="font-bold text-foreground">{a.title}</p>
              <p className="text-xs text-muted-foreground">{a.business_name}</p>
              {a.description && <p className="line-clamp-2 text-xs text-muted-foreground">{a.description}</p>}
              <div className="mt-1 flex gap-3 text-xs font-bold text-primary">
                {a.phone && <a href={`tel:${a.phone}`} className="flex items-center gap-1"><Phone className="h-3 w-3" />{a.phone}</a>}
                {safeUrl(a.link_url) && <a href={safeUrl(a.link_url)!} target="_blank" rel="noopener noreferrer sponsored">Sura</a>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
});

export default AdBanner;
