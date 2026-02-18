import { createFileRoute, Link } from '@tanstack/react-router'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  MoreVerticalIcon,
  Clock04Icon,
  PlusSignIcon,
  ArrowDataTransferHorizontalIcon,
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
import { useTranslation } from 'react-i18next'
import { AccountItem } from '@/features/account'
import { selectAccounts, selectAccountsStatus } from '@/store/slices/account'
import { useAppSelector } from '@/store'
import { Spinner } from '@/components/ui/spinner'
import { Total } from '@/features/money'

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
    </AppLayout>
  )
}
