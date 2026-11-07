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
    alt: { rw: "Umuhinzi akorera mu mirima y'amaterasi yo mu Rwanda", en: "A farmer tending Rwanda's terraced hillsides" },
    title: { rw: "Ubumenyi butangirira mu murima", en: "Practical knowledge, rooted in the field" },
    detail: { rw: "Inama ku bihingwa no gutegura igihembwe cy'ihinga.", en: "Crop guidance and help planning your growing season." },
  },
  {
    image: cattleCare,
    alt: { rw: "Inka z'inyambo ziri mu rwuri", en: "Ankole cattle grazing in a green pasture" },
    title: { rw: "Kwita ku matungo neza", en: "Care for healthy livestock" },
    detail: { rw: "Baza ku mirire, ubworozi n'ibimenyetso by'indwara.", en: "Ask about feeding, animal care, and signs of illness." },
  },
  {
    image: farmMarket,
    alt: { rw: "Umusaruro w'ubuhinzi uri ku isoko mu Rwanda", en: "Fresh produce at a Rwandan farm market" },
    title: { rw: "Umusaruro uva mu murima ukagera ku isoko", en: "From the farm to the marketplace" },
    detail: { rw: "Shaka inama ku kubika no kugurisha umusaruro wawe.", en: "Get ideas for storing and selling your harvest." },
  },
];

export default function FarmPhotoSlides() {
  const { lang } = useLang();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const english = lang === "en";
  const slide = slides[active];

  const previous = () => setActive((current) => (current - 1 + slides.length) % slides.length);
  const next = () => setActive((current) => (current + 1) % slides.length);

  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(next, 6000);
    return () => window.clearInterval(timer);
  }, [paused]);

  return (
    <section
      aria-label={english ? "Farm photo slideshow" : "Amafoto y'ubuhinzi n'ubworozi"}
      aria-roledescription="carousel"
      className="relative mx-auto w-full max-w-5xl overflow-hidden rounded-2xl bg-primary shadow-sm"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setPaused(false);
      }}
    >
      <div className="relative h-36 sm:h-44 md:h-48">
        {slides.map((item, index) => (
          <img
            key={item.image}
            src={item.image}
            alt={item.alt[lang]}
            aria-hidden={index !== active}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${index === active ? "opacity-100" : "opacity-0"}`}
            loading={index === 0 ? "eager" : "lazy"}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-r from-[#092719]/90 via-[#092719]/55 to-transparent" />
        <div className="absolute inset-0 flex items-center px-5 py-4 text-white sm:px-8">
          <div className="max-w-xl">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-lime-200 sm:text-xs">
              {english ? `Rwanda farming · ${active + 1} / ${slides.length}` : `Ubuhinzi mu Rwanda · ${active + 1} / ${slides.length}`}
            </p>
            <h2 className="mt-1 font-heading text-lg font-bold leading-tight sm:text-2xl">{slide.title[lang]}</h2>
            <p className="mt-1 hidden text-xs leading-5 text-white/85 sm:block sm:text-sm">{slide.detail[lang]}</p>
          </div>
        </div>
        <div className="absolute bottom-3 right-3 flex items-center gap-1.5 sm:bottom-4 sm:right-5">
          <Button type="button" size="icon" variant="secondary" className="h-8 w-8 rounded-full bg-black/35 text-white hover:bg-black/55" onClick={previous} aria-label={english ? "Previous slide" : "Ifoto ibanza"}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button type="button" size="icon" variant="secondary" className="h-8 w-8 rounded-full bg-black/35 text-white hover:bg-black/55" onClick={next} aria-label={english ? "Next slide" : "Ifoto ikurikira"}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button type="button" size="icon" variant="secondary" className="h-8 w-8 rounded-full bg-black/35 text-white hover:bg-black/55" onClick={() => setPaused((value) => !value)} aria-label={paused ? (english ? "Play slideshow" : "Komeza amafoto") : (english ? "Pause slideshow" : "Hagarika amafoto") }>
            {paused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
          </Button>
        </div>
        <div className="absolute bottom-4 left-5 flex items-center gap-1.5 sm:left-8" role="group" aria-label={english ? "Choose a slide" : "Hitamo ifoto"}>
          {slides.map((item, index) => (
            <button
              key={item.title.en}
              type="button"
              aria-label={english ? `Show slide ${index + 1}` : `Erekana ifoto ya ${index + 1}`}
              aria-current={index === active ? "true" : undefined}
              onClick={() => setActive(index)}
              className={`h-1.5 rounded-full transition-all ${index === active ? "w-6 bg-white" : "w-1.5 bg-white/60 hover:bg-white"}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
