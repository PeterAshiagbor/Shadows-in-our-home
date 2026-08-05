'use client'

import { useEffect, useMemo, useState } from 'react'
import { FUNCTIONS_URL, fnHeaders } from '../../lib/config'
import { CATEGORY_OPTIONS } from '../../lib/categories'

const EDIT_FIELDS = [
  ['first_name', 'First name', 'text'],
  ['last_name', 'Last name', 'text'],
  ['role', 'Role', 'text'],
  ['organisation', 'Organisation', 'text'],
  ['linkedin_url', 'LinkedIn URL', 'url'],
  ['email', 'Email (private)', 'email'],
  ['summary', 'About', 'textarea'],
  ['looking_for', 'Looking for', 'textarea'],
  ['can_help_with', 'Can help with', 'textarea'],
]

export default function AdminPage() {
  const [adminKey, setAdminKey] = useState('')
  const [keyInput, setKeyInput] = useState('')
  const [delegates, setDelegates] = useState(null)
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)
  const [editing, setEditing] = useState(null) // delegate id
  const [editForm, setEditForm] = useState({})
  const [copied, setCopied] = useState(null)

  useEffect(() => {
    const stored = sessionStorage.getItem('admin_key')
    if (stored) setAdminKey(stored)
  }, [])

  useEffect(() => {
    if (adminKey) refresh(adminKey)
  }, [adminKey]) // eslint-disable-line react-hooks/exhaustive-deps

  async function refresh(key) {
    setError(null)
    try {
      const res = await fetch(`${FUNCTIONS_URL}/admin`, {
        headers: { ...fnHeaders, 'x-admin-key': key },
      })
      const body = await res.json()
      if (!res.ok) {
        if (res.status === 401) {
          sessionStorage.removeItem('admin_key')
          setAdminKey('')
          setError('That admin key was not recognised.')
        } else {
          setError(body.error || 'Failed to load.')
        }
        return
      }
      setDelegates(body.delegates)
    } catch {
      setError('Could not reach the server.')
    }
  }

  async function action(payload) {
    setBusy(true)
    setError(null)
    try {
      const res = await fetch(`${FUNCTIONS_URL}/admin`, {
        method: 'POST',
        headers: { ...fnHeaders, 'x-admin-key': adminKey },
        body: JSON.stringify(payload),
      })
      const body = await res.json()
      if (!res.ok) {
        setError(body.error || 'Action failed.')
        return false
      }
      await refresh(adminKey)
      return true
    } catch {
      setError('Could not reach the server.')
      return false
    } finally {
      setBusy(false)
    }
  }

  const stats = useMemo(() => {
    if (!delegates) return null
    const published = delegates.filter((d) => d.claim_status === 'published')
    return {
      total: delegates.length,
      published: published.length,
      withPhoto: delegates.filter((d) => d.photo_path).length,
      withEmail: delegates.filter((d) => d.email).length,
    }
  }, [delegates])

  function copyClaimLink(d) {
    const link = `${window.location.origin}/claim/${d.claim_token}`
    navigator.clipboard.writeText(link).then(() => {
      setCopied(d.id)
      setTimeout(() => setCopied(null), 1500)
    })
  }

  function startEdit(d) {
    setEditing(d.id)
    setEditForm(
      Object.fromEntries(
        EDIT_FIELDS.map(([k]) => [k, d[k] || '']).concat([
          ['category', d.category || ''],
        ])
      )
    )
  }

  async function saveEdit(id) {
    const ok = await action({ action: 'update', id, fields: editForm })
    if (ok) setEditing(null)
  }

  if (!adminKey) {
    return (
      <div className="form-shell">
        <form
          className="form-card"
          onSubmit={(e) => {
            e.preventDefault()
            const key = keyInput.trim()
            if (!key) return
            sessionStorage.setItem('admin_key', key)
            setAdminKey(key)
          }}
        >
          <h2 style={{ fontSize: 19 }}>Admin</h2>
          <div className="field">
            <label>Admin key</label>
            <input
              type="password"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              autoFocus
            />
          </div>
          {error && <div className="error-text">{error}</div>}
          <button className="btn" type="submit">
            Unlock
          </button>
        </form>
      </div>
    )
  }

  if (!delegates) {
    return (
      <div className="form-shell">
        <p>Loading…</p>
        {error && <div className="error-text">{error}</div>}
      </div>
    )
  }

  return (
    <div>
      <div className="stats-row">
        <div className="stat">
          <div className="num">{stats.total}</div>
          <div className="label">Delegates</div>
        </div>
        <div className="stat">
          <div className="num">{stats.published}</div>
          <div className="label">Published profiles</div>
        </div>
        <div className="stat">
          <div className="num">{stats.withPhoto}</div>
          <div className="label">With photo</div>
        </div>
        <div className="stat">
          <div className="num">{stats.withEmail}</div>
          <div className="label">Email on file</div>
        </div>
      </div>

      {error && (
        <div className="error-text" style={{ marginBottom: 12 }}>
          {error}
        </div>
      )}

      <div className="admin-list">
        {delegates.map((d) => (
          <div className="admin-row" key={d.id}>
            <div className="top">
              <span className="who">
                {d.first_name} {d.last_name}{' '}
                <span className="org">
                  {[d.role, d.organisation].filter(Boolean).join(' · ')}
                </span>
              </span>
              <span className={`status-pill ${d.claim_status}`}>
                {d.claim_status}
              </span>
            </div>
            <div className="meta">
              {d.email ? d.email : 'no email on file'} · claim link:{' '}
              /claim/{d.claim_token}
            </div>
            <div className="actions">
              <button
                className="btn secondary small"
                onClick={() => copyClaimLink(d)}
              >
                {copied === d.id ? 'Copied ✓' : 'Copy claim link'}
              </button>
              <button
                className="btn secondary small"
                onClick={() => (editing === d.id ? setEditing(null) : startEdit(d))}
              >
                {editing === d.id ? 'Close' : 'Edit'}
              </button>
              {d.photo_path && (
                <button
                  className="btn danger small"
                  disabled={busy}
                  onClick={() => action({ action: 'remove_photo', id: d.id })}
                >
                  Remove photo
                </button>
              )}
              {d.claim_status === 'published' && (
                <button
                  className="btn danger small"
                  disabled={busy}
                  onClick={() => {
                    if (
                      window.confirm(
                        d.photo_path
                          ? `Unpublish ${d.first_name} ${d.last_name}? This withdraws consent and deletes their photo, so the public URL stops working. They would need to re-upload it to publish again.`
                          : `Unpublish ${d.first_name} ${d.last_name}? This withdraws consent and hides their profile.`
                      )
                    ) {
                      action({ action: 'unpublish', id: d.id })
                    }
                  }}
                >
                  Unpublish
                </button>
              )}
              <button
                className="btn danger small"
                disabled={busy}
                onClick={() => {
                  if (
                    window.confirm(
                      `Permanently delete ${d.first_name} ${d.last_name} and their photo? This is the GDPR delete path — it cannot be undone.`
                    )
                  ) {
                    action({ action: 'delete', id: d.id })
                  }
                }}
              >
                Delete
              </button>
            </div>

            {editing === d.id && (
              <div className="admin-edit">
                {EDIT_FIELDS.map(([key, label, type]) => (
                  <div className="field" key={key}>
                    <label>{label}</label>
                    {type === 'textarea' ? (
                      <textarea
                        value={editForm[key]}
                        maxLength={280}
                        onChange={(e) =>
                          setEditForm({ ...editForm, [key]: e.target.value })
                        }
                      />
                    ) : (
                      <input
                        type={type}
                        value={editForm[key]}
                        onChange={(e) =>
                          setEditForm({ ...editForm, [key]: e.target.value })
                        }
                      />
                    )}
                  </div>
                ))}
                <div className="field">
                  <label>Category</label>
                  <select
                    value={editForm.category}
                    onChange={(e) =>
                      setEditForm({ ...editForm, category: e.target.value })
                    }
                  >
                    <option value="">None</option>
                    {CATEGORY_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  className="btn small"
                  disabled={busy}
                  onClick={() => saveEdit(d.id)}
                >
                  Save changes
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
