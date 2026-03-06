import { Navigate } from 'react-router'
import useAuth from '../hooks/useAuth'
import SmokeyBackground from '../components/ui/SmokeyBackground'
import LoginForm from '../components/ui/LoginForm'

export default function LoginPage() {
  const { member } = useAuth()

  if (member) return <Navigate to="/dashboard" replace />

  return (
    <main className="relative w-screen h-screen" style={{ background: '#07090F' }}>
      <SmokeyBackground className="absolute inset-0" color="#1E40AF" />
      <div className="relative z-10 flex items-center justify-center w-full h-full p-4">
        <LoginForm />
      </div>
    </main>
  )
}
