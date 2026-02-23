import type { FC } from 'react'

import { Card } from '@/components/ui/card'

import { TransferItem } from './TransferItem'
import type { Transfer } from '../types'

type Props = Transfer & {
  onClick?: () => void
}

export const TransferCard: FC<Props> = (props) => {
  return (
    <Card size="sm" className="p-0!">
      <TransferItem {...props} />
    </Card>
  )
}
