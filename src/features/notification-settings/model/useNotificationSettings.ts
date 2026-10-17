import { useCallback, useEffect, useRef, useState } from 'react'
import { useCredentials } from '@/entities/session'
import { getSettings, setSettings, type InstanceSettings } from '@/shared/api/green-api'

const REQUIRED_SETTINGS: InstanceSettings = {
  webhookUrl: '',
  incomingWebhook: 'yes',
  outgoingMessageWebhook: 'yes',
  outgoingAPIMessageWebhook: 'yes',
  outgoingWebhook: 'yes',
}

type Status =
  | { type: 'checking' }
  | { type: 'ok' }
  | { type: 'problem'; problems: string[] }
  | { type: 'saving' }
  | { type: 'saved' }
  | { type: 'error'; message: string }

function findProblems(settings: InstanceSettings): string[] {
  const problems: string[] = []
  if (settings.webhookUrl) problems.push('задан webhookUrl — HTTP API не может получать уведомления')
  if (settings.incomingWebhook !== 'yes') problems.push('выключены уведомления о входящих сообщениях')
  return problems
}

function statusFromSettings(settings: InstanceSettings | null): Status {
  if (!settings) return { type: 'error', message: 'пустой ответ getSettings' }
  const problems = findProblems(settings)
  return problems.length ? { type: 'problem', problems } : { type: 'ok' }
}

const errorMessage = (e: unknown) => (e instanceof Error ? e.message : String(e))

export function useNotificationSettings() {
  const credentials = useCredentials()
  const [status, setStatus] = useState<Status>({ type: 'checking' })
  const retryRef = useRef<AbortController | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    getSettings(credentials, controller.signal).then(
      (settings) => setStatus(statusFromSettings(settings)),
      (e) => !controller.signal.aborted && setStatus({ type: 'error', message: errorMessage(e) }),
    )
    return () => {
      controller.abort()
      retryRef.current?.abort()
    }
  }, [credentials])

  const check = useCallback(async () => {
    retryRef.current?.abort()
    const controller = new AbortController()
    retryRef.current = controller
    setStatus({ type: 'checking' })
    try {
      setStatus(statusFromSettings(await getSettings(credentials, controller.signal)))
    } catch (e) {
      if (!controller.signal.aborted) setStatus({ type: 'error', message: errorMessage(e) })
    }
  }, [credentials])

  const enable = useCallback(async () => {
    setStatus({ type: 'saving' })
    try {
      await setSettings(credentials, REQUIRED_SETTINGS)
      setStatus({ type: 'saved' })
    } catch (e) {
      setStatus({ type: 'error', message: errorMessage(e) })
    }
  }, [credentials])

  const dismiss = useCallback(() => setStatus({ type: 'ok' }), [])

  return { status, check, enable, dismiss }
}
