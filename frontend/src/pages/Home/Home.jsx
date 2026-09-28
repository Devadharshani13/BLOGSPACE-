import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, PenLine, TrendingUp, Zap, BookOpen, Users, Star } from 'lucide-react'
import { postsAPI, categoriesAPI } from '../../services/api'
import BlogCard from '../../components/BlogCard/BlogCard'
import { CardSkeleton } from '../../components/common/SkeletonLoader'
import MainLayout from '../../layouts/MainLayout'

const CATEGORY_ICONS = {
  Technology: '💻', 'Artificial Intelligence': '🤖', Programming: '⌨️',
  'Web Development': '🌐', Cybersecurity: '🔒', Education: '📚',
  Career: '📈', Travel: '✈️', Lifestyle: '🌿',
}
const CATEGORY_COLORS = {
  Technology: 'from-blue-500 to-cyan-500',
  'Artificial Intelligence': 'from-purple-500 to-pink-500',
  Programming: 'from-green-500 to-emerald-500',
  'Web Development': 'from-indigo-500 to-blue-500',
  Cybersecurity: 'from-red-500 to-orange-500',
  Education: 'from-yellow-500 to-amber-500',
  Career: 'from-orange-500 to-red-500',
  Travel: 'from-teal-500 to-green-500',
  Lifestyle: 'from-pink-500 to-rose-500',
}

function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-600 text-white">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-secondary-400 rounded-full blur-3xl" />
      </div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 text-sm mb-6 backdrop-blur-sm">
              <Star className="w-4 h-4 text-yellow-300" />
              <span>The best place to read & write</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight mb-6">
              Discover.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-pink-300">
                Write.
              </span>{' '}
              Share.
            </h1>
            <p className="text-lg text-white/80 leading-relaxed mb-8 max-w-md">
              Explore ideas, stories, tutorials and perspectives from a growing community of writers.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/explore"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary-700 font-semibold rounded-2xl hover:bg-white/90 transition-colors shadow-lg"
              >
                Explore Blogs <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 text-white font-semibold rounded-2xl border border-white/20 hover:bg-white/20 transition-colors backdrop-blur-sm"
              >
                <PenLine className="w-4 h-4" /> Start Writing
              </Link>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 mt-10 pt-8 border-t border-white/20">
              {[
                { label: 'Stories', value: '10K+' },
                { label: 'Writers', value: '5K+' },
                { label: 'Categories', value: '50+' },
                { label: 'Readers', value: '100K+' },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-2xl font-black">{stat.value}</p>
                  <p className="text-white/60 text-sm">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Decorative cards */}
          <div className="hidden lg:grid grid-cols-2 gap-4">
            {[
              { title: 'The Future of AI', category: 'Artificial Intelligence', color: 'from-purple-400 to-pink-400' },
              { title: 'FastAPI Guide', category: 'Programming', color: 'from-green-400 to-teal-400' },
              { title: 'Travel: Himalayas', category: 'Travel', color: 'from-teal-400 to-blue-400' },
              { title: 'Mindful Living', category: 'Lifestyle', color: 'from-pink-400 to-rose-400' },
            ].map((card, i) => (
              <div
                key={i}
                className={`bg-gradient-to-br ${card.color} rounded-2xl p-4 text-white ${i === 1 ? 'translate-y-4' : ''}`}
              >
                <span className="text-xs font-medium bg-white/20 rounded-full px-2 py-1">{card.category}</span>
                <p className="font-semibold text-sm mt-2 leading-snug">{card.title}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function SectionHeader({ title, subtitle, viewAllTo }) {
  return (
    <div className="flex items-end justify-between mb-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
        {subtitle && <p className="text-slate-500 text-sm mt-1">{subtitle}</p>}
      </div>
      {viewAllTo && (
        <Link
          to={viewAllTo}
          className="inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700"
        >
          View all <ArrowRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  )
}

export default function Home() {
  const [featured, setFeatured] = useState([])
  const [latest, setLatest] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    document.title = 'BlogSpace — Discover. Write. Share.'
    Promise.all([
      postsAPI.getAll({ sort_by: 'popular', per_page: 6 }),
      postsAPI.getAll({ sort_by: 'newest', per_page: 6 }),
      categoriesAPI.getAll(),
    ])
      .then(([pop, newest, cats]) => {
        setFeatured(pop.data.items)
        setLatest(newest.data.items)
        setCategories(cats.data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <MainLayout>
      <HeroSection />

      {/* Featured Posts */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <SectionHeader
          title="Featured Posts"
          subtitle="Handpicked stories from our community"
          viewAllTo="/explore?sort_by=popular"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading
            ? [...Array(6)].map((_, i) => <CardSkeleton key={i} />)
            : featured.map((post, i) => <BlogCard key={post.id} post={post} index={i} />)}
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeader title="Explore Categories" subtitle="Dive into topics that interest you" viewAllTo="/categories" />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/explore?category=${cat.slug}`}
                  className="group flex flex-col items-center p-5 rounded-2xl bg-slate-50 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${CATEGORY_COLORS[cat.name] || 'from-slate-400 to-slate-500'} flex items-center justify-center text-2xl mb-3`}>
                    {CATEGORY_ICONS[cat.name] || '📝'}
                  </div>
                  <p className="font-semibold text-slate-800 text-sm text-center leading-tight">{cat.name}</p>
                  <p className="text-slate-400 text-xs mt-1">{cat.post_count} posts</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Latest Posts */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <SectionHeader
          title="Latest Stories"
          subtitle="Fresh content from our writers"
          viewAllTo="/explore"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading
            ? [...Array(6)].map((_, i) => <CardSkeleton key={i} />)
            : latest.map((post, i) => <BlogCard key={post.id} post={post} index={i + 3} />)}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-gradient-to-r from-primary-600 to-secondary-500 py-16">
        <div className="max-w-3xl mx-auto px-4 text-center text-white">
          <PenLine className="w-12 h-12 mx-auto mb-4 opacity-80" />
          <h2 className="text-3xl font-black mb-4">Ready to share your story?</h2>
          <p className="text-white/80 mb-8">
            Join thousands of writers who are already sharing their knowledge and experiences on BlogSpace.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-8 py-3 bg-white text-primary-700 font-bold rounded-2xl hover:bg-white/90 transition-colors shadow-lg"
          >
            Start Writing Today <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </MainLayout>
  )
}
