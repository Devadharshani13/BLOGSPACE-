import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  PenLine, Menu, X, User, BookOpen, LayoutDashboard,
  LogOut, ChevronDown, Shield, Plus,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

function Avatar({ user, size = 'sm' }) {
  const sizes = { sm: 'w-8 h-8 text-sm', md: 'w-10 h-10 text-base' }
  if (user?.profile_image) {
    return (
      <img
        src={user.profile_image.startsWith('http') ? user.profile_image : `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}${user.profile_image}`}
        alt={user.name}
        className={`${sizes[size]} rounded-full object-cover border-2 border-white shadow`}
      />
    )
  }
  const initials = user?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || '?'
  return (
    <div className={`${sizes[size]} rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-semibold border-2 border-white shadow`}>
      {initials}
    </div>
  )
}

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const dropdownRef = useRef(null)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
    setDropdownOpen(false)
  }, [location.pathname])

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    navigate('/')
  }

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/explore', label: 'Explore' },
    { to: '/categories', label: 'Categories' },
    { to: '/about', label: 'About' },
  ]

  const isActive = (to) =>
    to === '/' ? location.pathname === '/' : location.pathname.startsWith(to)

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm' : 'bg-white/80 backdrop-blur-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-secondary-500 rounded-lg flex items-center justify-center">
              <PenLine className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-secondary-500 bg-clip-text text-transparent">
              BlogSpace
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link.to)
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-slate-600 hover:text-primary-600 hover:bg-slate-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Auth Area */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link
                  to="/create"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-primary-600 border border-primary-200 rounded-xl hover:bg-primary-50 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Write
                </Link>
                {/* User Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 transition-colors"
                  >
                    <Avatar user={user} />
                    <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden animate-fade-in">
                      <div className="px-4 py-3 border-b border-slate-100">
                        <p className="font-semibold text-slate-800 text-sm truncate">{user?.name}</p>
                        <p className="text-slate-500 text-xs truncate">{user?.email}</p>
                      </div>
                      <div className="py-1">
                        <Link to="/dashboard" className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50">
                          <LayoutDashboard className="w-4 h-4 text-slate-400" /> Dashboard
                        </Link>
                        <Link to="/bookmarks" className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50">
                          <BookOpen className="w-4 h-4 text-slate-400" /> Bookmarks
                        </Link>
                        <Link to="/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50">
                          <User className="w-4 h-4 text-slate-400" /> Profile
                        </Link>
                        {isAdmin && (
                          <Link to="/admin/dashboard" className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50">
                            <Shield className="w-4 h-4 text-slate-400" /> Admin
                          </Link>
                        )}
                        <hr className="my-1 border-slate-100" />
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                        >
                          <LogOut className="w-4 h-4" /> Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-primary-600 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-primary-600 to-secondary-500 rounded-xl hover:opacity-90 transition-opacity shadow-sm"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 px-4 py-4 space-y-1 animate-slide-up">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`block px-4 py-2.5 rounded-lg text-sm font-medium ${
                isActive(link.to) ? 'text-primary-600 bg-primary-50' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <hr className="border-slate-100 my-2" />
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="block px-4 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">Dashboard</Link>
              <Link to="/create" className="block px-4 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">Write a Post</Link>
              <Link to="/bookmarks" className="block px-4 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">Bookmarks</Link>
              <Link to="/profile" className="block px-4 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">Profile</Link>
              {isAdmin && <Link to="/admin/dashboard" className="block px-4 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">Admin Panel</Link>}
              <button onClick={handleLogout} className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50">
                Logout
              </button>
            </>
          ) : (
            <div className="flex gap-3 pt-2">
              <Link to="/login" className="flex-1 text-center px-4 py-2.5 text-sm font-medium border border-slate-200 rounded-xl text-slate-700">
                Login
              </Link>
              <Link to="/register" className="flex-1 text-center px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-primary-600 to-secondary-500 rounded-xl">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  )
}
