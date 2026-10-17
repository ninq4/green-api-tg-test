import { useEffect, useState } from 'react'
import { useChatsStore } from '@/entities/chat'
import { useCredentials } from '@/entities/session'
import { deleteNotification, receiveNotification } from '@/shared/api/green-api'
import { sleep } from '@/shared/lib'

const RECEIVE_TIMEOUT_SEC = 20
const RETRY_DELAY_MS = 5000

export function useReceiveMessages() {
  const credentials = useCredentials()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    const { signal } = controller

    async function poll() {
      while (!signal.aborted) {
        try {
          const notification = await receiveNotification(credentials, RECEIVE_TIMEOUT_SEC, signal)
          setError(null)
          if (!notification) continue

          if (import.meta.env.DEV) console.debug('[GREEN-API] уведомление', notification)
          try {
            useChatsStore.getState().receiveNotification(notification.body)
          } catch (e) {
            console.error('[GREEN-API] не удалось обработать уведомление', notification, e)
          }
          await deleteNotification(credentials, notification.receiptId, signal)
        } catch (e) {
          if (signal.aborted) return
          setError(e instanceof Error ? e.message : String(e))
          await sleep(RETRY_DELAY_MS, signal)
        }
      }
    }

    poll()
    return () => controller.abort()
  }, [credentials])

  return error
}
