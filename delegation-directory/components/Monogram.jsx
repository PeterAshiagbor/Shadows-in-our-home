const PALETTE = [
  '#3d5a80',
  '#5f6caf',
  '#3a7d6c',
  '#8a5a83',
  '#a8663b',
  '#4a6fa5',
  '#6b705c',
  '#7d5ba6',
]

export default function Monogram({ firstName, lastName, className = 'monogram' }) {
  const name = `${firstName} ${lastName}`
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0
  }
  const background = PALETTE[hash % PALETTE.length]
  const initials = `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase()
  return (
    <div className={className} style={{ background }} aria-hidden="true">
      {initials}
    </div>
  )
}
