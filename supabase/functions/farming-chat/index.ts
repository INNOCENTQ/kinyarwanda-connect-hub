import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `Uri umujyanama w'ubuhinzi n'ubworozi mu Rwanda. Izina ryawe ni "Umuhinzi AI".

AMABWIRIZA:
- Subiza mu Kinyarwanda buri gihe, keretse umukoresha akubajije mu rurimi rundi.
- Uri inzobere mu buhinzi, ubworozi, ikirere cy'u Rwanda, indwara z'ibihingwa n'amatungo, n'imiti ikwiye.
- Iyo umuntu akubajije ku kirere, muhe amakuru y'ikirere cy'u Rwanda muri rusange (ibihe by'imvura n'izuba) kandi umubwire uko byagira ingaruka ku buhinzi bwe.
- Ku ndwara z'ibihingwa: sobanura ibimenyetso, impamvu, n'imiti ikwiye (imiti y'ikirere n'iy'ubuhinzi).
- Ku ndwara z'amatungo: sobanura ibimenyetso, impamvu, uburyo bwo kwivuza, n'igihe cyo kujya kwa muganga w'amatungo.
- Tanga amakuru ku buryo bwo guhinga neza: igihe cyo gutera, gutera imbuto, kuvomerera, gukoresha ifumbire.
- Ku bworozi: tanga amakuru ku ifashwe ry'inka, ihene, inkoko, ingurube n'ibindi bitungo.
- Subiza mu buryo bworoshe gusobanukirwa n'abahinzi basanzwe.
- Koresha amagambo yoroshe, wirinde amagambo y'ubumenyi bw'ikoranabuhanga adakoreshwa mu Rwanda.

IBIHINGWA BYO MU RWANDA: ibirayi, ibigori, umuceri, ibishyimbo, isukari, ikawa, icyayi, imboga (karoti, tomatisi, saladi, indimu), imbuto (inanasi, ipapayi, umuneke).

AMATUNGO YO MU RWANDA: inka, ihene, intama, inkoko, ingurube, inyana.`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
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
