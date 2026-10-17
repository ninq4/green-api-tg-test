import type { Chat, Message } from '@/entities/chat'
import { useSendMessage } from '../model/useSendMessage'

interface Props {
  chat: Chat
  message: Message
}

export function RetryButton({ chat, message }: Props) {
  const { retry } = useSendMessage()

  return (
    <button type="button" className="message__retry" onClick={() => retry(chat, message)}>
      Не отправлено. Повторить
    </button>
  )
}
