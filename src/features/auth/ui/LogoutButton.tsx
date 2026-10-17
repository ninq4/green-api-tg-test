import { useSessionStore } from '@/entities/session'
import { IconButton } from '@/shared/ui'

export function LogoutButton() {
  const logout = useSessionStore((s) => s.logout)
  return (
    <IconButton onClick={logout} title="Выйти">
      ⎋
    </IconButton>
  )
}
