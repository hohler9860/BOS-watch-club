import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import { supabase } from '../lib/supabase'
import useAuth from '../hooks/useAuth'
import BlurImage from '../components/shared/BlurImage'
import FadeIn from '../components/shared/FadeIn'
import s from './JournalPostPage.module.css'

export default function JournalPostPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { member } = useAuth()
  const journalBack = member ? '/dashboard?tab=blogs' : '/blog'
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      if (!supabase) { setLoading(false); return }
      const { data } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('id', id)
        .maybeSingle()
      setPost(data)
      setLoading(false)
    }
    load()
  }, [id])

  if (loading) return (
    <div className={s.page}>
      <div className={s.spinner} />
    </div>
  )

  if (!post) return (
    <div className={s.page}>
      <div className={s.container}>
        <p className={s.notFound}>Post not found.</p>
        <button className={s.back} onClick={() => navigate(journalBack)}>← Back to Journal</button>
      </div>
    </div>
  )

  return (
    <div className={s.page}>
      <FadeIn>
        <div className={s.container}>
          <button className={s.back} onClick={() => navigate(journalBack)}>
            &larr; Back to Journal
          </button>

          {post.image && (
            <div className={s.hero}>
              <BlurImage
                src={post.image?.startsWith('http') ? post.image : `${import.meta.env.BASE_URL}assets/${post.image}`}
                alt={post.title}
              />
            </div>
          )}

          <div className={s.meta}>
            <span className={s.date}>{post.date}</span>
            {post.category && <span className={s.category}>{post.category}</span>}
          </div>

          <h1 className={s.title}>{post.title}</h1>

          {post.author && <p className={s.author}>By {post.author}</p>}

          <div className={s.body}>
            {post.content || post.body
              ? (post.content || post.body).split('\n').map((para, i) =>
                  para.trim() ? <p key={i}>{para}</p> : <br key={i} />
                )
              : <p>{post.excerpt}</p>
            }
          </div>
        </div>
      </FadeIn>
    </div>
  )
}
