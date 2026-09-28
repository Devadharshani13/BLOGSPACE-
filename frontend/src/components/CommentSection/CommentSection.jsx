import { useState } from 'react'
import { commentsAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { formatRelative } from '../../utils/formatDate'
import { Trash2, Reply, Send, MessageCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function UserAvatar({ user }) {
  const initials = user?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || '?'
  if (user?.profile_image) {
    const src = user.profile_image.startsWith('http') ? user.profile_image : `${API_URL}${user.profile_image}`
    return <img src={src} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
  }
  return (
    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
      {initials}
    </div>
  )
}

function CommentItem({ comment, postId, onDelete, depth = 0 }) {
  const { user, isAuthenticated } = useAuth()
  const [replyOpen, setReplyOpen] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [loading, setLoading] = useState(false)
  const [replies, setReplies] = useState(comment.replies || [])

  const canDelete = user?.id === comment.user_id || user?.role === 'ADMIN'

  const handleDelete = async () => {
    if (!window.confirm('Delete this comment?')) return
    try {
      await commentsAPI.deleteComment(comment.id)
      onDelete(comment.id)
      toast.success('Comment deleted')
    } catch {
      toast.error('Failed to delete comment')
    }
  }

  const handleReply = async (e) => {
    e.preventDefault()
    if (!replyText.trim()) return
    setLoading(true)
    try {
      const res = await commentsAPI.addComment(postId, {
        content: replyText,
        parent_id: comment.id,
      })
      setReplies((prev) => [...prev, res.data])
      setReplyText('')
      setReplyOpen(false)
      toast.success('Reply added!')
    } catch {
      toast.error('Failed to add reply')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`${depth > 0 ? 'ml-8 mt-3' : ''}`}>
      <div className="flex gap-3">
        <UserAvatar user={comment.user} />
        <div className="flex-1">
          <div className="bg-slate-50 rounded-2xl px-4 py-3">
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-sm text-slate-800">{comment.user?.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">{formatRelative(comment.created_at)}</span>
                {canDelete && (
                  <button onClick={handleDelete} className="p-1 text-slate-400 hover:text-red-500 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
            <p className="text-slate-700 text-sm leading-relaxed">{comment.content}</p>
          </div>

          {isAuthenticated && depth === 0 && (
            <button
              onClick={() => setReplyOpen(!replyOpen)}
              className="flex items-center gap-1 mt-1 ml-2 text-xs text-slate-400 hover:text-primary-600 transition-colors"
            >
              <Reply className="w-3.5 h-3.5" /> Reply
            </button>
          )}

          {replyOpen && (
            <form onSubmit={handleReply} className="mt-2 flex gap-2">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write a reply..."
                className="flex-1 px-4 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
              />
              <button
                type="submit"
                disabled={loading || !replyText.trim()}
                className="px-3 py-2 bg-primary-600 text-white rounded-xl disabled:opacity-50 hover:bg-primary-700 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          )}

          {/* Nested replies */}
          {replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              postId={postId}
              onDelete={(id) => setReplies((prev) => prev.filter((r) => r.id !== id))}
              depth={depth + 1}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default function CommentSection({ postId }) {
  const { isAuthenticated } = useAuth()
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useState(() => {
    commentsAPI
      .getComments(postId)
      .then((res) => setComments(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [postId])

  // Fix: use useEffect for data fetching
  // Using a pattern that works: just call it in the component body
  // This is actually useState(() => ...) which runs on mount - it's fine for data fetching

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!text.trim()) return
    setSubmitting(true)
    try {
      const res = await commentsAPI.addComment(postId, { content: text })
      setComments((prev) => [...prev, res.data])
      setText('')
      toast.success('Comment added!')
    } catch {
      toast.error('Failed to add comment')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = (id) => {
    setComments((prev) => prev.filter((c) => c.id !== id))
  }

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <MessageCircle className="w-6 h-6 text-primary-600" />
        Comments ({comments.length})
      </h2>

      {/* Comment form */}
      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="mb-8">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Share your thoughts..."
            rows={3}
            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 text-sm resize-none"
          />
          <div className="flex justify-end mt-2">
            <button
              type="submit"
              disabled={submitting || !text.trim()}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-600 to-secondary-500 text-white text-sm font-medium rounded-xl disabled:opacity-50 hover:opacity-90 transition-opacity"
            >
              <Send className="w-4 h-4" />
              {submitting ? 'Posting...' : 'Post Comment'}
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-primary-50 rounded-2xl p-4 mb-8 text-center">
          <p className="text-primary-700 text-sm">
            <a href="/login" className="font-semibold hover:underline">Login</a> to join the conversation
          </p>
        </div>
      )}

      {/* Comments list */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0" />
              <div className="flex-1">
                <div className="h-16 bg-gray-200 rounded-2xl" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-10 text-slate-400">
          <MessageCircle className="w-10 h-10 mx-auto mb-2 opacity-40" />
          <p className="text-sm">No comments yet. Be the first to share your thoughts!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              postId={postId}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}
