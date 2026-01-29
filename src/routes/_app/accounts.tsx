import { createFileRoute } from '@tanstack/react-router'
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
import { useTranslation } from 'react-i18next'
import { AccountItem, mockAccounts } from '@/features/account'

export const Route = createFileRoute('/_app/accounts')({
  component: AccountsPage,
})

const actions = [
  { value: 'add', icon: PlusSignIcon },
  { value: 'newTransfer', icon: ArrowDataTransferHorizontalIcon },
  { value: 'transferHistory', icon: Clock04Icon },
]

function AccountsPage() {
  const { t } = useTranslation()
  const total = '$6,944'

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

      <Card size="sm" className="py-1!">
        <ItemGroup>
          {mockAccounts.map((account, index) => (
            <Fragment key={account.id}>
              <AccountItem
                name={account.name}
                currency={account.currency}
                balance={account.balance}
                iconColor={account.iconColor}
                icon={account.icon}
                id={account.id}
              />
              {index !== mockAccounts.length - 1 && <ItemSeparator />}
            </Fragment>
          ))}
        </ItemGroup>
      </Card>
    </AppLayout>
  )
}
