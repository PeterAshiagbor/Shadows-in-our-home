// Admin API: completion dashboard, edits, photo removal, unpublish, and the
// GDPR delete path. Gated by an admin key whose SHA-256 hash lives in the
// locked app_config table — the plaintext key is held by Peter and Matt only.
import { createClient } from 'npm:@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-admin-key',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  })

const EDITABLE_FIELDS = [
  'first_name',
  'last_name',
  'role',
  'organisation',
  'linkedin_url',
  'category',
  'summary',
  'looking_for',
  'can_help_with',
  'email',
] as const

async function sha256hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(value)
  )
  return [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

async function authorised(req: Request): Promise<boolean> {
  const key = req.headers.get('x-admin-key')
  if (!key) return false
  const { data } = await supabase
    .from('app_config')
    .select('value')
    .eq('key', 'admin_key_hash')
    .maybeSingle()
  if (!data) return false
  return (await sha256hex(key)) === data.value
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (!(await authorised(req))) return json({ error: 'Unauthorised.' }, 401)

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('delegates')
      .select('*')
      .order('last_name')
      .order('first_name')
    if (error) return json({ error: 'Server error.' }, 500)
    return json({ delegates: data })
  }

  if (req.method === 'POST') {
    let body: any
    try {
      body = await req.json()
    } catch {
      return json({ error: 'Bad request.' }, 400)
    }
    const id = String(body.id ?? '')
    if (!id) return json({ error: 'Missing delegate id.' }, 400)

    const { data: delegate, error: findError } = await supabase
      .from('delegates')
      .select('id, photo_path')
      .eq('id', id)
      .maybeSingle()
    if (findError) return json({ error: 'Server error.' }, 500)
    if (!delegate) return json({ error: 'Delegate not found.' }, 404)

    switch (body.action) {
      case 'update': {
        const fields: Record<string, unknown> = {}
        for (const key of EDITABLE_FIELDS) {
          if (key in (body.fields ?? {})) {
            const raw = body.fields[key]
            const value = typeof raw === 'string' ? raw.trim() : null
            fields[key] = value || null
          }
        }
        const { error } = await supabase
          .from('delegates')
          .update(fields)
          .eq('id', id)
        if (error) return json({ error: 'Update failed.' }, 500)
        return json({ ok: true })
      }

      case 'remove_photo': {
        if (delegate.photo_path) {
          await supabase.storage
            .from('delegate-photos')
            .remove([delegate.photo_path])
        }
        const { error } = await supabase
          .from('delegates')
          .update({ photo_path: null })
          .eq('id', id)
        if (error) return json({ error: 'Update failed.' }, 500)
        return json({ ok: true })
      }

      case 'unpublish': {
        const { error } = await supabase
          .from('delegates')
          .update({ claim_status: 'claimed', consent_public: false })
          .eq('id', id)
        if (error) return json({ error: 'Update failed.' }, 500)
        return json({ ok: true })
      }

      // GDPR delete path: removes the row and the photo, same request.
      case 'delete': {
        if (delegate.photo_path) {
          await supabase.storage
            .from('delegate-photos')
            .remove([delegate.photo_path])
        }
        const { error } = await supabase.from('delegates').delete().eq('id', id)
        if (error) return json({ error: 'Delete failed.' }, 500)
        return json({ ok: true })
      }

      default:
        return json({ error: 'Unknown action.' }, 400)
    }
  }

  return json({ error: 'Method not allowed.' }, 405)
})
