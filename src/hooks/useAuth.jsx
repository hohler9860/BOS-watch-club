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
  // Stay in loading state if supabase exists OR if URL has OAuth callback tokens
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

      // Fetch role from profiles table
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, tier, name, avatar_url')
        .eq('id', session.user.id)
        .maybeSingle()

      setMember(mapSession(session, profile))
      setLoading(false)
    }

    // Listen for auth changes (must be set up before getSession)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => { handleSession(session) }
    )

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleSession(session)
    })

    // Safety timeout so auth never stays loading forever
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

  // Open registration — anyone can sign up (no approval needed)
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
      options: { redirectTo: window.location.origin + '/dashboard' },
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

  // Redeem an access code to upgrade from free → member (with tier)
  async function redeemAccessCode(code) {
    if (!supabase) {
      // Dev mode: simulate redemption
      setMember(prev => prev ? { ...prev, role: 'member', tier: 'COLLECTOR' } : prev)
      return { success: true, tier: 'COLLECTOR' }
    }

    const trimmed = code.trim().toUpperCase()

    // Look up the code
    const { data: accessCode, error: lookupError } = await supabase
      .from('access_codes')
      .select('*')
      .eq('code', trimmed)
      .eq('is_active', true)
      .is('redeemed_by', null)
      .maybeSingle()

    if (lookupError) throw lookupError
    if (!accessCode) {
      throw new Error('Invalid or already used access code.')
    }

    // Check expiration
    if (accessCode.expires_at && new Date(accessCode.expires_at) < new Date()) {
      throw new Error('This access code has expired.')
    }

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('You must be signed in to redeem a code.')

    // Mark the code as redeemed
    const { error: redeemError } = await supabase
      .from('access_codes')
      .update({
        redeemed_by: user.id,
        redeemed_at: new Date().toISOString(),
        is_active: false,
      })
      .eq('id', accessCode.id)

    if (redeemError) throw redeemError

    // Upgrade the user's profile
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        role: 'member',
        tier: accessCode.tier,
      })
      .eq('id', user.id)

    if (profileError) throw profileError

    // Update local state
    setMember(prev => prev ? { ...prev, role: 'member', tier: accessCode.tier } : prev)

    return { success: true, tier: accessCode.tier }
  }

  async function logout() {
    if (supabase) await supabase.auth.signOut()
    setMember(null)
  }

  return (
    <AuthContext.Provider value={{ member, loading, authError, setAuthError, signUp, signIn, signInWithGoogle, resetPassword, redeemAccessCode, logout }}>
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
    tier: profile?.tier || 'ENTHUSIAST',
  }
}

export default function useAuth() {
  return useContext(AuthContext)
}
