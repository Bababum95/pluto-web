import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import {
  Delete01Icon,
  MoreVerticalIcon,
  ViewOffSlashIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

import { AppLayout } from '@/components/AppLayout'
import { AccountForm, accountApi } from '@/features/account'
import { useAppDispatch, useAppSelector } from '@/store'
import {
  selectAccounts,
  selectAccountsStatus,
  updateAccount,
  deleteAccount,
} from '@/store/slices/account'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

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
      navigate({ to: '/accounts' })
      toast.success(t('accounts.updated'))
    },
  })

  const handleDelete = async () => {
    await dispatch(deleteAccount(accountId))
    navigate({ to: '/accounts' })
    toast.success(t('accounts.deleted'))
  }

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
    <AppLayout
      title={t('accounts.edit')}
      showBackButton
      actions={
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="[&_svg]:size-6">
              <HugeiconsIcon icon={MoreVerticalIcon} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem key="hide">
              <HugeiconsIcon icon={ViewOffSlashIcon} />
              <span>{t(`accounts.actions.hide`)}</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              key="delete"
              variant="destructive"
              onClick={handleDelete}
            >
              <HugeiconsIcon icon={Delete01Icon} />
              <span>{t(`accounts.actions.delete`)}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      }
    >
      <AccountForm
        defaultValues={{
          name: account.name,
          color: account.color,
          icon: account.icon,
          currency: account.currency?.id,
          balance: account.balance.toString(),
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
