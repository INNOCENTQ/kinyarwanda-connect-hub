import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

export function phoneToEmail(phone: string) {
  const input = phone.trim();
  // Keep signup normalization in sync with the browser login helper.
  if (!/^\+?[\d\s().-]+$/.test(input)) return null;
  const digits = input.replace(/\D/g, '');
  const local = digits.startsWith('250') ? digits.slice(3) : digits.replace(/^0/, '');
  if (!/^7\d{8}$/.test(local)) return null;
  return `250${local}@phone.umuhinzi.app`;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Uburyo bwo kohereza amakuru si bwo' }, 405);
  try {
    const { phone, password, full_name } = await req.json().catch(() => ({}));
    const email = phoneToEmail(String(phone ?? ''));
    if (!email) return json({ error: 'Nimero ya telefoni si yo (07XXXXXXXX cyangwa +2507XXXXXXXX)' }, 400);
    if (typeof password !== 'string' || password.length < 6) return json({ error: "Ijambo ry'ibanga rigomba kuba nibura inyuguti 6" }, 400);
    const name = String(full_name ?? '').trim().slice(0, 100);
    if (!name) return json({ error: 'Andika amazina yawe' }, 400);

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !serviceRoleKey) {
      console.error('Phone signup is missing required Supabase environment configuration');
      return json({ error: 'Serivisi yo gufungura konti ntibonetse' }, 500);
    }

    const admin = createClient(supabaseUrl, serviceRoleKey);
    const { error } = await admin.auth.admin.createUser({
      email, password, email_confirm: true,
      user_metadata: { full_name: name, phone: '0' + email.slice(3, 12) },
    });
    if (error) {
      const exists = /already|registered|exists/i.test(error.message);
      return json({ error: exists ? 'Iyi nimero isanzwe ifite konti. Injira.' : 'Ntibyashobotse gufungura konti' }, exists ? 409 : 400);
    }
    return json({ ok: true });
  } catch (error) {
    console.error('Phone signup failed', error);
    return json({ error: 'Ikibazo cyabaye' }, 500);
  }
});
