import { createFileRoute, Link } from '@tanstack/react-router'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  MoreVerticalIcon,
  Clock04Icon,
  ArrowDataTransferHorizontalIcon,
  PlusSignIcon,
} from '@hugeicons/core-free-icons'
import { Fragment } from 'react'

import { ItemGroup, ItemSeparator } from '@/components/ui/item'
import { Card } from '@/components/ui/card'
import { AppLayout } from '@/components/AppLayout'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { PlusButton } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'
import { AccountItem } from '@/features/account'
import {
  selectAccounts,
  selectAccountsStatus,
} from '@/store/slices/account'
import { useAppSelector } from '@/store'
import { Spinner } from '@/components/ui/spinner'

export const Route = createFileRoute('/_app/accounts/')({
  component: AccountsPage,
})

const actions = [
  { value: 'add', icon: PlusSignIcon },
  { value: 'newTransfer', icon: ArrowDataTransferHorizontalIcon },
  { value: 'transferHistory', icon: Clock04Icon },
]

function AccountsPage() {
  const { t } = useTranslation()
  const accounts = useAppSelector(selectAccounts)
  const status = useAppSelector(selectAccountsStatus)
  const total = accounts.reduce((sum, acc) => sum + acc.balance, 0).toFixed(2)

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
          <DropdownMenuContent align="end" className="w-42">
            {actions.map((action) => (
              <DropdownMenuItem key={action.value}>
                <HugeiconsIcon icon={action.icon} />
                <span>{t(`accounts.actions.${action.value}`)}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      }
    >
      <div className="mb-6">
        <div className="text-sm mb-2">{t('common.total')}:</div>
        <div className="text-4xl font-bold">{total}</div>
      </div>

      {status === 'pending' ? (
        <div className="flex flex-1 items-center justify-center py-8">
          <Spinner />
        </div>
      ) : (
        <Card size="sm" className="py-1!">
          <ItemGroup>
            {accounts.map((account, index) => (
              <Fragment key={account.id}>
                <Link
                  to="/accounts/$accountId"
                  params={{ accountId: account.id }}
                  viewTransition={{ types: ['slide-left'] }}
                >
                  <AccountItem {...account} />
                </Link>
                {index !== accounts.length - 1 && <ItemSeparator />}
              </Fragment>
            ))}
          </ItemGroup>
        </Card>
      )}
      <Link
        to="/accounts/create"
        viewTransition={{ types: ['slide-left'] }}
        className="fixed bottom-16 right-4 z-10"
      >
        <PlusButton />
      </Link>
    </AppLayout>
  )
}
