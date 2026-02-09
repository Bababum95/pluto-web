import { Card } from '@/components/ui/card'
import type { FC } from 'react'

import { AccountItem } from './AccountItem'
import type { Account } from '../types'

type AccountCardProps = Account & {
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
