if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual'
}
window.scrollTo(0, 0)

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { ThemeProvider } from './context/ThemeContext'
import './styles/variables.css'
import './styles/reset.css'
import './styles/global.css'
import './styles/animations.css'
import 'lenis/dist/lenis.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>
)
