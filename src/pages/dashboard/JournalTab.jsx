import { useNavigate } from 'react-router'
import FadeIn from '../../components/shared/FadeIn'
import BlurImage from '../../components/shared/BlurImage'
import s from '../DashboardPage.module.css'

export default function JournalTab({ blogPosts, selectedPost, setSelectedPost }) {
  const navigate = useNavigate()

  return (
    <div className={s.tabContent}>
      <FadeIn>
        <div className={s.pageHeader}>
          <h1 className={s.pageTitle}>The Journal</h1>
          <p className={s.pageSubtitle}>Event recaps, collector stories, and watch culture</p>
        </div>
      </FadeIn>

      <div className={s.blogGrid}>
        {blogPosts.length === 0 && (
          <FadeIn>
            <div className={s.empty}>
              <p className={s.emptyTitle}>No posts right now</p>
              <p className={s.emptyText}>
                We will notify you when they become available.
              </p>
            </div>
          </FadeIn>
        )}
        {blogPosts.map((post, i) => (
          <FadeIn key={post.id} delay={`${0.05 * i}s`}>
            <div className={s.blogCard} onClick={() => navigate(`/journal/${post.id}`)} style={{ cursor: 'pointer' }}>
              <div className={s.blogImage}>
                <BlurImage src={post.image?.startsWith('http') ? post.image : `${import.meta.env.BASE_URL}assets/${post.image}`} alt={post.title} />
              </div>
              <div className={s.blogBody}>
                <span className={s.blogDate}>{post.date}</span>
                <h3 className={s.blogTitle}>{post.title}</h3>
                <p className={s.blogExcerpt}>{post.excerpt}</p>
                <span className={s.blogLink}>READ MORE &rarr;</span>
              </div>
            </div>
          </FadeIn>
        ))}
      </div>
    </div>
  )
}
