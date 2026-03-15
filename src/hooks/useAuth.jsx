import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

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
      const email = session.user.email
      const { data } = await supabase
        .from('approved_members')
        .select('email')
        .eq('email', email.toLowerCase().trim())
        .maybeSingle()
      if (!data) {
        await supabase.auth.signOut()
        setAuthError('Become a member to sign in. Visit our membership page or contact the club to get started.')
        setMember(null)
        setLoading(false)
        return
      }
      setMember(mapSession(session))
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
      tier: 'COLLECTOR',
    }
    setMember(m)
    return m
  }

  async function signUp({ email, password, name, tier }) {
    if (!supabase) return devLogin(email)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, tier: tier || 'ENTHUSIAST' },
      },
    })
    if (error) throw error
    return data
  }

  async function checkApproved(email) {
    if (!supabase) return true
    const { data, error } = await supabase
      .from('approved_members')
      .select('email')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle()
    if (error) throw error
    return !!data
  }

  async function signIn({ email, password }) {
    if (!supabase) return devLogin(email)

    const approved = await checkApproved(email)
    if (!approved) throw new Error('Become a member to sign in. Visit our membership page or contact the club to get started.')

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

  async function logout() {
    if (supabase) await supabase.auth.signOut()
    setMember(null)
  }

  return (
    <AuthContext.Provider value={{ member, loading, authError, setAuthError, signUp, signIn, signInWithGoogle, resetPassword, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

function mapSession(session) {
  const user = session.user
  const meta = user.user_metadata || {}
  return {
    id: user.id,
    email: user.email,
    name: meta.name || meta.full_name || user.email.split('@')[0],
    avatar: meta.avatar_url || '',
    tier: meta.tier || 'ENTHUSIAST',
  }
}

export default function useAuth() {
  return useContext(AuthContext)
}
