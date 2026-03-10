import { useState, useEffect, useCallback } from 'react'
import { useNavigate, Link } from 'react-router'
import { supabase } from '../lib/supabase'
import useAuth from '../hooks/useAuth'
import events from '../data/events'
import tiers from '../data/tiers'
import blogPosts from '../data/blogPosts'
import { CLUB_NEWS } from '../data/mockNews'
import { DIRECTORY_MEMBERS } from '../data/mockMembers'
import discussions from '../data/mockDiscussions'
import FadeIn from '../components/shared/FadeIn'
import BlurImage from '../components/shared/BlurImage'
import AddToCalendar from '../components/shared/AddToCalendar'
import { toast } from '../components/shared/Toast'
import s from './DashboardPage.module.css'

const TIER_COLORS = {
  ENTHUSIAST: { bg: 'rgba(160, 170, 180, 0.1)', border: 'rgba(160, 170, 180, 0.25)', text: '#A0AAB4' },
  COLLECTOR: { bg: 'rgba(212, 175, 55, 0.08)', border: 'rgba(212, 175, 55, 0.25)', text: '#D4AF37' },
  "WOMEN\u2019S CIRCLE": { bg: 'rgba(212, 175, 55, 0.08)', border: 'rgba(212, 175, 55, 0.25)', text: '#D4AF37' },
  PATRON: { bg: 'rgba(212, 175, 55, 0.12)', border: 'rgba(212, 175, 55, 0.35)', text: '#D4AF37' },
}

