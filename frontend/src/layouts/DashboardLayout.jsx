import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, FileText, Bookmark, User,
  PenLine, Shield, LogOut, X, ChevronRight,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar/Navbar'
import toast from 'react-hot-toast'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/dashboard/posts', icon: FileText, label: 'My Posts' },
  { to: '/bookmarks', icon: Bookmark, label: 'Bookmarks' },
  { to: '/profile', icon: User, label: 'Profile' },
]

export default function DashboardLayout({ children }) {
  const { isAdmin, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    toast.success('Logged out')
    navigate('/')
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1 pt-16">
        {/* Sidebar */}
        <aside className="hidden lg:flex flex-col w-60 bg-white border-r border-slate-100 fixed top-16 left-0 bottom-0 overflow-y-auto">
          <div className="p-4 flex flex-col h-full">
            <nav className="flex-1 space-y-1">
              {navItems.map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/dashboard'}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </NavLink>
              ))}
              {isAdmin && (
                <NavLink
                  to="/admin/dashboard"
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      isActive ? 'bg-purple-50 text-purple-700' : 'text-slate-600 hover:bg-slate-50'
                    }`
                  }
                >
                  <Shield className="w-4 h-4" />
                  Admin Panel
                </NavLink>
              )}
            </nav>

            <div className="mt-4 pt-4 border-t border-slate-100 space-y-1">
              <NavLink
                to="/create"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-primary-600 to-secondary-500 text-white hover:opacity-90 transition-opacity"
              >
                <PenLine className="w-4 h-4" />
                Write New Post
              </NavLink>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 lg:ml-60 min-h-full">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">{children}</div>
        </main>
      </div>
    </div>
  )
}
