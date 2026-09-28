import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Users, FileText, MessageCircle, Heart, Eye,
  ShieldAlert, UserCheck, CheckCircle2, ArrowUpRight,
} from 'lucide-react'
import { adminAPI } from '../../services/api'
import { formatDate } from '../../utils/formatDate'
import DashboardLayout from '../../layouts/DashboardLayout'
import LoadingSpinner from '../../components/common/SkeletonLoader'
import toast from 'react-hot-toast'

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center gap-4">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${color}`}>
        <Icon className="w-7 h-7" />
      </div>
      <div>
        <p className="text-2xl sm:text-3xl font-black text-slate-900">
          {value !== undefined ? value.toLocaleString() : '0'}
        </p>
        <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mt-0.5">
          {label}
        </p>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [recentUsers, setRecentUsers] = useState([])
  const [recentPosts, setRecentPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    document.title = 'Admin Dashboard — BlogSpace'
    Promise.all([
      adminAPI.getStats(),
      adminAPI.getUsers({ per_page: 5 }),
      adminAPI.getPosts({ per_page: 5 }),
    ])
      .then(([statsRes, usersRes, postsRes]) => {
        setStats(statsRes.data)
        setRecentUsers(usersRes.data.items)
        setRecentPosts(postsRes.data.items)
      })
      .catch((err) => {
        toast.error('Failed to load admin telemetry')
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <DashboardLayout>
        <LoadingSpinner />
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold uppercase tracking-wider mb-2">
              <ShieldAlert className="w-3.5 h-3.5" />
              Platform Administration
            </div>
            <h1 className="text-3xl font-black text-slate-900">Admin Control Center</h1>
            <p className="text-slate-500 text-sm mt-1">
              Global platform analytics, user directory, content moderation and system metrics
            </p>
          </div>

          {/* Quick Sub-navigation */}
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              to="/admin/users"
              className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors"
            >
              Users Directory
            </Link>
            <Link
              to="/admin/posts"
              className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors"
            >
              All Blogs
            </Link>
            <Link
              to="/admin/comments"
              className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors"
            >
              Comments
            </Link>
          </div>
        </div>

        {/* Analytics Overview Cards */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard
              icon={Users}
              label="Total Users"
              value={stats.total_users}
              color="bg-blue-50 text-blue-600"
            />
            <StatCard
              icon={FileText}
              label="Total Posts"
              value={stats.total_posts}
              color="bg-primary-50 text-primary-600"
            />
            <StatCard
              icon={CheckCircle2}
              label="Published Posts"
              value={stats.published_posts}
              color="bg-emerald-50 text-emerald-600"
            />
            <StatCard
              icon={Eye}
              label="Platform Views"
              value={stats.total_views}
              color="bg-amber-50 text-amber-600"
            />
          </div>
        )}

        {/* Secondary Stats */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="bg-white p-5 rounded-2xl border border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-xs font-bold uppercase">Draft Posts</p>
                <p className="text-xl font-bold text-slate-800 mt-1">{stats.draft_posts}</p>
              </div>
              <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 font-bold">
                D
              </div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-xs font-bold uppercase">Total Comments</p>
                <p className="text-xl font-bold text-slate-800 mt-1">{stats.total_comments}</p>
              </div>
              <MessageCircle className="w-8 h-8 text-blue-400" />
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-xs font-bold uppercase">Total Likes Given</p>
                <p className="text-xl font-bold text-slate-800 mt-1">{stats.total_likes}</p>
              </div>
              <Heart className="w-8 h-8 text-red-400" />
            </div>
          </div>
        )}

        {/* Recent Activity Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Users */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-slate-800 text-lg">Recent Users</h2>
              <Link
                to="/admin/users"
                className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1"
              >
                Manage all <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="divide-y divide-slate-100">
              {recentUsers.map((u) => (
                <div key={u.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-sm text-slate-800">{u.name}</p>
                    <p className="text-xs text-slate-400">{u.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        u.role === 'ADMIN'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {u.role}
                    </span>
                    <span
                      className={`w-2 h-2 rounded-full ${
                        u.is_active ? 'bg-emerald-500' : 'bg-red-400'
                      }`}
                      title={u.is_active ? 'Active' : 'Inactive'}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Posts */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-slate-800 text-lg">Recent Posts</h2>
              <Link
                to="/admin/posts"
                className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1"
              >
                Manage all <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="divide-y divide-slate-100">
              {recentPosts.map((p) => (
                <div key={p.id} className="py-3 flex items-center justify-between">
                  <div className="max-w-xs">
                    <p className="font-semibold text-sm text-slate-800 line-clamp-1">{p.title}</p>
                    <p className="text-xs text-slate-400">By {p.author_name}</p>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      p.status === 'PUBLISHED'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {p.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
