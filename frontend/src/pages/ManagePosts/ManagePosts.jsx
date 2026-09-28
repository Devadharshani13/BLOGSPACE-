import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FileText, Search, Plus, Edit3, Trash2, Eye,
  CheckCircle2, XCircle, Clock, Heart, MessageCircle,
} from 'lucide-react'
import { postsAPI } from '../../services/api'
import { formatDate } from '../../utils/formatDate'
import DashboardLayout from '../../layouts/DashboardLayout'
import EmptyState from '../../components/common/EmptyState'
import LoadingSpinner from '../../components/common/SkeletonLoader'
import toast from 'react-hot-toast'

export default function ManagePosts() {
  const [posts, setPosts] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [search, setSearch] = useState('')
  const [actionLoading, setActionLoading] = useState(null)

  const fetchMyPosts = async () => {
    setLoading(true)
    try {
      const params = {}
      if (statusFilter !== 'ALL') {
        params.status = statusFilter
      }
      const res = await postsAPI.myPosts(params)
      setPosts(res.data.items)
      setTotal(res.data.total)
    } catch (err) {
      toast.error('Failed to load posts')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    document.title = 'My Posts — BlogSpace'
    fetchMyPosts()
  }, [statusFilter])

  const handleDelete = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) return
    try {
      await postsAPI.delete(postId)
      setPosts((prev) => prev.filter((p) => p.id !== postId))
      setTotal((prev) => prev - 1)
      toast.success('Post deleted successfully')
    } catch {
      toast.error('Failed to delete post')
    }
  }

  const handleTogglePublish = async (post) => {
    setActionLoading(post.id)
    try {
      if (post.status === 'PUBLISHED') {
        await postsAPI.unpublish(post.id)
        toast.success('Post unpublished')
      } else {
        await postsAPI.publish(post.id)
        toast.success('Post published successfully')
      }
      fetchMyPosts()
    } catch {
      toast.error('Failed to update post status')
    } finally {
      setActionLoading(null)
    }
  }

  const filteredPosts = posts.filter((p) =>
    search ? p.title.toLowerCase().includes(search.toLowerCase()) : true
  )

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-800">Manage Posts</h1>
            <p className="text-slate-500 text-sm mt-1">
              Create, edit, publish and manage all your blogs in one place
            </p>
          </div>
          <Link
            to="/create"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-600 to-secondary-500 text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity w-fit shadow-sm"
          >
            <Plus className="w-4 h-4" /> Create New Post
          </Link>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary-400"
            />
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-auto overflow-x-auto w-full sm:w-auto">
            {['ALL', 'PUBLISHED', 'DRAFT'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                  statusFilter === st
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {st === 'ALL' ? 'All Posts' : st.charAt(0) + st.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Posts Table / List */}
        {loading ? (
          <LoadingSpinner />
        ) : filteredPosts.length === 0 ? (
          <EmptyState
            icon="posts"
            title="No posts found"
            description={
              search
                ? `No posts matched "${search}"`
                : statusFilter !== 'ALL'
                ? `You don't have any ${statusFilter.toLowerCase()} posts.`
                : 'You have not written any posts yet. Start writing today!'
            }
            actionLabel="Write Your First Post"
            actionTo="/create"
          />
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50/80 border-b border-slate-100 text-xs uppercase font-bold text-slate-500">
                  <tr>
                    <th className="px-6 py-3.5">Title</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5">Category</th>
                    <th className="px-6 py-3.5">Created</th>
                    <th className="px-6 py-3.5">Engagement</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPosts.map((post) => (
                    <tr key={post.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4 max-w-xs font-medium text-slate-800">
                        <Link
                          to={post.status === 'PUBLISHED' ? `/blog/${post.slug}` : `/edit/${post.id}`}
                          className="hover:text-primary-600 transition-colors line-clamp-1"
                        >
                          {post.title}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                            post.status === 'PUBLISHED'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              post.status === 'PUBLISHED' ? 'bg-emerald-500' : 'bg-amber-500'
                            }`}
                          />
                          {post.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg">
                          {post.category_name || 'Uncategorized'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-400">
                        {formatDate(post.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1" title="Views">
                            <Eye className="w-3.5 h-3.5 text-slate-400" /> {post.views || 0}
                          </span>
                          <span className="flex items-center gap-1" title="Likes">
                            <Heart className="w-3.5 h-3.5 text-red-400" /> {post.like_count || 0}
                          </span>
                          <span className="flex items-center gap-1" title="Comments">
                            <MessageCircle className="w-3.5 h-3.5 text-blue-400" /> {post.comment_count || 0}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {post.status === 'PUBLISHED' && (
                            <Link
                              to={`/blog/${post.slug}`}
                              className="p-1.5 text-slate-400 hover:text-primary-600 rounded-lg hover:bg-slate-100 transition-colors"
                              title="View blog"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                          )}
                          <Link
                            to={`/edit/${post.id}`}
                            className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition-colors"
                            title="Edit"
                          >
                            <Edit3 className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleTogglePublish(post)}
                            disabled={actionLoading === post.id}
                            className={`p-1.5 rounded-lg transition-colors ${
                              post.status === 'PUBLISHED'
                                ? 'text-amber-500 hover:bg-amber-50'
                                : 'text-emerald-600 hover:bg-emerald-50'
                            }`}
                            title={post.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
                          >
                            {post.status === 'PUBLISHED' ? (
                              <XCircle className="w-4 h-4" />
                            ) : (
                              <CheckCircle2 className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleDelete(post.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                            title="Delete"
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
