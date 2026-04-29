import { Card } from '@/components/ui/card'
import type { FC } from 'react'

import { AccountItem } from './AccountItem'
import type { AccountDto } from '../types'

type AccountCardProps = AccountDto & {
  onClick?: () => void
  actions?: React.ReactNode
}

export const AccountCard: FC<AccountCardProps> = (props) => {
  return (
    <Card size="sm" className="p-0!">
      <AccountItem {...props} />
    </Card>
  )
}
