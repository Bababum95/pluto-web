import { Navigate, useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Delete01Icon, MoreVerticalIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

import { AppLayout } from '@/components/AppLayout'
import { useAppDispatch, useAppSelector } from '@/app/store'
import {
  selectTransferById,
  deleteTransfer,
  selectTransfersStatus,
} from '@/entities/transfer'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { Button } from '@/shared/ui/button'
import { TransferCard } from '@/features/transfer'
import { fetchAccounts } from '@/entities/account'

export type TransferDetailPageProps = {
  transferId: string
}

export function TransferDetailPage({ transferId }: TransferDetailPageProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const transfer = useAppSelector(selectTransferById(transferId))
  const status = useAppSelector(selectTransfersStatus)
  const isLoading = status === 'pending'

  const handleDelete = async () => {
    await dispatch(deleteTransfer(transferId)).unwrap()
    await dispatch(fetchAccounts())
    navigate({ to: '/transfers' })
    toast.success(t('transfers.messages.deleted'))
  }

  if (isLoading) {
    return (
      <AppLayout title={t('transfers.title')} showBackButton>
        <div className="flex flex-1 items-center justify-center py-8">
          {t('common.loading')}
        </div>
      </AppLayout>
    )
  }

  if (!transfer) {
    if (transferId.startsWith('temp-')) {
      return (
        <AppLayout title={t('transfers.title')} showBackButton>
          <div className="flex flex-1 items-center justify-center py-8 text-muted-foreground">
            {t('sync.pending')}
          </div>
        </AppLayout>
      )
    }
    return <Navigate to="/transfers" />
  }

  return (
    <AppLayout
      title={t('transfers.title')}
      showBackButton
      actions={
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="[&_svg]:size-6">
              <HugeiconsIcon icon={MoreVerticalIcon} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuItem variant="destructive" onClick={handleDelete}>
              <HugeiconsIcon icon={Delete01Icon} />
              <span>{t('transfers.actions.delete')}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      }
    >
      <TransferCard {...transfer} />
    </AppLayout>
  )
}
