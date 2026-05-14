import { Link } from '@tanstack/react-router'
import { useRouter } from '@tanstack/react-router'
import { HugeiconsIcon } from '@hugeicons/react'
import { Wallet01Icon } from '@hugeicons/core-free-icons'
import { DragDropProvider } from '@dnd-kit/react'
import {
  PointerSensor,
  KeyboardSensor,
  PointerActivationConstraints,
} from '@dnd-kit/dom'
import { move } from '@dnd-kit/helpers'

import { ItemGroup } from '@/shared/ui/item'
import { Card } from '@/shared/ui/card'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/shared/ui/empty'
import { Spinner } from '@/shared/ui/spinner'
import { Button } from '@/shared/ui/button'
import { useTranslation } from 'react-i18next'
import {
  reorderAccounts,
  selectAccounts,
  selectAccountsStatus,
} from '@/entities/account'
import { useAppDispatch, useAppSelector } from '@/app/store'
import { Total } from '@/features/money'
import { SortableAccountItem } from '@/features/account'

export function AccountsOverview() {
  const { t } = useTranslation()
  const accounts = useAppSelector(selectAccounts)
  const status = useAppSelector(selectAccountsStatus)
  const dispatch = useAppDispatch()
  const router = useRouter()

  const handleAccountClick = (id: string) => {
    router.navigate({
      to: '/accounts/$accountId',
      params: { accountId: id },
      viewTransition: { types: ['slide-left'] },
    })
  }

  return (
    <>
      <Total size="lg" className="mb-4 flex flex-col gap-2" />

      <DragDropProvider
        sensors={[
          PointerSensor.configure({
            activationConstraints: [
              new PointerActivationConstraints.Delay({
                value: 600,
                tolerance: 5,
              }),
            ],
          }),
          KeyboardSensor,
        ]}
        onDragEnd={(event) => {
          if (event.canceled) return

          const ids = move(accounts, event).map((account) => account.id)
          dispatch(reorderAccounts(ids))
        }}
      >
        {status === 'pending' ? (
          <div className="flex flex-1 items-center justify-center py-8">
            <Spinner />
          </div>
        ) : (
          <Card size="sm" className="py-1!">
            {accounts.length === 0 ? (
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <HugeiconsIcon icon={Wallet01Icon} />
                  </EmptyMedia>
                  <EmptyTitle>{t('accounts.empty.title')}</EmptyTitle>
                  <EmptyDescription>
                    {t('accounts.empty.description')}
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent className="flex-row justify-center">
                  <Button>
                    <Link
                      to="/accounts/create"
                      viewTransition={{ types: ['slide-left'] }}
                    >
                      {t('accounts.actions.add')}
                    </Link>
                  </Button>
                </EmptyContent>
              </Empty>
            ) : (
              <ItemGroup>
                {accounts.map((account, index) => (
                  <SortableAccountItem
                    key={account.id}
                    id={account.id}
                    index={index}
                    accountItemProps={{
                      ...account,
                      separator: index !== accounts.length - 1,
                      onClick: () => handleAccountClick(account.id),
                    }}
                  />
                ))}
              </ItemGroup>
            )}
          </Card>
        )}
      </DragDropProvider>
    </>
  )
}
