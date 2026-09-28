import { useEffect, useState, useCallback } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react'
import { postsAPI, categoriesAPI } from '../../services/api'
import BlogCard from '../../components/BlogCard/BlogCard'
import { CardSkeleton } from '../../components/common/SkeletonLoader'
import EmptyState from '../../components/common/EmptyState'
import MainLayout from '../../layouts/MainLayout'
import { useDebounce } from '../../hooks/useDebounce'

export default function Explore() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [posts, setPosts] = useState([])
  const [categories, setCategories] = useState([])
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [loading, setLoading] = useState(true)

  const searchQuery = searchParams.get('search') || ''
  const category = searchParams.get('category') || ''
  const sortBy = searchParams.get('sort_by') || 'newest'
  const page = parseInt(searchParams.get('page') || '1', 10)

  const [inputValue, setInputValue] = useState(searchQuery)
  const debouncedSearch = useDebounce(inputValue, 500)

  useEffect(() => {
    document.title = 'Explore — BlogSpace'
    categoriesAPI.getAll().then((res) => setCategories(res.data)).catch(() => {})
  }, [])

  useEffect(() => {
    const params = {}
    if (debouncedSearch) params.search = debouncedSearch
    const newParams = new URLSearchParams(searchParams)
    if (debouncedSearch) {
      newParams.set('search', debouncedSearch)
      newParams.set('page', '1')
    } else {
      newParams.delete('search')
    }
    setSearchParams(newParams, { replace: true })
  }, [debouncedSearch])

  useEffect(() => {
    setLoading(true)
    const params = {
      per_page: 12,
      page,
      sort_by: sortBy,
    }
    if (searchQuery) params.search = searchQuery
    if (category) params.category = category

    postsAPI
      .getAll(params)
      .then((res) => {
        setPosts(res.data.items)
        setTotal(res.data.total)
        setPages(res.data.pages)
      })
      .catch(() => setPosts([]))
      .finally(() => setLoading(false))
  }, [searchQuery, category, sortBy, page])

  const updateParam = (key, value) => {
    const newParams = new URLSearchParams(searchParams)
    if (value) newParams.set(key, value)
    else newParams.delete(key)
    newParams.set('page', '1')
    setSearchParams(newParams)
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-800 mb-2">Explore Stories</h1>
          <p className="text-slate-500">Discover ideas, tutorials, and perspectives</p>
        </div>

        {/* Search + Filters */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 mb-8">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search blogs, authors..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
              />
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => updateParam('sort_by', e.target.value)}
              className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary-400 bg-white text-slate-700"
            >
              <option value="newest">Newest First</option>
              <option value="popular">Most Popular</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>

          {/* Category Tabs */}
          {categories.length > 0 && (
            <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => updateParam('category', '')}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  !category ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => updateParam('category', cat.slug)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    category === cat.slug ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Results count */}
        {!loading && (
          <p className="text-sm text-slate-500 mb-4">
            {total > 0 ? `${total} post${total !== 1 ? 's' : ''} found` : 'No posts found'}
          </p>
        )}

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {loading
            ? [...Array(12)].map((_, i) => <CardSkeleton key={i} />)
            : posts.map((post, i) => <BlogCard key={post.id} post={post} index={i} />)}
        </div>

        {/* Empty */}
        {!loading && posts.length === 0 && (
          <EmptyState
            icon="search"
            title="No blogs found"
            description={searchQuery ? `No results for "${searchQuery}". Try different keywords.` : 'No posts in this category yet.'}
          />
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => updateParam('page', String(page - 1))}
              className="p-2 rounded-xl border border-slate-200 disabled:opacity-40 hover:bg-slate-50 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {[...Array(Math.min(pages, 7))].map((_, i) => {
              const p = i + 1
              return (
                <button
                  key={p}
                  onClick={() => updateParam('page', String(p))}
                  className={`w-9 h-9 rounded-xl text-sm font-medium transition-colors ${
                    p === page ? 'bg-primary-600 text-white' : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {p}
                </button>
              )
            })}
            <button
              disabled={page >= pages}
              onClick={() => updateParam('page', String(page + 1))}
              className="p-2 rounded-xl border border-slate-200 disabled:opacity-40 hover:bg-slate-50 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </MainLayout>
  )
}
