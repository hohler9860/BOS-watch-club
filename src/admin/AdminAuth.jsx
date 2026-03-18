import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'

const AdminAuthContext = createContext(null)

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null)
  const [loading, setLoading] = useState(true)

  async function trySetAdmin(user) {
    if (!user) return false
    const isAdmin = await checkIsAdmin(user.id)
    if (isAdmin) {
      setAdmin({ email: user.email, name: 'Admin', id: user.id })
      setLoading(false)
      return true
    }
    setLoading(false)
    return false
  }

  useEffect(() => {
    if (!supabase) { setLoading(false); return }

    // Listen for auth state changes (sign in, sign out, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session?.user) await trySetAdmin(session.user)
      } else if (event === 'SIGNED_OUT') {
        setAdmin(null)
        setLoading(false)
      }
    })

    // Explicitly check session on mount — this reliably handles OAuth redirects
    // and returning users, regardless of onAuthStateChange timing
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (user) {
        await trySetAdmin(user)
      } else {
        setLoading(false)
      }
    })

    // Safety timeout — never leave loading spinner stuck
    const timeout = setTimeout(() => {
      setLoading(false)
    }, 5000)

    return () => {
      subscription.unsubscribe()
      clearTimeout(timeout)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const login = useCallback(async (email, password) => {
    if (!supabase) return false

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error || !data.user) return false

    // Query profiles directly — session is already established by signInWithPassword
    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', data.user.id)
      .single()

    if (profileErr || !profile?.is_admin) {
      await supabase.auth.signOut()
      return false
    }

    setAdmin({ email: data.user.email, name: 'Admin', id: data.user.id })
    return true
  }, [])

  const logout = useCallback(async () => {
    if (supabase) await supabase.auth.signOut()
    setAdmin(null)
  }, [])

  return (
    <AdminAuthContext.Provider value={{ admin, login, logout, loading }}>
      {children}
    </AdminAuthContext.Provider>
  )
}

async function checkIsAdmin(userId) {
  // getUser() forces a server-side session verification, ensuring the
  // supabase client's auth headers are set before we query with RLS
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== userId) return false

  const { data, error } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', userId)
    .single()
  if (error) {
    console.error('Admin check failed:', error.message)
    return false
  }
  return data?.is_admin === true
}

export default function useAdminAuth() {
  return useContext(AdminAuthContext)
}
