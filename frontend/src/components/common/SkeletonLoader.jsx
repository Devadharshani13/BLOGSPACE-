export function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
      <div className="h-48 bg-gray-200" />
      <div className="p-5">
        <div className="h-3 bg-gray-200 rounded w-1/3 mb-3" />
        <div className="h-5 bg-gray-200 rounded w-full mb-2" />
        <div className="h-5 bg-gray-200 rounded w-3/4 mb-3" />
        <div className="h-3 bg-gray-200 rounded w-full mb-2" />
        <div className="h-3 bg-gray-200 rounded w-2/3 mb-4" />
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-200 rounded-full" />
          <div className="h-3 bg-gray-200 rounded w-24" />
          <div className="ml-auto h-3 bg-gray-200 rounded w-16" />
        </div>
      </div>
    </div>
  )
}

export function PostDetailSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-1/4 mb-4" />
      <div className="h-10 bg-gray-200 rounded w-full mb-3" />
      <div className="h-10 bg-gray-200 rounded w-3/4 mb-6" />
      <div className="flex gap-4 mb-8">
        <div className="w-10 h-10 bg-gray-200 rounded-full" />
        <div>
          <div className="h-4 bg-gray-200 rounded w-32 mb-2" />
          <div className="h-3 bg-gray-200 rounded w-24" />
        </div>
      </div>
      <div className="h-80 bg-gray-200 rounded-2xl mb-8" />
      {[...Array(5)].map((_, i) => (
        <div key={i} className="mb-4">
          <div className="h-4 bg-gray-200 rounded w-full mb-2" />
          <div className="h-4 bg-gray-200 rounded w-5/6" />
        </div>
      ))}
    </div>
  )
}

export function ProfileSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-48 bg-gray-200 rounded-2xl mb-6" />
      <div className="flex items-end gap-6 -mt-16 px-6 mb-6">
        <div className="w-28 h-28 bg-gray-300 rounded-full border-4 border-white" />
        <div className="pb-2">
          <div className="h-6 bg-gray-200 rounded w-40 mb-2" />
          <div className="h-4 bg-gray-200 rounded w-24" />
        </div>
      </div>
    </div>
  )
}

export default function LoadingSpinner({ size = 'md' }) {
  const sizes = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' }
  return (
    <div className="flex items-center justify-center p-8">
      <div
        className={`${sizes[size]} border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin`}
      />
    </div>
  )
}
