import { ArrowRight, CloudSun, MessageCircle, Sprout, Stethoscope, Store, Sun } from "lucide-react";
import { Link } from "react-router-dom";
import AppNav from "@/components/AppNav";
import AdBanner from "@/components/AdBanner";
import HeroCarousel from "@/components/HeroCarousel";
import { Button } from "@/components/ui/button";
import heroFarmer from "@/assets/rwanda-terraced-farmer.jpg";
import cattleCare from "@/assets/ankole-cattle-care.jpg";
import farmMarket from "@/assets/rwanda-farm-market.jpg";

const services = [
  { to: "/weather", eyebrow: "HITEGURE NEZA", title: "Ikirere cy'aho uri", description: "Iteganyagihe ry'iminsi 7 n'inama zijyanye n'ibikorwa by'ubuhinzi n'ubworozi.", icon: CloudSun, tone: "bg-sky-50 text-sky-700" },
  { to: "/diagnose", eyebrow: "KUMENYA VUBA", title: "Suzumisha AI", description: "Fata ifoto y'igihingwa cyangwa itungo, ubone ibisobanuro n'intambwe wakurikiza.", icon: Stethoscope, tone: "bg-emerald-50 text-emerald-700" },
  { to: "/chat", eyebrow: "IKIGANIRO MU KINYARWANDA", title: "Baza Umujyanama AI", description: "Baza ku mbuto, indwara z'ibihingwa n'iz'amatungo, ifumbire, ubworozi n'ibindi bikenerwa mu murima.", icon: MessageCircle, tone: "bg-amber-50 text-amber-700" },
  { to: "/marketplace", eyebrow: "HUZA ABAGUZI N'ABAGURISHA", title: "Isoko ry'abahinzi", description: "Menyesha umusaruro wawe cyangwa ushake ibicuruzwa biboneka hafi yawe.", icon: Store, tone: "bg-lime-50 text-lime-800" },
];

