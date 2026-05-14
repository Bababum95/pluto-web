import { Card } from '@/shared/ui/card'
import type { TransferDto } from '@/entities/transfer'

import { TransferItem } from './transfer-item'

type TransferCardProps = TransferDto & {
  onClick?: () => void
}

export function TransferCard(props: TransferCardProps) {
  return (
    <Card size="sm" className="p-0!">
      <TransferItem {...props} />
    </Card>
  )
}
