import { HashRouter, Routes, Route } from 'react-router'
import Layout from './components/layout/Layout'
import HomePage from './pages/HomePage'
import MembershipPage from './pages/MembershipPage'
import EventsPage from './pages/EventsPage'
import TermsPage from './pages/TermsPage'

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/membership" element={<MembershipPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/terms" element={<TermsPage />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}
