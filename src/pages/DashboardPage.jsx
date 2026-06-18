import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { supabase } from '../lib/supabase'
import useAuth, { roleMeetsMinimum } from '../hooks/useAuth'
import { TIER_COLORS } from '../constants/tiers'
import UpgradePopup from '../components/shared/UpgradePopup'
import { useEvents, useBlogPosts, useClubNews, useDiscussionsWithReplies, useTiers, useMembers } from '../hooks/useSupabaseData'
import { toast } from '../components/shared/Toast'
import s from './DashboardPage.module.css'

import { getRsvpMessage, getRsvpButtonLabel, isWithin24Hours } from './dashboard/utils'
import OverviewTab from './dashboard/OverviewTab'
import EventsTab from './dashboard/EventsTab'
import JournalTab from './dashboard/JournalTab'
import DiscussionsTab from './dashboard/DiscussionsTab'
import MembersTab from './dashboard/MembersTab'
import NotificationsTab from './dashboard/NotificationsTab'
import ProfileTab from './dashboard/ProfileTab'

const TABS = [
  { id: 'overview', label: 'Overview', icon: 'grid' },
  { id: 'events', label: 'Events', icon: 'calendar' },
  { id: 'blogs', label: 'Journal', icon: 'book' },
  { id: 'discussions', label: 'Discussions', icon: 'chat' },
  { id: 'members', label: 'Members', icon: 'people', memberOnly: true },
  { id: 'notifications', label: 'Notifications', icon: 'bell' },
  { id: 'profile', label: 'Profile', icon: 'user' },
]

