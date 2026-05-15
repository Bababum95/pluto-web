import { useTranslation } from 'react-i18next'

import { AppLayout } from '@/widgets/app-shell'
import {
  ExchangeRateList,
  ExchangeRateCalculatorSheet,
} from '@/features/exchange-rate'

export function ExchangeRatesPage() {
  const { t } = useTranslation()

  return (
    <AppLayout
      title={t('exchangeRates.title')}
      actions={<ExchangeRateCalculatorSheet />}
    >
      <ExchangeRateList />
    </AppLayout>
  )
}
