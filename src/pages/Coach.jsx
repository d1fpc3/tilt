import { useAuth } from '../context/AuthContext.jsx'

export default function Coach() {
  const { isPro } = useAuth()
  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Coach</h1>
        <p className="page-subtitle">{isPro ? 'Pro chat coach' : 'Weekly report'}</p>
      </div>

      <div className="card">
        {isPro ? (
          <p style={{ color: 'var(--text-muted)' }}>Chat coach UI ships in Phase 2.</p>
        ) : (
          <>
            <h3 style={{ marginBottom: 8 }}>Weekly report — Sundays at 8pm</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 14 }}>
              Tilt analyzes your week and surfaces patterns your eyes miss. Free tier gets one report a week.
              Pro unlocks an on-demand chat coach.
            </p>
            <button className="btn btn-primary">Upgrade to Pro — $12/mo</button>
          </>
        )}
      </div>
    </div>
  )
}
