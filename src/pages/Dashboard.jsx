import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient.js'
import { useAuth } from '../context/AuthContext.jsx'
import { computeAnalytics, formatPnl } from '../lib/analytics.js'

export default function Dashboard() {
  const { profile } = useAuth()
  const [trades, setTrades] = useState(null)

  useEffect(() => {
    let cancelled = false
    supabase
      .from('trades')
      .select('*')
      .order('date', { ascending: false })
      .limit(200)
      .then(({ data, error }) => {
        if (cancelled) return
        if (error) { console.error('[tilt] load trades:', error.message); setTrades([]); return }
        setTrades(data ?? [])
      })
    return () => { cancelled = true }
  }, [])

  if (!trades) return <div className="page"><span className="spinner" /></div>

  const today = new Date().toISOString().slice(0, 10)
  const todays = trades.filter(t => t.date === today)
  const todayStats = computeAnalytics(todays)

  const last7 = trades.filter(t => {
    const d = new Date(t.date)
    const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 7)
    return d >= cutoff
  })
  const weekStats = computeAnalytics(last7)

  return (
    <div className="page">
      <div className="page-header animate-fade-up">
        <h1 className="page-title">Hey{profile?.display_name ? `, ${profile.display_name}` : ''}</h1>
        <p className="page-subtitle">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
      </div>

      <div className="card animate-fade-up delay-1" style={{ marginBottom: 14 }}>
        <p className="stat-label">Today</p>
        <p className="stat-value" style={{ fontSize: '2rem', color: todayStats.totalPnl >= 0 ? 'var(--green)' : 'var(--red)' }}>
          {todays.length === 0 ? '—' : formatPnl(todayStats.totalPnl)}
        </p>
        <p className="stat-sub">{todays.length} trade{todays.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="grid-4 animate-fade-up delay-2" style={{ marginBottom: 14 }}>
        <div className="stat-card">
          <p className="stat-label">7-day P&L</p>
          <p className="stat-value" style={{ color: weekStats.totalPnl >= 0 ? 'var(--green)' : 'var(--red)' }}>
            {last7.length === 0 ? '—' : formatPnl(weekStats.totalPnl)}
          </p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Win rate</p>
          <p className="stat-value">{last7.length === 0 ? '—' : `${weekStats.winRate}%`}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Trades</p>
          <p className="stat-value">{last7.length}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Profit factor</p>
          <p className="stat-value">{weekStats.profitFactor != null ? weekStats.profitFactor : '—'}</p>
        </div>
      </div>

      {trades.length === 0 && (
        <div className="empty-state animate-fade-up delay-3">
          <div className="empty-state-icon">🎯</div>
          <p className="empty-state-text">No trades yet</p>
          <p className="empty-state-sub">Tap the <strong>+</strong> to log your first trade.</p>
        </div>
      )}

      {trades.length > 0 && (
        <div className="card animate-fade-up delay-3">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <h3>Recent</h3>
            <Link to="/history" style={{ fontSize: '0.85rem' }}>See all</Link>
          </div>
          <div style={{ display: 'grid', gap: 8 }}>
            {trades.slice(0, 5).map(t => (
              <Link key={t.id} to={`/trade/${t.id}`} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '12px 14px', background: 'var(--bg-input)',
                borderRadius: 'var(--r-md)', border: '1px solid var(--border)', color: 'inherit'
              }}>
                <div>
                  <p style={{ fontWeight: 700 }}>{t.symbol} <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '0.85rem' }}>{t.direction}</span></p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.date}{t.session ? ` • ${t.session}` : ''}</p>
                </div>
                <p style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: t.pnl >= 0 ? 'var(--green)' : 'var(--red)' }}>
                  {formatPnl(t.pnl)}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
