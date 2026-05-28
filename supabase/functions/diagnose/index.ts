import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

const SYSTEM_LIVESTOCK = `Uri inzobere mu buvuzi bw'amatungo mu Rwanda. Subiza BIGUFI cyane mu Kinyarwanda (max 80 amagambo).

Tanga gusa:
## Indwara: (1 ishoboka + %)
## Umuti: (izina + uburyo bwo gukoresha mu magambo make)
## Inama: (intambwe 1-2)
## Muganga: (interuro 1 - igihe cyo kujya kwa muganga)

Nta nyandiko ndende, nta kwisubiramo.`;

const SYSTEM_CROP = `Uri inzobere mu buhinzi bw'u Rwanda. Subiza BIGUFI cyane mu Kinyarwanda (max 80 amagambo).

Tanga gusa:
## Igihingwa: (izina + uko gimeze)
## Ikibazo: (indwara/udukoko + %)
## Umuti: (izina + dosage mu magambo make)
## Inama: (intambwe 1-2)

Nta nyandiko ndende.`;

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
