import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient.js'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  async function onSubmit(e) {
    e.preventDefault()
    setError(null); setBusy(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setBusy(false)
    if (error) return setError(error.message)
    navigate('/', { replace: true })
  }

  return (
    <div className="page" style={{ paddingTop: 60 }}>
      <div className="page-header" style={{ textAlign: 'center', marginBottom: 28 }}>
        <h1 className="page-title" style={{ fontSize: '2rem', letterSpacing: '-0.04em' }}>Tilt</h1>
        <p className="page-subtitle">Sign in to your trading journal</p>
      </div>
      <form onSubmit={onSubmit} className="card" style={{ display: 'grid', gap: 12 }}>
        <input type="email" placeholder="Email" autoComplete="email" required
          value={email} onChange={e => setEmail(e.target.value)} />
        <input type="password" placeholder="Password" autoComplete="current-password" required
          value={password} onChange={e => setPassword(e.target.value)} />
        {error && <p style={{ color: 'var(--red)', fontSize: '0.85rem' }}>{error}</p>}
        <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
          {busy ? <span className="spinner" /> : 'Sign in'}
        </button>
        <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          No account? <Link to="/signup">Create one</Link>
        </p>
      </form>
    </div>
  )
}
