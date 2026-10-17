import { useEffect } from 'react'
import { historyChatId, useChatsStore } from '@/entities/chat'
import { useCredentials } from '@/entities/session'
import { getChatHistory, getContactInfo } from '@/shared/api/green-api'
import { formatPhone } from '@/shared/lib'

const HISTORY_SIZE = 100

export function useChatHistory(phone: string | null) {
  const credentials = useCredentials()
  const historyLoaded = useChatsStore((s) => s.chats.find((c) => c.phone === phone)?.historyLoaded ?? true)

  useEffect(() => {
    const { chats, mergeHistory, updateChatInfo } = useChatsStore.getState()
    const chat = chats.find((c) => c.phone === phone)
    if (!phone || !chat || historyLoaded) return

    const controller = new AbortController()
    const { signal } = controller
    const chatId = historyChatId(chat)

    getChatHistory(credentials, chatId, HISTORY_SIZE, signal)
      .then((history) => mergeHistory(phone, history))
      .catch((e) => {
        if (signal.aborted) return
        console.warn('[GREEN-API] не удалось загрузить историю', e)
        mergeHistory(phone, [])
      })

    if (!chat.avatar) {
      getContactInfo(credentials, chatId, signal)
        .then((contact) => {
          if (!contact) return
          const hasDefaultTitle = chat.title === formatPhone(chat.phone)
          const title = contact.contactName || contact.name || contact.username
          updateChatInfo(phone, {
            avatar: contact.avatar || undefined,
            ...(hasDefaultTitle && title && { title }),
          })
        })
        .catch(() => {})
    }

    return () => controller.abort()
  }, [phone, historyLoaded, credentials])

  return { loading: !historyLoaded }
}
