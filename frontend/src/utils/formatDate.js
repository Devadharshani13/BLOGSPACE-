import { format, formatDistanceToNow, parseISO } from 'date-fns'

export function formatDate(dateStr) {
  if (!dateStr) return ''
  const date = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr
  return format(date, 'MMM d, yyyy')
}

export function formatRelative(dateStr) {
  if (!dateStr) return ''
  const date = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr
  return formatDistanceToNow(date, { addSuffix: true })
}

export function formatFull(dateStr) {
  if (!dateStr) return ''
  const date = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr
  return format(date, 'MMMM d, yyyy')
}
