import type { FC } from 'react'

import { Card } from '@/components/ui/card'

import type { TransferDto } from '../types'

import { TransferItem } from './TransferItem'

type Props = TransferDto & {
  onClick?: () => void
}

export const TransferCard: FC<Props> = (props) => {
  return (
    <Card size="sm" className="p-0!">
      <TransferItem {...props} />
    </Card>
  )
}
