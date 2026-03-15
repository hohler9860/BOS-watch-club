import FadeIn from '../components/shared/FadeIn'
import BlurImage from '../components/shared/BlurImage'
import { useBlogPosts } from '../hooks/useSupabaseData'
import styles from './BlogPage.module.css'

export default function BlogPage() {
  const { data: blogPosts } = useBlogPosts('published')

  return (
    <>
      <section className={styles.hero}>
        <FadeIn>
          <h2 className={styles.title}>THE JOURNAL</h2>
        </FadeIn>
        <FadeIn>
          <p className={styles.subtitle}>EVENT RECAPS, COLLECTOR STORIES, AND DISPATCHES FROM THE BOSTON WATCH CLUB.</p>
        </FadeIn>
      </section>

      <section className={styles.posts}>
        <div className={styles.grid}>
          {blogPosts.map((post, i) => (
            <FadeIn key={post.id} delay={`${0.05 * i}s`}>
              <article className={styles.card}>
                <div className={styles.imageWrap}>
                  <BlurImage
                    src={`${import.meta.env.BASE_URL}assets/${post.image}`}
                    alt={post.title}
                  />
                </div>
                <div className={styles.body}>
                  <span className={styles.date}>{post.date}</span>
                  <h3 className={styles.postTitle}>{post.title}</h3>
                  <p className={styles.excerpt}>{post.excerpt || post.body}</p>
                  <a
                    href={post.substack_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.readMore}
                  >
                    READ ON SUBSTACK &rarr;
                  </a>
                </div>
              </article>
            </FadeIn>
          ))}
        </div>
      </section>
    </>
  )
}
