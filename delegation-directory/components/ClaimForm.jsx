'use client'

import { useRef, useState } from 'react'
import Monogram from './Monogram'
import { CATEGORY_OPTIONS } from '../lib/categories'
import { FUNCTIONS_URL, fnHeaders, photoUrl } from '../lib/config'
import { prepareImage } from '../lib/image'

const SUMMARY_MAX = 280
const FIELD_MAX = 280

export default function ClaimForm({ token, delegate }) {
  const [form, setForm] = useState({
    first_name: delegate.first_name || '',
    last_name: delegate.last_name || '',
    role: delegate.role || '',
    organisation: delegate.organisation || '',
    linkedin_url: delegate.linkedin_url || '',
    category: delegate.category || '',
    summary: delegate.summary || '',
    looking_for: delegate.looking_for || '',
    can_help_with: delegate.can_help_with || '',
    email: delegate.email || '',
  })
  const [photo, setPhoto] = useState(null) // { base64, contentType, previewUrl }
  const [photoError, setPhotoError] = useState(null)
  const [consent, setConsent] = useState(delegate.consent_public || false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [saved, setSaved] = useState(false)
  const fileRef = useRef(null)

  const existingPhoto = delegate.photo_path ? photoUrl(delegate.photo_path) : null
  const preview = photo?.previewUrl || existingPhoto

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value })

  async function onPickPhoto(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoError(null)
    try {
      setPhoto(await prepareImage(file))
    } catch (err) {
      setPhotoError(err.message)
    }
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError(null)
    if (!consent) {
      setError('Please tick the visibility checkbox to publish your profile.')
      return
    }
    if (!form.first_name.trim() || !form.last_name.trim()) {
      setError('Name cannot be empty.')
      return
    }
    setSaving(true)
    try {
      const res = await fetch(`${FUNCTIONS_URL}/claim`, {
        method: 'POST',
        headers: fnHeaders,
        body: JSON.stringify({
          token,
          consent: true,
          profile: form,
          photo: photo
            ? { base64: photo.base64, contentType: photo.contentType }
            : undefined,
        }),
      })
      const body = await res.json()
      if (!res.ok) {
        setError(body.error || 'Something went wrong saving your profile.')
      } else {
        setSaved(body.slug)
      }
    } catch {
      setError('Could not reach the server. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (saved) {
    return (
      <div className="form-shell">
        <div className="success-card">
          <strong>Your profile is live.</strong>
          <br />
          <a href={`/d/${saved}`}>View your public profile →</a>
          <br />
          You can come back to this link any time to update it.
        </div>
      </div>
    )
  }

  return (
    <div className="form-shell">
      <form className="form-card" onSubmit={onSubmit}>
        <div>
          <h2 style={{ fontSize: 19 }}>
            Hi {delegate.first_name} — this is your profile
          </h2>
          <p style={{ fontSize: 14, color: 'var(--muted)', marginTop: 4 }}>
            Three lines and a photo is all it takes. This is what other
            delegates see when they&rsquo;re deciding who to find at the drinks
            reception.
          </p>
        </div>

        <div className="field">
          <label>Photo</label>
          <div className="photo-picker">
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="preview" src={preview} alt="Your photo" />
            ) : (
              <Monogram
                firstName={form.first_name || '?'}
                lastName={form.last_name || ''}
              />
            )}
            <div>
              <button
                type="button"
                className="btn secondary small"
                onClick={() => fileRef.current?.click()}
              >
                {preview ? 'Change photo' : 'Add a photo'}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={onPickPhoto}
              />
            </div>
          </div>
          {photoError && <div className="char-count" style={{ color: 'var(--red)', textAlign: 'left' }}>{photoError}</div>}
        </div>

        <div className="field">
          <label>First name</label>
          <input type="text" value={form.first_name} onChange={set('first_name')} maxLength={80} />
        </div>
        <div className="field">
          <label>Last name</label>
          <input type="text" value={form.last_name} onChange={set('last_name')} maxLength={80} />
        </div>
        <div className="field">
          <label>Role</label>
          <input type="text" value={form.role} onChange={set('role')} maxLength={120} />
        </div>
        <div className="field">
          <label>Organisation</label>
          <input type="text" value={form.organisation} onChange={set('organisation')} maxLength={120} />
        </div>
        <div className="field">
          <label>LinkedIn URL</label>
          <input
            type="url"
            value={form.linkedin_url}
            onChange={set('linkedin_url')}
            placeholder="https://www.linkedin.com/in/…"
          />
        </div>
        <div className="field">
          <label>
            Category <span className="hint">— pick what fits you best</span>
          </label>
          <select value={form.category} onChange={set('category')}>
            <option value="">Choose…</option>
            {CATEGORY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label>
            About you <span className="hint">— two or three lines</span>
          </label>
          <textarea
            value={form.summary}
            onChange={set('summary')}
            maxLength={SUMMARY_MAX}
            placeholder="What you do, in the way you'd say it to someone at the congress."
          />
          <div className="char-count">
            {form.summary.length}/{SUMMARY_MAX}
          </div>
        </div>

        <div className="field">
          <label>
            What are you looking for at GEC?{' '}
            <span className="hint">— this is how people find you</span>
          </label>
          <textarea
            value={form.looking_for}
            onChange={set('looking_for')}
            maxLength={FIELD_MAX}
            placeholder="Partners, investors, ideas, specific people or markets…"
          />
        </div>

        <div className="field">
          <label>What can you help other delegates with?</label>
          <textarea
            value={form.can_help_with}
            onChange={set('can_help_with')}
            maxLength={FIELD_MAX}
            placeholder="Intros, expertise, experience others can draw on…"
          />
        </div>

        <div className="field">
          <label>
            Email <span className="hint">— never shown publicly; only used to reach you about the delegation</span>
          </label>
          <input type="email" value={form.email} onChange={set('email')} />
        </div>

        <label className="consent-box">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
          />
          <span>
            I&rsquo;m happy for this profile to be visible to anyone with the
            link to this directory.
          </span>
        </label>

        {error && <div className="error-text">{error}</div>}

        <button className="btn" type="submit" disabled={saving || !consent}>
          {saving ? 'Publishing…' : 'Publish my profile'}
        </button>
      </form>
    </div>
  )
}
