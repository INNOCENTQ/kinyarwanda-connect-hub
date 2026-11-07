import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import cattleCare from "@/assets/ankole-cattle-care.jpg";
import farmMarket from "@/assets/rwanda-farm-market.jpg";
import terracedFarmer from "@/assets/rwanda-terraced-farmer.jpg";
import { Button } from "@/components/ui/button";
import { useLang } from "@/hooks/useLang";

const slides = [
  {
    image: terracedFarmer,
    alt: {
      rw: "Umuhinzi akorera mu mirima y'amaterasi yo mu Rwanda",
      en: "A farmer tending Rwanda's terraced hillsides",
    },
    title: {
      rw: "Ubumenyi butangirira mu murima",
      en: "Practical knowledge, rooted in the field",
    },
    detail: {
      rw: "Inama ku bihingwa, gutegura igihembwe, no gufata ibyemezo byiza mu murima.",
      en: "Crop guidance, seasonal planning, and better decisions for your fields.",
    },
  },
  {
    image: cattleCare,
    alt: {
      rw: "Inka z'inyambo ziri mu rwuri",
      en: "Ankole cattle grazing in a green pasture",
    },
    title: {
      rw: "Kwita ku matungo neza",
      en: "Care for healthy livestock",
    },
    detail: {
      rw: "Baza ku mirire, ubworozi n'ibimenyetso by'indwara z'amatungo.",
      en: "Ask about feeding, animal care, and early signs of livestock illness.",
    },
  },
  {
    image: farmMarket,
    alt: {
      rw: "Umusaruro w'ubuhinzi uri ku isoko mu Rwanda",
      en: "Fresh produce at a Rwandan farm market",
    },
    title: {
      rw: "Umusaruro uva mu murima ukagera ku isoko",
      en: "From the farm to the marketplace",
    },
    detail: {
      rw: "Shaka inama ku kubika umusaruro, kugurisha, no gukoresha isoko neza.",
      en: "Get ideas for storing harvests, selling confidently, and growing your market reach.",
    },
  },
];

const SLIDE_INTERVAL = 7000;

export default function FarmPhotoSlides() {
  const { lang } = useLang();
  const isEnglish = lang === "en";
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const previous = () => setActive((current) => (current - 1 + slides.length) % slides.length);
  const next = () => setActive((current) => (current + 1) % slides.length);

  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % slides.length);
    }, SLIDE_INTERVAL);

    return () => window.clearInterval(timer);
  }, [paused]);

  const currentSlide = slides[active];

  return (
    <section
      aria-label={isEnglish ? "Farm photo slideshow" : "Amafoto y'ubuhinzi n'ubworozi"}
      aria-roledescription="carousel"
      className="relative mx-auto w-full max-w-5xl overflow-hidden rounded-[1.75rem] border border-white/10 bg-primary shadow-[0_20px_50px_rgba(10,36,24,0.22)]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setPaused(false);
      }}
    >
      <div className="relative h-52 overflow-hidden sm:h-64 md:h-72 lg:h-80">
        {slides.map((item, index) => {
          const isActive = index === active;
          return (
            <div
              key={item.title.en}
              className={[
                "absolute inset-0 transition-all duration-1000 ease-out",
                isActive ? "translate-x-0 opacity-100 scale-100 z-10" : "translate-x-6 opacity-0 scale-[1.03] z-0",
              ].join(" ")}
              aria-hidden={!isActive}
            >
              <img
                src={item.image}
                alt={item.alt[lang]}
                className="h-full w-full object-cover"
                loading={index === 0 ? "eager" : "lazy"}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0a2618]/90 via-[#0a2618]/55 to-[#0a2618]/20" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a2618]/75 via-transparent to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6 lg:p-8">
                <div className="max-w-xl">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-lime-200 sm:text-xs">
                    {isEnglish
                      ? `Rwanda farming · ${active + 1}/${slides.length}`
                      : `Ubuhinzi mu Rwanda · ${active + 1}/${slides.length}`}
                  </p>
                  <h2 className="mt-2 font-heading text-lg font-bold leading-tight text-white sm:text-2xl lg:text-3xl">
                    {item.title[lang]}
                  </h2>
                  <p className="mt-2 max-w-lg text-xs leading-6 text-white/85 sm:text-sm lg:text-base">
                    {item.detail[lang]}
                  </p>
                </div>
              </div>
            </div>
          );
        })}

        <div className="absolute bottom-4 right-4 flex items-center gap-1.5 sm:bottom-5 sm:right-5">
          <Button
            type="button"
            size="icon"
            variant="secondary"
            className="h-9 w-9 rounded-full bg-black/35 text-white hover:bg-black/50"
            onClick={previous}
            aria-label={isEnglish ? "Previous slide" : "Ifoto ibanza"}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="secondary"
            className="h-9 w-9 rounded-full bg-black/35 text-white hover:bg-black/50"
            onClick={next}
            aria-label={isEnglish ? "Next slide" : "Ifoto ikurikira"}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="secondary"
            className="h-9 w-9 rounded-full bg-black/35 text-white hover:bg-black/50"
            onClick={() => setPaused((value) => !value)}
            aria-label={paused ? (isEnglish ? "Play slideshow" : "Komeza amafoto") : (isEnglish ? "Pause slideshow" : "Hagarika amafoto")}
          >
            {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
          </Button>
        </div>

        <div className="absolute bottom-4 left-4 flex items-center gap-1.5 sm:bottom-5 sm:left-5" role="group" aria-label={isEnglish ? "Choose a slide" : "Hitamo ifoto"}>
          {slides.map((slide, index) => (
            <button
              key={slide.title.en}
              type="button"
              aria-label={isEnglish ? `Show slide ${index + 1}` : `Erekana ifoto ya ${index + 1}`}
              aria-current={index === active ? "true" : undefined}
              onClick={() => setActive(index)}
              className={[
                "h-2 rounded-full transition-all duration-300",
                index === active ? "w-8 bg-white" : "w-2 bg-white/60 hover:bg-white/85",
              ].join(" ")}
            />
          ))}
        </div>
      </div>
    </section>
  );
}






















































