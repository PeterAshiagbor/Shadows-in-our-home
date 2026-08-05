import { SUPABASE_URL, SUPABASE_ANON_KEY, ACTIVE_COHORT } from './config'

const headers = {
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
}

// Every public read is scoped to the active cohort. Applied in both queries, so
// a retired cohort can neither appear on the grid nor be reached by slug.
const cohortFilter = `cohort=eq.${encodeURIComponent(ACTIVE_COHORT)}`

export async function fetchDelegates() {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/public_delegates?select=*&${cohortFilter}&order=last_name.asc,first_name.asc`,
    { headers, next: { revalidate: 60 } }
  )
  if (!res.ok) throw new Error(`Failed to load delegates (${res.status})`)
  return res.json()
}

export async function fetchDelegateBySlug(slug) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/public_delegates?select=*&slug=eq.${encodeURIComponent(slug)}&${cohortFilter}&limit=1`,
    { headers, next: { revalidate: 60 } }
  )
  if (!res.ok) throw new Error(`Failed to load delegate (${res.status})`)
  const rows = await res.json()
  return rows[0] ?? null
}
