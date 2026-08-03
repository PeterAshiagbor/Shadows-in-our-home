// The Supabase anon key is a public, browser-safe key by design. All privileged
// operations go through edge functions holding the service role key; the anon
// role can only read the public_delegates view (no email, no claim_token).
export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://oouspuoqsbavcnusbndq.supabase.co'

export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vdXNwdW9xc2JhdmNudXNibmRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU3NjMwMjUsImV4cCI6MjEwMTMzOTAyNX0.YK2smaTBuvy4JLbjxwAKUMNIxKFiB8v14End1od4-SM'

export const FUNCTIONS_URL = `${SUPABASE_URL}/functions/v1`

export function photoUrl(path) {
  return path
    ? `${SUPABASE_URL}/storage/v1/object/public/delegate-photos/${path}`
    : null
}

export const fnHeaders = {
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
}
