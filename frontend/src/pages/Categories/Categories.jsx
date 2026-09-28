import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Layers, ArrowRight } from 'lucide-react'
import { categoriesAPI } from '../../services/api'
import MainLayout from '../../layouts/MainLayout'
import LoadingSpinner from '../../components/common/SkeletonLoader'

const CATEGORY_META = {
  Technology: {
    icon: '💻',
    color: 'from-blue-500 to-cyan-500',
    bg: 'bg-blue-50',
    border: 'border-blue-100',
  },
  'Artificial Intelligence': {
    icon: '🤖',
    color: 'from-purple-500 to-pink-500',
    bg: 'bg-purple-50',
    border: 'border-purple-100',
  },
  Programming: {
    icon: '⌨️',
    color: 'from-green-500 to-emerald-500',
    bg: 'bg-green-50',
    border: 'border-green-100',
  },
  'Web Development': {
    icon: '🌐',
    color: 'from-indigo-500 to-blue-500',
    bg: 'bg-indigo-50',
    border: 'border-indigo-100',
  },
  Cybersecurity: {
    icon: '🔒',
    color: 'from-red-500 to-orange-500',
    bg: 'bg-red-50',
    border: 'border-red-100',
  },
  Education: {
    icon: '📚',
    color: 'from-yellow-500 to-amber-500',
    bg: 'bg-yellow-50',
    border: 'border-yellow-100',
  },
  Career: {
    icon: '📈',
    color: 'from-orange-500 to-red-500',
    bg: 'bg-orange-50',
    border: 'border-orange-100',
  },
  Travel: {
    icon: '✈️',
    color: 'from-teal-500 to-green-500',
    bg: 'bg-teal-50',
    border: 'border-teal-100',
  },
  Lifestyle: {
    icon: '🌿',
    color: 'from-pink-500 to-rose-500',
    bg: 'bg-pink-50',
    border: 'border-pink-100',
  },
}

export default function Categories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    document.title = 'Categories — BlogSpace'
    categoriesAPI
      .getAll()
      .then((res) => setCategories(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-50 text-primary-600 text-xs font-bold uppercase tracking-wider mb-3">
            <Layers className="w-3.5 h-3.5" />
            Browse Topics
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            Explore by Category
          </h1>
          <p className="text-slate-500 mt-2 text-base">
            Find the stories, guides, and perspectives that matter most to you
          </p>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat) => {
              const meta = CATEGORY_META[cat.name] || {
                icon: '📝',
                color: 'from-slate-500 to-slate-700',
                bg: 'bg-slate-50',
                border: 'border-slate-200',
              }

              return (
                <Link
                  key={cat.id}
                  to={`/explore?category=${cat.slug}`}
                  className={`group bg-white p-7 rounded-3xl border ${meta.border} shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <div
                        className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${meta.color} flex items-center justify-center text-3xl shadow-sm group-hover:scale-110 transition-transform`}
                      >
                        {meta.icon}
                      </div>
                      <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                        {cat.post_count} {cat.post_count === 1 ? 'post' : 'posts'}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-primary-600 transition-colors mb-2">
                      {cat.name}
                    </h3>
                    <p className="text-slate-500 text-sm leading-relaxed line-clamp-3">
                      {cat.description ||
                        `Explore trending stories, insightful opinions, and in-depth articles on ${cat.name}.`}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs font-bold text-primary-600 mt-6 group-hover:translate-x-1 transition-transform">
                    Explore topic <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </MainLayout>
  )
}
