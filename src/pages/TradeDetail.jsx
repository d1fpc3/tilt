import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient.js'
import { formatPnl } from '../lib/analytics.js'

export default function TradeDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [trade, setTrade] = useState(null)

  useEffect(() => {
    supabase.from('trades').select('*').eq('id', id).single()
      .then(({ data, error }) => {
        if (error) console.error(error)
        setTrade(data ?? null)
      })
  }, [id])

  if (!trade) return <div className="page"><span className="spinner" /></div>

  async function del() {
    if (!confirm('Delete this trade?')) return
    const { error } = await supabase.from('trades').delete().eq('id', id)
    if (error) return alert(error.message)
    navigate('/history', { replace: true })
  }

  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <h1 className="page-title">{trade.symbol} <span style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>{trade.direction}</span></h1>
        <button className="btn btn-ghost" onClick={() => navigate(-1)}>Back</button>
      </div>

      <div className="card" style={{ marginBottom: 12 }}>
        <p className="stat-label">P&L</p>
        <p className="stat-value" style={{ fontSize: '2rem', color: trade.pnl >= 0 ? 'var(--green)' : 'var(--red)' }}>
          {formatPnl(trade.pnl)}
        </p>
        <p className="stat-sub">{trade.date}{trade.session ? ` • ${trade.session}` : ''}{trade.setup ? ` • ${trade.setup}` : ''}</p>
      </div>

      <div className="card" style={{ marginBottom: 12 }}>
        <h3 style={{ marginBottom: 10 }}>Detail</h3>
        <dl style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: '0.9rem' }}>
          <div><dt style={{ color: 'var(--text-muted)' }}>Quantity</dt><dd>{trade.quantity ?? '—'}</dd></div>
          <div><dt style={{ color: 'var(--text-muted)' }}>Risk</dt><dd>{trade.risk_amount ? `$${trade.risk_amount}` : '—'}</dd></div>
          <div><dt style={{ color: 'var(--text-muted)' }}>Grade</dt><dd>{trade.grade ?? '—'}</dd></div>
          <div><dt style={{ color: 'var(--text-muted)' }}>Emotion (entry)</dt><dd style={{ textTransform: 'capitalize' }}>{trade.emotion_pre ?? '—'}</dd></div>
          <div><dt style={{ color: 'var(--text-muted)' }}>Emotion (exit)</dt><dd style={{ textTransform: 'capitalize' }}>{trade.emotion_post ?? '—'}</dd></div>
        </dl>
        {trade.notes && (
          <>
            <p className="stat-label" style={{ marginTop: 14, marginBottom: 4 }}>Notes</p>
            <p style={{ whiteSpace: 'pre-wrap', color: 'var(--text-secondary)' }}>{trade.notes}</p>
          </>
        )}
      </div>

      <button className="btn btn-block" style={{ color: 'var(--red)' }} onClick={del}>Delete trade</button>
    </div>
  )
}
