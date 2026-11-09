import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

function phoneToEmail(phone: string) {
  const digits = phone.replace(/\D/g, '');
  const local = digits.startsWith('250') ? digits.slice(3) : digits.replace(/^0/, '');
  return /^7\d{8}$/.test(local) ? `250${local}@phone.umuhinzi.app` : null;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const url = Deno.env.get('SUPABASE_URL')!;
    const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const token = (req.headers.get('Authorization') ?? '').replace('Bearer ', '');
    const { data: { user: caller } } = await admin.auth.getUser(token);
    if (!caller) return json({ error: 'Banza winjire' }, 401);
    const { data: isAdmin } = await admin.rpc('has_role', { _user_id: caller.id, _role: 'admin' });
    if (!isAdmin) return json({ error: 'Ubuyobozi gusa' }, 403);

    const { identifier, password, full_name, make_admin } = await req.json().catch(() => ({}));
    const id = String(identifier ?? '').trim();
    const email = id.includes('@') ? (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(id) ? id.toLowerCase() : null) : phoneToEmail(id);
    if (!email) return json({ error: 'Imeyili cyangwa telefone si byo' }, 400);
    if (typeof password !== 'string' || password.length < 6) return json({ error: "Ijambo ry'ibanga rigomba kuba nibura inyuguti 6" }, 400);
    const name = String(full_name ?? '').trim().slice(0, 100);
    if (!name) return json({ error: 'Andika amazina' }, 400);
    const phone = email.endsWith('@phone.umuhinzi.app') ? '0' + email.slice(3, 12) : undefined;

    const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { full_name: name, phone } });
    if (error) {
      const exists = /already|registered|exists/i.test(error.message);
      return json({ error: exists ? 'Iyi konti isanzwe ibaho' : 'Ntibyashobotse gufungura konti' }, exists ? 409 : 400);
    }
    if (make_admin) await admin.from('user_roles').insert({ user_id: data.user.id, role: 'admin' });
    return json({ ok: true });
  } catch (e) {
    console.error('admin-create-user failed', e);
    return json({ error: 'Ikibazo cyabaye' }, 500);
  }
});
