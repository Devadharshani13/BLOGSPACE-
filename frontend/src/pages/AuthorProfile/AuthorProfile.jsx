import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { User, Calendar, BookOpen, ArrowLeft, Mail } from 'lucide-react'
import { usersAPI, postsAPI } from '../../services/api'
import { formatDate } from '../../utils/formatDate'
import BlogCard from '../../components/BlogCard/BlogCard'
import EmptyState from '../../components/common/EmptyState'
import { CardSkeleton } from '../../components/common/SkeletonLoader'
import MainLayout from '../../layouts/MainLayout'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function AuthorProfile() {
  const { id } = useParams()
  const [author, setAuthor] = useState(null)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      usersAPI.getById(id),
      postsAPI.getAll({ author_id: id, status: 'PUBLISHED', per_page: 20 }),
    ])
      .then(([userRes, postsRes]) => {
        setAuthor(userRes.data)
        setPosts(postsRes.data.items)
        document.title = `${userRes.data.name} — Author on BlogSpace`
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse bg-white rounded-3xl p-8 mb-8">
            <div className="w-24 h-24 bg-slate-200 rounded-2xl mb-4" />
            <div className="h-6 bg-slate-200 rounded w-48 mb-2" />
            <div className="h-4 bg-slate-200 rounded w-96 mb-4" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        </div>
      </MainLayout>
    )
  }

  if (!author) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <EmptyState
            icon="search"
            title="Author not found"
            description="The author you are looking for does not exist."
            actionLabel="Back to Explore"
            actionTo="/explore"
          />
        </div>
      </MainLayout>
    )
  }

  const avatarSrc = author.profile_image
    ? author.profile_image.startsWith('http')
      ? author.profile_image
      : `${API_URL}${author.profile_image}`
    : null

  const initials =
    author.name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'A'

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link
          to="/explore"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-primary-600 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Explore
        </Link>

        {/* Author Header Card */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 mb-10 flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
          <div className="w-28 h-28 rounded-3xl overflow-hidden bg-slate-100 border-2 border-slate-100 shadow-md flex-shrink-0">
            {avatarSrc ? (
              <img
                src={avatarSrc}
                alt={author.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary-600 to-secondary-500 flex items-center justify-center text-white text-3xl font-black">
                {initials}
              </div>
            )}
          </div>

          <div className="flex-1 space-y-3">
            <div>
              <h1 className="text-3xl font-black text-slate-900">{author.name}</h1>
              <p className="text-slate-400 text-sm mt-0.5">Author on BlogSpace</p>
            </div>

            {author.bio && (
              <p className="text-slate-600 text-sm max-w-2xl leading-relaxed">
                {author.bio}
              </p>
            )}

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-5 pt-2 text-xs text-slate-500">
              <span className="flex items-center gap-1.5 font-medium">
                <BookOpen className="w-4 h-4 text-primary-600" />
                {posts.length} Published {posts.length === 1 ? 'Story' : 'Stories'}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-slate-400" />
                Member since {formatDate(author.created_at)}
              </span>
            </div>
          </div>
        </div>

        {/* Author Posts */}
        <div className="space-y-6">
          <h2 className="text-xl font-black text-slate-800">
            Stories by {author.name}
          </h2>

          {posts.length === 0 ? (
            <EmptyState
              icon="posts"
              title="No published stories yet"
              description={`${author.name} hasn't published any stories yet.`}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post, idx) => (
                <BlogCard key={post.id} post={post} index={idx} />
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  )
}
