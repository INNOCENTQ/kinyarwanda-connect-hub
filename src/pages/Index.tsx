import { ArrowRight, CloudSun, MapPin, MessageCircle, Stethoscope, Store } from "lucide-react";
import { Link } from "react-router-dom";
import AppNav from "@/components/AppNav";
import AdBanner from "@/components/AdBanner";
import { Button } from "@/components/ui/button";
import heroFarmer from "@/assets/rwanda-terraced-farmer.jpg";
import cattleCare from "@/assets/ankole-cattle-care.jpg";
import farmMarket from "@/assets/rwanda-farm-market.jpg";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <main className="mx-auto w-full max-w-6xl px-4 py-5 sm:py-8">
        <section aria-label="Umuhinzi AI" className="relative -mx-4 mb-8 overflow-hidden bg-primary sm:mx-0">
          <img src={heroFarmer} alt="Umuhinzi mu murima w'amaterasi mu Rwanda" width={1600} height={1200} fetchPriority="high" className="absolute inset-0 h-full w-full object-cover object-top" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/65 to-transparent" />
          <div className="relative flex min-h-[420px] flex-col justify-end px-6 py-10 sm:min-h-[480px] sm:px-12 sm:py-12">
            <p className="mb-4 text-sm font-bold text-secondary">UMUJYANAMA W'UMUHINZI N'UMWOROZI</p>
            <h1 className="text-4xl font-bold leading-tight text-primary-foreground sm:text-5xl">Umuhinzi AI</h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-primary-foreground/90 sm:text-lg">Menya ikirere cy'aho uri, suzumisha amatungo n'ibihingwa, kandi ubone inama zihuse mu Kinyarwanda.</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild size="lg" variant="secondary" className="font-bold"><Link to="/diagnose">Suzumisha <ArrowRight /></Link></Button>
              <Button asChild size="lg" variant="secondary" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"><Link to="/weather"><CloudSun />Ikirere cy'aho ndi</Link></Button>
            </div>
          </div>
        </section>
        <div className="mb-5 flex items-center justify-between"><h2 className="text-xl font-bold sm:text-2xl">Serivisi zacu</h2><span className="text-sm text-muted-foreground">Mu Kinyarwanda</span></div>
        <section aria-label="Serivisi za Umuhinzi AI" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
        <div className="mt-6"><AdBanner /></div>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto grid max-w-5xl gap-8 px-4 py-10 md:grid-cols-2">
          <div>
            <h3 className="text-lg font-bold text-foreground">Ibyerekeye Umuhinzi AI</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Umuhinzi AI ni urubuga rukorwa mu Rwanda rufasha abahinzi n'aborozi gukoresha ikoranabuhanga mu buzima bwabo bwa minsi yose. Ureba ikirere cy'aho uri, usuzumisha amatungo n'ibihingwa birwaye ukoresheje ifoto cyangwa ijwi, ubone inama zihuse mu Kinyarwanda, kandi uhuzwe n'abandi bahinzi ku isoko — byose bikorwa na telefone ntoya.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Uru rubuga rwaturutse ku gitekerezo cya <span className="font-bold text-foreground">MIGAMBI Innocent</span>, umunyeshuri w'ikoranabuhanga (Level 4, Software Development), agamije kugeza ikoranabuhanga ku bahinzi n’aborozi.
            </p>
          </div>
          <div className="md:text-right">
            <h3 className="text-lg font-bold text-foreground">Serivisi zacu</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><Link to="/weather" className="hover:text-primary">Ikirere n'iteganyagihe</Link></li>
              <li><Link to="/diagnose" className="hover:text-primary">Gusuzuma amatungo n'ibihingwa</Link></li>
              <li><Link to="/chat" className="hover:text-primary">AI Chat — inama zihuse</Link></li>
              <li><Link to="/marketplace" className="hover:text-primary">Isoko ry'abahinzi n'aborozi</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border py-6 text-center text-sm text-muted-foreground">
          © 2026 Umuhinzi AI — MIGAMBI Innocent
        </div>
      </footer>
    </div>
  );
};

export default Index;
