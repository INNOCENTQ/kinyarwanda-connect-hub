import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

const SYSTEM = `Uri inzobere mu buhinzi bw'u Rwanda. Hawe amakuru y'ikirere cy'iminsi iri imbere n'igihingwa. Tanga inama BIGUFI mu Kinyarwanda (max 70 amagambo).

Andika gusa:
## Inama y'uyu munsi
- (intambwe 1-2 zihuse)

## Kwitondera
- (ibyago 1-2 - urugero: imvura nyinshi, izuba ryinshi)

Nta nyandiko ndende.`;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const { weather, crop, location } = await req.json();
    const KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!KEY) throw new Error('LOVABLE_API_KEY missing');

    const prompt = `Igihingwa: ${crop || 'rusange'}.\nAho: ${location || 'Rwanda'}.\nIkirere cy'iminsi 5:\n${weather}`;

    const r = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [{ role: 'system', content: SYSTEM }, { role: 'user', content: prompt }],
      }),
    });
    if (!r.ok) {
      const t = await r.text();
      console.error('AI error', r.status, t);
      if (r.status === 429) return new Response(JSON.stringify({ error: "Gerageza nyuma y'akanya." }), { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      if (r.status === 402) return new Response(JSON.stringify({ error: 'Amafaranga ya AI yarangiye.' }), { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      return new Response(JSON.stringify({ error: 'Ikibazo cya AI' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const data = await r.json();
    return new Response(JSON.stringify({ advice: data.choices?.[0]?.message?.content || '' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : 'Unknown' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
