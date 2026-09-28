import { useEffect, useState, useRef, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import {
  Bold, Italic, Underline as UnderlineIcon, List, ListOrdered,
  Quote, Code, Heading1, Heading2, Heading3, Link as LinkIcon,
  ImageIcon, Save, Send, X, Eye, EyeOff, ChevronDown,
} from 'lucide-react'
import { postsAPI, categoriesAPI, uploadAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { slugify } from '../../utils/slugify'
import DashboardLayout from '../../layouts/DashboardLayout'
import toast from 'react-hot-toast'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function ToolbarButton({ onClick, active, title, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-2 rounded-lg transition-colors ${
        active ? 'bg-primary-100 text-primary-700' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
      }`}
    >
      {children}
    </button>
  )
}

function EditorToolbar({ editor }) {
  if (!editor) return null

  const addLink = () => {
    const url = window.prompt('Enter URL:')
    if (url) editor.chain().focus().setLink({ href: url }).run()
  }

  const addImage = () => {
    const url = window.prompt('Enter image URL:')
    if (url) editor.chain().focus().setImage({ src: url }).run()
  }

  return (
    <div className="flex flex-wrap gap-1 p-2 border-b border-slate-200 bg-slate-50 rounded-t-xl">
      <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })} title="H1">
        <Heading1 className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="H2">
        <Heading2 className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="H3">
        <Heading3 className="w-4 h-4" />
      </ToolbarButton>
      <div className="w-px bg-slate-200 mx-1" />
      <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold">
        <Bold className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic">
        <Italic className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Underline">
        <UnderlineIcon className="w-4 h-4" />
      </ToolbarButton>
      <div className="w-px bg-slate-200 mx-1" />
      <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet List">
        <List className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Ordered List">
        <ListOrdered className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Blockquote">
        <Quote className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')} title="Code Block">
        <Code className="w-4 h-4" />
      </ToolbarButton>
      <div className="w-px bg-slate-200 mx-1" />
      <ToolbarButton onClick={addLink} active={editor.isActive('link')} title="Insert Link">
        <LinkIcon className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton onClick={addImage} title="Insert Image">
        <ImageIcon className="w-4 h-4" />
      </ToolbarButton>
    </div>
  )
}


export default function CreatePost({ editId }) {
  const navigate = useNavigate()
  const { id: paramId } = useParams()
  const postId = editId || paramId
  const isEdit = !!postId

  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [tags, setTags] = useState([])
  const [tagInput, setTagInput] = useState('')
  const [featuredImage, setFeaturedImage] = useState('')
  const [imagePreview, setImagePreview] = useState('')
  const [categories, setCategories] = useState([])
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [preview, setPreview] = useState(false)
  const [imageUploading, setImageUploading] = useState(false)
  const fileInputRef = useRef(null)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false }),
      Image,
      Placeholder.configure({ placeholder: 'Write your story here...' }),
    ],
    content: '',
  })

  useEffect(() => {
    categoriesAPI.getAll().then((res) => setCategories(res.data)).catch(() => {})
  }, [])

  useEffect(() => {
    if (isEdit && editor) {
      postsAPI
        .getAll({ per_page: 1 }) // This is wrong but we'd normally use getById
        .catch(() => {})

      // Fetch post by ID for editing
      // Since our API uses slug for public fetch, we'll use the my posts endpoint
      postsAPI.myPosts({}).then((res) => {
        const found = res.data.items.find((p) => String(p.id) === String(postId))
        if (found) {
          // Get full post
          postsAPI.getBySlug(found.slug).then((r) => {
            const p = r.data
            setTitle(p.title)
            setSlug(p.slug)
            setExcerpt(p.excerpt || '')
            setCategoryId(p.category?.id ? String(p.category.id) : '')
            setTags(p.tags?.map((t) => t.name) || [])
            setFeaturedImage(p.featured_image || '')
            setImagePreview(p.featured_image ? (p.featured_image.startsWith('http') ? p.featured_image : `${API_URL}${p.featured_image}`) : '')
            editor.commands.setContent(p.content)
          })
        }
      }).catch(() => {})
    }
  }, [isEdit, postId, editor])

  // Auto-generate slug from title
  useEffect(() => {
    if (!isEdit && title) {
      setSlug(slugify(title))
    }
  }, [title, isEdit])

  const addTag = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault()
      const newTag = tagInput.trim().toLowerCase()
      if (!tags.includes(newTag)) {
        setTags((prev) => [...prev, newTag])
      }
      setTagInput('')
    }
  }

  const removeTag = (tag) => setTags((prev) => prev.filter((t) => t !== tag))

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageUploading(true)
    try {
      const res = await uploadAPI.uploadImage(file)
      const url = res.data.url
      setFeaturedImage(url)
      setImagePreview(url.startsWith('http') ? url : `${API_URL}${url}`)
      toast.success('Image uploaded!')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Upload failed')
    } finally {
      setImageUploading(false)
    }
  }

  const getPostData = (statusOverride) => ({
    title,
    slug,
    excerpt,
    content: editor?.getHTML() || '',
    featured_image: featuredImage || null,
    category_id: categoryId ? Number(categoryId) : null,
    tags,
    status: statusOverride,
  })

  const handleSaveDraft = async () => {
    if (!title.trim()) { toast.error('Title is required'); return }
    if (!editor?.getText().trim()) { toast.error('Content is required'); return }
    setSaving(true)
    try {
      const data = getPostData('DRAFT')
      if (isEdit) {
        await postsAPI.update(postId, data)
        toast.success('Draft saved!')
      } else {
        const res = await postsAPI.create(data)
        toast.success('Draft saved!')
        navigate(`/edit/${res.data.id}`)
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handlePublish = async () => {
    if (!title.trim()) { toast.error('Title is required'); return }
    if (!editor?.getText().trim()) { toast.error('Content is required'); return }
    setPublishing(true)
    try {
      const data = getPostData('PUBLISHED')
      if (isEdit) {
        const res = await postsAPI.update(postId, data)
        await postsAPI.publish(postId)
        toast.success('Post published! 🎉')
        navigate(`/blog/${res.data.slug}`)
      } else {
        const res = await postsAPI.create(data)
        toast.success('Post published! 🎉')
        navigate(`/blog/${res.data.slug}`)
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to publish')
    } finally {
      setPublishing(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{isEdit ? 'Edit Post' : 'Create New Post'}</h1>
            <p className="text-slate-500 text-sm mt-1">Share your story with the world</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPreview(!preview)}
              className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              {preview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {preview ? 'Edit' : 'Preview'}
            </button>
            <button
              onClick={handleSaveDraft}
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Draft'}
            </button>
            <button
              onClick={handlePublish}
              disabled={publishing}
              className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-primary-600 to-secondary-500 text-white rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              <Send className="w-4 h-4" />
              {publishing ? 'Publishing...' : 'Publish'}
            </button>
          </div>
        </div>

        {preview ? (
          /* Preview Mode */
          <div className="bg-white rounded-2xl shadow-sm p-8">
            <h1 className="text-4xl font-black text-slate-900 mb-4">{title || 'Your Title Here'}</h1>
            {excerpt && <p className="text-slate-500 text-lg mb-8 italic">{excerpt}</p>}
            {imagePreview && (
              <img src={imagePreview} alt="Featured" className="w-full rounded-xl mb-8 max-h-96 object-cover" />
            )}
            <div
              className="blog-content text-slate-700"
              dangerouslySetInnerHTML={{ __html: editor?.getHTML() || '<p>Start writing to see preview...</p>' }}
            />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Title */}
            <div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Your amazing title..."
                className="w-full text-3xl font-bold border-0 border-b-2 border-slate-200 focus:border-primary-400 focus:outline-none bg-transparent pb-3 text-slate-800 placeholder:text-slate-300 transition-colors"
              />
            </div>

            {/* Slug */}
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Slug</label>
              <div className="flex items-center gap-2">
                <span className="text-slate-400 text-sm">/blog/</span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-primary-400 bg-slate-50 font-mono"
                />
              </div>
            </div>

            {/* Excerpt */}
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Short Excerpt</label>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Write a brief summary..."
                rows={2}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 resize-none"
              />
            </div>

            {/* Category + Tags row */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Category</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary-400 bg-white text-slate-700"
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Tags (press Enter to add)</label>
                <div className="flex flex-wrap gap-1.5 px-3 py-2 border border-slate-200 rounded-xl min-h-[46px] focus-within:border-primary-400 focus-within:ring-2 focus-within:ring-primary-100">
                  {tags.map((tag) => (
                    <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary-50 text-primary-700 text-xs rounded-full">
                      #{tag}
                      <button type="button" onClick={() => removeTag(tag)}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={addTag}
                    placeholder={tags.length === 0 ? 'python, react, tutorial...' : ''}
                    className="flex-1 min-w-[80px] text-xs outline-none bg-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Featured Image */}
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Featured Image</label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="relative border-2 border-dashed border-slate-200 rounded-xl overflow-hidden cursor-pointer hover:border-primary-400 transition-colors"
              >
                {imagePreview ? (
                  <div className="relative">
                    <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover" />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <p className="text-white text-sm font-medium">Click to change</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                    <ImageIcon className="w-8 h-8 mb-2" />
                    <p className="text-sm">{imageUploading ? 'Uploading...' : 'Click to upload image'}</p>
                    <p className="text-xs mt-1">JPG, PNG, WEBP up to 5MB</p>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>

            {/* Content Editor */}
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Content</label>
              <div className="border border-slate-200 rounded-xl overflow-hidden focus-within:border-primary-400 focus-within:ring-2 focus-within:ring-primary-100 transition-all">
                <EditorToolbar editor={editor} />
                <div className="p-4 min-h-[300px]">
                  <EditorContent editor={editor} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
