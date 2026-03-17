import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const AdminAuthContext = createContext(null)

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null)
  const [loading, setLoading] = useState(true)

  // Check for existing admin session on mount
  useEffect(() => {
    if (!supabase) { setLoading(false); return }

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const isAdmin = await checkIsAdmin(session.user.id)
        if (isAdmin) {
          setAdmin({ email: session.user.email, name: 'Admin', id: session.user.id })
        }
      }
      setLoading(false)
    })
  }, [])

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
