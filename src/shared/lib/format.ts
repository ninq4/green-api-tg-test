export function formatTime(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
}

export function formatChatTime(timestamp: number) {
  const date = new Date(timestamp)
  const isToday = date.toDateString() === new Date().toDateString()
  return isToday ? formatTime(timestamp) : date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })
}

export function formatDay(timestamp: number) {
  return new Date(timestamp).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
}
