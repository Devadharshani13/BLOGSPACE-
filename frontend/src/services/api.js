import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('blogspace_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle 401 — clear auth and redirect to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('blogspace_token')
      localStorage.removeItem('blogspace_user')
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  }
)

export const authAPI = {
  register: (data) => api.post('/api/auth/register', data),
  login: (data) => api.post('/api/auth/login', data),
  logout: () => api.post('/api/auth/logout'),
  me: () => api.get('/api/auth/me'),
}

export const usersAPI = {
  getById: (id) => api.get(`/api/users/${id}`),
  getStats: () => api.get('/api/users/me/stats'),
  updateProfile: (data) => api.put('/api/users/profile', data),
}

export const postsAPI = {
  getAll: (params) => api.get('/api/posts', { params }),
  getBySlug: (slug) => api.get(`/api/posts/${slug}`),
  create: (data) => api.post('/api/posts', data),
  update: (id, data) => api.put(`/api/posts/${id}`, data),
  delete: (id) => api.delete(`/api/posts/${id}`),
  publish: (id) => api.post(`/api/posts/${id}/publish`),
  unpublish: (id) => api.post(`/api/posts/${id}/unpublish`),
  myPosts: (params) => api.get('/api/posts/me/posts', { params }),
}

export const categoriesAPI = {
  getAll: () => api.get('/api/categories'),
  create: (data) => api.post('/api/categories', data),
  update: (id, data) => api.put(`/api/categories/${id}`, data),
  delete: (id) => api.delete(`/api/categories/${id}`),
}

export const tagsAPI = {
  getAll: () => api.get('/api/tags'),
  create: (data) => api.post('/api/tags', data),
}

export const likesAPI = {
  like: (postId) => api.post(`/api/posts/${postId}/like`),
  unlike: (postId) => api.delete(`/api/posts/${postId}/like`),
  getLikes: (postId) => api.get(`/api/posts/${postId}/likes`),
}

export const bookmarksAPI = {
  bookmark: (postId) => api.post(`/api/posts/${postId}/bookmark`),
  removeBookmark: (postId) => api.delete(`/api/posts/${postId}/bookmark`),
  getBookmarks: (params) => api.get('/api/bookmarks', { params }),
}

export const commentsAPI = {
  getComments: (postId) => api.get(`/api/posts/${postId}/comments`),
  addComment: (postId, data) => api.post(`/api/posts/${postId}/comments`, data),
  deleteComment: (commentId) => api.delete(`/api/comments/${commentId}`),
}

export const uploadAPI = {
  uploadImage: (file) => {
    const fd = new FormData()
    fd.append('file', file)
    return api.post('/api/upload/image', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}

export const adminAPI = {
  getStats: () => api.get('/api/admin/stats'),
  getUsers: (params) => api.get('/api/admin/users', { params }),
  updateUser: (id, data) => api.put(`/api/admin/users/${id}`, data),
  getPosts: (params) => api.get('/api/admin/posts', { params }),
  deletePost: (id) => api.delete(`/api/admin/posts/${id}`),
  getComments: (params) => api.get('/api/admin/comments', { params }),
  deleteComment: (id) => api.delete(`/api/admin/comments/${id}`),
}

export default api
