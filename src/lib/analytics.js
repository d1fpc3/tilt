// Pure analytics — ported verbatim from apps/trade-journal/client/src/pages/Analytics.jsx
// Keep this file pure so it's unit-testable and reusable in Edge Functions.

const DOW_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const DOW_ORDER = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export function formatPnl(val) {
  if (val === null || val === undefined) return '—'
  const sign = val >= 0 ? '+' : ''
  return `${sign}$${Math.abs(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function formatDate(str) {
  if (!str) return ''
  return new Date(str).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function computeAnalytics(trades) {
  const withPnl = trades.filter(t => t.pnl !== null && t.pnl !== undefined)
  const wins   = withPnl.filter(t => t.pnl > 0)
  const losses = withPnl.filter(t => t.pnl <= 0)

  const totalPnl  = withPnl.reduce((s, t) => s + Number(t.pnl), 0)
  const totalWins = wins.reduce((s, t) => s + Number(t.pnl), 0)
  const totalLoss = Math.abs(losses.reduce((s, t) => s + Number(t.pnl), 0))
  const winRate   = withPnl.length > 0 ? Math.round((wins.length / withPnl.length) * 100) : 0
  const avgWin    = wins.length   > 0 ? totalWins / wins.length   : null
  const avgLoss   = losses.length > 0 ? losses.reduce((s, t) => s + Number(t.pnl), 0) / losses.length : null
  const profitFactor = totalLoss > 0 ? +(totalWins / totalLoss).toFixed(2) : null

  const bestTrade  = withPnl.length > 0 ? withPnl.reduce((b, t) => Number(t.pnl) > Number(b.pnl) ? t : b, withPnl[0]) : null
  const worstTrade = withPnl.length > 0 ? withPnl.reduce((w, t) => Number(t.pnl) < Number(w.pnl) ? t : w, withPnl[0]) : null

  // Streaks
  let maxWinStreak = 0, maxLossStreak = 0, curWin = 0, curLoss = 0
  const sorted = [...withPnl].sort((a, b) => new Date(a.date) - new Date(b.date))
  sorted.forEach(t => {
    if (Number(t.pnl) > 0) { curWin++;  curLoss = 0; maxWinStreak  = Math.max(maxWinStreak,  curWin) }
    else                    { curLoss++; curWin = 0; maxLossStreak = Math.max(maxLossStreak, curLoss) }
  })

  // Avg R:R
  const rrTrades = withPnl.filter(t => t.risk_amount && t.risk_amount > 0)
  const avgRR = rrTrades.length > 0
    ? +(rrTrades.reduce((s, t) => s + Number(t.pnl) / Number(t.risk_amount), 0) / rrTrades.length).toFixed(2)
    : null

  // Equity curve + max drawdown
  let cum = 0
  const equityCurve = sorted.map(t => {
    cum += Number(t.pnl)
    return { date: t.date, pnl: Number(t.pnl), cumulativePnl: +cum.toFixed(2) }
  })

  let peak = 0, maxDrawdown = 0
  equityCurve.forEach(p => {
    if (p.cumulativePnl > peak) peak = p.cumulativePnl
    const dd = peak - p.cumulativePnl
    if (dd > maxDrawdown) maxDrawdown = dd
  })

  // Buckets (symbol, session, grade, day-of-week, mistakes, setup)
  const symbolMap = {}
  withPnl.forEach(t => { symbolMap[t.symbol] = (symbolMap[t.symbol] || 0) + Number(t.pnl) })
  const pnlBySymbol = Object.entries(symbolMap)
    .map(([symbol, pnl]) => ({ symbol, pnl: +pnl.toFixed(2) }))
    .sort((a, b) => b.pnl - a.pnl)

  const sessionMap = {}
  withPnl.forEach(t => {
    const s = t.session || 'Unknown'
    if (!sessionMap[s]) sessionMap[s] = { pnl: 0, count: 0 }
    sessionMap[s].pnl += Number(t.pnl)
    sessionMap[s].count++
  })
  const pnlBySession = Object.entries(sessionMap)
    .map(([session, v]) => ({ session, pnl: +v.pnl.toFixed(2), count: v.count }))
    .sort((a, b) => b.pnl - a.pnl)

  const gradeMap = { A: { pnl: 0, count: 0 }, B: { pnl: 0, count: 0 }, C: { pnl: 0, count: 0 } }
  withPnl.forEach(t => {
    if (t.grade && gradeMap[t.grade]) {
      gradeMap[t.grade].pnl += Number(t.pnl)
      gradeMap[t.grade].count++
    }
  })
  const pnlByGrade = Object.entries(gradeMap)
    .filter(([, v]) => v.count > 0)
    .map(([grade, v]) => ({ grade, pnl: +v.pnl.toFixed(2), count: v.count }))

  const mistakeMap = {}
  withPnl.forEach(t => {
    (t.mistakes || []).forEach(m => { mistakeMap[m] = (mistakeMap[m] || 0) + 1 })
  })
  const mistakeFreq = Object.entries(mistakeMap)
    .map(([mistake, count]) => ({ mistake, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6)

  const dowMap = {}
  withPnl.forEach(t => {
    const dayName = DOW_NAMES[new Date(t.date).getDay()]
    if (!dowMap[dayName]) dowMap[dayName] = { pnl: 0, count: 0 }
    dowMap[dayName].pnl += Number(t.pnl)
    dowMap[dayName].count++
  })
  const pnlByDow = DOW_ORDER
    .map(d => ({ day: d, pnl: +(dowMap[d]?.pnl || 0).toFixed(2), count: dowMap[d]?.count || 0 }))
    .filter(d => d.count > 0)

  const setupMap = {}
  withPnl.forEach(t => {
    if (!t.setup) return
    if (!setupMap[t.setup]) setupMap[t.setup] = { count: 0, wins: 0, pnl: 0 }
    setupMap[t.setup].count++
    if (Number(t.pnl) > 0) setupMap[t.setup].wins++
    setupMap[t.setup].pnl += Number(t.pnl)
  })
  const winRateBySetup = Object.entries(setupMap)
    .filter(([, v]) => v.count >= 2)
    .map(([setup, v]) => ({ setup, winRate: Math.round((v.wins / v.count) * 100), count: v.count, pnl: +v.pnl.toFixed(2) }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)

  return {
    totalPnl, winRate, winCount: wins.length, lossCount: losses.length,
    totalTrades: trades.length, withPnlCount: withPnl.length,
    avgWin, avgLoss, profitFactor, bestTrade, worstTrade,
    maxWinStreak, maxLossStreak, avgRR, maxDrawdown: +maxDrawdown.toFixed(2),
    equityCurve, pnlBySymbol, pnlBySession, pnlByGrade, mistakeFreq, pnlByDow, winRateBySetup
  }
}
