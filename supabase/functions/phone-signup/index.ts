import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

export function phoneToEmail(phone: string) {
  const d = phone.replace(/\D/g, '');
  const local = d.startsWith('250') ? d.slice(3) : d.replace(/^0/, '');
  if (!/^7\d{8}$/.test(local)) return null;
  return `250${local}@phone.umuhinzi.app`;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const { phone, password, full_name } = await req.json().catch(() => ({}));
    const email = phoneToEmail(String(phone ?? ''));
    if (!email) return json({ error: 'Nimero ya telefoni si yo (07XXXXXXXX)' }, 400);
    if (typeof password !== 'string' || password.length < 6) return json({ error: "Ijambo ry'ibanga rigomba kuba nibura inyuguti 6" }, 400);
    const name = String(full_name ?? '').trim().slice(0, 100);
    if (!name) return json({ error: 'Andika amazina yawe' }, 400);

    const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { error } = await admin.auth.admin.createUser({
      email, password, email_confirm: true,
      user_metadata: { full_name: name, phone: '0' + email.slice(3, 12) },
    });
    if (error) {
      const exists = /already|registered|exists/i.test(error.message);
      return json({ error: exists ? 'Iyi nimero isanzwe ifite konti. Injira.' : 'Ntibyashobotse gufungura konti' }, exists ? 409 : 400);
    }
    return json({ ok: true });
  } catch {
    return json({ error: 'Ikibazo cyabaye' }, 500);
  }
});
