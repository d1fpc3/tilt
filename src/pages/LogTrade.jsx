import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient.js'
import { useAuth } from '../context/AuthContext.jsx'
import { tradeSchema, EMOTIONS } from '../lib/tradeSchema.js'

const EMOTION_COLORS = {
  calm: 'var(--emo-calm)',
  focused: 'var(--emo-focused)',
  anxious: 'var(--emo-anxious)',
  greedy: 'var(--emo-greedy)',
  frustrated: 'var(--emo-frustrated)',
  euphoric: 'var(--emo-euphoric)',
  tired: 'var(--emo-tired)',
  revenge: 'var(--emo-revenge)',
}

export default function LogTrade() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const [form, setForm] = useState({
    symbol: '', direction: 'LONG', date: new Date().toISOString().slice(0, 10),
    pnl: '', risk_amount: '', session: '', setup: '', grade: '',
    emotion_pre: 'calm', emotion_post: '', notes: ''
  })
  const [error, setError] = useState(null)
  const [busy, setBusy]   = useState(false)

  function update(k, v) { setForm(f => ({ ...f, [k]: v })) }

  async function submit(e) {
    e.preventDefault()
    setError(null); setBusy(true)
    const parsed = tradeSchema.safeParse({
      ...form,
      pnl: form.pnl === '' ? null : form.pnl,
      risk_amount: form.risk_amount === '' ? null : form.risk_amount,
      session: form.session || null,
      setup: form.setup || null,
      grade: form.grade || null,
      emotion_post: form.emotion_post || null,
      notes: form.notes || null,
    })
    if (!parsed.success) {
      setBusy(false)
      setError(parsed.error.issues[0]?.message ?? 'Invalid input')
      return
    }
    const { error } = await supabase.from('trades').insert({
      ...parsed.data,
      user_id: session.user.id,
    })
    setBusy(false)
    if (error) return setError(error.message)
    navigate('/', { replace: true })
  }

  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <h1 className="page-title">Log trade</h1>
        <button className="btn btn-ghost" onClick={() => navigate(-1)}>Cancel</button>
      </div>

      <form onSubmit={submit} className="card" style={{ display: 'grid', gap: 12 }}>
        <div className="grid-2">
          <input placeholder="Symbol (e.g. ES)" required
            value={form.symbol} onChange={e => update('symbol', e.target.value)} />
          <select value={form.direction} onChange={e => update('direction', e.target.value)}>
            <option value="LONG">LONG</option>
            <option value="SHORT">SHORT</option>
          </select>
        </div>

        <div className="grid-2">
          <input type="date" required
            value={form.date} onChange={e => update('date', e.target.value)} />
          <input inputMode="decimal" placeholder="P&L (e.g. 250 or -120)"
            value={form.pnl} onChange={e => update('pnl', e.target.value)} />
        </div>

        <div className="grid-2">
          <input inputMode="decimal" placeholder="Risk $ (optional)"
            value={form.risk_amount} onChange={e => update('risk_amount', e.target.value)} />
          <input placeholder="Session (e.g. Open)"
            value={form.session} onChange={e => update('session', e.target.value)} />
        </div>

        <div className="grid-2">
          <input placeholder="Setup (e.g. ORB)"
            value={form.setup} onChange={e => update('setup', e.target.value)} />
          <select value={form.grade} onChange={e => update('grade', e.target.value)}>
            <option value="">Grade…</option>
            <option value="A">A</option><option value="B">B</option><option value="C">C</option>
          </select>
        </div>

        <div>
          <p className="stat-label" style={{ marginBottom: 8 }}>Emotion at entry</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {EMOTIONS.map(e => (
              <button type="button" key={e} onClick={() => update('emotion_pre', e)}
                style={{
                  padding: '8px 12px', borderRadius: 'var(--r-pill)', fontSize: '0.8rem',
                  background: form.emotion_pre === e ? EMOTION_COLORS[e] : 'var(--bg-input)',
                  color: form.emotion_pre === e ? '#000' : 'var(--text-secondary)',
                  border: '1px solid var(--border)', fontWeight: 600, textTransform: 'capitalize'
                }}>
                {e}
              </button>
            ))}
          </div>
        </div>

        <textarea placeholder="Notes (optional)" rows={3}
          value={form.notes} onChange={e => update('notes', e.target.value)} />

        {error && <p style={{ color: 'var(--red)', fontSize: '0.85rem' }}>{error}</p>}
        <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
          {busy ? <span className="spinner" /> : 'Save trade'}
        </button>
      </form>
    </div>
  )
}
