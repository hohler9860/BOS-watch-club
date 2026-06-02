import { useNavigate } from 'react-router'
import { Helmet } from 'react-helmet-async'
import FadeIn from '../components/shared/FadeIn'
import BlurImage from '../components/shared/BlurImage'
import { useBlogPosts, useSiteContent } from '../hooks/useSupabaseData'
import styles from './BlogPage.module.css'

export default function BlogPage() {
  const { data: blogPosts } = useBlogPosts('published')
  const { content } = useSiteContent()
  const journalHeroStyle = content.journalHeroImage ? { '--journal-hero-image': `url("${content.journalHeroImage}")` } : undefined
  const navigate = useNavigate()

  return (
    <>
      <Helmet>
        <title>The Journal — Boston Watch Club</title>
        <meta name="description" content="Stories, event recaps, and insights from Boston Watch Club members. Horology culture, collector spotlights, and community updates." />
      </Helmet>
      <section className={styles.hero} style={journalHeroStyle}>
        <FadeIn>
          <h2 className={styles.title}>THE JOURNAL</h2>
        </FadeIn>
        <FadeIn>
          <p className={styles.subtitle}>EVENT RECAPS, COLLECTOR STORIES, AND DISPATCHES FROM THE BOSTON WATCH CLUB.</p>
        </FadeIn>
      </section>

      <section className={styles.posts}>
        {blogPosts.length === 0 ? (
          <FadeIn>
            <div className={styles.empty}>
              <h3 className={styles.emptyTitle}>NOTHING HERE YET</h3>
              <p className={styles.emptyText}>New stories and recaps are on the way. Check back soon.</p>
              <a href="https://instagram.com/boswatchclub" target="_blank" rel="noopener noreferrer" className={styles.emptyCta}>FOLLOW US FOR UPDATES</a>
            </div>
          </FadeIn>
        ) : (
          <div className={styles.grid}>
            {blogPosts.map((post, i) => (
              <FadeIn key={post.id} delay={`${0.05 * i}s`}>
                <article className={styles.card} onClick={() => navigate(`/journal/${post.id}`)} style={{ cursor: 'pointer' }}>
                  <div className={styles.imageWrap}>
                    <BlurImage
                      src={post.image?.startsWith('http') ? post.image : `${import.meta.env.BASE_URL}assets/${post.image}`}
                      alt={post.title}
                    />
                  </div>
                  <div className={styles.body}>
                    <span className={styles.date}>{post.date}</span>
                    <h3 className={styles.postTitle}>{post.title}</h3>
                    <p className={styles.excerpt}>{post.excerpt || post.body}</p>
                    <span className={styles.readMore}>READ MORE &rarr;</span>
                  </div>
                </article>
              </FadeIn>
            ))}
          </div>
        )}
      </section>
    </>
  )
}
