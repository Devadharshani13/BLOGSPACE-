import { Link } from 'react-router-dom'
import { PenLine, Compass, Users2, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react'
import MainLayout from '../../layouts/MainLayout'

export default function About() {
  return (
    <MainLayout>
      <div className="space-y-16 py-12">
        {/* Hero */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-primary-50 text-primary-700 text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Our Mission
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Where ideas ignite conversations and stories find their voice.
          </h1>
          <p className="text-slate-600 text-lg sm:text-xl mt-6 leading-relaxed max-w-2xl mx-auto">
            BlogSpace is a modern blogging ecosystem built to empower creators, developers,
            thinkers, and curious minds to discover, write, and share meaningful perspectives.
          </p>
          <div className="flex justify-center gap-4 mt-8">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-secondary-500 text-white font-bold rounded-2xl shadow-lg hover:opacity-95 transition-opacity"
            >
              Join the Community <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/explore"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-slate-700 font-bold rounded-2xl border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm"
            >
              Read Stories
            </Link>
          </div>
        </section>

        {/* Pillars / Values */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-primary-600 flex items-center justify-center mb-5">
                <PenLine className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Write with Clarity</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Enjoy a distraction-free rich text editor powered by modern standards. Format code,
                embed images, and format your thoughts with precision.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-secondary-600 flex items-center justify-center mb-5">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Discover Seamlessly</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Explore deep dives in Technology, Artificial Intelligence, Web Development,
                Lifestyle, and more with instant full-text search and curated tags.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-5">
                <Users2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Connect & Engage</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Engage in authentic discussions via nested comments, bookmark your favorite reads,
                and support writers with likes and interactions.
              </p>
            </div>
          </div>
        </section>

        {/* Platform Stats */}
        <section className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-black mb-10">
              Built for Scale. Engineered for Performance.
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div>
                <p className="text-4xl sm:text-5xl font-black text-primary-400">100%</p>
                <p className="text-slate-400 text-sm mt-2">Open Source Core</p>
              </div>
              <div>
                <p className="text-4xl sm:text-5xl font-black text-secondary-400">FastAPI</p>
                <p className="text-slate-400 text-sm mt-2">High-Speed Backend</p>
              </div>
              <div>
                <p className="text-4xl sm:text-5xl font-black text-emerald-400">PostgreSQL</p>
                <p className="text-slate-400 text-sm mt-2">Rock-Solid Persistence</p>
              </div>
              <div>
                <p className="text-4xl sm:text-5xl font-black text-amber-400">React + Vite</p>
                <p className="text-slate-400 text-sm mt-2">Lightning Fast UI</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  )
}
