import { useMemo } from 'react'
import { create } from 'zustand'
import type { ChatListEntry, HistoryMessage, NotificationBody } from '@/shared/api/green-api'
import { readJson, writeJson } from '@/shared/lib'
import { importChats, mergeHistory } from './history'
import {
  applyMessageStatus,
  applyNotification,
  createChat,
  hasMessage,
  linkChatId,
  toMessageStatus,
  updateChat,
} from './notifications'
import type { Chat, Message, MessageStatus } from './types'

interface PendingUpdate {
  chatId?: string
  status?: MessageStatus
}

interface ChatsState {
  instanceId: string | null
  chats: Chat[]
  activePhone: string | null
  pending: Record<string, PendingUpdate>

  loadInstance: (instanceId: string) => void
  createChat: (phone: string) => void
  linkChatId: (phone: string, chatId: string) => void
  updateChatInfo: (phone: string, info: Partial<Pick<Chat, 'title' | 'avatar'>>) => void
  openChat: (phone: string | null) => void
  queueMessage: (phone: string, message: Message) => void
  removeMessage: (phone: string, id: string) => void
  importChats: (entries: ChatListEntry[]) => void
  mergeHistory: (phone: string, history: HistoryMessage[]) => void
  markSent: (phone: string, localId: string, idMessage: string) => void
  markFailed: (phone: string, localId: string) => void
  receiveNotification: (body: NotificationBody) => void
}

const MAX_PENDING = 50

const storageKey = (instanceId: string) => `green-api-chats:${instanceId}`

function loadChats(instanceId: string): Chat[] {
  const chats = readJson<Chat[]>(storageKey(instanceId)) ?? []
  return chats.map((chat) => ({
    ...chat,
    messages: chat.messages.map((m) => (m.status === 'sending' ? { ...m, status: 'failed' as const } : m)),
  }))
}

function pendingUpdate(body: NotificationBody): PendingUpdate | null {
  if (body.typeWebhook === 'outgoingAPIMessageReceived' && body.senderData) return { chatId: body.senderData.chatId }
  if (body.typeWebhook === 'outgoingMessageStatus' && body.sendByApi && body.status) {
    return { status: toMessageStatus(body.status) }
  }
  return null
}

export const useChatsStore = create<ChatsState>()((set) => ({
  instanceId: null,
  chats: [],
  activePhone: null,
  pending: {},

  loadInstance: (instanceId) => set({ instanceId, chats: loadChats(instanceId), activePhone: null, pending: {} }),

  createChat: (phone) =>
    set(({ chats }) => ({
      chats: chats.some((c) => c.phone === phone) ? chats : [...chats, createChat(phone)],
      activePhone: phone,
    })),

  linkChatId: (phone, chatId) => set(({ chats }) => ({ chats: linkChatId(chats, phone, chatId) })),

  updateChatInfo: (phone, info) =>
    set(({ chats }) => ({ chats: updateChat(chats, phone, (chat) => ({ ...chat, ...info })) })),

  openChat: (phone) =>
    set(({ chats }) => ({
      chats: phone ? updateChat(chats, phone, (chat) => ({ ...chat, unread: 0 })) : chats,
      activePhone: phone,
    })),

  queueMessage: (phone, message) =>
    set(({ chats }) => ({
      chats: updateChat(chats, phone, (chat) => ({ ...chat, messages: [...chat.messages, message] })),
    })),

  removeMessage: (phone, id) =>
    set(({ chats }) => ({
      chats: updateChat(chats, phone, (chat) => ({ ...chat, messages: chat.messages.filter((m) => m.id !== id) })),
    })),

  importChats: (entries) => set(({ chats }) => ({ chats: importChats(chats, entries) })),

  mergeHistory: (phone, history) => set(({ chats }) => ({ chats: mergeHistory(chats, phone, history) })),

  markSent: (phone, localId, idMessage) =>
    set(({ chats, pending }) => {
      let next = updateChat(chats, phone, (chat) => ({
        ...chat,
        messages: hasMessage(chat, idMessage)
          ? chat.messages.filter((m) => m.id !== localId)
          : chat.messages.map((m) => (m.id === localId ? { ...m, id: idMessage, status: 'sent' } : m)),
      }))
      const update = pending[idMessage]
      if (!update) return { chats: next }

      if (update.chatId) next = linkChatId(next, phone, update.chatId)
      if (update.status) next = applyMessageStatus(next, idMessage, update.status)
      const rest = { ...pending }
      delete rest[idMessage]
      return { chats: next, pending: rest }
    }),

  markFailed: (phone, localId) =>
    set(({ chats }) => ({
      chats: updateChat(chats, phone, (chat) => ({
        ...chat,
        messages: chat.messages.map((m) => (m.id === localId ? { ...m, status: 'failed' } : m)),
      })),
    })),

  receiveNotification: (body) =>
    set(({ chats, activePhone, pending }) => {
      const next = applyNotification(chats, activePhone, body)
      const update = next === chats ? pendingUpdate(body) : null
      if (!update || !body.idMessage) return { chats: next }

      const merged = { ...pending[body.idMessage], ...update }
      const entries = Object.entries({ ...pending, [body.idMessage]: merged }).slice(-MAX_PENDING)
      return { pending: Object.fromEntries(entries) }
    }),
}))

useChatsStore.subscribe((state, prev) => {
  if (state.instanceId && state.chats !== prev.chats) writeJson(storageKey(state.instanceId), state.chats)
})

const lastActivity = (chat: Chat) => chat.messages.at(-1)?.timestamp ?? 0

export function useSortedChats() {
  const chats = useChatsStore((s) => s.chats)
  return useMemo(() => [...chats].sort((a, b) => lastActivity(b) - lastActivity(a)), [chats])
}

export function useActiveChat() {
  return useChatsStore((s) => s.chats.find((chat) => chat.phone === s.activePhone) ?? null)
}
