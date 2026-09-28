import { FileText, BookOpen, Search, PenTool } from 'lucide-react'
import { Link } from 'react-router-dom'

const iconMap = {
  posts: FileText,
  bookmarks: BookOpen,
  search: Search,
  write: PenTool,
}

export default function EmptyState({
  icon = 'posts',
  title = 'Nothing here yet',
  description = '',
  actionLabel,
  actionTo,
}) {
  const Icon = iconMap[icon] || FileText

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center mb-4">
        <Icon className="w-10 h-10 text-primary-400" />
      </div>
      <h3 className="text-xl font-semibold text-slate-700 mb-2">{title}</h3>
      {description && (
        <p className="text-slate-500 text-sm max-w-xs mb-6">{description}</p>
      )}
      {actionLabel && actionTo && (
        <Link
          to={actionTo}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-600 to-secondary-500 text-white rounded-xl font-medium text-sm hover:opacity-90 transition-opacity"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  )
}
