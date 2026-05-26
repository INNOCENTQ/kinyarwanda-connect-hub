import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

const SYSTEM_LIVESTOCK = `Uri inzobere mu buvuzi bw'amatungo mu Rwanda. Iyo wahawe ifoto, ijwi cyangwa ibimenyetso by'itungo (inka, ihene, intama, inkoko, ingurube), suzuma:
1. INDWARA ISHOBOKA (tanga 1-3 zishoboka n'ibyizere %).
2. IBIMENYETSO bigaragara.
3. UMUTI / UBUVUZI (imiti yo mu Rwanda + uburyo bwo gukoresha).
4. INAMA z'uko itungo riterwa rikitabwaho.
5. IGIHE CYO KUJYA KWA MUGANGA W'AMATUNGO.
Subiza mu Kinyarwanda gusa, mu buryo bwumvikana. Koresha imitwe (##) na bullet points.`;

const SYSTEM_CROP = `Uri inzobere mu buhinzi bw'u Rwanda. Iyo wahawe ifoto y'ibihingwa hamwe n'aho biherereye n'ikirere, suzuma:
1. IGIHINGWA cyagaragaye.
2. UKO GIMEZE (kizima cyangwa kirwaye).
3. INDWARA / UDUKOKO bishoboka (n'ibyizere %).
4. UMUTI (imiti y'ubuhinzi iboneka mu Rwanda + dosage).
5. INAMA ku kirere n'ahantu (gutera, kuvomerera, ifumbire).
Subiza mu Kinyarwanda gusa, ukoresha imitwe (##) na bullet points.`;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { type, imageBase64, imageMime, audioBase64, audioMime, symptoms, location, weather } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY missing');

    const userContent: any[] = [];
    let prompt = '';
    if (type === 'crop') {
      prompt = `Suzuma iki gihingwa.`;
      if (location) prompt += `\nAho giherereye: ${location.district || ''} ${location.sector || ''} (lat:${location.latitude}, lng:${location.longitude}).`;
      if (weather) prompt += `\nIkirere: ${weather}.`;
    } else {
      prompt = `Suzuma iri tungo.`;
      if (symptoms) prompt += `\nIbimenyetso umuhinzi yatanze: ${symptoms}`;
      if (audioBase64) prompt += `\n(Hari n'ijwi ry'itungo ryometseho - rikoreshe mu gusuzuma.)`;
    }
    userContent.push({ type: 'text', text: prompt });
    if (imageBase64) {
      userContent.push({ type: 'image_url', image_url: { url: `data:${imageMime || 'image/jpeg'};base64,${imageBase64}` } });
    }
    if (audioBase64) {
      userContent.push({ type: 'input_audio', input_audio: { data: audioBase64, format: (audioMime || 'audio/webm').split('/')[1] } });
    }

    const resp = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'google/gemini-2.5-pro',
        messages: [
          { role: 'system', content: type === 'crop' ? SYSTEM_CROP : SYSTEM_LIVESTOCK },
          { role: 'user', content: userContent },
        ],
      }),
    });

    if (!resp.ok) {
      const t = await resp.text();
      console.error('AI error', resp.status, t);
      if (resp.status === 429) return new Response(JSON.stringify({ error: 'Gerageza nyuma y\'akanya.' }), { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      if (resp.status === 402) return new Response(JSON.stringify({ error: 'Amafaranga ya AI yarangiye.' }), { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      return new Response(JSON.stringify({ error: 'Ikibazo cya AI' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const data = await resp.json();
    const result = data.choices?.[0]?.message?.content || 'Nta gisubizo.';
    return new Response(JSON.stringify({ result }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : 'Unknown' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
