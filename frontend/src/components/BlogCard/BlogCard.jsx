import { Link } from 'react-router-dom'
import { Heart, MessageCircle, Clock, Eye } from 'lucide-react'
import { formatDate } from '../../utils/formatDate'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const CATEGORY_COLORS = {
  technology: 'bg-blue-100 text-blue-700',
  'artificial intelligence': 'bg-purple-100 text-purple-700',
  programming: 'bg-green-100 text-green-700',
  'web development': 'bg-indigo-100 text-indigo-700',
  cybersecurity: 'bg-red-100 text-red-700',
  education: 'bg-yellow-100 text-yellow-700',
  career: 'bg-orange-100 text-orange-700',
  travel: 'bg-teal-100 text-teal-700',
  lifestyle: 'bg-pink-100 text-pink-700',
}

const GRADIENT_FALLBACKS = [
  'from-indigo-400 to-purple-500',
  'from-blue-400 to-cyan-500',
  'from-violet-400 to-pink-500',
  'from-emerald-400 to-teal-500',
  'from-orange-400 to-red-500',
]

function Avatar({ name, image, size = 'sm' }) {
  const sz = size === 'sm' ? 'w-7 h-7 text-xs' : 'w-9 h-9 text-sm'
  const initials = name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || '?'
  if (image) {
    const src = image.startsWith('http') ? image : `${API_URL}${image}`
    return <img src={src} alt={name} className={`${sz} rounded-full object-cover`} />
  }
  return (
    <div className={`${sz} rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-semibold`}>
      {initials}
    </div>
  )
}

export default function BlogCard({ post, index = 0 }) {
  const gradient = GRADIENT_FALLBACKS[index % GRADIENT_FALLBACKS.length]
  const categoryKey = post.category_name?.toLowerCase() || ''
  const categoryColor = CATEGORY_COLORS[categoryKey] || 'bg-slate-100 text-slate-600'
  const imgSrc = post.featured_image
    ? post.featured_image.startsWith('http') ? post.featured_image : `${API_URL}${post.featured_image}`
    : null

  return (
    <Link
      to={`/blog/${post.slug}`}
      className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col"
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              e.target.style.display = 'none'
              e.target.nextSibling.style.display = 'flex'
            }}
          />
        ) : null}
        <div
          className={`${imgSrc ? 'hidden' : 'flex'} w-full h-full bg-gradient-to-br ${gradient} items-center justify-center`}
        >
          <span className="text-white text-4xl font-bold opacity-30">
            {post.title?.[0]?.toUpperCase() || 'B'}
          </span>
        </div>
        {post.category_name && (
          <span className={`absolute top-3 left-3 px-2.5 py-1 text-xs font-medium rounded-full ${categoryColor}`}>
            {post.category_name}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-bold text-slate-800 text-base leading-snug mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="text-slate-500 text-sm leading-relaxed line-clamp-3 mb-4 flex-1">
            {post.excerpt}
          </p>
        )}

        {/* Meta */}
        <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
          <Avatar name={post.author_name} image={post.author_avatar} />
          <span className="text-xs text-slate-600 font-medium truncate">{post.author_name}</span>
          <span className="text-slate-300">·</span>
          <span className="text-xs text-slate-400">{formatDate(post.published_at || post.created_at)}</span>
        </div>

        <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" /> {post.reading_time || 1} min read
          </span>
          <span className="flex items-center gap-1">
            <Heart className="w-3 h-3" /> {post.like_count || 0}
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle className="w-3 h-3" /> {post.comment_count || 0}
          </span>
          {post.views > 0 && (
            <span className="flex items-center gap-1 ml-auto">
              <Eye className="w-3 h-3" /> {post.views?.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
