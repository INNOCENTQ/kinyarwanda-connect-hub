import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, CloudSun, MapPin, MessageCircle, ShieldCheck, Sparkles, Sprout, Store, Stethoscope } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import heroFarmer from "@/assets/rwanda-terraced-farmer.jpg";
import cattleCare from "@/assets/ankole-cattle-care.jpg";
import farmMarket from "@/assets/rwanda-farm-market.jpg";

type Slide = {
  image: string;
  alt: string;
  badge: string;
  badgeIcon: typeof Sprout;
  title: string;
  highlight: string;
  description: string;
  cta: { to: string; label: string; icon: typeof ArrowRight };
  secondary: { to: string; label: string; icon: typeof MessageCircle };
};

const slides: Slide[] = [
  {
    image: heroFarmer,
    alt: "Umuhinzi mu murima w'amaterasi mu Rwanda",
    badge: "IKORANABUHANGA RY'UBUHINZI N'UBWOROZI MU RWANDA",
    badgeIcon: Sprout,
    title: "Ubuhinzi n'ubworozi",
    highlight: "bw'ejo hazaza.",
    description:
      "Umuhinzi AI ihuza ubumenyi n'ikoranabuhanga, igufasha kwita ku bihingwa n'amatungo no gufata ibyemezo byiza mu Kinyarwanda.",
    cta: { to: "/diagnose", label: "Tangira isuzuma", icon: ArrowRight },
    secondary: { to: "/chat", label: "Baza AI", icon: MessageCircle },
  },
  {
    image: cattleCare,
    alt: "Umworozi yita ku nka mu rwuri",
    badge: "UBWOROZI N'AMATUNGO",
    badgeIcon: Stethoscope,
    title: "Amatungo meza,",
    highlight: "ubworozi burambye.",
    description:
      "Fata ifoto y'itungo cyangwa ufate ijwi ryaryo, AI igusobanurira ibimenyetso n'intambwe wakurikiza vuba.",
    cta: { to: "/diagnose", label: "Suzuma itungo", icon: ArrowRight },
    secondary: { to: "/vets", label: "Abaveterineri", icon: Stethoscope },
  },
  {
    image: heroFarmer,
    alt: "Imisozi y'u Rwanda n'imirima",
    badge: "ITEGANYAGIHE RY'IMINSI 7",
    badgeIcon: CloudSun,
    title: "Menya ikirere,",
    highlight: "tegura umurima.",
    description:
      "Iteganyagihe rishingiye aho uri n'inama zijyanye n'ibikorwa by'ubuhinzi: gutera, kurima no gusarura.",
    cta: { to: "/weather", label: "Reba ikirere", icon: CloudSun },
    secondary: { to: "/chat", label: "Baza AI", icon: MessageCircle },
  },
  {
    image: farmMarket,
    alt: "Umusaruro w'abahinzi bo mu Rwanda ku isoko",
    badge: "ISOKO RY'ABAHINZI N'ABOROZI",
    badgeIcon: Store,
    title: "Umusaruro wawe",
    highlight: "ufite agaciro.",
    description:
      "Shaka abaguzi, reba ibicuruzwa, kandi uhuze n'abahinzi n'aborozi bo mu Rwanda bose.",
    cta: { to: "/marketplace", label: "Jya ku isoko", icon: Store },
    secondary: { to: "/chat", label: "Baza AI", icon: MessageCircle },
  },
];

const AUTOPLAY_MS = 6000;

const HeroCarousel = () => {
  const [index, setIndex] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const restart = useCallback(() => {
    if (timer.current) clearInterval(timer.current);
    timer.current = setInterval(() => setIndex((i) => (i + 1) % slides.length), AUTOPLAY_MS);
  }, []);

  useEffect(() => {
    restart();
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [restart]);

  const goTo = (n: number) => {
    setIndex(((n % slides.length) + slides.length) % slides.length);
    restart();
  };

  return (
    <section
      aria-label="Amashusho y'ibanze"
      aria-roledescription="carousel"
      className="group/carousel relative isolate mt-5 min-h-[510px] overflow-hidden rounded-[2rem] bg-[#123b28] shadow-xl sm:mt-8 lg:min-h-[570px]"
    >
      {slides.map((slide, i) => (
        <div
          key={i}
          aria-hidden={i !== index}
          className={`absolute inset-0 transition-opacity duration-700 motion-reduce:transition-none ${i === index ? "z-0 opacity-100" : "-z-10 opacity-0"}`}
        >
          <img
            src={slide.image}
            alt={slide.alt}
            width={1600}
            height={1200}
            fetchPriority={i === 0 ? "high" : "low"}
            loading={i === 0 ? "eager" : "lazy"}
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0b2b1d]/95 via-[#0b2b1d]/75 to-[#0b2b1d]/15" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b2b1d]/55 via-transparent to-transparent" />
        </div>
      ))}

      <div className="relative z-10 flex min-h-[510px] max-w-3xl flex-col justify-center px-6 py-14 sm:px-12 lg:min-h-[570px] lg:px-16">
        {slides.map((slide, i) => (
          <div key={i} className={i === index ? "block" : "hidden"} aria-live={i === index ? "polite" : undefined}>
            <span className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold tracking-[0.16em] text-white backdrop-blur-sm">
              <slide.badgeIcon className="h-4 w-4 text-lime-300" /> {slide.badge}
            </span>
            <h1 className="font-heading text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-7xl">
              {slide.title}
              <br />
              <span className="text-lime-300">{slide.highlight}</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-white/85 sm:text-lg">{slide.description}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-full bg-lime-300 px-6 font-bold text-[#123b28] shadow-lg hover:bg-lime-200">
                <Link to={slide.cta.to} tabIndex={i === index ? 0 : -1}>
                  {slide.cta.label} <slide.cta.icon className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-full border-white/40 bg-white/10 px-6 font-semibold text-white backdrop-blur-sm hover:bg-white/20 hover:text-white"
              >
                <Link to={slide.secondary.to} tabIndex={i === index ? 0 : -1}>
                  <slide.secondary.icon className="mr-1 h-4 w-4" /> {slide.secondary.label}
                </Link>
              </Button>
            </div>
            {i === 0 && (
              <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-white/80">
                <span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-lime-300" /> Yubakiwe ku bahinzi n'aborozi</span>
                <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4 text-lime-300" /> Yagenewe u Rwanda</span>
                <span className="inline-flex items-center gap-2"><Sparkles className="h-4 w-4 text-lime-300" /> Ikoresha AI</span>
              </div>
            )}
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => goTo(index - 1)}
        aria-label="Ishusho ibanziriza"
        className="absolute left-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-black/25 text-white opacity-0 backdrop-blur-sm transition hover:bg-black/45 focus-visible:opacity-100 group-hover/carousel:opacity-100 sm:left-5"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={() => goTo(index + 1)}
        aria-label="Ishusho ikurikira"
        className="absolute right-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-black/25 text-white opacity-0 backdrop-blur-sm transition hover:bg-black/45 focus-visible:opacity-100 group-hover/carousel:opacity-100 sm:right-5"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`Jya ku ishusho ${i + 1}`}
            aria-current={i === index}
            className={`h-2 rounded-full transition-all ${i === index ? "w-7 bg-lime-300" : "w-2 bg-white/45 hover:bg-white/70"}`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroCarousel;
