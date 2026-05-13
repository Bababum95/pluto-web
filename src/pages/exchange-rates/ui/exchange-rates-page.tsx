import { useTranslation } from 'react-i18next'

import { AppLayout } from '@/components/AppLayout'
import {
  ExchangeRateList,
  ExchangeRateCalculatorSheet,
} from '@/features/exchange-rate'

export function ExchangeRatesPage() {
  const { t } = useTranslation()

  return (
    <AppLayout
      title={t('exchangeRates.title')}
      showBackButton
      actions={<ExchangeRateCalculatorSheet />}
    >
      <ExchangeRateList />
    </AppLayout>
  )
}
