import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

import { AppLayout } from '@/components/AppLayout'
import { ExchangeRateList } from '@/features/exchange-rate'

export const Route = createFileRoute('/_app/exchange-rates')({
  component: ExchangeRatesPage,
})

function ExchangeRatesPage() {
  const { t } = useTranslation()

  return (
    <AppLayout title={t('exchangeRates.title')} showBackButton>
      <ExchangeRateList />
    </AppLayout>
  )
}
