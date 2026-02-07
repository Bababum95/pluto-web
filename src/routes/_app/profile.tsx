import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

import { AppLayout } from '@/components/AppLayout'
import { useAuth } from '@/features/auth'
import { Button } from '@/components/ui/button'
import { selectUser } from '@/store/slices/user'
import { useAppSelector } from '@/store'

const ProfilePage = () => {
  const { t } = useTranslation()
  const { logout } = useAuth()
  const user = useAppSelector(selectUser)

  return (
    <AppLayout title={t('common.profile')}>
      <p>{user?.name}</p>
      <p>{user?.email}</p>
      <p>{user?.id}</p>
      <Button onClick={logout}>Logout</Button>
    </AppLayout>
  )
}

export const Route = createFileRoute('/_app/profile')({
  component: ProfilePage,
})
