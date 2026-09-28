import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FileText, Heart, MessageCircle, Eye, TrendingUp,
  BookOpen, User, Plus, BarChart2, Pencil,
} from 'lucide-react'
import { usersAPI, postsAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { formatDate } from '../../utils/formatDate'
import DashboardLayout from '../../layouts/DashboardLayout'
import LoadingSpinner from '../../components/common/SkeletonLoader'

const STATUS_COLORS = {
  PUBLISHED: 'bg-green-100 text-green-700',
  DRAFT: 'bg-slate-100 text-slate-600',
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-2xl font-black text-slate-800">{value?.toLocaleString()}</p>
      <p className="text-slate-500 text-sm mt-0.5">{label}</p>
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [recentPosts, setRecentPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    document.title = 'Dashboard — BlogSpace'
    Promise.all([
      usersAPI.getStats(),
      postsAPI.myPosts({ per_page: 5 }),
    ])
      .then(([statsRes, postsRes]) => {
        setStats(statsRes.data)
        setRecentPosts(postsRes.data.items)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <DashboardLayout><LoadingSpinner /></DashboardLayout>

  return (
    <DashboardLayout>
      {/* Welcome */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-800">
            Welcome back, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-slate-500 text-sm mt-1">Here's what's happening with your posts.</p>
        </div>
        <Link
          to="/create"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-600 to-secondary-500 text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" /> Create New Post
        </Link>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <StatCard icon={FileText} label="Total Posts" value={stats.total_posts} color="bg-primary-50 text-primary-600" />
          <StatCard icon={TrendingUp} label="Published" value={stats.published_posts} color="bg-green-50 text-green-600" />
          <StatCard icon={BookOpen} label="Drafts" value={stats.drafts} color="bg-slate-100 text-slate-500" />
          <StatCard icon={Heart} label="Total Likes" value={stats.total_likes} color="bg-red-50 text-red-500" />
          <StatCard icon={MessageCircle} label="Comments" value={stats.total_comments} color="bg-blue-50 text-blue-500" />
          <StatCard icon={Eye} label="Total Views" value={stats.total_views} color="bg-amber-50 text-amber-500" />
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { to: '/create', icon: Plus, label: 'New Post', color: 'bg-primary-50 text-primary-600 hover:bg-primary-100' },
          { to: '/dashboard/posts', icon: FileText, label: 'Manage Posts', color: 'bg-slate-50 text-slate-600 hover:bg-slate-100' },
          { to: '/profile', icon: User, label: 'Edit Profile', color: 'bg-blue-50 text-blue-600 hover:bg-blue-100' },
          { to: '/bookmarks', icon: BookOpen, label: 'Bookmarks', color: 'bg-amber-50 text-amber-600 hover:bg-amber-100' },
        ].map((action) => (
          <Link
            key={action.to}
            to={action.to}
            className={`flex flex-col items-center justify-center p-5 rounded-2xl transition-colors font-medium text-sm gap-2 ${action.color}`}
          >
            <action.icon className="w-6 h-6" />
            {action.label}
          </Link>
        ))}
      </div>

      {/* Recent Posts */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-bold text-slate-800">Recent Posts</h2>
          <Link to="/dashboard/posts" className="text-xs font-medium text-primary-600 hover:underline">View all</Link>
        </div>
        {recentPosts.length === 0 ? (
          <div className="py-10 text-center text-slate-400 text-sm">
            No posts yet.{' '}
            <Link to="/create" className="text-primary-600 hover:underline font-medium">Write your first story!</Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {recentPosts.map((post) => (
              <div key={post.id} className="flex items-center gap-4 px-6 py-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-800 text-sm truncate">{post.title}</p>
                  <p className="text-slate-400 text-xs mt-0.5">{formatDate(post.created_at)}</p>
                </div>
                <span className={`px-2.5 py-1 text-xs font-medium rounded-full flex-shrink-0 ${STATUS_COLORS[post.status]}`}>
                  {post.status}
                </span>
                <div className="flex items-center gap-3 text-xs text-slate-400 flex-shrink-0">
                  <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{post.views}</span>
                  <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{post.like_count}</span>
                </div>
                <Link to={`/edit/${post.id}`} className="p-1.5 text-slate-400 hover:text-primary-600 transition-colors">
                  <Pencil className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
