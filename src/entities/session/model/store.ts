import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { InstanceCredentials } from '@/shared/api/green-api'

interface SessionState {
  credentials: InstanceCredentials | null
  login: (credentials: InstanceCredentials) => void
  logout: () => void
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      credentials: null,
      login: (credentials) => set({ credentials }),
      logout: () => set({ credentials: null }),
    }),
    {
      name: 'green-api-session',
      partialize: ({ credentials }) => ({ credentials }),
    },
  ),
)

export function useCredentials() {
  const credentials = useSessionStore((s) => s.credentials)
  if (!credentials) throw new Error('Пользователь не авторизован')
  return credentials
}
