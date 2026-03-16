import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { HugeiconsIcon } from '@hugeicons/react'
import { Invoice01Icon, PlusSignIcon } from '@hugeicons/core-free-icons'
import { useTranslation } from 'react-i18next'

import { AppLayout } from '@/components/AppLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { ItemGroup } from '@/components/ui/item'
import { Spinner } from '@/components/ui/spinner'
import { TimeRangeSwitcher } from '@/features/time-range/components/TimeRangeSwitcher'
import { useAppSelector } from '@/store'
import { selectTransfers, selectTransfersStatus } from '@/store/slices/transfer'
import { TransferItem } from '@/features/transfer'

export const Route = createFileRoute('/_app/transfers/')({
  component: TransfersPage,
})

function TransfersPage() {
  const { t } = useTranslation()
  const transfers = useAppSelector(selectTransfers)
  const status = useAppSelector(selectTransfersStatus)
  const router = useRouter()

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
      <Card className="flex flex-col relative h-full flex-1" size="sm">
        <CardHeader className="items-center pb-0">
          <TimeRangeSwitcher />
        </CardHeader>
        <CardContent>
          {status === 'pending' ? (
            <div className="flex items-center justify-center py-8">
              <Spinner size={32} />
            </div>
          ) : transfers.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <HugeiconsIcon icon={Invoice01Icon} />
                </EmptyMedia>
                <EmptyTitle>{t('transfers.empty.title')}</EmptyTitle>
                <EmptyDescription>
                  {t('transfers.empty.description')}
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent className="flex-row justify-center">
                <Button>
                  <Link
                    to="/transfers/create"
                    viewTransition={{ types: ['slide-left'] }}
                  >
                    {t('transfers.actions.create')}
                  </Link>
                </Button>
              </EmptyContent>
            </Empty>
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
        </CardContent>
      </Card>
    </AppLayout>
  )
}
