import { createFileRoute } from '@tanstack/react-router'

import { ExchangeRatesPage } from '@/pages/exchange-rates'

export const Route = createFileRoute('/_app/exchange-rates')({
  component: ExchangeRatesPage,
})
