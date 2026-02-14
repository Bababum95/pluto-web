import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { AppLayout } from '@/components/AppLayout'
import { AccountForm, DEFAULT_ACCOUNT_FORM_VALUES } from '@/features/account'
import { useAppDispatch, useAppSelector } from '@/store'
import { createAccount } from '@/store/slices/account'
import { selectSettings } from '@/store/slices/settings'
import type { CreateAccountDto } from '@/features/account/types'

const CreateAccountPage = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const settings = useAppSelector(selectSettings)

  const handleSubmit = async (values: CreateAccountDto) => {
    await dispatch(createAccount(values))
    navigate({ to: '/accounts' })
    toast.success(t('accounts.created'))
  }

  return (
    <AppLayout title={t('accounts.create')} showBackButton>
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
