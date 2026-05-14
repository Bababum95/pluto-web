import { Link } from '@tanstack/react-router'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  MoreVerticalIcon,
  Clock04Icon,
  PlusSignIcon,
  ArrowDataTransferHorizontalIcon,
} from '@hugeicons/core-free-icons'

import { AppLayout } from '@/components/AppLayout'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { Button } from '@/shared/ui/button'
import { useTranslation } from 'react-i18next'
import { AccountsOverview } from '@/widgets/account-summary'

const actions = [
  { value: 'add', icon: PlusSignIcon, to: '/accounts/create' },
  {
    value: 'newTransfer',
    icon: ArrowDataTransferHorizontalIcon,
    to: '/transfers/create',
  },
  {
    value: 'transferHistory',
    icon: Clock04Icon,
    to: '/transfers',
  },
] as const

export function AccountsPage() {
  const { t } = useTranslation()

  return (
    <AppLayout
      title={t('accounts.title')}
      actions={
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="[&_svg]:size-6">
              <HugeiconsIcon icon={MoreVerticalIcon} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {actions.map((action) => (
              <DropdownMenuItem key={action.value} asChild>
                <Link
                  to={action.to}
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
      <AccountsOverview />
    </AppLayout>
  )
}
