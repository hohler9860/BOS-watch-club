import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const AdminAuthContext = createContext(null)

async function checkIsAdmin() {
  const { data, error } = await supabase.rpc('check_is_admin')
  if (error) {
    console.error('Admin check failed:', error.message)
    return false
  }
  return data === true
}

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase) { setLoading(false); return }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session?.user) {
          const isAdmin = await checkIsAdmin()
          if (isAdmin) {
            setAdmin({ email: session.user.email, name: 'Admin', id: session.user.id })
          }
        }
        setLoading(false)
      } else if (event === 'SIGNED_OUT') {
        setAdmin(null)
        setLoading(false)
      }
    })

    // Check existing session on mount
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (user) {
        const isAdmin = await checkIsAdmin()
        if (isAdmin) {
          setAdmin({ email: user.email, name: 'Admin', id: user.id })
        }
      }
      setLoading(false)
    })

    const timeout = setTimeout(() => setLoading(false), 5000)

    return () => {
      subscription.unsubscribe()
      clearTimeout(timeout)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const login = useCallback(async (email, password) => {
    if (!supabase) return false

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error || !data.user) return false

    const isAdmin = await checkIsAdmin()
    if (!isAdmin) {
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

export default function useAdminAuth() {
  return useContext(AdminAuthContext)
}