const Index = () => (
  <div className="min-h-screen bg-background">
    <AppNav />
    <main className="mx-auto w-full max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
      <HeroCarousel />

      <section className="py-14 sm:py-20" aria-labelledby="services-heading">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div><p className="text-xs font-bold tracking-[0.18em] text-primary">IBIKENEWE MU BUHINZI N'UBWOROZI</p><h2 id="services-heading" className="mt-2 font-heading text-3xl font-bold tracking-tight sm:text-4xl">Ibikoresho bigufasha gutera imbere</h2></div>
          <p className="max-w-md text-sm leading-6 text-muted-foreground">Serivisi zifasha kwita ku bihingwa n'amatungo, gufata ibyemezo no guhuza abahinzi n'amasoko.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {services.map(({ to, eyebrow, title, description, icon: Icon, tone }) => (
            <Link key={to} to={to} className="group rounded-2xl border border-border/70 bg-card p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <div className="flex items-center justify-between"><span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${tone}`}><Icon className="h-6 w-6" /></span><ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" /></div>
              <p className="mt-7 text-[10px] font-bold tracking-[0.15em] text-primary">{eyebrow}</p>
              <h3 className="mt-2 font-heading text-xl font-bold">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section aria-labelledby="sectors-heading" className="py-2">
        <div className="mb-8 max-w-2xl"><p className="text-xs font-bold tracking-[0.18em] text-primary">INKUNGA ZOMBI ZOMBI</p><h2 id="sectors-heading" className="mt-2 font-heading text-3xl font-bold tracking-tight sm:text-4xl">Dufasha ibihingwa n'amatungo</h2><p className="mt-3 text-sm leading-6 text-muted-foreground">Hitamo ibyo ukeneye: inama ku bihingwa cyangwa ubufasha ku matungo. Byombi bifite umwanya ungana kuri Umuhinzi AI.</p></div>
        <div className="grid gap-5 lg:grid-cols-2">
          <Link to="/diagnose" className="group relative min-h-[360px] overflow-hidden rounded-[1.75rem] bg-primary shadow-md">
            <img src={heroFarmer} alt="Umuhinzi mu murima w'amaterasi mu Rwanda" width={1200} height={900} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 motion-reduce:transition-none" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#082719]/95 via-[#082719]/15 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-6 p-7 text-white sm:p-9"><div><span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold backdrop-blur">UBUHINZI N'IBIHINGWA</span><h3 className="mt-4 font-heading text-2xl font-bold sm:text-3xl">Ibihingwa bizima, umusaruro mwiza.</h3><p className="mt-2 max-w-md text-sm leading-6 text-white/85">Saba ubufasha ku ndwara z'ibihingwa, imbuto, ifumbire n'ibindi byo mu murima.</p></div><ArrowRight className="mb-1 h-6 w-6 shrink-0 transition-transform group-hover:translate-x-1" /></div>
          </Link>
          <Link to="/diagnose" className="group relative min-h-[360px] overflow-hidden rounded-[1.75rem] bg-primary shadow-md">
            <img src={cattleCare} alt="Umworozi yita ku nka mu rwuri" width={1200} height={912} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 motion-reduce:transition-none" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#082719]/95 via-[#082719]/15 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-6 p-7 text-white sm:p-9"><div><span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold backdrop-blur">UBWOROZI N'AMATUNGO</span><h3 className="mt-4 font-heading text-2xl font-bold sm:text-3xl">Amatungo meza, ubworozi burambye.</h3><p className="mt-2 max-w-md text-sm leading-6 text-white/85">Menya ibimenyetso by'indwara, ubone inama z'ibanze, cyangwa ushake veterineri.</p></div><ArrowRight className="mb-1 h-6 w-6 shrink-0 transition-transform group-hover:translate-x-1" /></div>
          </Link>
        </div>
      </section>

      <section className="relative my-14 min-h-[260px] overflow-hidden rounded-[1.75rem] bg-[#1a3426] sm:my-20">
        <img src={farmMarket} alt="Umusaruro w'abahinzi bo mu Rwanda ku isoko" width={1200} height={912} loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-45" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#102819]/95 via-[#102819]/75 to-[#102819]/35" />
        <div className="relative flex min-h-[260px] flex-col items-start justify-center gap-6 p-7 text-white sm:flex-row sm:items-center sm:justify-between sm:p-10"><div className="max-w-2xl"><p className="text-xs font-bold tracking-[0.18em] text-lime-300">ISOKO RY'UBUHINZI N'UBWOROZI</p><h2 className="mt-3 font-heading text-2xl font-bold sm:text-3xl">Umusaruro wawe ufite agaciro.</h2><p className="mt-3 text-sm leading-6 text-white/80">Shaka abaguzi, reba ibicuruzwa, kandi uhuze n'abahinzi n'aborozi bo mu Rwanda.</p></div><Button asChild size="lg" className="shrink-0 rounded-full bg-lime-300 px-6 font-bold text-[#123b28] hover:bg-lime-200"><Link to="/marketplace">Jya ku isoko <ArrowRight className="ml-1 h-4 w-4" /></Link></Button></div>
      </section>

      <section className="my-14 overflow-hidden rounded-3xl border border-primary/10 bg-[#edf5e9] p-6 sm:my-20 sm:p-10 dark:bg-card">
        <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center"><div><p className="flex items-center gap-2 text-xs font-bold tracking-[0.16em] text-primary"><Sun className="h-4 w-4" /> UBUMENYI BUKORERA ABANTU BOSE</p><h2 className="mt-3 max-w-2xl font-heading text-2xl font-bold sm:text-3xl">Ikoranabuhanga rikura rifatanyije n'ubumenyi bw'umuhinzi n'umworozi.</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">Ibisubizo bya AI ni ubufasha bw'ibanze, si umusimbura w'umuveterineri cyangwa umuhanga mu buhinzi. Igihe ikibazo gikomeye, ganira n'inzobere.</p></div><Button asChild size="lg" className="w-fit rounded-full px-6"><Link to="/vets">Reba abaveterineri <ArrowRight className="ml-1 h-4 w-4" /></Link></Button></div>
      </section>
      <div className="mb-12"><AdBanner /></div>
    </main>

    <footer className="border-t border-border bg-card">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr] lg:px-8">
        <div><Link to="/" className="inline-flex items-center gap-3 font-heading font-bold"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-secondary"><Sprout className="h-5 w-5" /></span><span>Umuhinzi AI</span></Link><p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground">Urubuga rukorwa mu Rwanda rufasha abahinzi n'aborozi kubona ubumenyi, ibikoresho n'amasoko mu Kinyarwanda. Umushinga wa Innocent MIGAMBI.</p></div>
        <div className="md:justify-self-end"><h3 className="font-heading font-bold">Serivisi</h3><ul className="mt-4 grid grid-cols-2 gap-x-8 gap-y-3 text-sm text-muted-foreground"><li><Link to="/weather" className="hover:text-primary">Ikirere</Link></li><li><Link to="/diagnose" className="hover:text-primary">Isuzuma rya AI</Link></li><li><Link to="/chat" className="hover:text-primary">Umujyanama AI</Link></li><li><Link to="/marketplace" className="hover:text-primary">Isoko</Link></li><li><Link to="/vets" className="hover:text-primary">Abaveterineri</Link></li><li><Link to="/premium" className="hover:text-primary">Serivisi z'inyongera</Link></li></ul></div>
      </div>
      <div className="border-t border-border px-4 py-5 text-center text-xs text-muted-foreground">© {new Date().getFullYear()} Umuhinzi AI · Yakozwe mu Rwanda na Innocent MIGAMBI</div>
    </footer>
  </div>
);

export default Index;
