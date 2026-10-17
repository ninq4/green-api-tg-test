import { extractText, type NotificationBody, type OutgoingStatus } from '@/shared/api/green-api'
import { formatPhone } from '@/shared/lib'
import type { Chat, Message, MessageStatus } from './types'

export const phoneToChatId = (phone: string) => `${phone}@c.us`

export const chatPhone = (chat: Chat) => (chat.chatIds.includes(phoneToChatId(chat.phone)) ? chat.phone : null)

export function createChat(phone: string, title = formatPhone(phone), chatId = phoneToChatId(phone)): Chat {
  return { phone, title, chatIds: [chatId], messages: [], unread: 0 }
}

export const updateChat = (chats: Chat[], phone: string, update: (chat: Chat) => Chat) =>
  chats.map((chat) => (chat.phone === phone ? update(chat) : chat))

export const hasMessage = (chat: Chat, id: string) => chat.messages.some((m) => m.id === id)

const addChatId = (chat: Chat, chatId: string): Chat =>
  chat.chatIds.includes(chatId) ? chat : { ...chat, chatIds: [...chat.chatIds, chatId] }

export function linkChatId(chats: Chat[], phone: string, chatId: string): Chat[] {
  const target = chats.find((c) => c.phone === phone)
  if (!target) return chats
  const duplicate = chats.find((c) => c.phone !== phone && c.chatIds.includes(chatId))
  if (!duplicate) return target.chatIds.includes(chatId) ? chats : updateChat(chats, phone, (c) => addChatId(c, chatId))

  const known = new Set(target.chatIds)
  const ids = new Set(target.messages.map((m) => m.id))
  const merged: Chat = {
    ...target,
    chatIds: [...target.chatIds, ...duplicate.chatIds.filter((id) => !known.has(id))],
    messages: [...target.messages, ...duplicate.messages.filter((m) => !ids.has(m.id))].sort(
      (a, b) => a.timestamp - b.timestamp,
    ),
    unread: target.unread + duplicate.unread,
  }
  return chats.filter((c) => c !== duplicate).map((c) => (c === target ? merged : c))
}

const STATUS_RANK: Record<MessageStatus, number> = { sending: 0, failed: 1, sent: 2, delivered: 3, read: 4 }

const canChangeStatus = (current: MessageStatus, next: MessageStatus) =>
  next === 'failed' ? STATUS_RANK[current] < STATUS_RANK.delivered : STATUS_RANK[next] > STATUS_RANK[current]

export function toMessageStatus(status: OutgoingStatus): MessageStatus {
  return status === 'sent' || status === 'delivered' || status === 'read' ? status : 'failed'
}

export function applyMessageStatus(chats: Chat[], idMessage: string, status: MessageStatus): Chat[] {
  const chat = chats.find((c) => hasMessage(c, idMessage))
  if (!chat) return chats
  return updateChat(chats, chat.phone, (c) => ({
    ...c,
    messages: c.messages.map((m) =>
      m.id === idMessage && canChangeStatus(m.status ?? 'sending', status) ? { ...m, status } : m,
    ),
  }))
}

export function applyNotification(chats: Chat[], activePhone: string | null, body: NotificationBody): Chat[] {
  const { typeWebhook, senderData, idMessage } = body
  if (typeWebhook === 'outgoingMessageStatus') {
    return idMessage && body.status ? applyMessageStatus(chats, idMessage, toMessageStatus(body.status)) : chats
  }
  if (!senderData || !idMessage) return chats

  const text = extractText(body.messageData)
  if (text === null) return chats

  const { chatId } = senderData
  if (chatId.startsWith('-') || chatId.endsWith('@g.us')) return chats

  const timestamp = body.timestamp ? body.timestamp * 1000 : Date.now()

  if (typeWebhook === 'incomingMessageReceived') {
    const phone = senderData.senderPhoneNumber ? String(senderData.senderPhoneNumber) : ''
    const existing = chats.find((c) => c.chatIds.includes(chatId) || (phone && c.phone === phone))
    if (existing && hasMessage(existing, idMessage)) return chats

    const message: Message = { id: idMessage, text, timestamp, direction: 'in' }
    const unread = (chat: Chat) => (chat.phone === activePhone ? 0 : chat.unread + 1)

    if (existing) {
      return updateChat(chats, existing.phone, (chat) => ({
        ...addChatId(chat, chatId),
        messages: [...chat.messages, message],
        unread: unread(chat),
      }))
    }

    const title =
      senderData.senderContactName || senderData.senderName || senderData.chatName || formatPhone(phone || chatId)
    const chat = createChat(phone || chatId, title, chatId)
    return [...chats, { ...chat, messages: [message], unread: unread(chat) }]
  }

  if (typeWebhook === 'outgoingAPIMessageReceived' || typeWebhook === 'outgoingMessageReceived') {
    const owner = chats.find((c) => hasMessage(c, idMessage))
    if (owner) return linkChatId(chats, owner.phone, chatId)

    const chat = chats.find((c) => c.chatIds.includes(chatId))
    if (!chat) return chats
    const message: Message = { id: idMessage, text, timestamp, direction: 'out', status: 'sent' }
    return updateChat(chats, chat.phone, (c) => ({ ...c, messages: [...c.messages, message] }))
  }

  return chats
}
