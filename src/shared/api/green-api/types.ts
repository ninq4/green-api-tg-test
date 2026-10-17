export interface InstanceCredentials {
  apiUrl: string
  idInstance: string
  apiTokenInstance: string
}

type YesNo = 'yes' | 'no'

export interface InstanceSettings {
  webhookUrl: string
  incomingWebhook: YesNo
  outgoingMessageWebhook: YesNo
  outgoingAPIMessageWebhook: YesNo
  outgoingWebhook: YesNo
}

export interface CheckAccountResult {
  exist: boolean
  chatId: string
  username?: string
}

export interface ContactInfo {
  chatId: string
  name?: string
  contactName?: string
  username?: string
  avatar?: string
}

export interface ChatListEntry {
  chatId: string
  name?: string
  type?: string
  phoneNumber?: number
  username?: string
}

export interface HistoryMessage {
  type: 'incoming' | 'outgoing'
  idMessage: string
  timestamp: number
  typeMessage: string
  chatId: string
  textMessage?: string
  statusMessage?: string
  isDeleted?: boolean
}

export type OutgoingStatus = 'sent' | 'delivered' | 'read' | 'failed' | 'noAccount' | 'notInGroup' | 'suspended'

export interface SenderData {
  chatId: string
  chatName?: string
  sender?: string
  senderName?: string
  senderContactName?: string
  senderPhoneNumber?: number
}

export interface MessageData {
  typeMessage: string
  textMessageData?: { textMessage: string }
  extendedTextMessageData?: { text: string }
}

export interface NotificationBody {
  typeWebhook: string
  timestamp?: number
  idMessage?: string
  chatId?: string
  status?: OutgoingStatus
  sendByApi?: boolean
  senderData?: SenderData
  messageData?: MessageData
}

export interface Notification {
  receiptId: number
  body: NotificationBody
}
