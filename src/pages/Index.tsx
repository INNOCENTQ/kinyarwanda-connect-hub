import { ArrowRight, Camera, CloudSun, MapPin, MessageCircle, Mic, Stethoscope, Store } from "lucide-react";
import { Link } from "react-router-dom";
import AppNav from "@/components/AppNav";
import { Button } from "@/components/ui/button";
import heroFarmer from "@/assets/rwanda-terraced-farmer.jpg";
import cattleCare from "@/assets/ankole-cattle-care.jpg";
import farmMarket from "@/assets/rwanda-farm-market.jpg";

const HOW = [
  { icon: Camera, title: "1. Fotora", desc: "Fotora itungo ryarwaye cyangwa igihingwa" },
  { icon: Mic, title: "2. Vuga / Andika", desc: "Tanga ibimenyetso cg ufate ijwi ry'itungo" },
  { icon: MapPin, title: "3. Akera aho uri", desc: "AI yifashisha aho uri n'ikirere" },
  { icon: Stethoscope, title: "4. Akira igisubizo", desc: "Indwara, umuti, n'inama zihuse" },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <main className="mx-auto w-full max-w-6xl px-4 py-5 sm:py-8">
        <section aria-label="Serivisi za Umuhinzi AI" className="grid grid-cols-1 gap-4 md:grid-cols-4 md:grid-rows-2 md:min-h-[650px]">
          <article className="group relative min-h-[520px] overflow-hidden rounded-lg bg-primary md:col-span-2 md:row-span-2">
            <img src={heroFarmer} alt="Umuhinzi mu murima w'amaterasi mu Rwanda" width={1600} height={1200} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 motion-reduce:transition-none group-hover:scale-[1.03]" />
            <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/45 to-transparent" />
            <div className="relative flex h-full min-h-[520px] flex-col justify-end p-6 sm:p-10">
              <div className="mb-4 flex items-center gap-3 text-secondary">
                <span className="h-0.5 w-8 bg-secondary" aria-hidden="true" />
                <span className="text-xs font-bold uppercase tracking-normal">Ikoranabuhanga ry'umuhinzi</span>
              </div>
              <h1 className="max-w-xl text-3xl font-bold leading-tight text-primary-foreground sm:text-5xl">Ubwenge bw'ubukorano mu buhinzi n'ubworozi</h1>
              <p className="mt-5 max-w-lg text-base leading-relaxed text-primary-foreground/90 sm:text-lg">Menya ikirere cy'aho uri, suzumisha amatungo n'ibihingwa, kandi ubone inama zihuse mu Kinyarwanda.</p>
              <div className="mt-7">
                <Button asChild size="lg" variant="secondary" className="font-bold">
                  <Link to="/diagnose">Tangira nonaha <ArrowRight /></Link>
                </Button>
              </div>
            </div>
          </article>

          <Link to="/weather" className="group flex min-h-64 flex-col justify-between rounded-lg border border-border bg-card p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md motion-reduce:transition-none md:p-7">
            <div className="flex items-start justify-between">
              <span className="flex h-14 w-14 items-center justify-center rounded-lg bg-background text-accent"><CloudSun className="h-8 w-8" /></span>
              <span className="flex items-center gap-1 text-xs font-bold uppercase text-primary"><MapPin className="h-4 w-4" /> Aho uri</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Ikirere</h2>
              <p className="mt-2 text-sm text-muted-foreground">Reba iteganyagihe n'inama z'iminsi 7 zishingiye aho uri.</p>
            </div>
          </Link>

          <Link to="/diagnose" className="group relative min-h-64 overflow-hidden rounded-lg bg-primary shadow-sm">
            <img src={cattleCare} alt="Umworozi asuzuma inka mu rwuri" width={1200} height={912} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 motion-reduce:transition-none group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/30 to-transparent" />
            <div className="relative flex h-full min-h-64 flex-col justify-between p-6 text-primary-foreground">
              <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-background/90 text-primary"><Stethoscope className="h-6 w-6" /></span>
              <div><h2 className="text-2xl font-bold">Gusuzuma</h2><p className="mt-1 text-sm text-primary-foreground/90">Fata ifoto cyangwa ijwi ry'itungo, ubone inama yihuse.</p></div>
            </div>
          </Link>

          <Link to="/chat" className="flex min-h-64 flex-col gap-5 rounded-lg border border-border bg-card p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md motion-reduce:transition-none md:p-7">
            <div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-primary-foreground"><MessageCircle className="h-5 w-5" /></span><h2 className="text-xl font-bold">AI Chat</h2></div>
            <p className="flex-1 rounded-lg bg-background p-4 text-sm text-muted-foreground">Baza ikibazo kijyanye n'ifumbire, imbuto cyangwa amatungo...</p>
            <span className="flex items-center justify-between text-sm font-bold text-primary">Tangira ikiganiro <ArrowRight className="h-4 w-4" /></span>
          </Link>

          <Link to="/marketplace" className="group relative min-h-64 overflow-hidden rounded-lg border border-border bg-card shadow-sm">
            <img src={farmMarket} alt="Umusaruro w'ibirayi, ibishyimbo n'ibigori ku isoko" width={1200} height={912} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 motion-reduce:transition-none group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/35 to-transparent" />
            <div className="relative flex h-full min-h-64 flex-col justify-end p-6 text-background">
              <div className="flex items-end justify-between gap-4"><div><h2 className="text-2xl font-bold">Isoko</h2><p className="mt-1 text-sm text-background/90">Gurisha cyangwa ugure umusaruro hafi yawe.</p></div><Store className="h-7 w-7 shrink-0 text-secondary" /></div>
            </div>
          </Link>
        </section>
      </main>

      <section className="mt-8 bg-muted/40 py-14">
        <div className="max-w-5xl mx-auto px-4">
          <div className="mb-10 max-w-xl"><p className="mb-2 text-sm font-bold text-primary">BYOROSHYE GUKORESHA</p><h2 className="text-2xl sm:text-3xl font-bold text-foreground">Uko ubona ubufasha</h2></div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW.map((h, i) => (
              <div key={i} className="space-y-3">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary text-primary-foreground"><h.icon className="h-6 w-6" /></div>
                <h3 className="font-bold text-foreground">{h.title}</h3>
                <p className="text-sm text-muted-foreground">{h.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        © 2026 Umuhinzi AI — MIGAMBI Innocent 🇷🇼
      </footer>
    </div>
  );
};

export default Index;
