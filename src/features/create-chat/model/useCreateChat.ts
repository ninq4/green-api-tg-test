import { useCallback } from 'react'
import { useChatsStore } from '@/entities/chat'
import { useCredentials } from '@/entities/session'
import { checkAccount, getContactInfo } from '@/shared/api/green-api'

export function useCreateChat() {
  const credentials = useCredentials()

  return useCallback(
    async (phone: string) => {
      const { createChat, linkChatId, updateChatInfo } = useChatsStore.getState()
      createChat(phone)
      try {
        const account = await checkAccount(credentials, phone)
        if (!account) return
        linkChatId(phone, account.chatId)

        const contact = await getContactInfo(credentials, account.chatId)
        const title = contact?.contactName || contact?.name || contact?.username || account.username
        if (title || contact?.avatar) {
          updateChatInfo(phone, { ...(title && { title }), avatar: contact?.avatar || undefined })
        }
      } catch (e) {
        console.warn('[GREEN-API] не удалось получить данные контакта', e)
      }
    },
    [credentials],
  )
}
