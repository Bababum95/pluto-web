import { useTranslation } from 'react-i18next'
import { HugeiconsIcon } from '@hugeicons/react'
import { Calculator01Icon } from '@hugeicons/core-free-icons'

import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'

import { ExchangeRateCalculator } from './ExchangeRateCalculator'

export function ExchangeRateCalculatorSheet() {
  const { t } = useTranslation()

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="ghost" size="icon" className="[&_svg]:size-5">
          <HugeiconsIcon icon={Calculator01Icon} />
          <span className="sr-only">{t('exchangeRates.calculator.title')}</span>
        </Button>
      </DrawerTrigger>
      <DrawerContent aria-describedby={undefined} className="pb-12">
        <DrawerHeader>
          <DrawerTitle>{t('exchangeRates.calculator.title')}</DrawerTitle>
        </DrawerHeader>
        <div className="px-4 pb-4 pb-safe">
          <ExchangeRateCalculator />
        </div>
      </DrawerContent>
    </Drawer>
  )
}
