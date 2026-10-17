import type { ChatListEntry, HistoryMessage } from '@/shared/api/green-api'
import { formatPhone } from '@/shared/lib'
import { linkChatId, phoneToChatId, updateChat } from './notifications'
import type { Chat, Message } from './types'

const TEXT_TYPES = new Set(['textMessage', 'extendedTextMessage', 'quotedMessage'])

export function toMessage(item: HistoryMessage): Message | null {
  if (item.isDeleted || !TEXT_TYPES.has(item.typeMessage) || !item.textMessage) return null
  const base = { id: item.idMessage, text: item.textMessage, timestamp: item.timestamp * 1000 }
  if (item.type === 'incoming') return { ...base, direction: 'in' }
  const status = item.statusMessage === 'read' || item.statusMessage === 'delivered' ? item.statusMessage : 'sent'
  return { ...base, direction: 'out', status }
}

const isDefaultTitle = (chat: Chat) => chat.title === formatPhone(chat.phone) || chat.title === `+${chat.phone}`

export function importChats(chats: Chat[], entries: ChatListEntry[]): Chat[] {
  let result = chats
  for (const entry of entries) {
    if (entry.type !== 'user') continue
    const phone = entry.phoneNumber ? String(entry.phoneNumber) : ''
    const title = entry.name || entry.username || formatPhone(phone || entry.chatId)
    const existing = result.find((c) => c.chatIds.includes(entry.chatId) || (phone && c.phone === phone))

    if (existing) {
      result = linkChatId(result, existing.phone, entry.chatId)
      if (isDefaultTitle(existing)) result = updateChat(result, existing.phone, (c) => ({ ...c, title }))
      continue
    }

    const chatIds = phone ? [entry.chatId, phoneToChatId(phone)] : [entry.chatId]
    result = [...result, { phone: phone || entry.chatId, title, chatIds, messages: [], unread: 0 }]
  }
  return result
}

export function mergeHistory(chats: Chat[], phone: string, history: HistoryMessage[]): Chat[] {
  return updateChat(chats, phone, (chat) => {
    const known = new Set(chat.messages.map((m) => m.id))
    const loaded = history.map(toMessage).filter((m): m is Message => m !== null && !known.has(m.id))
    return {
      ...chat,
      historyLoaded: true,
      messages: [...loaded, ...chat.messages].sort((a, b) => a.timestamp - b.timestamp),
    }
  })
}

export const historyChatId = (chat: Chat) => chat.chatIds.find((id) => !id.endsWith('@c.us')) ?? chat.chatIds[0]
