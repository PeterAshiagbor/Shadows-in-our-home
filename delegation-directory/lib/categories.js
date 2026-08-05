// Provisional first-pass taxonomy, not GEN's. Delegates correct their own
// category when they claim their profile.
export const CATEGORY_LABELS = {
  founder: 'Founder',
  investor: 'Investor',
  support_org: 'Ecosystem support',
  university: 'University',
  education: 'Enterprise education',
  policy: 'Policy & government',
  research: 'Research',
  gen: 'GEN',
}

export const CATEGORY_OPTIONS = Object.entries(CATEGORY_LABELS).map(
  ([value, label]) => ({ value, label })
)

export function categoryLabel(value) {
  return CATEGORY_LABELS[value] || null
}
