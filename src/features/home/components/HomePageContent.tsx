import { HugeiconsIcon } from '@hugeicons/react'
import { Dollar01Icon } from '@hugeicons/core-free-icons'
import { Link } from '@tanstack/react-router'
import type { FC } from 'react'

import { ChartPieDonutText } from '@/components/charts/chart-pie-donut-text'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { PlusButton } from '@/components/ui/button'
import {
  Item,
  ItemActions,
  ItemContent,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item'
import { TimeRangeSwitcher } from '@/features/time-range'

export const HomePageContent: FC = () => {
  return (
    <div className="flex flex-col gap-2">
      <Card className="flex flex-col relative" size="sm">
        <CardHeader className="items-center pb-0">
          <TimeRangeSwitcher />
        </CardHeader>
        <CardContent className="flex-1 pb-0">
          <ChartPieDonutText total="104,25 $" />
        </CardContent>
        <Link
          to="/transaction"
          className="absolute bottom-4 right-4 z-10"
          viewTransition={{ types: ['slide-left'] }}
        >
          <PlusButton />
        </Link>
      </Card>
      <div className="flex flex-col gap-1">
        <Item variant="outline" size="xs" className="bg-card">
          <ItemMedia variant="icon" style={{ backgroundColor: '#00a0df' }}>
            <HugeiconsIcon icon={Dollar01Icon} />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>Развлечения</ItemTitle>
          </ItemContent>
          <ItemActions>
            <span className="font-medium">104,25 $</span>
          </ItemActions>
        </Item>
        <Item variant="outline" size="xs" className="bg-card">
          <ItemMedia variant="icon">
            <HugeiconsIcon icon={Dollar01Icon} />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>Развлечения</ItemTitle>
          </ItemContent>
          <ItemActions>
            <span className="font-medium">104,25 $</span>
          </ItemActions>
        </Item>
      </div>
    </div>
  )
}
