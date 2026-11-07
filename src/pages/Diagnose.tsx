import { useState, useRef, useEffect } from "react";
import AppNav from "@/components/AppNav";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Camera, Mic, Square, Loader2, MapPin, X, RotateCcw, Copy, Stethoscope, Sparkles, ShieldAlert, History, Check, ImagePlus, Trash2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import { usePlan } from "@/hooks/usePlan";
import { useLocationPreference } from "@/hooks/useLocationPreference";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import cattleImg from "@/assets/ankole-cattle-care.jpg";
import cropImg from "@/assets/rwanda-terraced-farmer.jpg";

const DIAGNOSE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/diagnose`;
const FREE_LIMIT = 10;
const MAX_AUDIO_SECONDS = 30;
const MAX_IMAGE_MB = 15;

type Kind = "livestock" | "crop";

const SUBJECTS: Record<Kind, string[]> = {
  livestock: ["Inka", "Ihene", "Intama", "Inkoko", "Ingurube", "Irindi"],
  crop: ["Ibigori", "Ibirayi", "Ibishyimbo", "Umuceri", "Ikawa", "Imboga", "Ikindi"],
};
const QUICK_SYMPTOMS: Record<Kind, string[]> = {
  livestock: ["Ntirya", "Umuriro", "Ihumeka nabi", "Impiswi", "Inkorora", "Ibisebe", "Yacitse intege", "Amata yagabanutse"],
  crop: ["Amababi y'umuhondo", "Amababi yumye", "Utudomo ku mababi", "Udukoko", "Kubora", "Gukura nabi", "Imbuto zangiritse"],
};

/** Shrink photos before upload so slow connections send them quickly. */
const compressImage = (file: File, max = 1280, quality = 0.8) => new Promise<{ base64: string; mime: string }>((resolve, reject) => {
  const url = URL.createObjectURL(file);
  const img = new Image();
  img.onload = () => {
    const scale = Math.min(1, max / Math.max(img.width, img.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);
    canvas.getContext("2d")?.drawImage(img, 0, 0, canvas.width, canvas.height);
    URL.revokeObjectURL(url);
    resolve({ base64: canvas.toDataURL("image/jpeg", quality).split(",")[1], mime: "image/jpeg" });
  };
  img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Ifoto ntisomeka. Gerageza indi.")); };
  img.src = url;
});

const blobToBase64 = (b: Blob) => new Promise<string>((res, rej) => {
  const r = new FileReader();
  r.onload = () => res((r.result as string).split(",")[1]);
  r.onerror = rej;
  r.readAsDataURL(b);
});

function StepTitle({ n, title, hint }: { n: number; title: string; hint?: string }) {
  return (
    <div className="mb-3 flex items-start gap-3">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{n}</span>
      <div>
        <h3 className="font-heading text-base font-semibold text-foreground">{title}</h3>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
    </div>
  );
}

interface Result { text: string; kind: Kind; subject: string; preview: string }

function DiagnoseForm({ kind, onResult }: { kind: Kind; onResult: (r: Result) => void }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const locationPreference = useLocationPreference();
  const [subject, setSubject] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [audio, setAudio] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState("");
  const [seconds, setSeconds] = useState(0);
  const [symptoms, setSymptoms] = useState("");
  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const mediaRec = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const timer = useRef<number>();
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => () => { if (imagePreview) URL.revokeObjectURL(imagePreview); }, [imagePreview]);
  useEffect(() => () => { if (audioUrl) URL.revokeObjectURL(audioUrl); }, [audioUrl]);
  useEffect(() => () => { window.clearInterval(timer.current); mediaRec.current?.stream.getTracks().forEach(t => t.stop()); }, []);

  const pickImage = (f: File | undefined) => {
    if (!f) return;
    if (!f.type.startsWith("image/")) { toast.error("Hitamo ifoto gusa"); return; }
    if (f.size > MAX_IMAGE_MB * 1024 * 1024) { toast.error(`Ifoto irenze ${MAX_IMAGE_MB} MB`); return; }
    setImage(f);
    setImagePreview(URL.createObjectURL(f));
  };
  const clearImage = () => { setImage(null); setImagePreview(""); if (fileInput.current) fileInput.current.value = ""; };

  const stopRec = () => {
    window.clearInterval(timer.current);
    if (mediaRec.current?.state === "recording") mediaRec.current.stop();
    setRecording(false);
  };
  const startRec = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      chunks.current = [];
      rec.ondataavailable = e => chunks.current.push(e.data);
      rec.onstop = () => {
        const blob = new Blob(chunks.current, { type: rec.mimeType || "audio/webm" });
        setAudio(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach(t => t.stop());
      };
      rec.start();
      mediaRec.current = rec;
      setSeconds(0);
      setRecording(true);
      timer.current = window.setInterval(() => {
        setSeconds(s => {
          if (s + 1 >= MAX_AUDIO_SECONDS) stopRec();
          return s + 1;
        });
      }, 1000);
    } catch { toast.error("Ntibyakunze gufungura microphone. Emerera urubuga kuyikoresha."); }
  };
  const clearAudio = () => { setAudio(null); setAudioUrl(""); setSeconds(0); };

  const getLoc = () => {
    if (locationPreference.loading) return;
    if (!locationPreference.allowed) { toast.error("GPS ntiyemewe mu igenamiterere ryawe"); return; }
    if (!navigator.geolocation) { toast.error("Telefoni yawe ntishobora gutanga aho uri"); return; }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      p => { setLocation({ latitude: p.coords.latitude, longitude: p.coords.longitude }); setLocating(false); },
      () => { toast.error("Ntibyashobotse kubona aho uri"); setLocating(false); },
      { timeout: 10000, maximumAge: 300000 },
    );
  };

  const addSymptom = (s: string) => {
    setSymptoms(prev => {
      if (prev.toLowerCase().includes(s.toLowerCase())) return prev;
      return prev.trim() ? `${prev.trim().replace(/[,.]$/, "")}, ${s.toLowerCase()}` : s;
    });
  };

  const reset = () => { clearImage(); clearAudio(); setSymptoms(""); setSubject(""); setLocation(null); };

  const ready = !!image || !!audio || symptoms.trim().length > 2;

  const submit = async () => {
    if (!ready) { toast.error("Tanga byibuze ifoto, ijwi cyangwa ibimenyetso"); return; }
    if (recording) stopRec();
    setLoading(true);
    try {
      const payload: Record<string, unknown> = { type: kind };
      if (subject) payload.subject = subject;
      if (image) { const c = await compressImage(image); payload.imageBase64 = c.base64; payload.imageMime = c.mime; }
      if (audio) { payload.audioBase64 = await blobToBase64(audio); payload.audioMime = audio.type || "audio/webm"; }
      if (symptoms.trim()) payload.symptoms = symptoms.trim();
      if (location && locationPreference.allowed) payload.location = location;

      const { data: { session } } = await supabase.auth.getSession();
      const r = await fetch(DIAGNOSE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify(payload),
      });
      const data = await r.json().catch(() => ({}));
      if (data.error === "LIMIT") {
        toast.error(data.message, { action: { label: "Fata Premium", onClick: () => { window.location.href = "/premium"; } } });
        return;
      }
      if (!r.ok) throw new Error(data.error || "Habaye ikibazo. Ongera ugerageze.");
      onResult({ text: data.result, kind, subject, preview: imagePreview });
      if (user) {
        const { error } = await supabase.from("diagnosis_records").insert({
          user_id: user.id, diagnosis_type: kind,
          input_type: image && audio ? "image+audio" : image ? "image" : audio ? "audio" : "text",
          symptoms_text: [subject, symptoms.trim()].filter(Boolean).join(" — ") || null, ai_diagnosis: data.result,
          latitude: locationPreference.allowed ? location?.latitude : undefined, longitude: locationPreference.allowed ? location?.longitude : undefined,
        });
        if (!error) qc.invalidateQueries({ queryKey: ["diagnosis-history", user.id] });
      }
    } catch (e) { toast.error(e instanceof Error ? e.message : "Habaye ikibazo"); } finally { setLoading(false); }
  };

  const mmss = (s: number) => `0:${String(s).padStart(2, "0")}`;

  return (
    <div className="space-y-6">
      <section>
        <StepTitle n={1} title={kind === "livestock" ? "Ni irihe tungo?" : "Ni ikihe gihingwa?"} hint="Bifasha AI gutanga igisubizo nyacyo" />
        <div className="flex flex-wrap gap-2">
          {SUBJECTS[kind].map(s => (
            <button key={s} type="button" onClick={() => setSubject(subject === s ? "" : s)} aria-pressed={subject === s}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${subject === s ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground hover:border-primary/50"}`}>
              {s}
            </button>
          ))}
        </div>
      </section>

      <section>
        <StepTitle n={2} title="Ifoto" hint={kind === "livestock" ? "Fotora igice kirwaye neza, ahari urumuri" : "Fotora amababi cyangwa igice cyangiritse hafi"} />
        <input ref={fileInput} type="file" accept="image/*" capture="environment" className="hidden" onChange={e => pickImage(e.target.files?.[0])} />
        {imagePreview ? (
          <div className="relative overflow-hidden rounded-xl border border-border bg-muted">
            <img src={imagePreview} className="mx-auto max-h-72 w-full object-contain" alt="Ifoto wahisemo" />
            <div className="absolute right-2 top-2 flex gap-2">
              <Button type="button" size="sm" variant="secondary" onClick={() => fileInput.current?.click()}><ImagePlus className="h-4 w-4" />Hindura</Button>
              <Button type="button" size="icon" variant="secondary" className="h-9 w-9" aria-label="Kuraho ifoto" onClick={clearImage}><X className="h-4 w-4" /></Button>
            </div>
          </div>
        ) : (
          <button type="button" onClick={() => fileInput.current?.click()} className="flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed border-border bg-card px-6 py-10 text-muted-foreground transition-colors hover:border-primary/60 hover:bg-primary/5">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10"><Camera className="h-6 w-6 text-primary" /></span>
            <span className="text-sm font-semibold text-foreground">Fotora cyangwa hitamo ifoto</span>
            <span className="text-xs">JPG, PNG — kugeza kuri {MAX_IMAGE_MB} MB</span>
          </button>
        )}
      </section>

      {kind === "livestock" && (
        <section>
          <StepTitle n={3} title="Ijwi ry'itungo (si ngombwa)" hint={`Fata ijwi ry'inkorora cyangwa uko rihumeka — amasegonda ${MAX_AUDIO_SECONDS} gusa`} />
          <div className="rounded-xl border border-border bg-card p-4">
            {recording ? (
              <div className="flex items-center gap-3">
                <span className="relative flex h-3 w-3"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-75" /><span className="relative inline-flex h-3 w-3 rounded-full bg-destructive" /></span>
                <span className="font-mono text-sm text-foreground">{mmss(seconds)} / {mmss(MAX_AUDIO_SECONDS)}</span>
                <Progress value={(seconds / MAX_AUDIO_SECONDS) * 100} className="h-1.5 flex-1" />
                <Button type="button" size="sm" variant="destructive" onClick={stopRec}><Square className="h-4 w-4" />Hagarika</Button>
              </div>
            ) : audioUrl ? (
              <div className="flex items-center gap-2">
                <audio controls src={audioUrl} className="h-10 min-w-0 flex-1" />
                <Button type="button" size="icon" variant="ghost" aria-label="Siba ijwi" onClick={clearAudio}><Trash2 className="h-4 w-4" /></Button>
              </div>
            ) : (
              <Button type="button" variant="outline" onClick={startRec} className="w-full"><Mic className="h-4 w-4" />Tangira gufata ijwi</Button>
            )}
          </div>
        </section>
      )}

      <section>
        <StepTitle n={kind === "livestock" ? 4 : 3} title="Ibimenyetso" hint="Kanda ku bimenyetso ubona, cyangwa wandike ibindi" />
        <div className="mb-3 flex flex-wrap gap-2">
          {QUICK_SYMPTOMS[kind].map(s => {
            const on = symptoms.toLowerCase().includes(s.toLowerCase());
            return (
              <button key={s} type="button" onClick={() => addSymptom(s)} className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs transition-colors ${on ? "border-accent bg-accent/10 text-foreground" : "border-border bg-card text-muted-foreground hover:text-foreground"}`}>
                {on && <Check className="h-3 w-3 text-accent" />}{s}
              </button>
            );
          })}
        </div>
        <Textarea aria-label="Ibimenyetso" maxLength={1000} placeholder={kind === "livestock" ? "Urugero: imaze iminsi 2 itarya, ifite umuriro, ihumeka nabi" : "Urugero: amababi yatangiye kuba umuhondo mu cyumweru gishize"} value={symptoms} onChange={e => setSymptoms(e.target.value)} rows={3} />
        {kind === "crop" && (
          <Button type="button" variant="outline" size="sm" onClick={getLoc} disabled={locating || locationPreference.loading} className="mt-3 w-full">
            {locating ? <Loader2 className="h-4 w-4 animate-spin" /> : location ? <Check className="h-4 w-4 text-accent" /> : <MapPin className="h-4 w-4" />}
            {location ? `Aho uri: ${location.latitude.toFixed(3)}, ${location.longitude.toFixed(3)}` : "Ongeraho aho umurima uri (si ngombwa)"}
          </Button>
        )}
      </section>

      <div className="sticky bottom-3 z-10 flex gap-2 rounded-xl border border-border bg-background/95 p-2 shadow-lg backdrop-blur sm:static sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none">
        <Button type="button" variant="ghost" onClick={reset} disabled={loading} aria-label="Siba byose"><RotateCcw className="h-4 w-4" /></Button>
        <Button onClick={submit} disabled={loading || !ready} className="flex-1" size="lg">
          {loading ? <><Loader2 className="h-4 w-4 animate-spin" />AI irasuzuma…</> : <><Sparkles className="h-4 w-4" />Suzumisha AI</>}
        </Button>
      </div>
    </div>
  );
}

function ResultCard({ result, onNew }: { result: Result; onNew: () => void }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(result.text); setCopied(true); setTimeout(() => setCopied(false), 2000); }
    catch { toast.error("Ntibyakunze gukoporora"); }
  };
  return (
    <article className="overflow-hidden rounded-2xl border border-primary/30 bg-card shadow-sm">
      <header className="flex items-center gap-3 border-b border-border bg-primary/5 px-5 py-4">
        {result.preview ? <img src={result.preview} alt="" className="h-12 w-12 rounded-lg object-cover" /> : <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10"><Stethoscope className="h-6 w-6 text-primary" /></span>}
        <div className="min-w-0 flex-1">
          <h2 className="font-heading text-lg font-semibold text-foreground">Igisubizo cy'isuzuma</h2>
          <div className="mt-0.5 flex flex-wrap gap-1.5">
            <Badge variant="secondary">{result.kind === "livestock" ? "Itungo" : "Igihingwa"}</Badge>
            {result.subject && <Badge variant="outline">{result.subject}</Badge>}
          </div>
        </div>
      </header>
      <div className="prose prose-sm max-w-none px-5 py-4 text-foreground prose-headings:font-heading prose-headings:text-primary prose-h2:mb-1 prose-h2:mt-4 prose-h2:text-base prose-p:my-1 prose-strong:text-foreground first:prose-h2:mt-0">
        <ReactMarkdown>{result.text}</ReactMarkdown>
      </div>
      <div className="mx-5 mb-4 flex gap-2 rounded-lg bg-muted p-3 text-xs text-muted-foreground">
        <ShieldAlert className="h-4 w-4 shrink-0 text-secondary-foreground" />
        <p>Iki ni igitekerezo cya AI, si icyemezo cya muganga. Niba ikibazo gikomeye cyangwa kidakira, baza umuveterineri cyangwa agronome.</p>
      </div>
      <footer className="flex flex-wrap gap-2 border-t border-border px-5 py-3">
        <Button size="sm" variant="outline" onClick={copy}>{copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}{copied ? "Byakopowe" : "Koporora"}</Button>
        <Button size="sm" variant="outline" onClick={onNew}><RotateCcw className="h-4 w-4" />Isuzuma rishya</Button>
        {result.kind === "livestock" && <Button size="sm" asChild><Link to="/vets"><Stethoscope className="h-4 w-4" />Vugana n'umuveterineri</Link></Button>}
      </footer>
    </article>
  );
}

function HistoryList() {
  const { user } = useAuth();
  const { data, isPending } = useQuery({
    queryKey: ["diagnosis-history", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("diagnosis_records").select("id, created_at, diagnosis_type, symptoms_text, ai_diagnosis").eq("user_id", user!.id).order("created_at", { ascending: false }).limit(5);
      if (error) throw error;
      return data;
    },
  });
  if (isPending) return <div className="space-y-2">{[0, 1].map(i => <div key={i} className="h-12 animate-pulse rounded-lg bg-muted" />)}</div>;
  if (!data?.length) return <p className="rounded-lg border border-dashed border-border p-4 text-center text-sm text-muted-foreground">Nta suzuma urakora. Isuzuma ryawe rizagaragara hano.</p>;
  return (
    <Accordion type="single" collapsible className="rounded-xl border border-border bg-card">
      {data.map(d => (
        <AccordionItem key={d.id} value={d.id} className="px-4 last:border-b-0">
          <AccordionTrigger className="gap-3 text-left hover:no-underline">
            <span className="flex min-w-0 flex-1 items-center gap-2">
              <span aria-hidden>{d.diagnosis_type === "livestock" ? "🐄" : "🌱"}</span>
              <span className="truncate text-sm font-medium text-foreground">{d.symptoms_text || (d.diagnosis_type === "livestock" ? "Itungo" : "Igihingwa")}</span>
            </span>
            <span className="shrink-0 text-xs font-normal text-muted-foreground">{new Date(d.created_at).toLocaleDateString("fr-RW", { day: "numeric", month: "short" })}</span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="prose prose-sm max-w-none text-foreground prose-headings:text-primary prose-h2:mb-1 prose-h2:mt-3 prose-h2:text-sm prose-p:my-1"><ReactMarkdown>{d.ai_diagnosis || ""}</ReactMarkdown></div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

export default function Diagnose() {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const [kind, setKind] = useState<Kind>("livestock");
  const [result, setResult] = useState<Result | null>(null);
  const [formKey, setFormKey] = useState(0);
  const resultRef = useRef<HTMLDivElement>(null);
  const { premium, used } = usePlan(result?.text);

  useEffect(() => { if (!loading && !user) nav("/auth"); }, [loading, user, nav]);
  useEffect(() => { if (result) resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); }, [result]);
  if (!user) return null;

  const left = Math.max(0, FREE_LIMIT - used);
  const startNew = () => { setResult(null); setFormKey(k => k + 1); window.scrollTo({ top: 0, behavior: "smooth" }); };

  const kinds: { id: Kind; title: string; desc: string; img: string }[] = [
    { id: "livestock", title: "Amatungo", desc: "Inka, ihene, inkoko…", img: cattleImg },
    { id: "crop", title: "Ibihingwa", desc: "Ibigori, ibirayi, ikawa…", img: cropImg },
  ];

  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <header className="mb-6">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-accent">Isuzuma rya AI</p>
          <h1 className="font-heading text-3xl font-bold text-foreground">Menya indwara n'umuti mu masegonda</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">Tanga ifoto, ijwi cyangwa ibimenyetso — AI iguhe indwara ishoboka, umuti n'icyo ukora ubu.</p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Icyo usuzuma">
              {kinds.map(k => (
                <button key={k.id} type="button" role="radio" aria-checked={kind === k.id} onClick={() => { setKind(k.id); setResult(null); }}
                  className={`group relative h-28 overflow-hidden rounded-xl border-2 text-left transition-all sm:h-32 ${kind === k.id ? "border-primary ring-2 ring-primary/20" : "border-transparent opacity-80 hover:opacity-100"}`}>
                  <img src={k.img} alt="" className="absolute inset-0 h-full w-full object-cover transition-transform group-hover:scale-105" />
                  <span className="absolute inset-0 bg-gradient-to-t from-foreground/85 via-foreground/40 to-transparent" />
                  <span className="absolute bottom-3 left-3 right-3">
                    <span className="block font-heading text-lg font-semibold text-primary-foreground">{k.title}</span>
                    <span className="block text-xs text-primary-foreground/80">{k.desc}</span>
                  </span>
                  {kind === k.id && <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary"><Check className="h-4 w-4 text-primary-foreground" /></span>}
                </button>
              ))}
            </div>

            <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
              <DiagnoseForm key={`${kind}-${formKey}`} kind={kind} onResult={setResult} />
            </div>

            {result && <div ref={resultRef} className="scroll-mt-20"><ResultCard result={result} onNew={startNew} /></div>}
          </div>

          <aside className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-4">
              {premium ? (
                <div className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /><span className="text-sm font-bold text-primary">Premium — isuzuma nta mupaka</span></div>
              ) : (
                <>
                  <div className="mb-2 flex items-baseline justify-between">
                    <span className="text-sm font-semibold text-foreground">Isuzuma ry'ubuntu</span>
                    <span className="text-xs text-muted-foreground">{Math.min(used, FREE_LIMIT)}/{FREE_LIMIT} uku kwezi</span>
                  </div>
                  <Progress value={(Math.min(used, FREE_LIMIT) / FREE_LIMIT) * 100} className="h-2" />
                  <p className="mt-2 text-xs text-muted-foreground">{left > 0 ? `Usigaje ${left}.` : "Warangije isuzuma ry'ubuntu."} <Link to="/premium" className="font-semibold text-primary">Fata Premium</Link></p>
                </>
              )}
            </div>

            <div className="rounded-xl border border-border bg-card p-4">
              <h2 className="mb-2 font-heading text-sm font-semibold text-foreground">Inama zo gufotora neza</h2>
              <ul className="space-y-1.5 text-xs text-muted-foreground">
                <li className="flex gap-2"><Check className="h-3.5 w-3.5 shrink-0 text-accent" />Fotora ku manywa, ahari urumuri</li>
                <li className="flex gap-2"><Check className="h-3.5 w-3.5 shrink-0 text-accent" />Egera igice kirwaye</li>
                <li className="flex gap-2"><Check className="h-3.5 w-3.5 shrink-0 text-accent" />Ongeraho ibimenyetso n'igihe bimaze</li>
              </ul>
            </div>

            <div>
              <h2 className="mb-2 flex items-center gap-2 font-heading text-sm font-semibold text-foreground"><History className="h-4 w-4" />Isuzuma rya vuba</h2>
              <HistoryList />
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
