import { Sprout, MessageCircle, Stethoscope, Store, CloudSun, Mic, Camera, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import AppNav from "@/components/AppNav";

const FEATURES = [
  { icon: MessageCircle, title: "AI Chatbot", desc: "Baza ikibazo cyose ku buhinzi & ubworozi", to: "/chat" },
  { icon: Stethoscope, title: "Gusuzuma indwara", desc: "Fotora itungo cg igihingwa, AI ikuvure", to: "/diagnose" },
  { icon: Store, title: "Isoko ry'abahinzi", desc: "Guranisha cg uhindurane ibihingwa & matungo", to: "/marketplace" },
  { icon: CloudSun, title: "Ikirere", desc: "Reba ikirere n'inama z'iminsi 7 iri imbere", to: "/weather" },
];

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
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
        <div className="relative max-w-5xl mx-auto px-4 py-20 sm:py-24 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <Sprout className="h-4 w-4" />Ubuhinzi n'Ubworozi
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-foreground leading-tight mb-6">
            AI ifasha umuhinzi<br /><span className="text-primary">n'umworozi w'u Rwanda</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
            Fotora itungo ryawe ryarwaye cyangwa igihingwa, AI ikubwire indwara, umuti, n'aho wabona umuguzi. Byose mu Kinyarwanda.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link to="/diagnose" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold hover:bg-primary/90 shadow-lg shadow-primary/25">
              <Stethoscope className="h-5 w-5" />Suzumisha
            </Link>
            <Link to="/marketplace" className="inline-flex items-center gap-2 bg-card border border-border text-foreground px-6 py-3 rounded-xl font-semibold hover:bg-muted">
              <Store className="h-5 w-5" />Reba isoko
            </Link>
          </div>
        </div>
      </header>

      <section className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-foreground mb-12">Ibyo dukora</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((f, i) => (
            <Link key={i} to={f.to} className="bg-card border border-border rounded-xl p-6 text-center space-y-3 hover:shadow-md hover:border-primary/40 transition-all">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                <f.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-bold text-foreground">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-muted/30 py-16">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-foreground mb-12">Uburyo bukoreshwa</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW.map((h, i) => (
              <div key={i} className="text-center space-y-3">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary text-primary-foreground"><h.icon className="h-7 w-7" /></div>
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
