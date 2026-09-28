import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bookmark, BookmarkX, Trash2 } from 'lucide-react'
import { bookmarksAPI } from '../../services/api'
import BlogCard from '../../components/BlogCard/BlogCard'
import EmptyState from '../../components/common/EmptyState'
import LoadingSpinner from '../../components/common/SkeletonLoader'
import DashboardLayout from '../../layouts/DashboardLayout'
import toast from 'react-hot-toast'

export default function Bookmarks() {
  const [posts, setPosts] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  const fetchBookmarks = async () => {
    setLoading(true)
    try {
      const res = await bookmarksAPI.getBookmarks({ per_page: 20 })
      setPosts(res.data.items)
      setTotal(res.data.total)
    } catch {
      toast.error('Failed to load bookmarks')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    document.title = 'Saved Bookmarks — BlogSpace'
    fetchBookmarks()
  }, [])

  const handleRemove = async (postId, e) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      await bookmarksAPI.removeBookmark(postId)
      setPosts((prev) => prev.filter((p) => p.id !== postId))
      setTotal((prev) => prev - 1)
      toast.success('Bookmark removed')
    } catch {
      toast.error('Failed to remove bookmark')
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2.5">
              <Bookmark className="w-6 h-6 text-primary-600 fill-primary-600" />
              Bookmarked Posts
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Articles and stories you have saved to read later
            </p>
          </div>
          {!loading && total > 0 && (
            <span className="text-xs font-semibold px-3 py-1 bg-primary-50 text-primary-700 rounded-full">
              {total} saved {total === 1 ? 'item' : 'items'}
            </span>
          )}
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : posts.length === 0 ? (
          <EmptyState
            icon="bookmarks"
            title="No bookmarks yet"
            description="When you find an article you love, click the bookmark icon on it to save it here."
            actionLabel="Explore Stories"
            actionTo="/explore"
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post, idx) => (
              <div key={post.id} className="relative group">
                <BlogCard post={post} index={idx} />
                <button
                  onClick={(e) => handleRemove(post.id, e)}
                  className="absolute top-3 right-3 z-10 p-2 bg-white/90 backdrop-blur-md rounded-full text-slate-400 hover:text-red-500 shadow-md transition-all hover:scale-105"
                  title="Remove bookmark"
                >
                  <BookmarkX className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
