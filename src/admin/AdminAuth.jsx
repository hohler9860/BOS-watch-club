import { createContext, useContext, useState, useCallback } from 'react'
import { ADMIN_CREDENTIALS } from '../data/adminData'

// TODO: Replace with Supabase admin auth (separate from member auth)
const AdminAuthContext = createContext(null)

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null)

  const login = useCallback((email, password) => {
    // TODO: Replace with Supabase auth.signInWithPassword for admin role
    if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
      setAdmin({ email, name: 'Admin' })
      return true
    }
    return false
  }, [])

  const logout = useCallback(() => {
    // TODO: Replace with Supabase auth.signOut
    setAdmin(null)
  }, [])

  return (
    <AdminAuthContext.Provider value={{ admin, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  )
}

export default function useAdminAuth() {
  return useContext(AdminAuthContext)
}
