import { Sprout, MessageCircle, CloudSun, Bug, Heart } from "lucide-react";
import { useState } from "react";
import FarmingChat from "@/components/FarmingChat";

const FEATURES = [
  { icon: MessageCircle, title: "Ibibazo by'ubuhinzi", desc: "Baza ikibazo icyo aricyo cyose ku buhinzi" },
  { icon: Bug, title: "Indwara n'imiti", desc: "Menya indwara z'ibihingwa n'imiti yazo" },
  { icon: CloudSun, title: "Ikirere n'ibihe", desc: "Amakuru ku bihe byo gutera no gusarura" },
  { icon: Heart, title: "Ubworozi", desc: "Ubufasha ku ndwara z'amatungo n'ifashwe ryayo" },
];

const Index = () => {
  const [showChat, setShowChat] = useState(false);

  if (showChat) {
    return (
      <div className="flex flex-col h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border bg-card px-4 py-3 flex items-center gap-3">
          <button onClick={() => setShowChat(false)} className="text-muted-foreground hover:text-foreground text-sm">
            ← Subira
          </button>
          <div className="flex items-center gap-2">
            <Sprout className="h-5 w-5 text-primary" />
            <span className="font-semibold text-foreground">Umuhinzi AI</span>
          </div>
        </header>
        <FarmingChat />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
        <div className="relative max-w-5xl mx-auto px-4 py-20 sm:py-28 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <Sprout className="h-4 w-4" />
            Ubuhinzi n'Ubworozi
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-foreground leading-tight mb-6">
            Umujyanama w'ubuhinzi<br />
            <span className="text-primary">wa buri munsi</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Baza ikibazo icyo ari cyo cyose ku buhinzi n'ubworozi. Umuhinzi AI azagusubiza mu Kinyarwanda, 
            akakubwira ikirere, imiti y'ibihingwa, n'uburyo bwo kwita ku matungo yawe.
          </p>
          <button
            onClick={() => setShowChat(true)}
            className="inline-flex items-center gap-3 bg-primary text-primary-foreground px-8 py-4 rounded-xl text-lg font-semibold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25"
          >
            <MessageCircle className="h-5 w-5" />
            Tangira kuvugana na AI
          </button>
        </div>
      </header>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-foreground mb-12">
          Ibyo Umuhinzi AI akora
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((f, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-6 text-center space-y-3 hover:shadow-md transition-shadow">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                <f.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-bold text-foreground">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        <p>© 2026 Umuhinzi AI — Kubakiwe n'urukundo ku buhinzi bw'u Rwanda 🇷🇼</p>
      </footer>
    </div>
  );
};

export default Index;
