import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../supabaseClient.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) loadProfile(session.user.id)
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) loadProfile(session.user.id)
      else { setProfile(null); setLoading(false) }
    })

    function handleVisibility() {
      if (document.visibilityState !== 'visible') return
      supabase.auth.refreshSession().then(({ data }) => {
        if (data.session) setSession(data.session)
      })
    }
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      subscription.unsubscribe()
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [])

  async function loadProfile(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, display_name, timezone, plan, plan_renews_at, weekly_report_day, weekly_report_hour')
      .eq('id', userId)
      .single()

    if (error) console.error('[tilt] loadProfile failed:', error.message)
    setProfile(data ?? null)
    setLoading(false)
  }

  async function logout() {
    await supabase.auth.signOut()
    setSession(null)
    setProfile(null)
  }

  const isPro = profile?.plan === 'pro'

  return (
    <AuthContext.Provider value={{ session, profile, loading, isPro, logout, setProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
