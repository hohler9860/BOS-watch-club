if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual'
}
window.scrollTo(0, 0)

import React from 'react'
import ReactDOM from 'react-dom/client'
import * as Sentry from '@sentry/react'
import App from './App'
import { ThemeProvider } from './context/ThemeContext'
import './styles/variables.css'
import './styles/reset.css'
import './styles/global.css'
import './styles/animations.css'
import 'lenis/dist/lenis.css'

if (import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
    integrations: [Sentry.browserTracingIntegration()],
    tracesSampleRate: 0.1,
  })
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <Sentry.ErrorBoundary fallback={<ErrorFallback />}>
        <App />
      </Sentry.ErrorBoundary>
    </ThemeProvider>
  </React.StrictMode>
)

function ErrorFallback() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#07090F', color: '#E8ECF0', fontFamily: "'Unbounded', sans-serif", textAlign: 'center', padding: '24px' }}>
      <p style={{ fontSize: '12px', letterSpacing: '3px', color: '#B8C4D4', marginBottom: '12px' }}>SOMETHING WENT WRONG</p>
      <p style={{ fontSize: '13px', fontWeight: 300, color: 'rgba(232,236,240,0.5)', marginBottom: '24px' }}>Please refresh the page or try again later.</p>
      <button onClick={() => window.location.reload()} style={{ background: '#B8C4D4', color: '#07090F', border: 'none', padding: '12px 32px', borderRadius: '40px', fontFamily: "'Bebas Neue', sans-serif", fontSize: '15px', letterSpacing: '3px', cursor: 'pointer' }}>REFRESH</button>
    </div>
  )
}
