import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'

const AdminAuthContext = createContext(null)

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null)
  const [loading, setLoading] = useState(true)
  const checkedRef = useRef(false)

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

    // Listen for ALL auth events — this catches OAuth redirects, token refreshes, etc.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user && !checkedRef.current) {
        checkedRef.current = true
        await trySetAdmin(session.user)
      } else if (!session) {
        setAdmin(null)
        setLoading(false)
      }
    })

    // Also check immediately in case session already exists (e.g. returning user)
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user && !checkedRef.current) {
        checkedRef.current = true
        await trySetAdmin(session.user)
      } else if (!checkedRef.current) {
        setLoading(false)
      }
    })

    // Safety timeout — never leave loading spinner stuck
    const timeout = setTimeout(() => {
      if (loading) setLoading(false)
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

    const isAdmin = await checkIsAdmin(data.user.id)
    if (!isAdmin) {
      await supabase.auth.signOut()
      return false
    }

    setAdmin({ email: data.user.email, name: 'Admin', id: data.user.id })
    return true
  }, [])

  const loginWithGoogle = useCallback(async () => {
    if (!supabase) return false

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/admin' },
    })
    return !error
  }, [])

  const logout = useCallback(async () => {
    if (supabase) await supabase.auth.signOut()
    checkedRef.current = false
    setAdmin(null)
  }, [])

  return (
    <AdminAuthContext.Provider value={{ admin, login, loginWithGoogle, logout, loading }}>
      {children}
    </AdminAuthContext.Provider>
  )
}

async function checkIsAdmin(userId) {
  const { data } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', userId)
    .single()
  return data?.is_admin === true
}

export default function useAdminAuth() {
  return useContext(AdminAuthContext)
}
