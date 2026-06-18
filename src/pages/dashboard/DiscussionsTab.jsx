import { TIER_COLORS } from '../../constants/tiers'
import FadeIn from '../../components/shared/FadeIn'
import s from '../DashboardPage.module.css'

const DISCUSSION_TAGS = ['Service', 'Vintage', 'New Release', 'Discussion', 'Recommendations', 'Everyday Wear', 'Travel', 'Events', 'Buying Advice', 'Watchmaking']

export default function DiscussionsTab({
  member,
  discussions,
  userDiscussions,
  expandedDiscussion,
  setExpandedDiscussion,
  newDiscussion,
  setNewDiscussion,
  showNewDiscussion,
  setShowNewDiscussion,
  discSearch,
  setDiscSearch,
  discSort,
  setDiscSort,
  deleteModal,
  setDeleteModal,
  likes,
  setLikes,
  replyingTo,
  setReplyingTo,
  replyText,
  setReplyText,
  handleCreateDiscussion,
  handleDeleteDiscussion,
  handlePostReply,
}) {
  return (
    <div className={s.tabContent}>
      <FadeIn>
        <div className={s.pageHeader}>
          <h1 className={s.pageTitle}>Discussions</h1>
          <div className={s.pageSubtitleRow}>
            <p className={s.pageSubtitle}>Ask questions, share knowledge, connect with members</p>
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
            <div className={s.discTagPicker}>
              <span className={s.discTagLabel}>TAGS</span>
              <div className={s.discTags}>
                {DISCUSSION_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    className={`${s.discTag} ${newDiscussion.tags.includes(tag) ? s.discTagSelected : ''}`}
                    onClick={() => setNewDiscussion((p) => ({
                      ...p,
                      tags: p.tags.includes(tag)
                        ? p.tags.filter((t) => t !== tag)
                        : [...p.tags, tag],
                    }))}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
            <button
              className={`${s.actionBtn} ${(!newDiscussion.title.trim() || !newDiscussion.body.trim() || newDiscussion.tags.length === 0) ? s.actionBtnDisabled : ''}`}
              onClick={() => handleCreateDiscussion()}
            >
              POST DISCUSSION
            </button>
          </div>
        </FadeIn>
      )}

      {/* Search + Sort */}
      <div className={s.discToolbar}>
        <div className={s.discSearchWrap}>
          <svg className={s.discSearchIcon} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input
            type="text"
            className={s.discSearchInput}
            placeholder="Search discussions..."
            value={discSearch}
            onChange={(e) => setDiscSearch(e.target.value)}
          />
        </div>
        <div className={s.filterRow}>
          <button className={`${s.filterBtn} ${discSort === 'latest' ? s.filterBtnActive : ''}`} onClick={() => setDiscSort('latest')}>LATEST</button>
          <button className={`${s.filterBtn} ${discSort === 'earliest' ? s.filterBtnActive : ''}`} onClick={() => setDiscSort('earliest')}>EARLIEST</button>
        </div>
      </div>

      <div className={s.discussionsList}>
        {(() => {
          const allDiscs = [...userDiscussions, ...discussions]
          const filtered = discSearch.trim()
            ? allDiscs.filter((d) => {
                const q = discSearch.toLowerCase()
                return d.title.toLowerCase().includes(q) || d.body.toLowerCase().includes(q) || d.author.toLowerCase().includes(q) || d.tags.some((t) => t.toLowerCase().includes(q))
              })
            : allDiscs
          const sorted = discSort === 'earliest' ? [...filtered].reverse() : filtered
          return sorted.length === 0
            ? <p className={s.emptyState}>No discussions found.</p>
            : sorted.map((disc, i) => (
          <FadeIn key={disc.id} delay={`${0.05 * i}s`}>
            <div className={s.discussionCard}>
              <div
                className={s.discussionHeader}
                onClick={() => setExpandedDiscussion(expandedDiscussion === disc.id ? null : disc.id)}
              >
                <div className={s.discussionInfo}>
                  <h3 className={s.discussionTitle}>{disc.title}</h3>
                  <div className={s.discussionMeta}>
                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(184,196,212,0.15)', border: '1px solid rgba(184,196,212,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontFamily: 'var(--font-sans)', fontSize: 9, letterSpacing: '0.05em', color: 'rgba(26,26,26,0.6)' }}>
                      {disc.author?.charAt(0).toUpperCase()}
                    </div>
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

                  {/* Like + Reply + Delete actions */}
                  <div className={s.discussionActions}>
                    <button
                      className={`${s.likeBtn} ${likes[disc.id] ? s.likeBtnActive : ''}`}
                      onClick={() => setLikes((prev) => ({ ...prev, [disc.id]: !prev[disc.id] }))}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill={likes[disc.id] ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                      </svg>
                      {likes[disc.id] ? 'Liked' : 'Like'}
                    </button>
                    <button
                      className={s.replyBtn}
                      onClick={() => { setReplyingTo(replyingTo === disc.id ? null : disc.id); setReplyText('') }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                      </svg>
                      Reply
                    </button>
                    {disc.isOwn && (
                      <button
                        className={s.deleteBtn}
                        onClick={() => setDeleteModal(disc.id)}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                        Delete
                      </button>
                    )}
                  </div>

                  {/* Reply compose */}
                  {replyingTo === disc.id && (
                    <div className={s.replyCompose}>
                      <textarea
                        className={s.discTextarea}
                        placeholder="Write your reply..."
                        rows={3}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                      />
                      <button
                        className={s.actionBtn}
                        onClick={() => handlePostReply(disc)}
                      >
                        POST REPLY
                      </button>
                    </div>
                  )}

                  {disc.replies.length > 0 && (
                    <div className={s.replies}>
                      {[...disc.replies].reverse().map((reply, ri) => (
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
        ))
        })()}
      </div>

      {/* Delete Discussion Modal */}
      {deleteModal && (
        <div className={s.modalOverlay} onClick={() => setDeleteModal(null)}>
          <div className={s.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 className={s.modalTitle}>Delete Discussion</h2>
            <div className={s.modalBody}>
              <p>Are you sure you want to delete this discussion? This cannot be undone.</p>
            </div>
            <div className={s.modalActions}>
              <button className={s.cancelRsvpBtn} onClick={() => handleDeleteDiscussion(deleteModal)}>
                DELETE
              </button>
              <button className={s.modalDismiss} onClick={() => setDeleteModal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
