'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import ClaimForm from '../../../components/ClaimForm'
import { FUNCTIONS_URL, fnHeaders } from '../../../lib/config'

export default function ClaimPage() {
  const { token } = useParams()
  const [state, setState] = useState({ status: 'loading' })

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await fetch(
          `${FUNCTIONS_URL}/claim?token=${encodeURIComponent(token)}`,
          { headers: fnHeaders }
        )
        const body = await res.json()
        if (cancelled) return
        if (!res.ok) {
          setState({ status: 'error', message: body.error || 'Something went wrong.' })
        } else {
          setState({ status: 'ready', delegate: body.delegate })
        }
      } catch {
        if (!cancelled)
          setState({
            status: 'error',
            message: 'Could not reach the server. Please try again.',
          })
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [token])

  if (state.status === 'loading') {
    return <div className="form-shell"><p>Checking your link…</p></div>
  }

  if (state.status === 'error') {
    return (
      <div className="form-shell">
        <div className="error-text">
          {state.message} If you think this is a mistake, email{' '}
          <a href="mailto:peter@kickstartglobal.com">peter@kickstartglobal.com</a>.
        </div>
      </div>
    )
  }

  return <ClaimForm token={token} delegate={state.delegate} />
}
