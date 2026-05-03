import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient.js'
import { formatPnl } from '../lib/analytics.js'

export default function History() {
  const [trades, setTrades] = useState(null)

  useEffect(() => {
    supabase.from('trades').select('*').order('date', { ascending: false }).limit(500)
      .then(({ data, error }) => {
        if (error) console.error(error)
        setTrades(data ?? [])
      })
  }, [])

  if (!trades) return <div className="page"><span className="spinner" /></div>

  return (
    <div className="page">
      <div className="page-header"><h1 className="page-title">History</h1>
        <p className="page-subtitle">{trades.length} trade{trades.length !== 1 ? 's' : ''}</p>
      </div>

      {trades.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📒</div>
          <p className="empty-state-text">No trades yet</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 8 }}>
          {trades.map(t => (
            <Link key={t.id} to={`/trade/${t.id}`} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '12px 14px', background: 'var(--bg-card)',
              borderRadius: 'var(--r-md)', border: '1px solid var(--border)', color: 'inherit'
            }}>
              <div>
                <p style={{ fontWeight: 700 }}>{t.symbol} <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '0.85rem' }}>{t.direction}</span></p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {t.date}
                  {t.session ? ` • ${t.session}` : ''}
                  {t.emotion_pre ? ` • ${t.emotion_pre}` : ''}
                </p>
              </div>
              <p style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: t.pnl >= 0 ? 'var(--green)' : 'var(--red)' }}>
                {formatPnl(t.pnl)}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
