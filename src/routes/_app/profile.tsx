import { createFileRoute, useRouter } from '@tanstack/react-router'
import { HugeiconsIcon } from '@hugeicons/react'
import { Logout03Icon, Mail01Icon, UserSquareIcon } from '@hugeicons/core-free-icons'
import { useTranslation } from 'react-i18next'

import { AppLayout } from '@/components/AppLayout'
import { useAuth } from '@/features/auth'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item'
import { selectUser } from '@/store/slices/user'
import { useAppSelector } from '@/store'

const ProfilePage = () => {
  const { t } = useTranslation()
  const { logout } = useAuth()
  const router = useRouter()
  const user = useAppSelector(selectUser)
  const initials = user?.name?.trim().charAt(0).toUpperCase() ?? 'U'

  const handleLogout = async () => {
    await logout()
    await router.invalidate()
    router.navigate({ to: '/login', viewTransition: { types: ['slide-left'] } })
  }

  return (
    <AppLayout title={t('common.entities.profile')}>
      <Card size="sm" className="py-1!">
        <ItemGroup>
          <Item size="sm">
            <ItemMedia>
              <Avatar size="lg">
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            </ItemMedia>
            <ItemContent className="gap-0">
              <ItemTitle>{user?.name ?? t('profile.fields.unknownUser')}</ItemTitle>
              <ItemDescription className="text-primary">
                {user?.email ?? t('profile.fields.noEmail')}
              </ItemDescription>
            </ItemContent>
          </Item>
          <div className="bg-border mx-4 h-px" />
          <Item size="sm">
            <ItemMedia variant="icon">
              <HugeiconsIcon icon={Mail01Icon} />
            </ItemMedia>
            <ItemContent className="gap-0">
              <ItemTitle>{t('profile.fields.email')}</ItemTitle>
              <ItemDescription className="text-primary break-all">
                {user?.email ?? t('profile.fields.noEmail')}
              </ItemDescription>
            </ItemContent>
          </Item>
          <Item size="sm">
            <ItemMedia variant="icon">
              <HugeiconsIcon icon={UserSquareIcon} />
            </ItemMedia>
            <ItemContent className="gap-0">
              <ItemTitle>{t('profile.fields.id')}</ItemTitle>
              <ItemDescription className="text-primary break-all">
                {user?.id ?? t('profile.fields.noId')}
              </ItemDescription>
            </ItemContent>
          </Item>
        </ItemGroup>
      </Card>

      <Button
        variant="destructive"
        className="mt-3 w-full"
        onClick={handleLogout}
      >
        <HugeiconsIcon icon={Logout03Icon} />
        {t('auth.logout')}
      </Button>
    </AppLayout>
  )
}

export const Route = createFileRoute('/_app/profile')({
  component: ProfilePage,
})
