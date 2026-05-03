import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient.js'
import { computeAnalytics, formatPnl } from '../lib/analytics.js'

export default function Analytics() {
  const [data, setData] = useState(null)

  useEffect(() => {
    supabase
      .from('trades')
      .select('*')
      .order('date', { ascending: false })
      .then(({ data, error }) => {
        if (error) console.error(error)
        setData(computeAnalytics(data ?? []))
      })
  }, [])

  if (!data) return <div className="page"><span className="spinner" /></div>

  if (data.totalTrades === 0) return (
    <div className="page">
      <div className="page-header"><h1 className="page-title">Analytics</h1></div>
      <div className="empty-state">
        <div className="empty-state-icon">📊</div>
        <p className="empty-state-text">No trade data yet</p>
        <p className="empty-state-sub">Log some trades to see your edge.</p>
      </div>
    </div>
  )

  return (
    <div className="page">
      <div className="page-header animate-fade-up">
        <h1 className="page-title">Analytics</h1>
        <p className="page-subtitle">{data.withPnlCount} trade{data.withPnlCount !== 1 ? 's' : ''}</p>
      </div>

      <div className="grid-4 animate-fade-up delay-1" style={{ marginBottom: 14 }}>
        <div className="stat-card">
          <p className="stat-label">Total P&L</p>
          <p className="stat-value" style={{ color: data.totalPnl >= 0 ? 'var(--green)' : 'var(--red)' }}>{formatPnl(data.totalPnl)}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Win rate</p>
          <p className="stat-value">{data.winRate}%</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Profit factor</p>
          <p className="stat-value">{data.profitFactor ?? '—'}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Avg R:R</p>
          <p className="stat-value">{data.avgRR != null ? `${data.avgRR}R` : '—'}</p>
        </div>
      </div>

      <div className="card animate-fade-up delay-2" style={{ marginBottom: 14 }}>
        <h3 style={{ marginBottom: 12 }}>Charts coming next</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Equity curve, P&L by symbol/session/grade, mistakes, day-of-week, and the new emotion-correlated charts ship in the next pass.
        </p>
      </div>
    </div>
  )
}
