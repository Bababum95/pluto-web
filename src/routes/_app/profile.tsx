import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { useRouter } from '@tanstack/react-router'

import { AppLayout } from '@/components/AppLayout'
import { useAuth } from '@/features/auth'
import { Button } from '@/components/ui/button'

const ProfilePage = () => {
  const { t } = useTranslation()
  const { user, logout } = useAuth()
  const navigate = Route.useNavigate()
  const router = useRouter()

  const handleLogout = async () => {
    await logout()
    await router.invalidate()

    await navigate({ to: '/login', viewTransition: { types: ['slide-left'] } })
  }

  return (
    <AppLayout title={t('common.profile')}>
      <p>{user}</p>
      <Button onClick={handleLogout}>Logout</Button>
    </AppLayout>
  )
}

export const Route = createFileRoute('/_app/profile')({
  component: ProfilePage,
})
