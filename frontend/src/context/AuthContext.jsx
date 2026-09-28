import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  // Restore auth state on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('blogspace_token')
    const savedUser = localStorage.getItem('blogspace_user')
    if (savedToken && savedUser) {
      setToken(savedToken)
      try {
        setUser(JSON.parse(savedUser))
      } catch {}
      // Verify token is still valid
      authAPI
        .me()
        .then((res) => {
          setUser(res.data)
          localStorage.setItem('blogspace_user', JSON.stringify(res.data))
        })
        .catch(() => {
          localStorage.removeItem('blogspace_token')
          localStorage.removeItem('blogspace_user')
          setToken(null)
          setUser(null)
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = (accessToken, userData) => {
    setToken(accessToken)
    setUser(userData)
    localStorage.setItem('blogspace_token', accessToken)
    localStorage.setItem('blogspace_user', JSON.stringify(userData))
  }

  const logout = () => {
    authAPI.logout().catch(() => {})
    setToken(null)
    setUser(null)
    localStorage.removeItem('blogspace_token')
    localStorage.removeItem('blogspace_user')
  }

  const updateUser = (userData) => {
    setUser(userData)
    localStorage.setItem('blogspace_user', JSON.stringify(userData))
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        updateUser,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'ADMIN',
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
