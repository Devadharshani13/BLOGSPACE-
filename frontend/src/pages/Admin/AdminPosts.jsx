import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FileText, Search, Trash2, Eye, XCircle, CheckCircle2,
  ArrowLeft,
} from 'lucide-react'
import { adminAPI, postsAPI } from '../../services/api'
import { formatDate } from '../../utils/formatDate'
import DashboardLayout from '../../layouts/DashboardLayout'
import LoadingSpinner from '../../components/common/SkeletonLoader'
import toast from 'react-hot-toast'

export default function AdminPosts() {
  const [posts, setPosts] = useState([])
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  const fetchPosts = async () => {
    setLoading(true)
    try {
      const params = { page, per_page: 15 }
      if (search) params.search = search
      if (statusFilter) params.status = statusFilter
      const res = await adminAPI.getPosts(params)
      setPosts(res.data.items)
      setTotal(res.data.total)
    } catch {
      toast.error('Failed to load posts')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    document.title = 'Blog Moderation — BlogSpace Admin'
    fetchPosts()
  }, [page, statusFilter])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    setPage(1)
    fetchPosts()
  }

  const handleDelete = async (postId) => {
    if (!window.confirm('Delete this blog permanently?')) return
    try {
      await adminAPI.deletePost(postId)
      setPosts((prev) => prev.filter((p) => p.id !== postId))
      setTotal((prev) => prev - 1)
      toast.success('Post removed from platform')
    } catch {
      toast.error('Failed to delete post')
    }
  }

  const handleTogglePublish = async (post) => {
    try {
      if (post.status === 'PUBLISHED') {
        await postsAPI.unpublish(post.id)
        toast.success('Post unpublished')
      } else {
        await postsAPI.publish(post.id)
        toast.success('Post published')
      }
      fetchPosts()
    } catch {
      toast.error('Failed to toggle status')
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
              <FileText className="w-6 h-6 text-primary-600" /> Platform Stories Moderation
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">
              Review, unpublish, or delete blogs across the entire platform
            </p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setPage(1)
              }}
              className="px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-primary-400"
            >
              <option value="">All Statuses</option>
              <option value="PUBLISHED">Published</option>
              <option value="DRAFT">Draft</option>
            </select>

            <form onSubmit={handleSearchSubmit} className="relative w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search blogs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-primary-400"
              />
            </form>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50/80 border-b border-slate-100 text-xs uppercase font-bold text-slate-500">
                  <tr>
                    <th className="px-6 py-4">Title</th>
                    <th className="px-6 py-4">Author</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Views</th>
                    <th className="px-6 py-4">Created</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {posts.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900 max-w-xs">
                        <Link
                          to={`/blog/${p.slug}`}
                          className="hover:text-primary-600 transition-colors line-clamp-1"
                        >
                          {p.title}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-600">
                        {p.author_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg">
                          {p.category_name || 'Uncategorized'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                            p.status === 'PUBLISHED'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500">
                        {p.views || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-400">
                        {formatDate(p.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/blog/${p.slug}`}
                            className="p-1.5 text-slate-400 hover:text-primary-600 rounded-lg hover:bg-slate-100 transition-colors"
                            title="View post"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleTogglePublish(p)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              p.status === 'PUBLISHED'
                                ? 'text-amber-500 hover:bg-amber-50'
                                : 'text-emerald-600 hover:bg-emerald-50'
                            }`}
                            title={p.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
                          >
                            {p.status === 'PUBLISHED' ? (
                              <XCircle className="w-4 h-4" />
                            ) : (
                              <CheckCircle2 className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                            title="Delete permanently"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
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
