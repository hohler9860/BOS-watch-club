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
  const [passwordRecovery, setPasswordRecovery] = useState(false)
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
        .select('role, tier, name, avatar_url, onboarding_complete, is_admin')
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

    const welcomeSentRef = { sent: false }
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'PASSWORD_RECOVERY') {
          setPasswordRecovery(true)
        }

        handleSession(session)

        // Send welcome email for new OAuth signups (Google)
        if (!welcomeSentRef.sent && session?.user && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION')) {
          const createdAt = new Date(session.user.created_at)
          const now = new Date()
          const isNewUser = (now - createdAt) < 120000 // created within last 2 min
          const isOAuth = session.user.app_metadata?.provider !== 'email'
          if (isNewUser && isOAuth) {
            welcomeSentRef.sent = true
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

  async function signUp({ email, password, name }) {
    if (!supabase) throw new Error('Supabase is not configured.')
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
    if (!supabase) throw new Error('Supabase is not configured.')
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    return data
  }

  async function signInWithGoogle() {
    if (!supabase) throw new Error('Supabase is not configured.')
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

  async function updatePassword(newPassword) {
    if (!supabase) return
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) throw error
    setPasswordRecovery(false)
  }

  // Re-fetch the user's profile from Supabase to pick up server-side changes
  // (e.g. tier upgrades applied by the Stripe webhook in api/stripe-webhook.js).
  // SECURITY: Tier/role changes must only happen via the Stripe webhook using the
  // service-role key. Client-side code must never write role/tier directly.
  async function refreshProfile() {
    if (!supabase) return null

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return null

    let { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, tier, name, avatar_url, onboarding_complete, is_admin')
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

    if (profile) {
      const updated = mapSession(session, profile)
      setMember(updated)
      return updated
    }
    return null
  }

  function markOnboardingComplete() {
    setMember(prev => prev ? { ...prev, onboardingComplete: true } : prev)
  }

  async function logout() {
    if (supabase) await supabase.auth.signOut()
    setMember(null)
  }

  return (
    <AuthContext.Provider value={{ member, loading, authError, setAuthError, passwordRecovery, signUp, signIn, signInWithGoogle, resetPassword, updatePassword, refreshProfile, markOnboardingComplete, logout }}>
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
    is_admin: profile?.is_admin || false,
  }
}

export default function useAuth() {
  return useContext(AuthContext)
}
