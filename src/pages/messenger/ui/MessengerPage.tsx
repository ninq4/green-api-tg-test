import { useEffect } from 'react'
import { useActiveChat, useChatsStore } from '@/entities/chat'
import { useCredentials } from '@/entities/session'
import { NotificationSettingsBanner } from '@/features/notification-settings'
import { useReceiveMessages } from '@/features/receive-messages'
import { ChatSidebar } from '@/widgets/chat-sidebar'
import { ChatWindow } from '@/widgets/chat-window'

function MessengerLayout() {
  const connectionError = useReceiveMessages()
  const activeChat = useActiveChat()

  return (
    <div className="messenger-page">
      <NotificationSettingsBanner />
      {connectionError && (
        <div className="banner banner--warning" role="alert">
          Нет связи с GREEN-API, переподключаемся… ({connectionError})
        </div>
      )}
      <main className={`messenger${activeChat ? ' messenger--chat-open' : ''}`}>
        <ChatSidebar />
        <ChatWindow />
      </main>
    </div>
  )
}

export function MessengerPage() {
  const { idInstance } = useCredentials()
  const loadedInstance = useChatsStore((s) => s.instanceId)
  const loadInstance = useChatsStore((s) => s.loadInstance)

  useEffect(() => {
    loadInstance(idInstance)
  }, [idInstance, loadInstance])

  return loadedInstance === idInstance ? <MessengerLayout /> : null
}
