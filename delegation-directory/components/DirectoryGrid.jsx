'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import Monogram from './Monogram'
import { CATEGORY_LABELS, categoryLabel } from '../lib/categories'
import { photoUrl } from '../lib/config'

export default function DirectoryGrid({ delegates }) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState(null)

  const categories = useMemo(() => {
    const present = new Set(delegates.map((d) => d.category).filter(Boolean))
    return Object.keys(CATEGORY_LABELS).filter((c) => present.has(c))
  }, [delegates])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return delegates.filter((d) => {
      if (category && d.category !== category) return false
      if (!q) return true
      const haystack = `${d.first_name} ${d.last_name} ${d.organisation || ''}`.toLowerCase()
      return haystack.includes(q)
    })
  }, [delegates, query, category])

  return (
    <div>
      <div className="toolbar">
        <input
          className="search-input"
          type="text"
          placeholder="Search by name or organisation…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search delegates"
        />
        <div className="chip-row" role="tablist" aria-label="Filter by category">
          <button
            className={`chip${category === null ? ' active' : ''}`}
            onClick={() => setCategory(null)}
          >
            All ({delegates.length})
          </button>
          {categories.map((c) => (
            <button
              key={c}
              className={`chip${category === c ? ' active' : ''}`}
              onClick={() => setCategory(category === c ? null : c)}
            >
              {CATEGORY_LABELS[c]}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          No delegates match — try a different search.
        </div>
      ) : (
        <div className="grid">
          {filtered.map((d) => (
            <Link key={d.id} href={`/d/${d.slug}`} className="card">
              {d.photo_path ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  className="photo"
                  src={photoUrl(d.photo_path)}
                  alt={`${d.first_name} ${d.last_name}`}
                  loading="lazy"
                />
              ) : (
                <Monogram firstName={d.first_name} lastName={d.last_name} />
              )}
              <div className="body">
                <div className="name">
                  {d.first_name} {d.last_name}
                </div>
                {d.role && <div className="role">{d.role}</div>}
                {d.organisation && <div className="org">{d.organisation}</div>}
                {d.claim_status === 'published' ? (
                  categoryLabel(d.category) && (
                    <span className="badge">{categoryLabel(d.category)}</span>
                  )
                ) : (
                  <span className="badge unclaimed">Profile not yet claimed</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
