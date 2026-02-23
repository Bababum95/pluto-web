import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { HugeiconsIcon } from '@hugeicons/react'
import { PlusSignIcon } from '@hugeicons/core-free-icons'
import { useTranslation } from 'react-i18next'
import { useEffect } from 'react'

import { ItemGroup } from '@/components/ui/item'
import { Card } from '@/components/ui/card'
import { AppLayout } from '@/components/AppLayout'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { useAppDispatch, useAppSelector } from '@/store'
import {
  fetchTransfers,
  selectTransfers,
  selectTransfersStatus,
} from '@/store/slices/transfer'
import { TransferItem } from '@/features/transfer'

export const Route = createFileRoute('/_app/transfers/')({
  component: TransfersPage,
})

function TransfersPage() {
  const { t } = useTranslation()
  const transfers = useAppSelector(selectTransfers)
  const status = useAppSelector(selectTransfersStatus)
  const dispatch = useAppDispatch()
  const router = useRouter()

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchTransfers())
    }
  }, [status, dispatch])

  const handleTransferClick = (id: string) => {
    router.navigate({
      to: '/transfers/$transferId',
      params: { transferId: id },
      viewTransition: { types: ['slide-left'] },
    })
  }

  return (
    <AppLayout
      title={t('transfers.title')}
      showBackButton
      actions={
        <Button variant="ghost" size="icon" className="[&_svg]:size-6" asChild>
          <Link
            to="/transfers/create"
            viewTransition={{ types: ['slide-left'] }}
          >
            <HugeiconsIcon icon={PlusSignIcon} />
          </Link>
        </Button>
      }
    >
      {status === 'pending' ? (
        <div className="flex flex-1 items-center justify-center py-8">
          <Spinner />
        </div>
      ) : transfers.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 py-8 text-muted-foreground">
          <p>{t('transfers.empty')}</p>
          <Button asChild>
            <Link to="/transfers/create">{t('transfers.create')}</Link>
          </Button>
        </div>
      ) : (
        <Card size="sm" className="py-1!">
          <ItemGroup>
            {transfers.map((transfer, index) => (
              <TransferItem
                key={transfer.id}
                {...transfer}
                separator={index !== transfers.length - 1}
                onClick={() => handleTransferClick(transfer.id)}
              />
            ))}
          </ItemGroup>
        </Card>
      )}
    </AppLayout>
  )
}