const TABS = [
  { id: 'overview', label: 'Overview', icon: 'grid' },
  { id: 'events', label: 'Events', icon: 'calendar' },
  { id: 'blogs', label: 'Journal', icon: 'book' },
  { id: 'discussions', label: 'Discussions', icon: 'chat' },
  { id: 'members', label: 'Members', icon: 'people' },
  { id: 'membership', label: 'Membership', icon: 'star' },
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
    default: return null
  }
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const { member, loading, logout } = useAuth()
  const [rsvps, setRsvps] = useState([])
  const [activeTab, setActiveTab] = useState('overview')
  const [eventFilter, setEventFilter] = useState('upcoming')
  const [expandedDiscussion, setExpandedDiscussion] = useState(null)
  const [newDiscussion, setNewDiscussion] = useState({ title: '', body: '', tags: '' })
  const [showNewDiscussion, setShowNewDiscussion] = useState(false)
  const [selectedMember, setSelectedMember] = useState(null)
  const [selectedEvent, setSelectedEvent] = useState(null)

  const fetchRsvps = useCallback(async () => {
    if (!supabase || !member) return
    const { data } = await supabase
      .from('rsvps')
      .select('event_id')
      .eq('user_id', member.id)
    if (data) setRsvps(data.map((r) => r.event_id))
  }, [member])

  useEffect(() => {
    if (!loading && !member) {
      navigate('/login')
      return
    }
    fetchRsvps()
  }, [member, loading, navigate, fetchRsvps])

  async function toggleRsvp(eventId) {
    if (!member) return
    const isRsvpd = rsvps.includes(eventId)
    const eventName = events.find((e) => e.id === eventId)?.name || 'Event'

    if (supabase) {
      if (isRsvpd) {
        await supabase.from('rsvps').delete().eq('user_id', member.id).eq('event_id', eventId)
      } else {
        await supabase.from('rsvps').insert({ user_id: member.id, event_id: eventId })
      }
    }

    if (isRsvpd) {
      setRsvps((prev) => prev.filter((id) => id !== eventId))
      toast(`RSVP cancelled for ${eventName}`)
    } else {
      setRsvps((prev) => [...prev, eventId])
      toast(`You're going to ${eventName}!`)
    }
  }

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  if (loading || !member) return (
    <section className={s.page}>
      <div className={s.loadingState}>
        <div className={s.spinner} />
        <p className={s.loadingText}>Loading your dashboard...</p>
      </div>
    </section>
  )

  const firstName = member.name?.split(' ')[0] || 'Member'
  const userTier = member.tier || 'ENTHUSIAST'
  const tierData = tiers.find((t) => t.name === userTier) || tiers[0]
  const tierColor = TIER_COLORS[userTier] || TIER_COLORS.ENTHUSIAST
  const rsvpEvents = events.filter((e) => rsvps.includes(e.id))
  const now = new Date()
  const upcomingEvents = events.filter((e) => new Date(e.date) >= now)
  const nextEvent = upcomingEvents[0] || events[0]

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
            <div>
              <p className={s.sidebarName}>{firstName}</p>
              <span className={s.sidebarTier} style={{ color: tierColor.text }}>{userTier}</span>
            </div>
          </div>

          <nav className={s.sidebarNav}>
            {TABS.map((tab) => (
              <button
                key={tab.id}
                className={`${s.navItem} ${activeTab === tab.id ? s.navItemActive : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <TabIcon icon={tab.icon} />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>

          <button className={s.logoutBtn} onClick={handleLogout}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            LOG OUT
          </button>
        </aside>

        {/* ── Main Content ── */}
        <main className={s.main}>
          {/* ── Mobile Tab Bar ── */}
          <div className={s.mobileTabBar}>
            {TABS.map((tab) => (
              <button
                key={tab.id}
                className={`${s.mobileTab} ${activeTab === tab.id ? s.mobileTabActive : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <TabIcon icon={tab.icon} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* ════════════════ OVERVIEW TAB ════════════════ */}
          {activeTab === 'overview' && (
            <div className={s.tabContent}>
              <FadeIn>
                <div className={s.pageHeader}>
                  <h1 className={s.pageTitle}>Welcome back, {firstName}</h1>
                  <p className={s.pageSubtitle}>Here&apos;s what&apos;s happening at Boston Watch Club</p>
                </div>
              </FadeIn>

              {/* KPIs */}
              <FadeIn delay="0.05s">
                <div className={s.kpiRow}>
                  <div className={s.kpiCard}>
                    <span className={s.kpiValue}>{rsvps.length}</span>
                    <span className={s.kpiLabel}>Events RSVP&apos;d</span>
                  </div>
                  <div className={s.kpiCard}>
                    <span className={s.kpiValue}>{events.length}</span>
                    <span className={s.kpiLabel}>Total Events</span>
                  </div>
                  <div className={s.kpiCard}>
                    <span className={s.kpiValue}>{DIRECTORY_MEMBERS.length}</span>
                    <span className={s.kpiLabel}>Members</span>
                  </div>
                  <div className={s.kpiCard}>
                    <span className={s.kpiValue} style={{ color: '#34A853', fontSize: '20px' }}>Active</span>
                    <span className={s.kpiLabel}>Status</span>
                  </div>
                </div>
              </FadeIn>

              {/* Updates / Notifications */}
              <FadeIn delay="0.1s">
                <div className={s.sectionCard}>
                  <h2 className={s.sectionTitle}>LATEST UPDATES</h2>
                  <div className={s.updatesList}>
                    {CLUB_NEWS.map((item) => (
                      <div key={item.id} className={s.updateItem}>
                        <div className={s.updateDot} />
                        <div>
                          <p className={s.updateTitle}>{item.title}</p>
                          <p className={s.updatePreview}>{item.preview}</p>
                          <span className={s.updateDate}>{item.date}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </FadeIn>

              {/* Next Event Highlight */}
              {nextEvent && (
                <FadeIn delay="0.15s">
                  <div className={s.nextEvent}>
                    <div className={s.nextEventImage}>
                      <BlurImage src={`${import.meta.env.BASE_URL}assets/${nextEvent.image}`} alt={nextEvent.name} />
                      <div className={s.nextEventOverlay} />
                      <div className={s.nextEventContent}>
                        <span className={s.nextEventLabel}>NEXT EVENT</span>
                        <h3 className={s.nextEventName}>{nextEvent.name}</h3>
                        <p className={s.nextEventDetails}>{nextEvent.date} &middot; {nextEvent.time}</p>
                        <p className={s.nextEventVenue}>{nextEvent.venue}</p>
                        <div className={s.nextEventActions}>
                          <button
                            className={`${s.actionBtn} ${rsvps.includes(nextEvent.id) ? s.actionBtnActive : ''}`}
                            onClick={() => toggleRsvp(nextEvent.id)}
                          >
                            {rsvps.includes(nextEvent.id) ? 'GOING' : 'RSVP NOW'}
                          </button>
                          {rsvps.includes(nextEvent.id) && <AddToCalendar event={nextEvent} />}
                        </div>
                      </div>
                    </div>
                  </div>
                </FadeIn>
              )}

              {/* Upcoming Events Preview */}
              <FadeIn delay="0.2s">
                <div className={s.sectionCard}>
                  <div className={s.sectionHeader}>
                    <h2 className={s.sectionTitle}>UPCOMING EVENTS</h2>
                    <button className={s.seeAllBtn} onClick={() => setActiveTab('events')}>
                      See all &rarr;
                    </button>
                  </div>
                  <div className={s.upcomingList}>
                    {upcomingEvents.slice(0, 3).map((event) => (
                      <div
                        key={event.id}
                        className={s.upcomingItem}
                        onClick={() => { setActiveTab('events'); setSelectedEvent(event.id) }}
                      >
                        <div className={s.upcomingDate}>
                          <span className={s.upcomingMonth}>{event.month}</span>
                          <span className={s.upcomingDay}>{event.day}</span>
                        </div>
                        <div className={s.upcomingInfo}>
                          <p className={s.upcomingName}>{event.name}</p>
                          <p className={s.upcomingMeta}>{event.time} &middot; {event.venue}</p>
                        </div>
                        <button
                          className={`${s.rsvpSmall} ${rsvps.includes(event.id) ? s.rsvpSmallActive : ''}`}
                          onClick={(e) => { e.stopPropagation(); toggleRsvp(event.id) }}
                        >
                          {rsvps.includes(event.id) ? 'GOING' : 'RSVP'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </FadeIn>
            </div>
          )}

          {/* ════════════════ EVENTS TAB ════════════════ */}
          {activeTab === 'events' && (
            <div className={s.tabContent}>
              <FadeIn>
                <div className={s.pageHeader}>
                  <h1 className={s.pageTitle}>Events</h1>
                  <p className={s.pageSubtitle}>Browse and RSVP to upcoming gatherings</p>
                </div>
              </FadeIn>

              <FadeIn delay="0.05s">
                <div className={s.filterRow}>
                  <button
                    className={`${s.filterBtn} ${eventFilter === 'upcoming' ? s.filterBtnActive : ''}`}
                    onClick={() => setEventFilter('upcoming')}
                  >ALL EVENTS</button>
                  <button
                    className={`${s.filterBtn} ${eventFilter === 'rsvps' ? s.filterBtnActive : ''}`}
                    onClick={() => setEventFilter('rsvps')}
                  >MY RSVPs{rsvps.length > 0 && ` (${rsvps.length})`}</button>
                </div>
              </FadeIn>

              {/* Event Detail Modal */}
              {selectedEvent && (() => {
                const event = events.find((e) => e.id === selectedEvent)
                if (!event) return null
                const isRsvpd = rsvps.includes(event.id)
                return (
                  <FadeIn>
                    <div className={s.eventDetail}>
                      <button className={s.backBtn} onClick={() => setSelectedEvent(null)}>&larr; Back to events</button>
                      <div className={s.eventDetailImage}>
                        <BlurImage src={`${import.meta.env.BASE_URL}assets/${event.image}`} alt={event.name} />
                      </div>
                      <div className={s.eventDetailBody}>
                        <h2 className={s.eventDetailName}>{event.name}</h2>
                        <p className={s.eventDetailTagline}>{event.tagline}</p>
                        <div className={s.eventDetailMeta}>
                          <div className={s.metaItem}>
                            <span className={s.metaLabel}>DATE</span>
                            <span className={s.metaValue}>{event.date}</span>
                          </div>
                          <div className={s.metaItem}>
                            <span className={s.metaLabel}>TIME</span>
                            <span className={s.metaValue}>{event.time}</span>
                          </div>
                          <div className={s.metaItem}>
                            <span className={s.metaLabel}>VENUE</span>
                            <span className={s.metaValue}>{event.venue}</span>
                          </div>
                          <div className={s.metaItem}>
                            <span className={s.metaLabel}>DRESS CODE</span>
                            <span className={s.metaValue}>{event.dressCode}</span>
                          </div>
                          <div className={s.metaItem}>
                            <span className={s.metaLabel}>CAPACITY</span>
                            <span className={s.metaValue}>{event.capacity}</span>
                          </div>
                          <div className={s.metaItem}>
                            <span className={s.metaLabel}>ACCESS</span>
                            <span className={s.metaValue}>{event.access}</span>
                          </div>
                        </div>
                        <p className={s.eventDetailDesc}>{event.longDescription || event.description}</p>
                        <div className={s.eventDetailActions}>
                          <button
                            className={`${s.actionBtn} ${isRsvpd ? s.actionBtnActive : ''}`}
                            onClick={() => toggleRsvp(event.id)}
                          >
                            {isRsvpd ? 'GOING' : 'RSVP NOW'}
                          </button>
                          {isRsvpd && <AddToCalendar event={event} />}
                        </div>
                      </div>
                    </div>
                  </FadeIn>
                )
              })()}

              {/* Events Grid */}
              {!selectedEvent && (
                <div className={s.eventsGrid}>
                  {(eventFilter === 'upcoming' ? events : rsvpEvents).map((event, i) => {
                    const isRsvpd = rsvps.includes(event.id)
                    return (
                      <FadeIn key={event.id} delay={`${0.05 * i}s`}>
                        <div className={s.eventCard} onClick={() => setSelectedEvent(event.id)}>
                          <div className={s.eventImage}>
                            <BlurImage src={`${import.meta.env.BASE_URL}assets/${event.image}`} alt={event.name} />
                            <div className={s.eventDate}>
                              <span className={s.eventMonth}>{event.month}</span>
                              <span className={s.eventDay}>{event.day}</span>
                            </div>
                          </div>
                          <div className={s.eventBody}>
                            <h3 className={s.eventName}>{event.name}</h3>
                            <div className={s.eventMeta}>
                              <span>{event.date}</span>
                              <span className={s.dot} />
                              <span>{event.time}</span>
                            </div>
                            <p className={s.eventLocation}>{event.venue}</p>
                            <div className={s.eventFooter}>
                              <div className={s.eventTags}>
                                <span className={s.tag}>{event.access}</span>
                              </div>
                              <button
                                className={`${s.rsvpSmall} ${isRsvpd ? s.rsvpSmallActive : ''}`}
                                onClick={(e) => { e.stopPropagation(); toggleRsvp(event.id) }}
                              >
                                {isRsvpd ? 'GOING' : 'RSVP'}
                              </button>
                            </div>
                          </div>
                        </div>
                      </FadeIn>
                    )
                  })}
                  {eventFilter === 'rsvps' && rsvpEvents.length === 0 && (
                    <FadeIn>
                      <div className={s.empty}>
                        <p className={s.emptyTitle}>No RSVPs yet</p>
                        <p className={s.emptyText}>
                          Browse upcoming events and RSVP to the ones you&apos;d like to attend.
                        </p>
                        <button className={s.actionBtn} onClick={() => setEventFilter('upcoming')}>
                          VIEW EVENTS
                        </button>
                      </div>
                    </FadeIn>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ════════════════ BLOGS TAB ════════════════ */}
          {activeTab === 'blogs' && (
            <div className={s.tabContent}>
              <FadeIn>
                <div className={s.pageHeader}>
                  <h1 className={s.pageTitle}>The Journal</h1>
                  <p className={s.pageSubtitle}>Event recaps, collector stories, and watch culture</p>
                </div>
              </FadeIn>

              <div className={s.blogGrid}>
                {blogPosts.map((post, i) => (
                  <FadeIn key={post.id} delay={`${0.05 * i}s`}>
                    <a href={post.substackUrl} target="_blank" rel="noopener noreferrer" className={s.blogCard}>
                      <div className={s.blogImage}>
                        <BlurImage src={`${import.meta.env.BASE_URL}assets/${post.image}`} alt={post.title} />
                      </div>
                      <div className={s.blogBody}>
                        <span className={s.blogDate}>{post.date}</span>
                        <h3 className={s.blogTitle}>{post.title}</h3>
                        <p className={s.blogExcerpt}>{post.excerpt}</p>
                        <span className={s.blogLink}>READ ON SUBSTACK &rarr;</span>
                      </div>
                    </a>
                  </FadeIn>
                ))}
              </div>
            </div>
          )}

          {/* ════════════════ DISCUSSIONS TAB ════════════════ */}
          {activeTab === 'discussions' && (
            <div className={s.tabContent}>
              <FadeIn>
                <div className={s.pageHeader}>
                  <div className={s.pageHeaderRow}>
                    <div>
                      <h1 className={s.pageTitle}>Discussions</h1>
                      <p className={s.pageSubtitle}>Ask questions, share knowledge, connect with members</p>
                    </div>
                    <button className={s.actionBtn} onClick={() => setShowNewDiscussion(!showNewDiscussion)}>
                      {showNewDiscussion ? 'CANCEL' : 'NEW TOPIC'}
                    </button>
                  </div>
                </div>
              </FadeIn>

              {/* New Discussion Form */}
              {showNewDiscussion && (
                <FadeIn>
                  <div className={s.newDiscussionForm}>
                    <input
                      type="text"
                      className={s.discInput}
                      placeholder="Discussion title..."
                      value={newDiscussion.title}
                      onChange={(e) => setNewDiscussion((p) => ({ ...p, title: e.target.value }))}
                    />
                    <textarea
                      className={s.discTextarea}
                      placeholder="What's on your mind?"
                      rows={4}
                      value={newDiscussion.body}
                      onChange={(e) => setNewDiscussion((p) => ({ ...p, body: e.target.value }))}
                    />
                    <input
                      type="text"
                      className={s.discInput}
                      placeholder="Tags (comma-separated)"
                      value={newDiscussion.tags}
                      onChange={(e) => setNewDiscussion((p) => ({ ...p, tags: e.target.value }))}
                    />
                    <button
                      className={s.actionBtn}
                      onClick={() => {
                        toast('Discussion posted! (Demo mode)')
                        setShowNewDiscussion(false)
                        setNewDiscussion({ title: '', body: '', tags: '' })
                      }}
                    >
                      POST DISCUSSION
                    </button>
                  </div>
                </FadeIn>
              )}

              <div className={s.discussionsList}>
                {discussions.map((disc, i) => (
                  <FadeIn key={disc.id} delay={`${0.05 * i}s`}>
                    <div className={s.discussionCard}>
                      <div
                        className={s.discussionHeader}
                        onClick={() => setExpandedDiscussion(expandedDiscussion === disc.id ? null : disc.id)}
                      >
                        <div className={s.discussionInfo}>
                          <h3 className={s.discussionTitle}>{disc.title}</h3>
                          <div className={s.discussionMeta}>
                            <span className={s.discussionAuthor}>{disc.author}</span>
                            <span className={s.dot} />
                            <span className={s.discussionTier} style={{ color: (TIER_COLORS[disc.tier] || TIER_COLORS.ENTHUSIAST).text }}>
                              {disc.tier}
                            </span>
                            <span className={s.dot} />
                            <span>{disc.date}</span>
                          </div>
                        </div>
                        <div className={s.discussionRight}>
                          <div className={s.discussionTags}>
                            {disc.tags.map((tag) => <span key={tag} className={s.tag}>{tag}</span>)}
                          </div>
                          <span className={s.replyCount}>{disc.replies.length} {disc.replies.length === 1 ? 'reply' : 'replies'}</span>
                        </div>
                      </div>

                      {expandedDiscussion === disc.id && (
                        <div className={s.discussionBody}>
                          <p className={s.discussionText}>{disc.body}</p>
                          {disc.replies.length > 0 && (
                            <div className={s.replies}>
                              {disc.replies.map((reply, ri) => (
                                <div key={ri} className={s.reply}>
                                  <div className={s.replyHeader}>
                                    <span className={s.replyAuthor}>{reply.author}</span>
                                    <span className={s.replyTier} style={{ color: (TIER_COLORS[reply.tier] || TIER_COLORS.ENTHUSIAST).text }}>
                                      {reply.tier}
                                    </span>
                                    <span className={s.replyDate}>{reply.date}</span>
                                  </div>
                                  <p className={s.replyText}>{reply.body}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </FadeIn>
                ))}
              </div>
            </div>
          )}

          {/* ════════════════ MEMBERS TAB ════════════════ */}
          {activeTab === 'members' && (
            <div className={s.tabContent}>
              <FadeIn>
                <div className={s.pageHeader}>
                  <h1 className={s.pageTitle}>Member Directory</h1>
                  <p className={s.pageSubtitle}>{DIRECTORY_MEMBERS.length} members in the club</p>
                </div>
              </FadeIn>

              {/* Member Detail */}
              {selectedMember && (() => {
                const m = DIRECTORY_MEMBERS.find((d) => d.id === selectedMember)
                if (!m) return null
                const mColor = TIER_COLORS[m.tier] || TIER_COLORS.ENTHUSIAST
                return (
                  <FadeIn>
                    <div className={s.memberDetail}>
                      <button className={s.backBtn} onClick={() => setSelectedMember(null)}>&larr; Back to directory</button>
                      <div className={s.memberDetailCard}>
                        <div className={s.memberDetailTop}>
                          <div className={s.memberDetailAvatar}>
                            {m.name.charAt(0)}
                          </div>
                          <div>
                            <h2 className={s.memberDetailName}>{m.name}</h2>
                            <span className={s.memberDetailTier} style={{ color: mColor.text, borderColor: mColor.border, background: mColor.bg }}>
                              {m.tier}
                            </span>
                          </div>
                        </div>
                        <p className={s.memberDetailBio}>{m.bio}</p>
                        <div className={s.memberDetailGrid}>
                          <div className={s.metaItem}>
                            <span className={s.metaLabel}>COLLECTS</span>
                            <span className={s.metaValue}>{m.collects}</span>
                          </div>
                          <div className={s.metaItem}>
                            <span className={s.metaLabel}>LOCATION</span>
                            <span className={s.metaValue}>{m.location}</span>
                          </div>
                          <div className={s.metaItem}>
                            <span className={s.metaLabel}>INSTAGRAM</span>
                            <span className={s.metaValue}>{m.instagram}</span>
                          </div>
                          <div className={s.metaItem}>
                            <span className={s.metaLabel}>EMAIL</span>
                            <span className={s.metaValue}>{m.email}</span>
                          </div>
                          <div className={s.metaItem}>
                            <span className={s.metaLabel}>JOINED</span>
                            <span className={s.metaValue}>{m.joined}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </FadeIn>
                )
              })()}

              {/* Members Grid */}
              {!selectedMember && (
                <div className={s.membersGrid}>
                  {DIRECTORY_MEMBERS.map((m, i) => {
                    const mColor = TIER_COLORS[m.tier] || TIER_COLORS.ENTHUSIAST
                    return (
                      <FadeIn key={m.id} delay={`${0.05 * i}s`}>
                        <div className={s.memberCard} onClick={() => setSelectedMember(m.id)}>
                          <div className={s.memberCardAvatar}>
                            {m.name.charAt(0)}
                          </div>
                          <h3 className={s.memberCardName}>{m.name}</h3>
                          <span className={s.memberCardTier} style={{ color: mColor.text }}>
                            {m.tier}
                          </span>
                          <p className={s.memberCardCollects}>{m.collects}</p>
                          <p className={s.memberCardLocation}>{m.location}</p>
                        </div>
                      </FadeIn>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* ════════════════ MEMBERSHIP TAB ════════════════ */}
          {activeTab === 'membership' && (
            <div className={s.tabContent}>
              <FadeIn>
                <div className={s.pageHeader}>
                  <h1 className={s.pageTitle}>Your Membership</h1>
                  <p className={s.pageSubtitle}>Manage your tier and explore upgrade options</p>
                </div>
              </FadeIn>

              {/* Current membership card */}
              <FadeIn delay="0.05s">
                <div
                  className={s.currentMembershipCard}
                  style={{
                    borderColor: tierColor.border,
                    background: `linear-gradient(135deg, ${tierColor.bg}, rgba(20, 24, 32, 0.6))`,
                  }}
                >
                  <div className={s.currentMembershipHeader}>
                    <span className={s.currentMembershipLabel}>CURRENT PLAN</span>
                    <span className={s.activeBadge}>ACTIVE</span>
                  </div>
                  <h2 className={s.currentMembershipTier} style={{ color: tierColor.text }}>{userTier}</h2>
                  <p className={s.currentMembershipPrice}>{tierData.price} <span>{tierData.period}</span></p>
                  <ul className={s.benefitsList}>
                    {tierData.benefits.map((b, i) => (
                      <li key={i} className={s.benefitItem}>
                        <span className={s.benefitCheck}>&#10003;</span>
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              </FadeIn>

              {/* All tiers */}
              <FadeIn delay="0.1s">
                <h2 className={s.sectionTitle} style={{ marginTop: 32 }}>ALL TIERS</h2>
              </FadeIn>
              <div className={s.tiersGrid}>
                {tiers.map((tier, i) => {
                  const isActive = tier.name === userTier
                  const tc = TIER_COLORS[tier.name] || TIER_COLORS.ENTHUSIAST
                  return (
                    <FadeIn key={tier.name} delay={`${0.05 * (i + 2)}s`}>
                      <div
                        className={`${s.tierCard} ${isActive ? s.tierCardActive : ''}`}
                        style={isActive ? { borderColor: tc.border, background: `linear-gradient(135deg, ${tc.bg}, rgba(20, 24, 32, 0.6))` } : {}}
                      >
                        {isActive && <span className={s.activeBadgeSmall}>ACTIVE</span>}
                        <h3 className={s.tierName} style={isActive ? { color: tc.text } : {}}>{tier.name}</h3>
                        <p className={s.tierPrice}>{tier.price} <span>{tier.period}</span></p>
                        <ul className={s.tierBenefits}>
                          {tier.benefits.map((b, bi) => (
                            <li key={bi}>{b}</li>
                          ))}
                        </ul>
                        {!isActive && (
                          <Link to="/membership" className={s.actionBtn}>
                            UPGRADE
                          </Link>
                        )}
                      </div>
                    </FadeIn>
                  )
                })}
              </div>
            </div>
          )}
        </main>
      </div>
    </section>
  )
}
