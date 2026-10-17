import { useSessionStore } from '@/entities/session'

export function LogoutButton() {
  const logout = useSessionStore((s) => s.logout)
  return (
    <button type="button" className="icon-button" onClick={logout} title="Выйти">
      ⎋
    </button>
  )
}
