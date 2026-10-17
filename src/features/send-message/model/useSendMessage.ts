import { useCallback } from 'react'
import { useChatsStore, type Chat, type Message } from '@/entities/chat'
import { useCredentials } from '@/entities/session'
import { sendMessage } from '@/shared/api/green-api'

export function useSendMessage() {
  const credentials = useCredentials()

  const send = useCallback(
    async (chat: Chat, text: string) => {
      const { queueMessage, markSent, markFailed } = useChatsStore.getState()
      const localId = `local-${crypto.randomUUID()}`
      const { phone } = chat
      queueMessage(phone, { id: localId, text, timestamp: Date.now(), direction: 'out', status: 'sending' })

      try {
        const { idMessage } = await sendMessage(credentials, chat.chatIds[0], text)
        markSent(phone, localId, idMessage)
      } catch {
        markFailed(phone, localId)
      }
    },
    [credentials],
  )

  const retry = useCallback(
    (chat: Chat, message: Message) => {
      useChatsStore.getState().removeMessage(chat.phone, message.id)
      return send(chat, message.text)
    },
    [send],
  )

  return { send, retry }
}
