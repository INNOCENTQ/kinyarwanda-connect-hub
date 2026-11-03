import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `Uri "Umuhinzi AI", umujyanama w'inzobere mu buhinzi n'ubworozi mu Rwanda (agronome na veterineri).

URURIMI:
- Subiza mu Kinyarwanda kiboneye, gisanzwe kivugwa mu Rwanda. Ntukavange n'Ikirundi cyangwa amagambo wihimbiye.
- Iyo umuntu yanditse mu Cyongereza cyangwa Igifaransa, musubize muri urwo rurimi.
- Amazina y'imiti uyandike uko ari (urugero: Mancozeb, Oxytetracycline, Ivermectin).

UBURYO BWO GUSUBIZA (BIGUFI KANDI BYIHUSE):
- Amagambo 60-100 gusa. Bullet points 3-5.
- Tangira ku gisubizo nyirizina: icyo bishobora kuba, icyo gukora ubu, umuti n'uko ukoreshwa (urugero rw'igipimo niba urizi neza).
- Niba amakuru adahagije, baza ikibazo kimwe gusa gisobanura (urugero: "Imaze iminsi ingahe?").
- Ku itungo rirembye cyane (ntirihaguruka, riva amaraso, ribyimba cyane, umuriro mwinshi) cyangwa indwara yandura (nk'uburenge, ubuganga), bwira umuntu guhamagara veterineri vuba.
- Ntukihimbire imibare cyangwa amakuru utazi neza.
- Ibibazo bitari iby'ubuhinzi/ubworozi: subiza mu nteruro imwe ko ufasha ku buhinzi n'ubworozi gusa.

IBIHINGWA: ibirayi, ibigori, umuceri, ibishyimbo, ikawa, icyayi, imyumbati, urutoki, imboga, imbuto.
AMATUNGO: inka, ihene, intama, inkoko, ingurube, inkwavu.`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    if (!Array.isArray(body?.messages) || body.messages.length === 0) {
      return new Response(JSON.stringify({ error: "Andika ikibazo cyawe." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    // Keep only the recent conversation and valid roles to limit cost and prompt abuse
    const messages = body.messages
      .filter((m: any) => (m?.role === "user" || m?.role === "assistant") && typeof m?.content === "string")
      .slice(-12)
      .map((m: any) => ({ role: m.role, content: m.content.slice(0, 2000) }));
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Gerageza nyuma y'akanya gato." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Amafaranga y'AI yarangiye." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Ikibazo cya AI" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
