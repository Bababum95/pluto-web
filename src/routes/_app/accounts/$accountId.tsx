import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { AppLayout } from '@/components/AppLayout'
import { AccountForm, accountApi } from '@/features/account'
import { useAppDispatch, useAppSelector } from '@/store'
import {
  selectAccounts,
  selectAccountsStatus,
  updateAccount,
} from '@/store/slices/account'

const EditAccountPage = () => {
  const { accountId } = Route.useParams()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const accounts = useAppSelector(selectAccounts)
  const status = useAppSelector(selectAccountsStatus)
  const account = accounts.find((a) => a.id === accountId)
  const isLoading = status === 'pending'

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string
      data: Parameters<typeof accountApi.update>[1]
    }) => accountApi.update(id, data),
    onSuccess: (updated) => {
      dispatch(updateAccount(updated))
      toast.success(t('accounts.updated'))
      navigate({ to: '/accounts' })
    },
  })

  if (isLoading || !account) {
    return (
      <AppLayout title={t('accounts.edit')} showBackButton>
        <div className="flex flex-1 items-center justify-center py-8">
          {isLoading ? t('common.loading') : t('accounts.notFound')}
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout title={t('accounts.edit')} showBackButton>
      <AccountForm
        defaultValues={{
          name: account.name,
          color: account.color,
          icon: account.icon,
          currency:
            typeof account.currency === 'string'
              ? account.currency
              : account.currency?.id || '',
          balance: account.balance,
          scale: account.scale,
        }}
        submitLabel={t('accounts.save')}
        onSubmit={async (values) => {
          await updateMutation.mutateAsync({ id: accountId, data: values })
        }}
      />
    </AppLayout>
  )
}

export const Route = createFileRoute('/_app/accounts/$accountId')({
  component: EditAccountPage,
})
