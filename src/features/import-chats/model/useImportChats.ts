import { useCallback, useState } from 'react'
import { useChatsStore } from '@/entities/chat'
import { useCredentials } from '@/entities/session'
import { getAvatar, getChats, type InstanceCredentials } from '@/shared/api/green-api'

type State =
  | { type: 'idle' }
  | { type: 'loading' }
  | { type: 'done'; count: number }
  | { type: 'error'; message: string }

async function loadAvatars(credentials: InstanceCredentials, chatIds: string[]) {
  for (const chatId of chatIds) {
    const { chats, updateChatInfo } = useChatsStore.getState()
    const chat = chats.find((c) => c.chatIds.includes(chatId))
    if (!chat || chat.avatar) continue
    try {
      const avatar = await getAvatar(credentials, chatId)
      if (avatar) updateChatInfo(chat.phone, { avatar })
    } catch (e) {
      console.warn('[GREEN-API] не удалось загрузить аватар', e)
    }
  }
}

export function useImportChats() {
  const credentials = useCredentials()
  const [state, setState] = useState<State>({ type: 'idle' })

  const importChats = useCallback(async () => {
    setState({ type: 'loading' })
    try {
      const users = (await getChats(credentials)).filter((entry) => entry.type === 'user')
      useChatsStore.getState().importChats(users)
      setState({ type: 'done', count: users.length })
      await loadAvatars(
        credentials,
        users.map((entry) => entry.chatId),
      )
    } catch (e) {
      setState({ type: 'error', message: e instanceof Error ? e.message : String(e) })
    }
  }, [credentials])

  return { state, importChats }
}
