import { useState } from 'react'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import { useMutation } from '@tanstack/react-query'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  Logout03Icon,
  Mail01Icon,
  UserSquareIcon,
  LockPasswordIcon,
  Copy01Icon,
  CheckmarkCircle01Icon,
  ArrowRight01Icon,
} from '@hugeicons/core-free-icons'
import { z } from 'zod'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'

import { AppLayout } from '@/components/AppLayout'
import { useAuth } from '@/features/auth'
import { PASSWORD_MIN_LENGTH } from '@/features/auth/constants'
import { userApi } from '@/features/user'
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
  ItemActions,
} from '@/components/ui/item'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from '@/components/ui/drawer'
import { PasswordFormField } from '@/components/forms/password-form-field'
import { selectUser } from '@/store/slices/user'
import { useAppSelector } from '@/store'

const ProfilePage = () => {
  const { t } = useTranslation()
  const { logout } = useAuth()
  const router = useRouter()
  const user = useAppSelector(selectUser)
  const [isPasswordSheetOpen, setIsPasswordSheetOpen] = useState(false)
  const [copiedId, setCopiedId] = useState(false)

  const initials = user?.name?.trim().charAt(0).toUpperCase() ?? 'U'

  const handleLogout = async () => {
    await logout()
    await router.invalidate()
    router.navigate({ to: '/login', viewTransition: { types: ['slide-left'] } })
  }

  const handleCopyId = async () => {
    if (!user?.id) return
    await navigator.clipboard.writeText(user.id)
    setCopiedId(true)
    setTimeout(() => setCopiedId(false), 2000)
  }

  return (
    <AppLayout title={t('common.entities.profile')}>
      {/* Identity card */}
      <Card size="sm" className="py-1!">
        <ItemGroup>
          <Item size="sm">
            <ItemMedia>
              <Avatar size="lg">
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            </ItemMedia>
            <ItemContent className="gap-0">
              <ItemTitle className="text-base">
                {user?.name ?? t('profile.fields.unknownUser')}
              </ItemTitle>
              <ItemDescription className="text-primary">
                {user?.email ?? t('profile.fields.noEmail')}
              </ItemDescription>
            </ItemContent>
          </Item>
        </ItemGroup>
      </Card>

      {/* Account info */}
      <p className="text-muted-foreground mt-1 px-1 text-xs font-medium uppercase tracking-wide">
        {t('profile.sections.info')}
      </p>
      <Card size="sm" className="py-1!">
        <ItemGroup>
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

          <div className="bg-border mx-4 h-px" />

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
            <ItemActions>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCopyId}
                disabled={!user?.id}
                aria-label={t('profile.actions.copyId')}
              >
                <HugeiconsIcon
                  icon={copiedId ? CheckmarkCircle01Icon : Copy01Icon}
                  className={copiedId ? 'text-green-500' : ''}
                />
              </Button>
            </ItemActions>
          </Item>
        </ItemGroup>
      </Card>

      {/* Security */}
      <p className="text-muted-foreground mt-1 px-1 text-xs font-medium uppercase tracking-wide">
        {t('profile.sections.security')}
      </p>
      <Card size="sm" className="py-1!">
        <ItemGroup>
          <Item size="sm" asChild>
            <button
              type="button"
              className="w-full text-left"
              onClick={() => setIsPasswordSheetOpen(true)}
            >
              <ItemMedia variant="icon">
                <HugeiconsIcon icon={LockPasswordIcon} />
              </ItemMedia>
              <ItemContent className="gap-0">
                <ItemTitle>{t('profile.actions.changePassword')}</ItemTitle>
              </ItemContent>
              <ItemActions>
                <HugeiconsIcon
                  icon={ArrowRight01Icon}
                  className="text-muted-foreground size-4"
                />
              </ItemActions>
            </button>
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

      <ChangePasswordSheet
        userId={user?.id ?? ''}
        open={isPasswordSheetOpen}
        onOpenChange={setIsPasswordSheetOpen}
      />
    </AppLayout>
  )
}

type ChangePasswordSheetProps = {
  userId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

const changePasswordSchema = (confirmPasswordMismatchMsg: string) =>
  z
    .object({
      currentPassword: z.string().min(1),
      newPassword: z.string().min(PASSWORD_MIN_LENGTH),
      confirmPassword: z.string().min(PASSWORD_MIN_LENGTH),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: confirmPasswordMismatchMsg,
      path: ['confirmPassword'],
    })

function ChangePasswordSheet({
  userId,
  open,
  onOpenChange,
}: ChangePasswordSheetProps) {
  const { t } = useTranslation()

  const mutation = useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      userApi.changePassword(userId, data),
  })

  const form = useForm({
    validators: {
      onSubmit: changePasswordSchema(
        t('profile.changePassword.errors.passwordMismatch')
      ),
    },
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    onSubmit: async ({ value }) => {
      await mutation.mutateAsync({
        currentPassword: value.currentPassword,
        newPassword: value.newPassword,
      })
      toast.success(t('profile.changePassword.success'))
      form.reset()
      onOpenChange(false)
    },
  })

  const handleOpenChange = (next: boolean) => {
    if (!next) form.reset()
    onOpenChange(next)
  }

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerContent className="pb-safe">
        <DrawerHeader>
          <DrawerTitle>{t('profile.changePassword.title')}</DrawerTitle>
          <DrawerDescription>
            {t('profile.changePassword.description')}
          </DrawerDescription>
        </DrawerHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
        >
          <div className="px-4 grid gap-4">
            <form.Field
              name="currentPassword"
              children={(field) => (
                <PasswordFormField
                  field={field}
                  label={t('profile.changePassword.currentPassword')}
                />
              )}
            />
            <form.Field
              name="newPassword"
              children={(field) => (
                <PasswordFormField
                  field={field}
                  label={t('profile.changePassword.newPassword')}
                />
              )}
            />
            <form.Field
              name="confirmPassword"
              children={(field) => (
                <PasswordFormField
                  field={field}
                  label={t('profile.changePassword.confirmPassword')}
                />
              )}
            />
          </div>

          <DrawerFooter>
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
              children={([canSubmit, isSubmitting]) => (
                <Button
                  type="submit"
                  className="w-full"
                  disabled={!canSubmit}
                  isLoading={isSubmitting}
                >
                  {t('profile.changePassword.submit')}
                </Button>
              )}
            />
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  )
}

export const Route = createFileRoute('/_app/profile')({
  component: ProfilePage,
})
