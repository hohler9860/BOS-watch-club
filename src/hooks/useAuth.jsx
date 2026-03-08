import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [member, setMember] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }

    // Listen for auth changes (must be set up before getSession)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setMember(session ? mapSession(session) : null)
        setLoading(false)
      }
    )

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setMember(session ? mapSession(session) : null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function signUp({ email, password, name, tier }) {
    if (!supabase) throw new Error('Supabase not configured')
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

  async function signIn({ email, password }) {
    if (!supabase) throw new Error('Supabase not configured')
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    return data
  }

  async function signInWithGoogle() {
    if (!supabase) throw new Error('Supabase not configured')
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/dashboard' },
    })
    if (error) throw error
    return data
  }

  async function resetPassword(email) {
    if (!supabase) throw new Error('Supabase not configured')
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/login',
    })
    if (error) throw error
  }

  async function logout() {
    if (!supabase) return
    await supabase.auth.signOut()
    setMember(null)
  }

  return (
    <AuthContext.Provider value={{ member, loading, signUp, signIn, signInWithGoogle, resetPassword, logout }}>
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
