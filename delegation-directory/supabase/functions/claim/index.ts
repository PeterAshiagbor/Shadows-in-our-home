// Claim flow: validates a personal claim token, returns the delegate's row for
// editing (GET) and saves profile + photo + consent (POST). This is the only
// write path for delegates — the anon role has no write access to the table.
import { createClient } from 'npm:@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  })

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const LINKEDIN_RE = /^https:\/\/(www\.)?linkedin\.com\/\S+$/i
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const CATEGORIES = [
  'founder',
  'investor',
  'support_org',
  'university',
  'education',
  'policy',
  'research',
  'gen',
]
const MIME_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}
const MAX_PHOTO_BYTES = 5 * 1024 * 1024

function clean(value: unknown, max: number): string | null {
  if (typeof value !== 'string') return null
  const t = value.trim()
  return t ? t.slice(0, max) : null
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

  if (req.method === 'GET') {
    const token = new URL(req.url).searchParams.get('token') ?? ''
    if (!UUID_RE.test(token)) return json({ error: 'This link is not valid.' }, 400)
    const { data, error } = await supabase
      .from('delegates')
      .select(
        'first_name, last_name, role, organisation, linkedin_url, category, photo_path, summary, looking_for, can_help_with, email, claim_status, consent_public'
      )
      .eq('claim_token', token)
      .maybeSingle()
    if (error) return json({ error: 'Server error.' }, 500)
    if (!data) return json({ error: 'This link is not recognised.' }, 404)
    return json({ delegate: data })
  }

  if (req.method === 'POST') {
    let body: any
    try {
      body = await req.json()
    } catch {
      return json({ error: 'Bad request.' }, 400)
    }

    const token = String(body.token ?? '')
    if (!UUID_RE.test(token)) return json({ error: 'This link is not valid.' }, 400)
    if (body.consent !== true) {
      return json(
        { error: 'The visibility checkbox must be ticked to publish.' },
        400
      )
    }

    const { data: delegate, error: findError } = await supabase
      .from('delegates')
      .select('id, slug, photo_path, claimed_at')
      .eq('claim_token', token)
      .maybeSingle()
    if (findError) return json({ error: 'Server error.' }, 500)
    if (!delegate) return json({ error: 'This link is not recognised.' }, 404)

    const p = body.profile ?? {}
    const firstName = clean(p.first_name, 80)
    const lastName = clean(p.last_name, 80)
    if (!firstName || !lastName) {
      return json({ error: 'Name cannot be empty.' }, 400)
    }

    const linkedin = clean(p.linkedin_url, 200)
    if (linkedin && !LINKEDIN_RE.test(linkedin)) {
      return json(
        { error: 'LinkedIn URL must start with https://www.linkedin.com/' },
        400
      )
    }
    const email = clean(p.email, 200)
    if (email && !EMAIL_RE.test(email)) {
      return json({ error: 'That email address does not look right.' }, 400)
    }
    const category = clean(p.category, 40)
    if (category && !CATEGORIES.includes(category)) {
      return json({ error: 'Unknown category.' }, 400)
    }

    const now = new Date().toISOString()
    const update: Record<string, unknown> = {
      first_name: firstName,
      last_name: lastName,
      role: clean(p.role, 120),
      organisation: clean(p.organisation, 120),
      linkedin_url: linkedin,
      category,
      summary: clean(p.summary, 280),
      looking_for: clean(p.looking_for, 280),
      can_help_with: clean(p.can_help_with, 280),
      email,
      claim_status: 'published',
      claimed_at: delegate.claimed_at ?? now,
      consent_public: true,
      consent_at: now,
    }

    if (body.photo?.base64) {
      const contentType = String(body.photo.contentType ?? '')
      const ext = MIME_EXT[contentType]
      if (!ext) return json({ error: 'Photo must be a JPG, PNG or WebP.' }, 400)
      let bytes: Uint8Array
      try {
        bytes = Uint8Array.from(atob(body.photo.base64), (c) => c.charCodeAt(0))
      } catch {
        return json({ error: 'Photo upload was corrupted — try again.' }, 400)
      }
      if (bytes.byteLength > MAX_PHOTO_BYTES) {
        return json({ error: 'Photo must be under 5MB.' }, 400)
      }
      const path = `${delegate.id}/${crypto.randomUUID()}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('delegate-photos')
        .upload(path, bytes, { contentType })
      if (uploadError) return json({ error: 'Photo upload failed.' }, 500)
      if (delegate.photo_path) {
        await supabase.storage.from('delegate-photos').remove([delegate.photo_path])
      }
      update.photo_path = path
    }

    const { error: updateError } = await supabase
      .from('delegates')
      .update(update)
      .eq('id', delegate.id)
    if (updateError) return json({ error: 'Saving failed — try again.' }, 500)

    return json({ ok: true, slug: delegate.slug })
  }

  return json({ error: 'Method not allowed.' }, 405)
})
