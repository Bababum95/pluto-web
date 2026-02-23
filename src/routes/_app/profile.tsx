import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

import { AppLayout } from '@/components/AppLayout'
import { useAuth } from '@/features/auth'
import { Button } from '@/components/ui/button'
import { selectUser } from '@/store/slices/user'
import { useAppSelector } from '@/store'

const ProfilePage = () => {
  const { t } = useTranslation()
  const { logout } = useAuth()
  const router = useRouter()
  const user = useAppSelector(selectUser)

  const handleLogout = async () => {
    await logout()
    await router.invalidate()
    router.navigate({ to: '/login', viewTransition: { types: ['slide-left'] } })
  }

  return (
    <AppLayout title={t('common.profile')}>
      <p>{user?.name}</p>
      <p>{user?.email}</p>
      <p>{user?.id}</p>
      <Button onClick={handleLogout}>{t('common.logout')}</Button>
    </AppLayout>
  )
}

export const Route = createFileRoute('/_app/profile')({
  component: ProfilePage,
})
