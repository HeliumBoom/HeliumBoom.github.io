/** @param {Date | string} value */
export function shanghaiDate(value) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit'
  }).format(new Date(value))
}

/**
 * Match the original site's day-based publication policy in every public index.
 * @param {{ date?: Date | string, draft?: boolean }} data
 * @param {Date} now
 */
export function isPublished(data, now = new Date()) {
  if (data.draft || !data.date) return false
  const date = new Date(data.date)
  return Number.isFinite(date.getTime()) && shanghaiDate(date) <= shanghaiDate(now)
}
