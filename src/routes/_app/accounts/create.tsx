import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { AppLayout } from '@/components/AppLayout'
import { AccountForm, accountApi } from '@/features/account'
import { useAppDispatch } from '@/store'
import { addAccount } from '@/store/slices/account'

const CreateAccountPage = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
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
