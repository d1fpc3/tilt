import { describe, it, expect } from 'vitest'
import { computeAnalytics } from '../../src/lib/analytics.js'

describe('computeAnalytics', () => {
  it('returns zeros for empty input', () => {
    const r = computeAnalytics([])
    expect(r.totalTrades).toBe(0)
    expect(r.totalPnl).toBe(0)
    expect(r.winRate).toBe(0)
  })

  it('computes win rate, profit factor, streaks', () => {
    const trades = [
      { date: '2026-04-01', symbol: 'ES', pnl:  100, risk_amount: 50 },
      { date: '2026-04-02', symbol: 'ES', pnl:  200, risk_amount: 50 },
      { date: '2026-04-03', symbol: 'NQ', pnl: -100, risk_amount: 50 },
      { date: '2026-04-04', symbol: 'NQ', pnl:  300, risk_amount: 50 },
    ]
    const r = computeAnalytics(trades)
    expect(r.totalTrades).toBe(4)
    expect(r.winCount).toBe(3)
    expect(r.lossCount).toBe(1)
    expect(r.winRate).toBe(75)
    expect(r.totalPnl).toBe(500)
    expect(r.profitFactor).toBe(6)        // 600 wins / 100 loss
    expect(r.maxWinStreak).toBe(2)
    expect(r.maxLossStreak).toBe(1)
    expect(r.avgRR).toBe(2.5)             // (2 + 4 + -2 + 6) / 4
  })

  it('builds equity curve and max drawdown in date order', () => {
    const trades = [
      { date: '2026-04-04', symbol: 'X', pnl:  50 },
      { date: '2026-04-01', symbol: 'X', pnl: 100 },
      { date: '2026-04-02', symbol: 'X', pnl:  50 },
      { date: '2026-04-03', symbol: 'X', pnl: -80 },
    ]
    const r = computeAnalytics(trades)
    expect(r.equityCurve.map(p => p.cumulativePnl)).toEqual([100, 150, 70, 120])
    expect(r.maxDrawdown).toBe(80)
  })
})
