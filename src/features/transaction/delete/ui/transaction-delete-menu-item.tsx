import { useTranslation } from 'react-i18next'
import { Delete01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

import { DropdownMenuItem } from '@/shared/ui/dropdown-menu'

type TransactionDeleteMenuItemProps = {
  onSelect: () => void
}

export function TransactionDeleteMenuItem({
  onSelect,
}: TransactionDeleteMenuItemProps) {
  const { t } = useTranslation()

  return (
    <DropdownMenuItem variant="destructive" onClick={onSelect}>
      <HugeiconsIcon icon={Delete01Icon} />
      <span>{t('transactions.actions.delete')}</span>
    </DropdownMenuItem>
  )
}
