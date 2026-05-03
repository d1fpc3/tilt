import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient.js'

export default function Signup() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [info, setInfo]   = useState(null)
  const [busy, setBusy]   = useState(false)

  async function onSubmit(e) {
    e.preventDefault()
    setError(null); setInfo(null); setBusy(true)
    const { data, error } = await supabase.auth.signUp({ email, password })
    setBusy(false)
    if (error) return setError(error.message)
    if (data.session) navigate('/', { replace: true })
    else setInfo('Check your email to confirm your account, then sign in.')
  }

  return (
    <div className="page" style={{ paddingTop: 60 }}>
      <div className="page-header" style={{ textAlign: 'center', marginBottom: 28 }}>
        <h1 className="page-title" style={{ fontSize: '2rem', letterSpacing: '-0.04em' }}>Create account</h1>
        <p className="page-subtitle">Start logging trades + emotions</p>
      </div>
      <form onSubmit={onSubmit} className="card" style={{ display: 'grid', gap: 12 }}>
        <input type="email" placeholder="Email" autoComplete="email" required
          value={email} onChange={e => setEmail(e.target.value)} />
        <input type="password" placeholder="Password (8+ chars)" autoComplete="new-password" minLength={8} required
          value={password} onChange={e => setPassword(e.target.value)} />
        {error && <p style={{ color: 'var(--red)', fontSize: '0.85rem' }}>{error}</p>}
        {info  && <p style={{ color: 'var(--green)', fontSize: '0.85rem' }}>{info}</p>}
        <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
          {busy ? <span className="spinner" /> : 'Create account'}
        </button>
        <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Already have one? <Link to="/login">Sign in</Link>
        </p>
      </form>
    </div>
  )
}
