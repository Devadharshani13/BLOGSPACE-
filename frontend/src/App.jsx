import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home/Home'
import Explore from './pages/Explore/Explore'
import BlogDetails from './pages/BlogDetails/BlogDetails'
import AuthorProfile from './pages/AuthorProfile/AuthorProfile'
import Categories from './pages/Categories/Categories'
import About from './pages/About/About'
import Login from './pages/Login/Login'
import Register from './pages/Register/Register'
import Dashboard from './pages/Dashboard/Dashboard'
import ManagePosts from './pages/ManagePosts/ManagePosts'
import CreatePost from './pages/CreatePost/CreatePost'
import EditPost from './pages/EditPost/EditPost'
import Bookmarks from './pages/Bookmarks/Bookmarks'
import Profile from './pages/Profile/Profile'
import AdminDashboard from './pages/Admin/AdminDashboard'
import AdminUsers from './pages/Admin/AdminUsers'
import AdminPosts from './pages/Admin/AdminPosts'
import AdminComments from './pages/Admin/AdminComments'
import ProtectedRoute from './components/common/ProtectedRoute'
import AdminRoute from './components/common/AdminRoute'

export default function App() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<Home />} />
      <Route path="/explore" element={<Explore />} />
      <Route path="/blog/:slug" element={<BlogDetails />} />
      <Route path="/author/:id" element={<AuthorProfile />} />
      <Route path="/categories" element={<Categories />} />
      <Route path="/about" element={<About />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Authenticated User Pages */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/posts"
        element={
          <ProtectedRoute>
            <ManagePosts />
          </ProtectedRoute>
        }
      />
      <Route
        path="/create"
        element={
          <ProtectedRoute>
            <CreatePost />
          </ProtectedRoute>
        }
      />
      <Route
        path="/edit/:id"
        element={
          <ProtectedRoute>
            <EditPost />
          </ProtectedRoute>
        }
      />
      <Route
        path="/bookmarks"
        element={
          <ProtectedRoute>
            <Bookmarks />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      {/* Admin Pages */}
      <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
      <Route
        path="/admin/dashboard"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <AdminRoute>
            <AdminUsers />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/posts"
        element={
          <AdminRoute>
            <AdminPosts />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/comments"
        element={
          <AdminRoute>
            <AdminComments />
          </AdminRoute>
        }
      />

      {/* 404 Catch-All */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