function TabIcon({ icon }) {
  const props = { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' }
  switch (icon) {
    case 'grid': return <svg {...props}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
    case 'calendar': return <svg {...props}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
    case 'book': return <svg {...props}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
    case 'chat': return <svg {...props}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
    case 'people': return <svg {...props}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
    case 'star': return <svg {...props}><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
    case 'bell': return <svg {...props}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
    case 'user': return <svg {...props}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
    default: return null
  }
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { member, loading, logout, refreshProfile } = useAuth()

  // Supabase data hooks
  const { data: events } = useEvents()
  const { data: tiersList } = useTiers()
  const { data: blogPosts } = useBlogPosts('published')
  const { data: clubNews } = useClubNews()
  const { data: discussions } = useDiscussionsWithReplies('approved')
  const { data: directoryMembers } = useMembers()

  const [welcomePopup, setWelcomePopup] = useState(null)
  const [userNotifications, setUserNotifications] = useState([])
  const [rsvps, setRsvps] = useState([])
  const [activeTab, setActiveTab] = useState(() => sessionStorage.getItem('dashTab') || 'overview')
  const [eventFilter, setEventFilter] = useState('upcoming')
  const [expandedDiscussion, setExpandedDiscussion] = useState(null)
  const [newDiscussion, setNewDiscussion] = useState({ title: '', body: '', tags: [] })
  const [showNewDiscussion, setShowNewDiscussion] = useState(false)
  const [userDiscussions, setUserDiscussions] = useState([])
  const [deleteModal, setDeleteModal] = useState(null)
  const [discSearch, setDiscSearch] = useState('')
  const [discSort, setDiscSort] = useState('latest')
  const [selectedPost, setSelectedPost] = useState(null)
  const [selectedMember, setSelectedMember] = useState(null)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [selectedUpdate, setSelectedUpdate] = useState(null)

  function switchTab(tabId) {
    setActiveTab(tabId)
    setSelectedEvent(null)
    setSelectedMember(null)
    setSelectedPost(null)
    setSelectedUpdate(null)
    setEventFilter('upcoming')
  }
  const [likes, setLikes] = useState({})
  const [replyingTo, setReplyingTo] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [rsvpModal, setRsvpModal] = useState(null)
  const [cancelModal, setCancelModal] = useState(null)
  const [guestForm, setGuestForm] = useState({ name: '', email: '', dob: '' })
  const [guestErrors, setGuestErrors] = useState({})
  const [addGuestModal, setAddGuestModal] = useState(null)
  const [guestWarning, setGuestWarning] = useState(false)
  const [eventGuests, setEventGuests] = useState({})
  const [readNotifications, setReadNotifications] = useState(() => {
    try {
      const stored = localStorage.getItem(`readNotifs_${member?.id}`)
      return stored ? JSON.parse(stored) : []
    } catch { return [] }
  })
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showAllTiers, setShowAllTiers] = useState(false)
  const [profile, setProfile] = useState({
    officialName: '',
    name: '',
    bio: '',
    nationality: '',
    linkedin: '',
    collects: '',
    favoriteWatch: '',
    location: '',
    instagram: '',
    avatarUrl: '',
  })
  const avatarInputRef = useRef(null)
  const mainRef = useRef(null)
  const membershipRef = useRef(null)

  useEffect(() => {
    if (member?.id && readNotifications.length > 0) {
      localStorage.setItem(`readNotifs_${member.id}`, JSON.stringify(readNotifications))
    }
  }, [readNotifications, member?.id])

  async function handleTierUpgrade(tierName) {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        toast('Please log in to upgrade your membership.')
        return
      }
      const isEdu = member?.email?.endsWith('.edu')
      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier: tierName,
          accessToken: session.access_token,
          eduDiscount: isEdu || false,
        }),
      })
      const text = await res.text()
      let data
      try { data = JSON.parse(text) } catch { throw new Error('Checkout unavailable — please try again.') }
      if (!res.ok) throw new Error(data.error || 'Failed to start checkout')
      window.location.href = data.url
    } catch (err) {
      toast(err.message || 'Something went wrong. Please try again.')
    }
  }

  function handleLogoClick() {
    if (activeTab === 'overview') {
      if (mainRef.current) mainRef.current.scrollTo({ top: 0, behavior: 'smooth' })
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      setActiveTab('overview')
    }
  }

  useEffect(() => {
    sessionStorage.setItem('dashTab', activeTab)
    if (mainRef.current) mainRef.current.scrollTop = 0
    window.scrollTo(0, 0)
  }, [activeTab])

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileMenuOpen])

  useEffect(() => {
    const tabParam = searchParams.get('tab')
    if (tabParam) setActiveTab(tabParam)

    const isWelcome = searchParams.get('welcome') === 'true'
    const tierParam = searchParams.get('tier')?.toUpperCase()
    if (!isWelcome || !tierParam) { if (tabParam) setSearchParams({}, { replace: true }); return }
    setSearchParams({}, { replace: true })
    // Only show welcome confetti once per session
    const welcomeKey = `welcomed_${member?.id}`
    if (sessionStorage.getItem(welcomeKey)) return
    sessionStorage.setItem(welcomeKey, 'true')
    // Refresh profile to pick up the tier change applied by the Stripe webhook
    refreshProfile()
      .then(updated => setWelcomePopup(updated?.tier || tierParam))
      .catch(() => setWelcomePopup(tierParam))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchRsvps = useCallback(async () => {
    if (!supabase || !member) return
    const { data } = await supabase
      .from('rsvps')
      .select('event_id')
      .eq('user_id', member.id)
    if (data) setRsvps(data.map((r) => r.event_id))
    // Also fetch this member's guests with full details
    const { data: guests } = await supabase
      .from('event_guests')
      .select('id, event_id, name, email, status')
      .eq('invited_by', member.id)
    if (guests) {
      const map = {}
      for (const g of guests) map[g.event_id] = g
      setEventGuests(map)
    }
  }, [member])

  useEffect(() => {
    if (!supabase || !member) return
    supabase
      .from('user_notifications')
      .select('*')
      .eq('user_id', member.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => { if (data) setUserNotifications(data) })
  }, [member?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!member) return
    fetchRsvps()
    if (supabase) {
      supabase
        .from('profiles')
        .select('name, bio, nationality, linkedin, collects, favorite_watch, location, instagram, avatar_url, official_name')
        .eq('id', member.id)
        .maybeSingle()
        .then(({ data }) => {
          if (data) {
            setProfile((prev) => ({
              ...prev,
              officialName: data.official_name || '',
              name: data.name || member.name || '',
              bio: data.bio || '',
              nationality: data.nationality || '',
              linkedin: data.linkedin || '',
              collects: data.collects || '',
              favoriteWatch: data.favorite_watch || '',
              location: data.location || '',
              instagram: data.instagram || '',
              avatarUrl: data.avatar_url || '',
            }))
          }
        })
    }
  }, [member, fetchRsvps])

  async function handleAvatarUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast('Please select an image file')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast('Image must be under 5MB')
      return
    }
    if (!supabase || !member) return

    const ext = file.name.split('.').pop()
    const filePath = `avatars/${member.id}.${ext}`

    const { error: uploadErr } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true })

    if (uploadErr) {
      toast('Failed to upload photo')
      return
    }

    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath)

    const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`

    const { error: updateErr } = await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', member.id)

    if (updateErr) {
      toast('Failed to save photo')
      return
    }

    setProfile((prev) => ({ ...prev, avatarUrl: publicUrl }))
    toast('Profile photo updated!')
  }

  function handleDobChange(e) {
    let val = e.target.value.replace(/[^\d]/g, '')
    if (val.length > 8) val = val.slice(0, 8)
    if (val.length >= 5) val = val.slice(0, 2) + '/' + val.slice(2, 4) + '/' + val.slice(4)
    else if (val.length >= 3) val = val.slice(0, 2) + '/' + val.slice(2)
    setGuestForm(p => ({ ...p, dob: val }))
  }

  function validateGuestDob(dob) {
    const match = dob.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
    if (!match) return 'Please enter date of birth in MM/DD/YYYY format.'
    const [, mm, dd, yyyy] = match
    const date = new Date(Number(yyyy), Number(mm) - 1, Number(dd))
    if (date.getMonth() !== Number(mm) - 1 || date.getDate() !== Number(dd)) return 'Invalid date.'
    const today = new Date()
    let age = today.getFullYear() - date.getFullYear()
    const monthDiff = today.getMonth() - date.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) age--
    if (age < 18) return 'Guest must be at least 18 years old.'
    return null
  }

  function handleRsvpClick(event) {
    const isRsvpd = rsvps.includes(event.id)
    if (isRsvpd) {
      setCancelModal(event)
    } else {
      setGuestForm({ name: '', email: '', dob: '' })
      setRsvpModal(event)
    }
  }

  async function confirmRsvp(event) {
    if (supabase && member) {
      // If a deposit is required, redirect to Stripe checkout
      if (event.deposit_amount > 0) {
        try {
          const { data: { session } } = await supabase.auth.getSession()
          if (!session) {
            toast('Please log in to RSVP.')
            return
          }
          const res = await fetch('/api/create-checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'deposit',
              eventId: event.id,
              eventName: event.name,
              amount: event.deposit_amount,
              accessToken: session.access_token,
            }),
          })
          const data = await res.json()
          if (!res.ok) throw new Error(data.error || 'Failed to start checkout')
          window.location.href = data.url
        } catch (err) {
          toast(err.message || 'Something went wrong. Please try again.')
        }
        setGuestForm({ name: '', email: '', dob: '' })
        setRsvpModal(null)
        return
      }

      const { error } = await supabase
        .from('rsvps')
        .insert({ user_id: member.id, event_id: event.id })
      if (error && error.code !== '23505') {
        toast('Failed to RSVP — please try again')
        return
      }

      fetch('/api/notify-rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: member.id,
          eventId: event.id,
          eventName: event.name,
          venue: event.venue,
          date: event.date,
          time: event.time,
          dressCode: event.dressCode || event.dress_code,
        }),
      }).catch(err => console.error('RSVP email failed:', err))

    }
    setRsvps((prev) => [...prev, event.id])
    setRsvpModal(null)
    toast(`You're going to ${event.name}!`)
  }

  async function confirmCancel(event) {
    if (supabase && member) {
      await supabase
        .from('rsvps')
        .delete()
        .eq('user_id', member.id)
        .eq('event_id', event.id)
    }
    setRsvps((prev) => prev.filter((id) => id !== event.id))
    setCancelModal(null)
    setEventGuests(prev => { const next = { ...prev }; delete next[event.id]; return next })
    toast(`RSVP cancelled for ${event.name}`)
  }

  async function addGuestToEvent(event) {
    if (!supabase || !member) return
    const errors = {}
    if (!guestForm.name.trim()) errors.name = '* Name is required.'
    if (!guestForm.email.trim()) errors.email = '* Email is required.'
    else if (guestForm.email.toLowerCase().trim() === member.email.toLowerCase().trim()) errors.email = '* You cannot add yourself as a guest.'
    if (!guestForm.dob.trim()) errors.dob = '* Date of birth is required.'
    else {
      const dobErr = validateGuestDob(guestForm.dob)
      if (dobErr) errors.dob = '* ' + dobErr
    }
    if (Object.keys(errors).length > 0) {
      setGuestErrors(errors)
      return
    }
    setGuestErrors({})
    const { data: rsvpData } = await supabase
      .from('rsvps')
      .select('id')
      .eq('user_id', member.id)
      .eq('event_id', event.id)
      .single()
    if (!rsvpData) { toast('RSVP not found.'); return }

    const { data: guestData, error } = await supabase.from('event_guests').insert({
      rsvp_id: rsvpData.id,
      event_id: event.id,
      invited_by: member.id,
      name: guestForm.name,
      email: guestForm.email,
      date_of_birth: guestForm.dob,
    }).select('id, event_id, name, email, status').single()
    if (error) { toast('Failed to add guest — please try again.'); return }

    setEventGuests(prev => ({ ...prev, [event.id]: guestData }))

    const profileRes = await supabase.from('profiles').select('name').eq('id', member.id).single()
    try {
      const emailRes = await fetch('/api/notify-guest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestId: guestData.id,
          guestName: guestForm.name,
          guestEmail: guestForm.email,
          memberName: profileRes?.data?.name || 'A member',
          eventName: event.name,
          venue: event.venue,
          date: event.date,
          time: event.time,
          dressCode: event.dressCode || event.dress_code,
        }),
      })
      if (!emailRes.ok) {
        const errBody = await emailRes.json().catch(() => ({}))
        console.error('Guest email API error:', emailRes.status, errBody)
      }
    } catch (err) {
      console.error('Guest email failed:', err)
    }

    setGuestForm({ name: '', email: '', dob: '' })
    setAddGuestModal(null)
    toast(`Guest added to ${event.name}!`)
  }

  async function handleLogout() {
    sessionStorage.removeItem('dashTab')
    await logout()
    navigate('/login')
  }

  // Discussion handlers
  async function handleCreateDiscussion() {
    if (!newDiscussion.title.trim() || !newDiscussion.body.trim() || newDiscussion.tags.length === 0) {
      toast('Please fill in the title, body, and select at least one tag.')
      return
    }
    const authorName = firstName + ' ' + (member.name?.split(' ')[1]?.charAt(0) || '') + '.'
    const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    const sortDate = new Date().toISOString().split('T')[0]

    if (supabase) {
      const { data, error } = await supabase.from('discussions').insert({
        title: newDiscussion.title.trim(),
        body: newDiscussion.body.trim(),
        author: authorName,
        author_id: member.id,
        tier: userTier,
        date: dateStr,
        sort_date: sortDate,
        tags: newDiscussion.tags,
        status: 'approved',
      }).select().single()

      if (error) {
        toast('Failed to post discussion. Please try again.')
        return
      }

      setUserDiscussions((prev) => [{ ...data, replies: [], isOwn: true }, ...prev])
    } else {
      setUserDiscussions((prev) => [{
        id: `user-${Date.now()}`,
        title: newDiscussion.title.trim(),
        body: newDiscussion.body.trim(),
        author: authorName,
        tier: userTier,
        date: dateStr,
        tags: newDiscussion.tags,
        replies: [],
        isOwn: true,
      }, ...prev])
    }
    toast('Discussion posted!')
    setShowNewDiscussion(false)
    setNewDiscussion({ title: '', body: '', tags: [] })
  }

  async function handleDeleteDiscussion(discId) {
    if (supabase) {
      await supabase.from('discussions').delete().eq('id', discId)
    }
    setUserDiscussions((prev) => prev.filter((d) => d.id !== discId))
    setExpandedDiscussion(null)
    setDeleteModal(null)
    toast('Discussion deleted.')
  }

  async function handlePostReply(disc) {
    if (!replyText.trim()) return
    const authorName = firstName + ' ' + (member.name?.split(' ')[1]?.charAt(0) || '') + '.'
    const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

    if (supabase) {
      const { data, error } = await supabase.from('discussion_replies').insert({
        discussion_id: disc.id,
        author: authorName,
        author_id: member.id,
        tier: userTier,
        body: replyText.trim(),
        date: dateStr,
      }).select().single()

      if (error) {
        toast('Failed to post reply. Please try again.')
        return
      }

      const addReply = (list) => list.map(d =>
        d.id === disc.id ? { ...d, replies: [...d.replies, data] } : d
      )
      if (disc.isOwn) {
        setUserDiscussions(addReply)
      }
    }

    toast('Reply posted!')
    setReplyingTo(null)
    setReplyText('')
  }

  if (loading || !member) return (
    <section className={s.page}>
      <div className={s.loadingState}>
        <div className={s.spinner} />
        <p className={s.loadingText}>Loading your dashboard...</p>
      </div>
    </section>
  )

  const firstName = profile.name || member.name || 'Member'
  const userTier = member.tier || 'MEMBER'
  const tierData = tiersList.find((t) => t.name === userTier) || tiersList[0]
  const tierColor = TIER_COLORS[userTier] || TIER_COLORS.MEMBER
  const now = new Date()
  const upcomingEvents = events.filter((e) => new Date(e.datetime || e.date) >= now)
  const pastEvents = events.filter((e) => new Date(e.datetime || e.date) < now)
  const rsvpEvents = events.filter((e) => rsvps.includes(e.id))
  const attendedEvents = pastEvents.filter((e) => rsvps.includes(e.id))
  const nextEvent = upcomingEvents[0] || events[0]
  const sortedNews = clubNews
  const unreadNews = clubNews.filter((n) => !readNotifications.includes(n.id)).length
  const unreadUserNotifs = userNotifications.filter((n) => !n.read && !readNotifications.includes(n.id)).length
  const actualUnread = unreadNews + unreadUserNotifs

  return (
    <section className={s.page}>
      <div className={s.layout}>
        {/* ── Sidebar ── */}
        <aside className={s.sidebar}>
          <div className={s.sidebarHeader}>
            {member.avatar && (
              <img src={member.avatar} alt="" className={s.avatar} referrerPolicy="no-referrer" />
            )}
            {!member.avatar && (
              <div className={s.avatarFallback}>
                {firstName.charAt(0).toUpperCase()}
              </div>
            )}
            <div style={{ minWidth: 0 }}>
              <p className={s.sidebarName}>{firstName}</p>
              <span className={s.sidebarTier} style={{ color: tierColor.text }}>{userTier}</span>
            </div>
          </div>

          <nav className={s.sidebarNav}>
            {TABS.filter(tab => !tab.memberOnly || roleMeetsMinimum(member.role, 'member')).map((tab) => (
              <button
                key={tab.id}
                className={`${s.navItem} ${activeTab === tab.id ? s.navItemActive : ''}`}
                onClick={() => switchTab(tab.id)}
              >
                <TabIcon icon={tab.icon} />
                <span>{tab.label}</span>
                {tab.id === 'notifications' && actualUnread > 0 && (
                  <span className={s.notifBadge}>{actualUnread}</span>
                )}
              </button>
            ))}
          </nav>

          <button className={s.logoutBtn} onClick={handleLogout}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            LOG OUT
          </button>
        </aside>

        {/* ── Mobile Header ── */}
        <div className={s.mobileHeader}>
          <span onClick={handleLogoClick} style={{ cursor: 'pointer', fontFamily: "'ABC Marist', Georgia, serif", fontSize: 16, letterSpacing: '0.04em', color: '#1a1a1a' }}>Boston Watch Club</span>
          <button
            className={`${s.hamburger} ${mobileMenuOpen ? s.hamburgerActive : ''}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menu"
          >
            <span /><span /><span />
          </button>
        </div>

        {/* ── Mobile Drawer ── */}
        {mobileMenuOpen && (
          <div className={s.mobileDrawerOverlay} onClick={() => setMobileMenuOpen(false)}>
            <div className={s.mobileDrawer} onClick={(e) => e.stopPropagation()}>
              <div className={s.mobileDrawerHeader}>
                {member.avatar ? (
                  <img src={member.avatar} alt="" className={s.avatar} referrerPolicy="no-referrer" />
                ) : (
                  <div className={s.avatarFallback}>{firstName.charAt(0).toUpperCase()}</div>
                )}
                <div style={{ minWidth: 0 }}>
                  <p className={s.sidebarName}>{firstName}</p>
                  <span className={s.sidebarTier} style={{ color: tierColor.text }}>{userTier}</span>
                </div>
              </div>
              <nav className={s.mobileDrawerNav}>
                {TABS.filter(tab => !tab.memberOnly || roleMeetsMinimum(member.role, 'member')).map((tab) => (
                  <button
                    key={tab.id}
                    className={`${s.navItem} ${activeTab === tab.id ? s.navItemActive : ''}`}
                    onClick={() => { switchTab(tab.id); setMobileMenuOpen(false) }}
                  >
                    <TabIcon icon={tab.icon} />
                    <span>{tab.label}</span>
                    {tab.id === 'notifications' && actualUnread > 0 && (
                      <span className={s.notifBadge}>{actualUnread}</span>
                    )}
                  </button>
                ))}
              </nav>
              <button className={s.logoutBtn} onClick={() => { setMobileMenuOpen(false); handleLogout() }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                LOG OUT
              </button>
            </div>
          </div>
        )}

        {/* ── Main Content ── */}
        <main className={s.main} ref={mainRef}>

          {activeTab === 'overview' && (
            <OverviewTab
              member={member}
              firstName={firstName}
              userTier={userTier}
              tierColor={tierColor}
              events={events}
              upcomingEvents={upcomingEvents}
              attendedEvents={attendedEvents}
              nextEvent={nextEvent}
              rsvps={rsvps}
              sortedNews={sortedNews}
              directoryMembers={directoryMembers}
              selectedUpdate={selectedUpdate}
              setSelectedUpdate={setSelectedUpdate}
              setActiveTab={setActiveTab}
              setSelectedEvent={setSelectedEvent}
              setShowAllTiers={setShowAllTiers}
              membershipRef={membershipRef}
              handleRsvpClick={handleRsvpClick}
            />
          )}

          {activeTab === 'events' && (
            <EventsTab
              member={member}
              userTier={userTier}
              events={upcomingEvents}
              pastEvents={pastEvents}
              rsvps={rsvps}
              rsvpEvents={rsvpEvents}
              eventFilter={eventFilter}
              setEventFilter={setEventFilter}
              selectedEvent={selectedEvent}
              setSelectedEvent={setSelectedEvent}
              handleRsvpClick={handleRsvpClick}
              rsvpModal={rsvpModal}
              setRsvpModal={setRsvpModal}
              cancelModal={cancelModal}
              setCancelModal={setCancelModal}
              confirmRsvp={confirmRsvp}
              confirmCancel={confirmCancel}
              eventGuests={eventGuests}
              addGuestModal={addGuestModal}
              setAddGuestModal={setAddGuestModal}
              guestForm={guestForm}
              setGuestForm={setGuestForm}
              addGuestToEvent={addGuestToEvent}
              guestWarning={guestWarning}
              setGuestWarning={setGuestWarning}
            />
          )}

          {activeTab === 'blogs' && (
            <JournalTab
              blogPosts={blogPosts}
              selectedPost={selectedPost}
              setSelectedPost={setSelectedPost}
            />
          )}

          {activeTab === 'discussions' && (
            <DiscussionsTab
              member={member}
              discussions={discussions}
              userDiscussions={userDiscussions}
              expandedDiscussion={expandedDiscussion}
              setExpandedDiscussion={setExpandedDiscussion}
              newDiscussion={newDiscussion}
              setNewDiscussion={setNewDiscussion}
              showNewDiscussion={showNewDiscussion}
              setShowNewDiscussion={setShowNewDiscussion}
              discSearch={discSearch}
              setDiscSearch={setDiscSearch}
              discSort={discSort}
              setDiscSort={setDiscSort}
              deleteModal={deleteModal}
              setDeleteModal={setDeleteModal}
              likes={likes}
              setLikes={setLikes}
              replyingTo={replyingTo}
              setReplyingTo={setReplyingTo}
              replyText={replyText}
              setReplyText={setReplyText}
              handleCreateDiscussion={handleCreateDiscussion}
              handleDeleteDiscussion={handleDeleteDiscussion}
              handlePostReply={handlePostReply}
            />
          )}

          {activeTab === 'members' && (
            <MembersTab
              member={member}
              directoryMembers={directoryMembers}
              selectedMember={selectedMember}
              setSelectedMember={setSelectedMember}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'notifications' && (
            <NotificationsTab
              actualUnread={actualUnread}
              sortedNews={sortedNews}
              userNotifications={userNotifications}
              readNotifications={readNotifications}
              setReadNotifications={setReadNotifications}
              setSelectedUpdate={setSelectedUpdate}
            />
          )}

          {activeTab === 'profile' && (
            <ProfileTab
              member={member}
              firstName={firstName}
              userTier={userTier}
              tierColor={tierColor}
              tierData={tierData}
              tiersList={tiersList}
              profile={profile}
              setProfile={setProfile}
              avatarInputRef={avatarInputRef}
              handleAvatarUpload={handleAvatarUpload}
              showAllTiers={showAllTiers}
              setShowAllTiers={setShowAllTiers}
              membershipRef={membershipRef}
              handleTierUpgrade={handleTierUpgrade}
              onDeleteAccount={async () => {
                sessionStorage.removeItem('dashTab')
                await logout()
                navigate('/login')
              }}
            />
          )}
        </main>
      </div>

      {/* ════════════════ RSVP CONFIRMATION MODAL ════════════════ */}
      {rsvpModal && (() => {
        const closed = isWithin24Hours(rsvpModal)
        return (
          <div className={s.modalOverlay} onClick={() => setRsvpModal(null)}>
            <div className={s.modalContent} onClick={(e) => e.stopPropagation()}>
              <h2 className={s.modalTitle}>{rsvpModal.name}</h2>
              <span className={s.modalDate}>{rsvpModal.date} &middot; {rsvpModal.time}</span>
              <div className={s.modalBody}>
                {closed ? (
                  <p>RSVPs for this event are closed. If you'd like to attend, please reach out to us directly.</p>
                ) : (
                  <p>{getRsvpMessage(rsvpModal)}</p>
                )}
              </div>
              {!closed && rsvpModal.cancellation_fee && (
                <p className={s.cancelFeeNote}>
                  Cancellations within 24 hours of the event are subject to a ${rsvpModal.cancellation_fee} fee.
                </p>
              )}
              <div className={s.modalActions}>
                {closed ? (
                  <a href="mailto:boswatchclub@gmail.com?subject=RSVP Request — ${encodeURIComponent(rsvpModal.name)}" className={s.actionBtn} style={{ textAlign: 'center', textDecoration: 'none' }}>
                    Email Us
                  </a>
                ) : (
                  <button className={s.actionBtn} onClick={() => confirmRsvp(rsvpModal)}>
                    {getRsvpButtonLabel(rsvpModal)}
                  </button>
                )}
                <button className={s.modalDismiss} onClick={() => setRsvpModal(null)}>{closed ? 'Close' : 'Cancel'}</button>
              </div>
            </div>
          </div>
        )
      })()}

      {/* ════════════════ CANCELLATION MODAL ════════════════ */}
      {cancelModal && (() => {
        const within24h = isWithin24Hours(cancelModal)
        const hasFee = cancelModal.cancellation_fee != null
        const isUpfront = cancelModal.payment_type === 'upfront'
        let message = 'Are you sure you want to cancel your RSVP?'
        let btnLabel = 'Cancel RSVP'

        if (isUpfront) {
          if (within24h && hasFee) {
            message = `Your $${cancelModal.price} payment will be refunded minus the $${cancelModal.cancellation_fee} cancellation fee.`
            btnLabel = `Cancel RSVP — $${cancelModal.cancellation_fee} fee applies`
          } else {
            message = `Your $${cancelModal.price} payment will be fully refunded.`
          }
        } else if (within24h && hasFee) {
          message = `Cancellations within 24 hours of the event are subject to a $${cancelModal.cancellation_fee} fee. Are you sure?`
          btnLabel = `Cancel RSVP — $${cancelModal.cancellation_fee} fee applies`
        }

        return (
          <div className={s.modalOverlay} onClick={() => setCancelModal(null)}>
            <div className={s.modalContent} onClick={(e) => e.stopPropagation()}>
              <h2 className={s.modalTitle}>{cancelModal.name}</h2>
              <div className={s.modalBody}>
                <p>{message}</p>
              </div>
              <div className={s.modalActions}>
                <button className={s.cancelRsvpBtn} onClick={() => confirmCancel(cancelModal)}>
                  {btnLabel}
                </button>
                <button className={s.modalDismiss} onClick={() => setCancelModal(null)}>Keep RSVP</button>
              </div>
            </div>
          </div>
        )
      })()}

      {/* ════════════════ ADD GUEST LATER MODAL ════════════════ */}
      {addGuestModal && (
        <div className={s.modalOverlay} onClick={() => { setAddGuestModal(null); setGuestForm({ name: '', email: '', dob: '' }); setGuestErrors({}) }}>
          <div className={s.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 className={s.modalTitle}>{addGuestModal.name}</h2>
            <span className={s.modalDate}>{addGuestModal.date} &middot; {addGuestModal.time}</span>
            <div style={{ borderTop: '1px solid rgba(26,26,26,0.1)', paddingTop: 16, marginTop: 12 }}>
              <p style={{ fontSize: 12, fontWeight: 500, letterSpacing: '0.1em', color: 'rgba(26,26,26,0.7)', marginBottom: 12 }}>ADD YOUR +1 GUEST</p>
              <input
                style={{ width: '100%', marginBottom: guestErrors.name ? 2 : 8, padding: '10px 12px', background: 'rgba(26,26,26,0.06)', border: `1px solid ${guestErrors.name ? '#b3261e' : 'rgba(26,26,26,0.12)'}`, borderRadius: 8, color: '#1a1a1a', fontSize: 13 }}
                placeholder="Guest name"
                value={guestForm.name}
                onChange={e => { setGuestForm(p => ({ ...p, name: e.target.value })); setGuestErrors(p => ({ ...p, name: null })) }}
              />
              {guestErrors.name && <p style={{ fontSize: 11, color: '#b3261e', fontWeight: 600, margin: '2px 0 6px' }}>{guestErrors.name}</p>}
              <input
                style={{ width: '100%', marginBottom: guestErrors.email ? 2 : 8, padding: '10px 12px', background: 'rgba(26,26,26,0.06)', border: `1px solid ${guestErrors.email ? '#b3261e' : 'rgba(26,26,26,0.12)'}`, borderRadius: 8, color: '#1a1a1a', fontSize: 13 }}
                placeholder="Guest email"
                type="email"
                value={guestForm.email}
                onChange={e => { setGuestForm(p => ({ ...p, email: e.target.value })); setGuestErrors(p => ({ ...p, email: null })) }}
              />
              {guestErrors.email && <p style={{ fontSize: 11, color: '#b3261e', fontWeight: 600, margin: '2px 0 6px' }}>{guestErrors.email}</p>}
              <input
                style={{ width: '100%', marginBottom: guestErrors.dob ? 2 : 4, padding: '10px 12px', background: 'rgba(26,26,26,0.06)', border: `1px solid ${guestErrors.dob ? '#b3261e' : 'rgba(26,26,26,0.12)'}`, borderRadius: 8, color: '#1a1a1a', fontSize: 13 }}
                placeholder="MM/DD/YYYY"
                type="text"
                maxLength={10}
                value={guestForm.dob}
                onChange={e => { handleDobChange(e); setGuestErrors(p => ({ ...p, dob: null })) }}
              />
              {guestErrors.dob && <p style={{ fontSize: 11, color: '#b3261e', fontWeight: 600, margin: '2px 0 4px' }}>{guestErrors.dob}</p>}
              <p style={{ fontSize: 11, color: 'rgba(26,26,26,0.4)', marginTop: 4 }}>Guest must be submitted at least 24 hours before the event.</p>
            </div>
            <div className={s.modalActions}>
              <button className={s.actionBtn} onClick={() => addGuestToEvent(addGuestModal)}>SUBMIT GUEST</button>
              <button className={s.modalDismiss} onClick={() => { setAddGuestModal(null); setGuestForm({ name: '', email: '', dob: '' }); setGuestErrors({}) }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════ 24H GUEST WARNING MODAL ════════════════ */}
      {guestWarning && (
        <div className={s.modalOverlay} onClick={() => setGuestWarning(false)}>
          <div className={s.modalContent} onClick={e => e.stopPropagation()}>
            <h2 className={s.modalTitle}>Too Late to Add a Guest</h2>
            <div className={s.modalBody}>
              <p>Guest details must be submitted at least 24 hours before the event. To request an exception, please email us at <a href="mailto:boswatchclub@gmail.com" style={{ color: '#1a1a1a', textDecoration: 'underline' }}>boswatchclub@gmail.com</a>.</p>
            </div>
            <div className={s.modalActions}>
              <button className={s.actionBtn} onClick={() => setGuestWarning(false)}>GOT IT</button>
            </div>
          </div>
        </div>
      )}

      {/* Update Detail Modal (for notifications) */}
      {selectedUpdate && activeTab === 'notifications' && (
        <div className={s.modalOverlay} onClick={() => setSelectedUpdate(null)}>
          <div className={s.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={s.modalHeader}>
              <h2 className={s.modalTitle}>{selectedUpdate.title}</h2>
              <button className={s.modalClose} onClick={() => setSelectedUpdate(null)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <span className={s.modalDate}>{selectedUpdate.date}</span>
            <div className={s.modalBody}>
              <p>{selectedUpdate.body}</p>
            </div>
          </div>
        </div>
      )}

      {welcomePopup && (
        <UpgradePopup tier={welcomePopup} onClose={() => setWelcomePopup(null)} />
      )}
    </section>
  )
}
