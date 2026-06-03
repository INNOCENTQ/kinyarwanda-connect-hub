import { useEffect, useState } from "react";
import AppNav from "@/components/AppNav";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CloudSun, CloudRain, Sun, Cloud, CloudSnow, MapPin, Loader2, Droplets, Wind, Sparkles, Thermometer } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

const WEATHER_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/weather-advice`;

// WMO weather codes → Kinyarwanda + icon
const WMO: Record<number, { label: string; Icon: any }> = {
  0: { label: "Izuba", Icon: Sun },
  1: { label: "Izuba ryinshi", Icon: Sun },
  2: { label: "Ibicu bike", Icon: CloudSun },
  3: { label: "Ibicu byinshi", Icon: Cloud },
  45: { label: "Igihu", Icon: Cloud },
  48: { label: "Igihu cy'urubura", Icon: Cloud },
  51: { label: "Imvura ntoya", Icon: CloudRain },
  53: { label: "Imvura yo hagati", Icon: CloudRain },
  55: { label: "Imvura nyinshi", Icon: CloudRain },
  61: { label: "Imvura ntoya", Icon: CloudRain },
  63: { label: "Imvura", Icon: CloudRain },
  65: { label: "Imvura nyinshi", Icon: CloudRain },
  71: { label: "Urubura", Icon: CloudSnow },
  80: { label: "Imvura y'akanya", Icon: CloudRain },
  81: { label: "Imvura ikomeye", Icon: CloudRain },
  82: { label: "Umuyaga w'imvura", Icon: CloudRain },
  95: { label: "Inkuba", Icon: CloudRain },
  96: { label: "Inkuba n'urubura", Icon: CloudRain },
  99: { label: "Inkuba ikomeye", Icon: CloudRain },
};

const wmoInfo = (c: number) => WMO[c] || { label: "Ikirere", Icon: CloudSun };

const DAYS = ["Cyumweru", "Mbere", "Kabiri", "Gatatu", "Kane", "Gatanu", "Gatandatu"];

const CROPS = [
  "Rusange", "Ibirayi", "Ibigori", "Ibishyimbo", "Umuceri", "Umuneke",
  "Imboga", "Inyanya", "Karoti", "Sukari", "Ikawa", "Icyayi",
];

type Current = { temp: number; feels: number; humidity: number; wind: number; code: number };
type Daily = { date: string; min: number; max: number; rain: number; code: number };

export default function Weather() {
  const [loading, setLoading] = useState(true);
  const [coords, setCoords] = useState<{ lat: number; lon: number; name?: string } | null>(null);
  const [current, setCurrent] = useState<Current | null>(null);
  const [daily, setDaily] = useState<Daily[]>([]);
  const [crop, setCrop] = useState("Rusange");
  const [advice, setAdvice] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const loadCoords = () => {
    setLoading(true);
    if (!navigator.geolocation) {
      setCoords({ lat: -1.9577, lon: 30.1127, name: "Kigali (default)" });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (p) => setCoords({ lat: p.coords.latitude, lon: p.coords.longitude }),
      () => {
        toast.error("Ntibyashobotse kubona aho uri. Dukoresheje Kigali.");
        setCoords({ lat: -1.9577, lon: 30.1127, name: "Kigali" });
      }
    );
  };

  useEffect(() => { loadCoords(); }, []);

  // Fetch weather + reverse geocode
  useEffect(() => {
    if (!coords) return;
    (async () => {
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=Africa%2FKigali&forecast_days=7`;
        const r = await fetch(url);
        const d = await r.json();
        setCurrent({
          temp: Math.round(d.current.temperature_2m),
          feels: Math.round(d.current.apparent_temperature),
          humidity: d.current.relative_humidity_2m,
          wind: Math.round(d.current.wind_speed_10m),
          code: d.current.weather_code,
        });
        const days: Daily[] = d.daily.time.map((t: string, i: number) => ({
          date: t,
          min: Math.round(d.daily.temperature_2m_min[i]),
          max: Math.round(d.daily.temperature_2m_max[i]),
          rain: d.daily.precipitation_sum[i],
          code: d.daily.weather_code[i],
        }));
        setDaily(days);

        // reverse geocode (free, no key)
        if (!coords.name) {
          try {
            const g = await fetch(`https://geocoding-api.open-meteo.com/v1/reverse?latitude=${coords.lat}&longitude=${coords.lon}&language=en`);
            const gd = await g.json();
            const name = gd?.results?.[0]?.name;
            if (name) setCoords((c) => c ? { ...c, name } : c);
          } catch {}
        }
      } catch {
        toast.error("Ntibyashobotse kubona ikirere.");
      } finally {
        setLoading(false);
      }
    })();
  }, [coords?.lat, coords?.lon]);

  const askAI = async () => {
    if (!daily.length) return;
    setAiLoading(true);
    setAdvice("");
    const summary = daily.slice(0, 5).map(d => `${d.date}: ${wmoInfo(d.code).label}, ${d.min}-${d.max}°C, imvura ${d.rain}mm`).join("\n");
    try {
      const r = await fetch(WEATHER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({ weather: summary, crop, location: coords?.name || "Rwanda" }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Ikibazo");
      setAdvice(data.advice);
    } catch (e: any) { toast.error(e.message); } finally { setAiLoading(false); }
  };

  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Ikirere</h1>
            <p className="text-muted-foreground flex items-center gap-1.5 mt-1 text-sm">
              <MapPin className="h-4 w-4" /> {coords?.name || (coords ? `${coords.lat.toFixed(2)}, ${coords.lon.toFixed(2)}` : "Turacyareba...")}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={loadCoords}><MapPin className="h-4 w-4" />Vugurura</Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : (
          <>
            {/* Current */}
            {current && (() => {
              const { label, Icon } = wmoInfo(current.code);
              return (
                <div className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground rounded-2xl p-6 shadow-lg mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90">Ubu noneho</p>
                      <p className="text-6xl font-black mt-1">{current.temp}°</p>
                      <p className="text-lg mt-1">{label}</p>
                    </div>
                    <Icon className="h-24 w-24 opacity-90" strokeWidth={1.5} />
                  </div>
                  <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-primary-foreground/20">
                    <div className="text-center">
                      <Thermometer className="h-4 w-4 mx-auto opacity-80" />
                      <p className="text-xs opacity-80 mt-1">Kumva</p>
                      <p className="font-bold">{current.feels}°</p>
                    </div>
                    <div className="text-center">
                      <Droplets className="h-4 w-4 mx-auto opacity-80" />
                      <p className="text-xs opacity-80 mt-1">Ubuhehere</p>
                      <p className="font-bold">{current.humidity}%</p>
                    </div>
                    <div className="text-center">
                      <Wind className="h-4 w-4 mx-auto opacity-80" />
                      <p className="text-xs opacity-80 mt-1">Umuyaga</p>
                      <p className="font-bold">{current.wind} km/h</p>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* 7-day */}
            <div className="bg-card border border-border rounded-2xl p-4 mb-6">
              <h2 className="font-bold text-foreground mb-3 px-2">Iminsi 7 iri imbere</h2>
              <div className="space-y-1">
                {daily.map((d, i) => {
                  const { label, Icon } = wmoInfo(d.code);
                  const dayName = i === 0 ? "Uyu munsi" : i === 1 ? "Ejo" : DAYS[new Date(d.date).getDay()];
                  return (
                    <div key={d.date} className="flex items-center gap-3 px-2 py-2.5 rounded-lg hover:bg-muted/50">
                      <div className="w-20 text-sm font-medium text-foreground">{dayName}</div>
                      <Icon className="h-6 w-6 text-primary shrink-0" />
                      <div className="flex-1 text-sm text-muted-foreground truncate">{label}</div>
                      {d.rain > 0 && (
                        <div className="flex items-center gap-1 text-xs text-primary">
                          <Droplets className="h-3 w-3" />{d.rain.toFixed(1)}mm
                        </div>
                      )}
                      <div className="text-sm font-medium text-foreground tabular-nums">
                        <span className="text-muted-foreground">{d.min}°</span> / {d.max}°
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* AI advice */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <h2 className="font-bold text-foreground mb-1 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" /> Inama za AI
              </h2>
              <p className="text-sm text-muted-foreground mb-4">Hitamo igihingwa cyawe, AI iguhe inama z'iyi week.</p>
              <div className="flex gap-2 flex-wrap">
                <Select value={crop} onValueChange={setCrop}>
                  <SelectTrigger className="w-full sm:w-48"><SelectValue /></SelectTrigger>
                  <SelectContent>{CROPS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
                <Button onClick={askAI} disabled={aiLoading} className="flex-1 sm:flex-none">
                  {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  Saba inama
                </Button>
              </div>
              {advice && (
                <div className="mt-4 prose prose-sm max-w-none text-foreground bg-muted/40 rounded-lg p-4">
                  <ReactMarkdown>{advice}</ReactMarkdown>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
