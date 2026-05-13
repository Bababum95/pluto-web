import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { AppLayout } from '@/components/AppLayout'
import { AccountForm } from '@/features/account'
import { createAccount, DEFAULT_ACCOUNT_FORM_VALUES } from '@/entities/account'
import { useAppDispatch, useAppSelector } from '@/app/store'
import { selectSettings } from '@/entities/settings'
import type { CreateAccountDto } from '@/entities/account'

const CreateAccountPage = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const settings = useAppSelector(selectSettings)

  const handleSubmit = async (values: CreateAccountDto) => {
    await dispatch(createAccount(values)).unwrap()
    navigate({ to: '/accounts' })
    toast.success(t('accounts.messages.created'))
  }

  return (
    <AppLayout title={t('accounts.actions.create')} showBackButton>
      <AccountForm
        onSubmit={handleSubmit}
        defaultValues={{
          ...DEFAULT_ACCOUNT_FORM_VALUES,
          currency: settings?.currency.id ?? '',
        }}
      />
    </AppLayout>
  )
}

export const Route = createFileRoute('/_app/accounts/create')({
  component: CreateAccountPage,
})
