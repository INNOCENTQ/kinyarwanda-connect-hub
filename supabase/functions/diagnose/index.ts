import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

const FREE_LIMIT = 10;

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
    const body = await req.json().catch(() => ({}));
    const { type, imageMime, audioMime, location, weather } = body;
    const imageBase64 = typeof body.imageBase64 === 'string' ? body.imageBase64 : '';
    const audioBase64 = typeof body.audioBase64 === 'string' ? body.audioBase64 : '';
    const symptoms = typeof body.symptoms === 'string' ? body.symptoms.slice(0, 1000) : '';
    const subject = typeof body.subject === 'string' ? body.subject.slice(0, 40) : '';
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY missing');

    // Free plan: 3 diagnoses per month; premium unlimited
    const json = (b: unknown, s: number) => new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    const authHeader = req.headers.get('Authorization') || '';
    const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: authHeader } } });
    const { data: { user } } = await sb.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return json({ error: 'Banza winjire.' }, 401);
    if (type !== 'crop' && type !== 'livestock') return json({ error: 'Hitamo itungo cyangwa igihingwa.' }, 400);
    if (!imageBase64 && !audioBase64 && !symptoms.trim()) return json({ error: 'Tanga ifoto, ijwi cyangwa ibimenyetso.' }, 400);
    if (imageBase64.length > 8_000_000 || audioBase64.length > 8_000_000) return json({ error: 'Ifoto cyangwa ijwi ni binini cyane.' }, 413);
    const { data: premium } = await sb.rpc('is_premium', { _uid: user.id });
    if (!premium) {
      const start = new Date(); start.setUTCDate(1); start.setUTCHours(0, 0, 0, 0);
      const { count } = await sb.from('diagnosis_records').select('id', { count: 'exact', head: true }).eq('user_id', user.id).gte('created_at', start.toISOString());
      if ((count ?? 0) >= FREE_LIMIT) return json({ error: 'LIMIT', message: `Wakoresheje isuzuma ${FREE_LIMIT} ry'ubuntu uku kwezi. Fata Premium ukomeze.` }, 403);
    }

    const userContent: any[] = [];
    let prompt = '';
    if (type === 'crop') {
      prompt = `Suzuma iki gihingwa${subject ? ` (${subject})` : ''}.`;
      if (symptoms) prompt += `\nIbimenyetso umuhinzi yatanze: ${symptoms}`;
      if (location) prompt += `\nAho giherereye: ${location.district || ''} ${location.sector || ''} (lat:${location.latitude}, lng:${location.longitude}).`;
      if (weather) prompt += `\nIkirere: ${weather}.`;
    } else {
      prompt = `Suzuma iri tungo${subject ? ` (${subject})` : ''}.`;
      if (symptoms) prompt += `\nIbimenyetso umuhinzi yatanze: ${symptoms}`;
      if (audioBase64) prompt += `\n(Hari n'ijwi ry'itungo ryometseho - rikoreshe mu gusuzuma.)`;
    }
    userContent.push({ type: 'text', text: prompt });
    if (imageBase64) {
      userContent.push({ type: 'image_url', image_url: { url: `data:${imageMime || 'image/jpeg'};base64,${imageBase64}` } });
    }
    if (audioBase64) {
      userContent.push({ type: 'input_audio', input_audio: { data: audioBase64, format: String(audioMime || 'audio/webm').split('/')[1].split(';')[0] } });
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
