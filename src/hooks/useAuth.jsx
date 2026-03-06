import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

const STORAGE_KEY = 'bwc_member'

// TODO: Replace with Supabase Auth provider
export function AuthProvider({ children }) {
  const [member, setMember] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })

  useEffect(() => {
    if (member) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(member))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [member])

  function login(memberData) {
    setMember(memberData)
  }

  function logout() {
    setMember(null)
  }

  return (
    <AuthContext.Provider value={{ member, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export default function useAuth() {
  return useContext(AuthContext)
}
