export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed'

export interface Message {
  id: string
  text: string
  timestamp: number
  direction: 'in' | 'out'
  status?: MessageStatus
}

export interface Chat {
  phone: string
  title: string
  avatar?: string
  chatIds: string[]
  messages: Message[]
  unread: number
  historyLoaded?: boolean
}
