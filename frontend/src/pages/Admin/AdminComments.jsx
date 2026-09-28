import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { MessageCircle, Search, Trash2, ArrowLeft, ExternalLink } from 'lucide-react'
import { adminAPI } from '../../services/api'
import { formatDate } from '../../utils/formatDate'
import DashboardLayout from '../../layouts/DashboardLayout'
import LoadingSpinner from '../../components/common/SkeletonLoader'
import toast from 'react-hot-toast'

export default function AdminComments() {
  const [comments, setComments] = useState([])
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  const fetchComments = async () => {
    setLoading(true)
    try {
      const res = await adminAPI.getComments({ search, page, per_page: 20 })
      setComments(res.data.items)
      setTotal(res.data.total)
    } catch {
      toast.error('Failed to load comments')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    document.title = 'Comment Moderation — BlogSpace Admin'
    fetchComments()
  }, [page])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    setPage(1)
    fetchComments()
  }

  const handleDelete = async (commentId) => {
    if (!window.confirm('Delete this comment permanently?')) return
    try {
      await adminAPI.deleteComment(commentId)
      setComments((prev) => prev.filter((c) => c.id !== commentId))
      setTotal((prev) => prev - 1)
      toast.success('Comment deleted')
    } catch {
      toast.error('Failed to delete comment')
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link
              to="/admin/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-primary-600 mb-2 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
            </Link>
            <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <MessageCircle className="w-6 h-6 text-primary-600" /> Comments Moderation
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">
              Review and moderate user discussions across all stories
            </p>
          </div>

          <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search comments by keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-primary-400"
            />
          </form>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50/80 border-b border-slate-100 text-xs uppercase font-bold text-slate-500">
                  <tr>
                    <th className="px-6 py-4">Comment</th>
                    <th className="px-6 py-4">Author</th>
                    <th className="px-6 py-4">Post</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {comments.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4 max-w-sm font-medium text-slate-800">
                        <p className="line-clamp-2">{c.content}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs font-semibold text-slate-700">
                        {c.user_name}
                      </td>
                      <td className="px-6 py-4 max-w-xs text-xs text-slate-600">
                        {c.post_slug ? (
                          <Link
                            to={`/blog/${c.post_slug}`}
                            className="hover:text-primary-600 transition-colors inline-flex items-center gap-1 line-clamp-1"
                          >
                            {c.post_title} <ExternalLink className="w-3 h-3 flex-shrink-0" />
                          </Link>
                        ) : (
                          c.post_title
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-400">
                        {formatDate(c.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                          title="Delete comment"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
