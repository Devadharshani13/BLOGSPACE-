import { useEffect, useState, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  Heart, Bookmark, Share2, Clock, Eye, Calendar,
  Tag, ArrowLeft, ExternalLink,
} from 'lucide-react'
import { postsAPI, likesAPI, bookmarksAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { formatFull, formatRelative } from '../../utils/formatDate'
import { PostDetailSkeleton } from '../../components/common/SkeletonLoader'
import CommentSection from '../../components/CommentSection/CommentSection'
import BlogCard from '../../components/BlogCard/BlogCard'
import MainLayout from '../../layouts/MainLayout'
import toast from 'react-hot-toast'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function AuthorAvatar({ author }) {
  const initials = author?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || '?'
  if (author?.profile_image) {
    const src = author.profile_image.startsWith('http') ? author.profile_image : `${API_URL}${author.profile_image}`
    return <img src={src} alt={author.name} className="w-14 h-14 rounded-full object-cover" />
  }
  return (
    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white text-xl font-bold">
      {initials}
    </div>
  )
}

export default function BlogDetails() {
  const { slug } = useParams()
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [related, setRelated] = useState([])
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [bookmarked, setBookmarked] = useState(false)
  const [likeLoading, setLikeLoading] = useState(false)
  const [bookmarkLoading, setBookmarkLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    postsAPI
      .getBySlug(slug)
      .then((res) => {
        const p = res.data
        setPost(p)
        setLiked(p.is_liked)
        setLikeCount(p.like_count)
        setBookmarked(p.is_bookmarked)
        document.title = `${p.title} — BlogSpace`

        // Fetch related posts
        if (p.category?.slug) {
          postsAPI
            .getAll({ category: p.category.slug, per_page: 3 })
            .then((r) => setRelated(r.data.items.filter((rp) => rp.slug !== slug).slice(0, 3)))
            .catch(() => {})
        }
      })
      .catch(() => {
        toast.error('Post not found')
        navigate('/explore')
      })
      .finally(() => setLoading(false))
  }, [slug])

  const handleLike = async () => {
    if (!isAuthenticated) { toast.error('Please login to like posts'); return }
    setLikeLoading(true)
    try {
      if (liked) {
        const res = await likesAPI.unlike(post.id)
        setLiked(false)
        setLikeCount(res.data.like_count)
        toast.success('Like removed')
      } else {
        const res = await likesAPI.like(post.id)
        setLiked(true)
        setLikeCount(res.data.like_count)
        toast.success('Post liked! ❤️')
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setLikeLoading(false)
    }
  }

  const handleBookmark = async () => {
    if (!isAuthenticated) { toast.error('Please login to bookmark posts'); return }
    setBookmarkLoading(true)
    try {
      if (bookmarked) {
        await bookmarksAPI.removeBookmark(post.id)
        setBookmarked(false)
        toast.success('Bookmark removed')
      } else {
        await bookmarksAPI.bookmark(post.id)
        setBookmarked(true)
        toast.success('Post bookmarked! 🔖')
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setBookmarkLoading(false)
    }
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href).catch(() => {})
    toast.success('Link copied to clipboard!')
  }

  if (loading) return <MainLayout><PostDetailSkeleton /></MainLayout>
  if (!post) return null

  const featuredImg = post.featured_image
    ? post.featured_image.startsWith('http') ? post.featured_image : `${API_URL}${post.featured_image}`
    : null
  const authorImg = post.author?.profile_image
    ? post.author.profile_image.startsWith('http') ? post.author.profile_image : `${API_URL}${post.author.profile_image}`
    : null

  return (
    <MainLayout>
      <article className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary-600 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        {/* Category */}
        {post.category && (
          <Link
            to={`/explore?category=${post.category.slug}`}
            className="inline-block px-3 py-1 bg-primary-50 text-primary-700 text-xs font-semibold rounded-full mb-4 hover:bg-primary-100 transition-colors"
          >
            {post.category.name}
          </Link>
        )}

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 leading-tight mb-6">
          {post.title}
        </h1>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-4 mb-8 pb-6 border-b border-slate-100">
          <Link to={`/author/${post.author.id}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <AuthorAvatar author={post.author} size="sm" />
            <div>
              <p className="font-semibold text-slate-800 text-sm">{post.author.name}</p>
              <p className="text-slate-400 text-xs">{formatFull(post.published_at || post.created_at)}</p>
            </div>
          </Link>
          <div className="flex items-center gap-4 ml-auto text-slate-400 text-sm">
            <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {post.reading_time} min read</span>
            <span className="flex items-center gap-1"><Eye className="w-4 h-4" /> {post.views?.toLocaleString()}</span>
          </div>
        </div>

        {/* Featured image */}
        {featuredImg && (
          <div className="rounded-2xl overflow-hidden mb-8">
            <img src={featuredImg} alt={post.title} className="w-full h-auto max-h-[500px] object-cover" />
          </div>
        )}

        {/* Content */}
        <div
          className="blog-content text-slate-700 leading-relaxed text-base mb-10"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Tags */}
        {post.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8 pb-8 border-b border-slate-100">
            <Tag className="w-4 h-4 text-slate-400 mt-0.5" />
            {post.tags.map((tag) => (
              <Link
                key={tag.id}
                to={`/explore?tag=${tag.slug}`}
                className="px-3 py-1 bg-slate-100 text-slate-600 text-xs rounded-full hover:bg-primary-50 hover:text-primary-700 transition-colors"
              >
                #{tag.name}
              </Link>
            ))}
          </div>
        )}

        {/* Engagement buttons */}
        <div className="flex items-center gap-3 mb-12">
          <button
            onClick={handleLike}
            disabled={likeLoading}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              liked
                ? 'bg-red-50 text-red-600 border border-red-200'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-red-200 hover:text-red-500'
            }`}
          >
            <Heart className={`w-4 h-4 ${liked ? 'fill-red-500 text-red-500' : ''}`} />
            {likeCount} {likeCount === 1 ? 'Like' : 'Likes'}
          </button>

          <button
            onClick={handleBookmark}
            disabled={bookmarkLoading}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              bookmarked
                ? 'bg-primary-50 text-primary-700 border border-primary-200'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-primary-200 hover:text-primary-600'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-primary-600 text-primary-600' : ''}`} />
            {bookmarked ? 'Bookmarked' : 'Bookmark'}
          </button>

          <button
            onClick={handleShare}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-white text-slate-600 border border-slate-200 hover:border-slate-300 transition-all ml-auto"
          >
            <Share2 className="w-4 h-4" /> Share
          </button>
        </div>

        {/* Author Card */}
        <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-2xl p-6 mb-12">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">About the Author</h3>
          <div className="flex gap-4">
            <AuthorAvatar author={post.author} />
            <div className="flex-1">
              <Link to={`/author/${post.author.id}`} className="font-bold text-slate-800 hover:text-primary-600 transition-colors">
                {post.author.name}
              </Link>
              {post.author.bio && (
                <p className="text-slate-600 text-sm mt-1 leading-relaxed line-clamp-3">{post.author.bio}</p>
              )}
              <Link
                to={`/author/${post.author.id}`}
                className="inline-flex items-center gap-1 mt-3 text-xs font-semibold text-primary-600 hover:text-primary-700"
              >
                View Profile <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* Related Posts */}
        {related.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Related Articles</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {related.map((rp, i) => <BlogCard key={rp.id} post={rp} index={i} />)}
            </div>
          </div>
        )}

        {/* Comments */}
        <CommentSection postId={post.id} />
      </article>
    </MainLayout>
  )
}
