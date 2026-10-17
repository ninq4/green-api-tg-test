import { sleep } from '@/shared/lib'
import type {
  ChatListEntry,
  CheckAccountResult,
  ContactInfo,
  HistoryMessage,
  InstanceCredentials,
  InstanceSettings,
  MessageData,
  Notification,
} from './types'

const STATUS_DESCRIPTIONS: Record<number, string> = {
  400: 'некорректный запрос',
  401: 'неверный idInstance или apiTokenInstance',
  403: 'доступ запрещён — проверьте apiUrl и статус инстанса в личном кабинете',
  429: 'слишком много запросов, повторите чуть позже',
  466: 'превышены ограничения тарифа',
  500: 'внутренняя ошибка GREEN-API',
  502: 'GREEN-API временно недоступен',
  503: 'GREEN-API временно недоступен',
}

export class GreenApiError extends Error {
  readonly status: number

  constructor(status: number, details = '') {
    const description = STATUS_DESCRIPTIONS[status] ?? 'неизвестная ошибка'
    super(`HTTP ${status}: ${description}${details ? ` (${details})` : ''}`)
    this.name = 'GreenApiError'
    this.status = status
  }
}

function buildUrl({ apiUrl, idInstance, apiTokenInstance }: InstanceCredentials, method: string) {
  return `${apiUrl.replace(/\/+$/, '')}/waInstance${idInstance}/${method}/${apiTokenInstance}`
}

const RATE_LIMIT_RETRIES = 3
const RATE_LIMIT_DELAY_MS = 1500

async function request<T>(url: string, init?: RequestInit): Promise<T | null> {
  let response = await fetch(url, init)
  for (let attempt = 1; response.status === 429 && attempt <= RATE_LIMIT_RETRIES; attempt++) {
    await sleep(RATE_LIMIT_DELAY_MS * attempt, init?.signal ?? undefined)
    init?.signal?.throwIfAborted()
    response = await fetch(url, init)
  }

  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new GreenApiError(response.status, text.trim())
  }
  const text = await response.text()
  return text ? (JSON.parse(text) as T | null) : null
}

export function defaultApiUrl(idInstance: string) {
  const prefix = idInstance.trim().slice(0, 4)
  return /^\d{4}$/.test(prefix) ? `https://${prefix}.api.green-api.com` : 'https://api.green-api.com'
}

export function getStateInstance(credentials: InstanceCredentials) {
  return request<{ stateInstance: string }>(buildUrl(credentials, 'getStateInstance'))
}

export function getSettings(credentials: InstanceCredentials, signal?: AbortSignal) {
  return request<InstanceSettings>(buildUrl(credentials, 'getSettings'), { signal })
}

export function setSettings(credentials: InstanceCredentials, settings: Partial<InstanceSettings>) {
  return request<{ saveSettings: boolean }>(buildUrl(credentials, 'setSettings'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
  })
}

export async function checkAccount(credentials: InstanceCredentials, phoneNumber: string) {
  const result = await request<CheckAccountResult>(buildUrl(credentials, 'checkAccount'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phoneNumber: Number(phoneNumber) }),
  })
  return result?.exist && result.chatId ? result : null
}

export function getContactInfo(credentials: InstanceCredentials, chatId: string, signal?: AbortSignal) {
  return request<ContactInfo>(buildUrl(credentials, 'getContactInfo'), {
    method: 'POST',
    signal,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chatId }),
  })
}

export async function getAvatar(credentials: InstanceCredentials, chatId: string, signal?: AbortSignal) {
  const result = await request<{ urlAvatar?: string }>(buildUrl(credentials, 'getAvatar'), {
    method: 'POST',
    signal,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chatId }),
  })
  return result?.urlAvatar || null
}

export async function getChats(credentials: InstanceCredentials) {
  return (await request<ChatListEntry[]>(buildUrl(credentials, 'getChats'))) ?? []
}

export async function getChatHistory(
  credentials: InstanceCredentials,
  chatId: string,
  count = 100,
  signal?: AbortSignal,
) {
  const result = await request<HistoryMessage[]>(buildUrl(credentials, 'getChatHistory'), {
    method: 'POST',
    signal,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chatId, count }),
  })
  return result ?? []
}

export async function sendMessage(credentials: InstanceCredentials, chatId: string, message: string) {
  const result = await request<{ idMessage: string }>(buildUrl(credentials, 'sendMessage'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chatId, message }),
  })
  if (!result) throw new GreenApiError(0, 'Пустой ответ от sendMessage')
  return result
}

export function receiveNotification(credentials: InstanceCredentials, receiveTimeout: number, signal?: AbortSignal) {
  const url = `${buildUrl(credentials, 'receiveNotification')}?receiveTimeout=${receiveTimeout}`
  return request<Notification>(url, { signal })
}

export function deleteNotification(credentials: InstanceCredentials, receiptId: number, signal?: AbortSignal) {
  return request<{ result: boolean }>(`${buildUrl(credentials, 'deleteNotification')}/${receiptId}`, {
    method: 'DELETE',
    signal,
  })
}

export function extractText(messageData?: MessageData): string | null {
  if (!messageData) return null
  switch (messageData.typeMessage) {
    case 'textMessage':
      return messageData.textMessageData?.textMessage ?? null
    case 'extendedTextMessage':
    case 'quotedMessage':
      return messageData.extendedTextMessageData?.text ?? null
    default:
      return null
  }
}
