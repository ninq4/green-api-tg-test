import { useSessionStore } from '@/entities/session'
import { LoginPage } from '@/pages/login'
import { MessengerPage } from '@/pages/messenger'
import './styles/index.css'

export function App() {
  const isAuthorized = useSessionStore((s) => s.credentials !== null)
  return isAuthorized ? <MessengerPage /> : <LoginPage />
}
