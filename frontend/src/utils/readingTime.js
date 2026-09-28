export function calculateReadingTime(content) {
  if (!content) return 1
  // Strip HTML tags
  const text = content.replace(/<[^>]+>/g, '')
  const words = text.trim().split(/\s+/).length
  return Math.max(1, Math.round(words / 200))
}
