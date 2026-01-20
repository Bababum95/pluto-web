import { Card } from '@/components/ui/card'
import type { FC } from 'react'

import { AccountItem } from './AccountItem'
import type { AccountItemProps } from '../type'

export const AccountCard: FC<AccountItemProps> = (props) => {
  return (
    <Card size="sm" className="p-0!">
      <AccountItem {...props} />
    </Card>
  )
}
