import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

// Role hierarchy: free < member < founding_member < vip
const ROLE_RANK = { free: 0, member: 1, founding_member: 2, vip: 3 }

export function roleMeetsMinimum(userRole, requiredRole) {
  const userRank = ROLE_RANK[userRole] ?? 0
  const requiredRank = ROLE_RANK[requiredRole] ?? 0
  return userRank >= requiredRank
}

export function AuthProvider({ children }) {
  const [member, setMember] = useState(null)
  const [authError, setAuthError] = useState('')
  const hasOAuthCallback = typeof window !== 'undefined' && (
    window.location.hash.includes('access_token') ||
    window.location.search.includes('code=')
  )
  const [loading, setLoading] = useState(!!supabase || hasOAuthCallback)

  useEffect(() => {
    if (!supabase) return

    async function handleSession(session) {
      if (!session) {
        setMember(null)
        setLoading(false)
        return
      }

      // Try fetching with role column; fall back if column doesn't exist yet
      let { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role, tier, name, avatar_url, onboarding_complete')
        .eq('id', session.user.id)
        .maybeSingle()

      if (profileError && profileError.message?.includes('role')) {
        const { data: fallbackProfile } = await supabase
          .from('profiles')
          .select('tier, name, avatar_url, onboarding_complete')
          .eq('id', session.user.id)
          .maybeSingle()
        profile = fallbackProfile
      }

      setMember(mapSession(session, profile))
      setLoading(false)
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        handleSession(session)

        // Send welcome email for new OAuth signups (Google)
        if (event === 'SIGNED_IN' && session?.user) {
          const createdAt = new Date(session.user.created_at)
          const now = new Date()
          const isNewUser = (now - createdAt) < 60000 // created within last 60s
          if (isNewUser) {
            const meta = session.user.user_metadata || {}
            const email = session.user.email
            const firstName = meta.name?.split(' ')[0] || meta.full_name?.split(' ')[0] || 'Member'
            fetch('/api/send-welcome', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, firstName }),
            }).catch(err => console.error('Welcome email failed:', err))
          }
        }
      }
    )

    supabase.auth.getSession().then(({ data: { session } }) => {
      handleSession(session)
    })

    const timeout = setTimeout(() => setLoading(false), 5000)

    return () => {
      subscription.unsubscribe()
      clearTimeout(timeout)
    }
  }, [])

  function devLogin(email) {
    const m = {
      id: 'dev-user',
      email: email || 'dev@boswatch.club',
      name: email ? email.split('@')[0] : 'Dev Member',
      avatar: '',
      role: 'member',
      tier: 'COLLECTOR',
    }
    setMember(m)
    return m
  }

  async function signUp({ email, password, name }) {
    if (!supabase) return devLogin(email)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    })
    if (error) throw error

    // Send welcome email (fire and forget — don't block signup)
    const firstName = name?.split(' ')[0] || 'Member'
    fetch('/api/send-welcome', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, firstName }),
    }).catch(err => console.error('Welcome email failed:', err))

    return data
  }

  async function signIn({ email, password }) {
    if (!supabase) return devLogin(email)
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    return data
  }

  async function signInWithGoogle() {
    if (!supabase) return devLogin()
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/login' },
    })
    if (error) throw error
    return data
  }

  async function resetPassword(email) {
    if (!supabase) return
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/login',
    })
    if (error) throw error
  }

  // Purchase a membership tier — upgrades account from free → member
  // TODO: Replace placeholder with real Stripe payment verification
  async function upgradeTier(tierName) {
    if (!supabase) {
      // Dev mode: simulate upgrade
      setMember(prev => prev ? { ...prev, role: 'member', tier: tierName } : prev)
      return { success: true, tier: tierName }
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('You must be signed in to upgrade.')

    // Try updating role + tier; if role column doesn't exist yet, update tier only
    let { error: profileError } = await supabase
      .from('profiles')
      .update({ role: 'member', tier: tierName })
      .eq('id', user.id)

    if (profileError && profileError.message?.includes('role')) {
      // role column not yet migrated — update tier only
      const { error: fallbackError } = await supabase
        .from('profiles')
        .update({ tier: tierName })
        .eq('id', user.id)
      if (fallbackError) throw fallbackError
    } else if (profileError) {
      throw profileError
    }

    // Update local state
    setMember(prev => prev ? { ...prev, role: 'member', tier: tierName } : prev)

    return { success: true, tier: tierName }
  }

  function markOnboardingComplete() {
    setMember(prev => prev ? { ...prev, onboardingComplete: true } : prev)
  }

  async function logout() {
    if (supabase) await supabase.auth.signOut()
    setMember(null)
  }

  return (
    <AuthContext.Provider value={{ member, loading, authError, setAuthError, signUp, signIn, signInWithGoogle, resetPassword, upgradeTier, markOnboardingComplete, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

function mapSession(session, profile) {
  const user = session.user
  const meta = user.user_metadata || {}
  return {
    id: user.id,
    email: user.email,
    name: profile?.name || meta.name || meta.full_name || user.email.split('@')[0],
    avatar: profile?.avatar_url || meta.avatar_url || '',
    role: profile?.role || 'free',
    tier: profile?.tier || 'FREE',
    onboardingComplete: profile?.onboarding_complete ?? false,
  }
}

export default function useAuth() {
  return useContext(AuthContext)
}
