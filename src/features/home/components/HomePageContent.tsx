import { HugeiconsIcon } from '@hugeicons/react'
import { PlusSignIcon, Dollar01Icon } from '@hugeicons/core-free-icons'
import type { FC } from 'react'

import { ChartPieDonutText } from '@/components/charts/chart-pie-donut-text'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
        <Button
          size="icon"
          className="[&_svg]:size-6 absolute bottom-4 right-4 z-10 w-11 h-11 rounded-full"
        >
          <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} />
        </Button>
      </Card>
      <div className="flex flex-col gap-1">
        <Item variant="outline" size="xs">
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
        <Item variant="outline" size="xs">
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
