import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { AppLayout } from '@/components/AppLayout'
import {
  AccountForm,
  accountApi,
  DEFAULT_ACCOUNT_FORM_VALUES,
} from '@/features/account'
import { useAppDispatch, useAppSelector } from '@/store'
import { addAccount } from '@/store/slices/account'
import { selectSettings } from '@/store/slices/settings'

const CreateAccountPage = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const settings = useAppSelector(selectSettings)
  const createMutation = useMutation({
    mutationFn: accountApi.create,
    onSuccess: (account) => {
      dispatch(addAccount(account))
      toast.success(t('accounts.created'))
      navigate({ to: '/accounts' })
    },
  })

  return (
    <AppLayout title={t('accounts.create')} showBackButton>
      <AccountForm
        defaultValues={{
          ...DEFAULT_ACCOUNT_FORM_VALUES,
          currency: settings?.currency.id ?? '',
        }}
        onSubmit={async (values) => {
          await createMutation.mutateAsync(values)
        }}
      />
    </AppLayout>
  )
}

export const Route = createFileRoute('/_app/accounts/create')({
  component: CreateAccountPage,
})
