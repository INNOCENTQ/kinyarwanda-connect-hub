import { useState, useRef, useEffect } from "react";
import AppNav from "@/components/AppNav";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera, Mic, Square, Loader2, Upload, MapPin } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import { usePlan } from "@/hooks/usePlan";
import { useLocationPreference } from "@/hooks/useLocationPreference";

const DIAGNOSE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/diagnose`;

const fileToBase64 = (f: File | Blob) => new Promise<string>((res, rej) => {
  const r = new FileReader();
  r.onload = () => res((r.result as string).split(",")[1]);
  r.onerror = rej;
  r.readAsDataURL(f);
});

function MediaInput({ type, onResult }: { type: "livestock" | "crop"; onResult: (r: string) => void }) {
  const { user } = useAuth();
  const locationPreference = useLocationPreference();
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [audio, setAudio] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>("");
  const [symptoms, setSymptoms] = useState("");
  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const mediaRec = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);

  const pickImage = (f: File | undefined) => {
    if (!f) return;
    setImage(f);
    setImagePreview(URL.createObjectURL(f));
  };

  const startRec = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      chunks.current = [];
      rec.ondataavailable = e => chunks.current.push(e.data);
      rec.onstop = () => {
        const blob = new Blob(chunks.current, { type: "audio/webm" });
        setAudio(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach(t => t.stop());
      };
      rec.start();
      mediaRec.current = rec;
      setRecording(true);
    } catch { toast.error("Ntibikunze gufungura microphone"); }
  };
  const stopRec = () => { mediaRec.current?.stop(); setRecording(false); };

  const getLoc = () => {
    if (locationPreference.loading) return;
    if (!locationPreference.allowed) { toast.error("GPS ntiyemewe mu igenamiterere ryawe"); return; }
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(p => setLocation({ latitude: p.coords.latitude, longitude: p.coords.longitude }), () => toast.error("Ntibyashobotse kubona aho uri"));
  };

  const submit = async () => {
    if (!image && !audio && !symptoms.trim()) { toast.error("Tanga byibuze ifoto, ijwi cyangwa ibimenyetso"); return; }
    setLoading(true);
    try {
      const payload: any = { type };
      if (image) { payload.imageBase64 = await fileToBase64(image); payload.imageMime = image.type; }
      if (audio) { payload.audioBase64 = await fileToBase64(audio); payload.audioMime = "audio/webm"; }
      if (symptoms) payload.symptoms = symptoms;
      if (location && locationPreference.allowed) payload.location = location;

      const { data: { session } } = await supabase.auth.getSession();
      const r = await fetch(DIAGNOSE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify(payload),
      });
      const data = await r.json();
      if (data.error === "LIMIT") {
        toast.error(data.message, { action: { label: "Fata Premium", onClick: () => { window.location.href = "/premium"; } } });
        return;
      }
      if (!r.ok) throw new Error(data.error || "Ikibazo");
      onResult(data.result);
      if (user) {
        await supabase.from("diagnosis_records").insert({
          user_id: user.id, diagnosis_type: type,
          input_type: image && audio ? "image+audio" : image ? "image" : audio ? "audio" : "text",
          symptoms_text: symptoms || null, ai_diagnosis: data.result,
          latitude: locationPreference.allowed ? location?.latitude : undefined, longitude: locationPreference.allowed ? location?.longitude : undefined,
        });
      }
    } catch (e: any) { toast.error(e.message); } finally { setLoading(false); }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block">
          <input type="file" accept="image/*" capture="environment" className="hidden" onChange={e => pickImage(e.target.files?.[0])} />
          <div className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:bg-muted">
            {imagePreview ? <img src={imagePreview} className="max-h-48 mx-auto rounded" alt="" /> : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <Camera className="h-8 w-8" /><span className="text-sm">Fotora cyangwa hitamo ifoto</span>
              </div>
            )}
          </div>
        </label>
      </div>

      {type === "livestock" && (
        <div className="border border-border rounded-xl p-4 space-y-2">
          <p className="text-sm font-medium text-foreground flex items-center gap-2"><Mic className="h-4 w-4" /> Ijwi ry'itungo</p>
          <div className="flex gap-2 items-center">
            {!recording ? (
              <Button type="button" size="sm" variant="outline" onClick={startRec}><Mic className="h-4 w-4" />Tangira</Button>
            ) : (
              <Button type="button" size="sm" variant="destructive" onClick={stopRec}><Square className="h-4 w-4" />Hagarika</Button>
            )}
            {audioUrl && <audio controls src={audioUrl} className="flex-1 h-8" />}
          </div>
        </div>
      )}

      <Textarea placeholder={type === "livestock" ? "Sobanura ibimenyetso (urugero: nta byo kurya, umuriro, ihumeka nabi)" : "Sobanura ibibazo by'igihingwa (urugero: amababi yumye, ibara ryahindutse)"} value={symptoms} onChange={e => setSymptoms(e.target.value)} rows={3} />

      {type === "crop" && (
        <Button type="button" variant="outline" size="sm" onClick={getLoc} className="w-full">
          <MapPin className="h-4 w-4" />{location ? `Aho uri: ${location.latitude.toFixed(3)}, ${location.longitude.toFixed(3)}` : "Tanga aho uri (location)"}
        </Button>
      )}

      <Button onClick={submit} disabled={loading} className="w-full" size="lg">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
        Ohereza kuri AI isuzume
      </Button>
    </div>
  );
}

export default function Diagnose() {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const [result, setResult] = useState("");
  const { premium, used } = usePlan(result);

  useEffect(() => { if (!loading && !user) nav("/auth"); }, [loading, user, nav]);
  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Gusuzuma na AI</h1>
        <p className="text-muted-foreground mb-4">Fotora itungo cyangwa igihingwa, AI izaguha indwara n'umuti.</p>
        <div className="mb-6 flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-3 text-sm">
          {premium ? <span className="font-bold text-primary">Premium — gusuzuma nta mupaka</span> : <span className="text-muted-foreground">Ubuntu: wakoresheje {Math.min(used, 3)}/3 uku kwezi</span>}
          {!premium && <Link to="/premium" className="font-bold text-primary">Fata Premium</Link>}
        </div>
        <Tabs defaultValue="livestock">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="livestock">🐄 Amatungo</TabsTrigger>
            <TabsTrigger value="crop">🌱 Ibihingwa</TabsTrigger>
          </TabsList>
          <TabsContent value="livestock" className="mt-6"><MediaInput type="livestock" onResult={setResult} /></TabsContent>
          <TabsContent value="crop" className="mt-6"><MediaInput type="crop" onResult={setResult} /></TabsContent>
        </Tabs>
        {result && (
          <div className="mt-8 bg-card border border-border rounded-xl p-6">
            <h2 className="font-bold text-primary mb-3">Igisubizo cya AI</h2>
            <div className="prose prose-sm max-w-none text-foreground"><ReactMarkdown>{result}</ReactMarkdown></div>
          </div>
        )}
      </main>
    </div>
  );
}
