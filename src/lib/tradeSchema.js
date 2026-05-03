import { z } from 'zod'

export const EMOTIONS = ['calm','focused','anxious','greedy','frustrated','euphoric','tired','revenge']

export const tradeSchema = z.object({
  symbol:       z.string().min(1).max(16).transform(s => s.toUpperCase()),
  direction:    z.enum(['LONG','SHORT']),
  quantity:     z.coerce.number().positive().nullable().optional(),
  entry_price:  z.coerce.number().nullable().optional(),
  exit_price:   z.coerce.number().nullable().optional(),
  pnl:          z.coerce.number().nullable().optional(),
  date:         z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  entry_time:   z.string().datetime().nullable().optional(),
  exit_time:    z.string().datetime().nullable().optional(),
  session:      z.string().max(40).nullable().optional(),
  setup:        z.string().max(60).nullable().optional(),
  risk_amount:  z.coerce.number().nonnegative().nullable().optional(),
  emotion_pre:  z.enum(EMOTIONS),
  emotion_post: z.enum(EMOTIONS).nullable().optional(),
  grade:        z.enum(['A','B','C']).nullable().optional(),
  mistakes:     z.array(z.string()).default([]),
  notes:        z.string().max(2000).nullable().optional(),
  images:       z.array(z.string().url()).default([])
})

export const emotionLogSchema = z.object({
  context:   z.enum(['pre_market','mid_day','post_market','ad_hoc']),
  emotion:   z.enum(EMOTIONS),
  intensity: z.coerce.number().int().min(1).max(5),
  trigger:   z.string().max(200).nullable().optional(),
  notes:     z.string().max(1000).nullable().optional(),
})
