import { useAuth } from '../context/AuthContext.jsx'

export default function Settings() {
  const { profile, isPro, logout } = useAuth()
  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
      </div>

      <div className="card" style={{ marginBottom: 12 }}>
        <p className="stat-label">Account</p>
        <p style={{ fontWeight: 700 }}>{profile?.email ?? '—'}</p>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 4 }}>
          Plan: <strong style={{ color: isPro ? 'var(--accent)' : 'var(--text-secondary)' }}>{isPro ? 'Pro' : 'Free'}</strong>
        </p>
      </div>

      <button className="btn btn-block" onClick={logout}>Sign out</button>
    </div>
  )
}
