import { createFileRoute } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { AppLayout } from '@/components/AppLayout'
import { ExchangeRateList } from '@/features/exchange-rate'
import { useAppDispatch } from '@/store'
import { fetchExchangeRates } from '@/store/slices/exchange-rate'

export const Route = createFileRoute('/_app/exchange-rates')({
  component: ExchangeRatesPage,
})

function ExchangeRatesPage() {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(fetchExchangeRates())
  }, [dispatch])

  return (
    <AppLayout title={t('exchangeRates.title')} showBackButton>
      <ExchangeRateList />
    </AppLayout>
  )
}
