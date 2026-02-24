import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Delete01Icon, MoreVerticalIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

import { AppLayout } from '@/components/AppLayout'
import { useAppDispatch, useAppSelector } from '@/store'
import { selectTransferById, deleteTransfer } from '@/store/slices/transfer'
import { fetchAccounts } from '@/store/slices/account'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { TransferCard } from '@/features/transfer'
import { selectTransfersStatus } from '@/store/slices/transfer'

const TransferDetailPage = () => {
  const { transferId } = Route.useParams()
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
    toast.success(t('transfers.deleted'))
  }

  if (isLoading || !transfer) {
    return (
      <AppLayout title={t('transfers.detail')} showBackButton>
        <div className="flex flex-1 items-center justify-center py-8">
          {isLoading ? t('common.loading') : t('transfers.notFound')}
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout
      title={t('transfers.detail')}
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

export const Route = createFileRoute('/_app/transfers/$transferId')({
  component: TransferDetailPage,
})
