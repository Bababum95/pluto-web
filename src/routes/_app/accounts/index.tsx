import { createFileRoute, Link } from '@tanstack/react-router'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  MoreVerticalIcon,
  Clock04Icon,
  PlusSignIcon,
  ArrowDataTransferHorizontalIcon,
} from '@hugeicons/core-free-icons'
import { DragDropProvider } from '@dnd-kit/react'
import {
  PointerSensor,
  KeyboardSensor,
  PointerActivationConstraints,
} from '@dnd-kit/dom'
import { useRouter } from '@tanstack/react-router'
import { move } from '@dnd-kit/helpers'

import { ItemGroup } from '@/components/ui/item'
import { Card } from '@/components/ui/card'
import { AppLayout } from '@/components/AppLayout'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'
import {
  reorderAccounts,
  selectAccounts,
  selectAccountsStatus,
} from '@/store/slices/account'
import { useAppDispatch, useAppSelector } from '@/store'
import { Spinner } from '@/components/ui/spinner'
import { Total } from '@/features/money'
import { SortableAccountItem } from '@/features/account'

export const Route = createFileRoute('/_app/accounts/')({
  component: AccountsPage,
})

const actions = [
  { value: 'add', icon: PlusSignIcon, to: '/accounts/create' },
  {
    value: 'newTransfer',
    icon: ArrowDataTransferHorizontalIcon,
    to: '/accounts/create',
    disabled: true,
  },
  {
    value: 'transferHistory',
    icon: Clock04Icon,
    to: '/accounts/create',
    disabled: true,
  },
]

function AccountsPage() {
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
    <AppLayout
      title={t('common.accounts')}
      actions={
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="[&_svg]:size-6">
              <HugeiconsIcon icon={MoreVerticalIcon} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {actions.map((action) => (
              <DropdownMenuItem
                key={action.value}
                asChild
                disabled={action.disabled}
              >
                <Link
                  to={action.to}
                  key={action.value}
                  viewTransition={{ types: ['slide-left'] }}
                >
                  <HugeiconsIcon icon={action.icon} />
                  <span>{t(`accounts.actions.${action.value}`)}</span>
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      }
    >
      <Total size="lg" className="mb-4 flex flex-col gap-2" />

      <DragDropProvider
        sensors={[
          PointerSensor.configure({
            activationConstraints: [
              new PointerActivationConstraints.Delay({
                value: 350,
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
        <div
          onContextMenu={(e) => e.preventDefault()}
          style={{ touchAction: 'none', WebkitTouchCallout: 'none' }}
        >
          {status === 'pending' ? (
            <div className="flex flex-1 items-center justify-center py-8">
              <Spinner />
            </div>
          ) : (
            <Card size="sm" className="py-1!">
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
            </Card>
          )}
        </div>
      </DragDropProvider>
    </AppLayout>
  )
}
