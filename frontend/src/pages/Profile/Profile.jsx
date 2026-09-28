import { useState, useEffect, useRef } from 'react'
import {
  User, Mail, Calendar, Camera, Edit2, Check,
  FileText, Bookmark, Heart, Sparkles,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { usersAPI, postsAPI, bookmarksAPI, uploadAPI } from '../../services/api'
import { formatDate } from '../../utils/formatDate'
import BlogCard from '../../components/BlogCard/BlogCard'
import EmptyState from '../../components/common/EmptyState'
import LoadingSpinner from '../../components/common/SkeletonLoader'
import DashboardLayout from '../../layouts/DashboardLayout'
import toast from 'react-hot-toast'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function Profile() {
  const { user, updateUser } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(user?.name || '')
  const [bio, setBio] = useState(user?.bio || '')
  const [profileImage, setProfileImage] = useState(user?.profile_image || '')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)

  const [activeTab, setActiveTab] = useState('posts')
  const [posts, setPosts] = useState([])
  const [drafts, setDrafts] = useState([])
  const [bookmarks, setBookmarks] = useState([])
  const [loadingTab, setLoadingTab] = useState(false)

  const fileInputRef = useRef(null)

  useEffect(() => {
    document.title = `${user?.name || 'Profile'} — BlogSpace`
    if (user) {
      setName(user.name || '')
      setBio(user.bio || '')
      setProfileImage(user.profile_image || '')
    }
  }, [user])

  useEffect(() => {
    const fetchTabData = async () => {
      setLoadingTab(true)
      try {
        if (activeTab === 'posts') {
          const res = await postsAPI.myPosts({ status: 'PUBLISHED' })
          setPosts(res.data.items)
        } else if (activeTab === 'drafts') {
          const res = await postsAPI.myPosts({ status: 'DRAFT' })
          setDrafts(res.data.items)
        } else if (activeTab === 'bookmarks') {
          const res = await bookmarksAPI.getBookmarks({ per_page: 20 })
          setBookmarks(res.data.items)
        }
      } catch {
        // silent fail
      } finally {
        setLoadingTab(false)
      }
    }
    fetchTabData()
  }, [activeTab])

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const res = await uploadAPI.uploadImage(file)
      const newUrl = res.data.url
      setProfileImage(newUrl)
      // Save directly to user profile
      const updateRes = await usersAPI.updateProfile({ profile_image: newUrl })
      updateUser(updateRes.data)
      toast.success('Avatar updated!')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('Name cannot be empty')
      return
    }
    setSaving(true)
    try {
      const res = await usersAPI.updateProfile({
        name: name.trim(),
        bio: bio.trim(),
        profile_image: profileImage,
      })
      updateUser(res.data)
      setIsEditing(false)
      toast.success('Profile updated successfully!')
    } catch {
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const currentItems =
    activeTab === 'posts'
      ? posts
      : activeTab === 'drafts'
      ? drafts
      : bookmarks

  const avatarSrc = profileImage
    ? profileImage.startsWith('http')
      ? profileImage
      : `${API_URL}${profileImage}`
    : null

  const initials =
    user?.name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'U'

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Cover & Profile Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          {/* Banner */}
          <div className="h-44 sm:h-52 bg-gradient-to-r from-primary-600 via-secondary-500 to-indigo-700 relative">
            <div className="absolute inset-0 bg-black/10" />
          </div>

          {/* Profile Details Container */}
          <div className="px-6 sm:px-8 pb-8 pt-0 relative">
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-16 sm:-mt-20 mb-6">
              {/* Avatar */}
              <div className="relative group">
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl border-4 border-white shadow-xl overflow-hidden bg-white flex items-center justify-center">
                  {avatarSrc ? (
                    <img
                      src={avatarSrc}
                      alt={user?.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary-600 to-secondary-500 flex items-center justify-center text-white text-3xl font-black">
                      {initials}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="absolute bottom-1 right-1 p-2.5 bg-slate-900/80 hover:bg-slate-900 text-white rounded-2xl shadow-lg backdrop-blur-sm transition-all hover:scale-105"
                  title="Change photo"
                >
                  <Camera className="w-4 h-4" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>

              {/* Edit Button */}
              <div className="sm:self-end">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Edit2 className="w-4 h-4 text-slate-400" />
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </button>
              </div>
            </div>

            {/* Profile Info / Edit Form */}
            {isEditing ? (
              <form onSubmit={handleSaveProfile} className="space-y-4 max-w-xl">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary-400"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                    Bio
                  </label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary-400 resize-none"
                    placeholder="Tell us about yourself..."
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 disabled:opacity-50 transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-3">
                <div>
                  <h2 className="text-2xl font-black text-slate-900">{user?.name}</h2>
                  <p className="text-sm text-slate-400 flex items-center gap-1.5 mt-0.5">
                    <Mail className="w-3.5 h-3.5" /> {user?.email}
                  </p>
                </div>
                {user?.bio && (
                  <p className="text-slate-600 text-sm max-w-2xl leading-relaxed">
                    {user.bio}
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-2 border-t border-slate-100">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    Joined {formatDate(user?.created_at)}
                  </span>
                  <span className="flex items-center gap-1 font-semibold text-primary-600 bg-primary-50 px-2.5 py-0.5 rounded-full">
                    <Sparkles className="w-3.5 h-3.5" />
                    Role: {user?.role}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Content Tabs */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
            {[
              { key: 'posts', label: 'Published Posts', icon: FileText },
              { key: 'drafts', label: 'Drafts', icon: Edit2 },
              { key: 'bookmarks', label: 'Saved Bookmarks', icon: Bookmark },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors whitespace-nowrap ${
                  activeTab === key
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          {loadingTab ? (
            <LoadingSpinner />
          ) : currentItems.length === 0 ? (
            <EmptyState
              icon={activeTab === 'bookmarks' ? 'bookmarks' : 'posts'}
              title={`No ${activeTab} found`}
              description={
                activeTab === 'posts'
                  ? "You haven't published any stories yet."
                  : activeTab === 'drafts'
                  ? 'No drafts currently saved.'
                  : "You haven't bookmarked any articles yet."
              }
              actionLabel={activeTab === 'bookmarks' ? 'Explore Articles' : 'Write Post'}
              actionTo={activeTab === 'bookmarks' ? '/explore' : '/create'}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentItems.map((p, idx) => (
                <BlogCard key={p.id} post={p} index={idx} />
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
