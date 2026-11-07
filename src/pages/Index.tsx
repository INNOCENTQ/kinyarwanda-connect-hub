import { ArrowRight, CloudSun, MapPin, MessageCircle, ShieldCheck, Sparkles, Sprout, Stethoscope, Store, Sun } from "lucide-react";
import { Link } from "react-router-dom";
import AppNav from "@/components/AppNav";
import AdBanner from "@/components/AdBanner";
import FarmPhotoSlides from "@/components/FarmPhotoSlides";
import { Button } from "@/components/ui/button";
import heroFarmer from "@/assets/rwanda-terraced-farmer.jpg";
import cattleCare from "@/assets/ankole-cattle-care.jpg";
import farmMarket from "@/assets/rwanda-farm-market.jpg";

const services = [
  { to: "/weather", eyebrow: "HITEGURE NEZA", title: "Ikirere cy'aho uri", description: "Iteganyagihe ry'iminsi 7 n'inama zijyanye n'ibikorwa by'ubuhinzi n'ubworozi.", icon: CloudSun, tone: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300" },
  { to: "/diagnose", eyebrow: "KUMENYA VUBA", title: "Suzumisha AI", description: "Fata ifoto y'igihingwa cyangwa itungo, ubone ibisobanuro n'intambwe wakurikiza.", icon: Stethoscope, tone: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" },
  { to: "/chat", eyebrow: "IKIGANIRO MU KINYARWANDA", title: "Baza Umujyanama AI", description: "Baza ku mbuto, indwara z'ibihingwa n'iz'amatungo, ifumbire, ubworozi n'ibindi bikenerwa mu murima.", icon: MessageCircle, tone: "bg-lime-100 text-lime-700 dark:bg-lime-900/30 dark:text-lime-300" },
  { to: "/marketplace", eyebrow: "HUZA ABAGUZI N'ABAGURISHA", title: "Isoko ry'abahinzi", description: "Menyesha umusaruro wawe cyangwa ushake ibicuruzwa biboneka hafi yawe.", icon: Store, tone: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300" },
];

const Index = () => (
  <div className="min-h-screen bg-background">
    <AppNav />
    <main className="mx-auto w-full max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
      <section aria-label="Ubuhinzi n'Ubworozi AI" className="relative isolate mt-5 min-h-[510px] overflow-hidden rounded-[2rem] bg-[#123b28] shadow-xl sm:mt-8 lg:min-h-[570px]">
        <img src={heroFarmer} alt="Ubuhinzi n'ubworozi mu misozi y'u Rwanda" width={1600} height={1200} fetchPriority="high" className="absolute inset-0 -z-20 h-full w-full object-cover object-center" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#0b2b1d]/95 via-[#0b2b1d]/75 to-[#0b2b1d]/15" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#0b2b1d]/55 via-transparent to-transparent" />
        <div className="flex min-h-[510px] max-w-3xl flex-col justify-center px-6 py-14 sm:px-12 lg:min-h-[570px] lg:px-16">
          <span className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold tracking-[0.16em] text-white backdrop-blur-sm"><Sprout className="h-4 w-4 text-lime-300" />Ubuhinzi n'Ubworozi AI</span>
          <h1 className="font-heading text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-7xl">Ubuhinzi n'ubworozi<br /><span className="text-lime-300">bw'ejo hazaza.</span></h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-white/85 sm:text-lg">Ubuhinzi &amp; Ubworozi AI ihuza ubumenyi n'ikoranabuhanga, igufasha kwita ku bihingwa n'amatungo no gufata ibyemezo byiza mu buhinzi no mu bworozi.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="rounded-full bg-lime-300 px-6 font-bold text-[#123b28] shadow-lg hover:bg-lime-200"><Link to="/diagnose">Tangira isuzuma <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
            <Button asChild size="lg" variant="outline" className="rounded-full border-white/40 bg-white/10 px-6 font-semibold text-white backdrop-blur-sm hover:bg-white/20 hover:text-white"><Link to="/chat">Baza AI</Link></Button>
          </div>
          <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-white/80">
            <span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-lime-300" /> Yubakiwe ku bahinzi n'aborozi</span>
            <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4 text-lime-300" /> Yagenewe u Rwanda</span>
            <span className="inline-flex items-center gap-2"><Sparkles className="h-4 w-4 text-lime-300" /> Ikoresha AI</span>
          </div>
        </div>
      </section>

      <section className="py-8 sm:py-10">
        <FarmPhotoSlides />
      </section>

      <section className="py-14 sm:py-20" aria-labelledby="services-heading">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div><p className="text-xs font-bold tracking-[0.18em] text-primary">IBIKENEWE MU BUHINZI N'UBWOROZI</p><h2 id="services-heading" className="mt-2 font-heading text-3xl font-bold tracking-tight text-foreground">Serivisi zihariye</h2></div>
          <p className="max-w-md text-sm leading-6 text-muted-foreground">Serivisi zifasha kwita ku bihingwa n'amatungo, gufata ibyemezo no guhuza abahinzi n'amasoko.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {services.map(({ to, eyebrow, title, description, icon: Icon, tone }) => (
            <Link key={to} to={to} className="group rounded-2xl border border-border/70 bg-card p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" >
              <div className="flex items-center justify-between">
                <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${tone}`}><Icon className="h-6 w-6" /></span>
                <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
              </div>
              <p className="mt-7 text-[10px] font-bold tracking-[0.15em] text-primary">{eyebrow}</p>
              <h3 className="mt-2 font-heading text-xl font-bold text-foreground">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section aria-labelledby="sectors-heading" className="py-2">
        <div className="mb-8 max-w-2xl"><p className="text-xs font-bold tracking-[0.18em] text-primary">INKUNGA ZOMBI ZOMBI</p><h2 id="sectors-heading" className="mt-2 font-heading text-3xl font-bold tracking-tight text-foreground">Amasomo y'ubuhinzi n'ubworozi</h2></div>
        <div className="grid gap-5 lg:grid-cols-2">
          <Link to="/diagnose" className="group relative min-h-[360px] overflow-hidden rounded-[1.75rem] bg-primary shadow-md">
            <img src={heroFarmer} alt="Umuhinzi mu murima w'amaterasi mu Rwanda" width={1200} height={900} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#082719]/95 via-[#082719]/15 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-6 p-7 text-white sm:p-9"><div><span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold backdrop-blur-sm">Ubumenyi</span><h3 className="mt-3 font-heading text-2xl font-bold">Guhinga mu Rwanda</h3></div><ArrowRight className="h-5 w-5 shrink-0" /></div>
          </Link>
          <Link to="/diagnose" className="group relative min-h-[360px] overflow-hidden rounded-[1.75rem] bg-primary shadow-md">
            <img src={cattleCare} alt="Umworozi yita ku nka mu rwuri" width={1200} height={912} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#082719]/95 via-[#082719]/15 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-6 p-7 text-white sm:p-9"><div><span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold backdrop-blur-sm">Ubworozi</span><h3 className="mt-3 font-heading text-2xl font-bold">Ubuzima bw'amatungo</h3></div><ArrowRight className="h-5 w-5 shrink-0" /></div>
          </Link>
        </div>
      </section>

      <section className="relative my-14 min-h-[260px] overflow-hidden rounded-[1.75rem] bg-[#1a3426] sm:my-20">
        <img src={farmMarket} alt="Umusaruro w'abahinzi bo mu Rwanda ku isoko" width={1200} height={912} loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-45" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#102819]/95 via-[#102819]/75 to-[#102819]/35" />
        <div className="relative flex min-h-[260px] flex-col items-start justify-center gap-6 p-7 text-white sm:flex-row sm:items-center sm:justify-between sm:p-10"><div className="max-w-2xl"><p className="text-xs font-bold tracking-[0.16em] text-lime-300">MURAKOZE KUGIRA</p><h2 className="mt-2 font-heading text-3xl font-bold">Ubumenyi nyabwo bukorwa mu murima</h2><p className="mt-3 text-base text-white/80">Guha abahinzi n'aborozi ibikoresho by'ukuri, by'igihe, kandi bifite akamaro mu buzima bwa buri munsi.</p></div><Link to="/chat" className="inline-flex items-center gap-2 rounded-full bg-lime-300 px-5 py-3 text-sm font-bold text-[#123b28] hover:bg-lime-200">Baza AI <ArrowRight className="h-4 w-4" /></Link></div>
      </section>

      <section className="my-14 overflow-hidden rounded-3xl border border-primary/10 bg-[#edf5e9] p-6 sm:my-20 sm:p-10 dark:bg-card">
        <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center"><div><p className="flex items-center gap-2 text-xs font-bold tracking-[0.16em] text-primary"><Sun className="h-4 w-4" />HITAMO IKIGUNGA</p><h2 className="mt-3 font-heading text-3xl font-bold text-foreground">Igihe cyiza cyo gutegura ikirere n'ibikorwa bya buri munsi</h2></div><Link to="/weather" className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-white px-5 py-3 text-sm font-semibold text-primary hover:bg-primary hover:text-primary-foreground">Reba ikirere <ArrowRight className="h-4 w-4" /></Link></div>
      </section>
      <div className="mb-12"><AdBanner /></div>
    </main>

    <footer className="border-t border-border bg-card">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr] lg:px-8">
        <div><Link to="/" className="inline-flex items-center gap-3 font-heading font-bold text-foreground"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-secondary"><Sprout className="h-5 w-5" /></span>Ubuhinzi &amp; Ubworozi AI</Link><p className="mt-4 max-w-md text-sm leading-6 text-muted-foreground">Guhanga ibikoresho, inama, n'ubumenyi bukomeye ku bahinzi n'aborozi bo mu Rwanda.</p></div>
        <div className="md:justify-self-end"><h3 className="font-heading font-bold text-foreground">Serivisi</h3><ul className="mt-4 grid grid-cols-2 gap-x-8 gap-y-3 text-sm text-muted-foreground"><li><Link to="/weather" className="hover:text-foreground">Ikirere</Link></li><li><Link to="/chat" className="hover:text-foreground">AI Chat</Link></li><li><Link to="/diagnose" className="hover:text-foreground">Gusuzuma</Link></li><li><Link to="/marketplace" className="hover:text-foreground">Isoko</Link></li></ul></div>
      </div>
      <div className="border-t border-border px-4 py-5 text-center text-xs text-muted-foreground">© {new Date().getFullYear()} Ubuhinzi &amp; Ubworozi AI · Yakozwe mu Rwanda na Innocent MIGAMBI</div>
    </footer>
  </div>
);

export default Index;
