import { AppLayout } from '@/components/AppLayout'
import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

export const Route = createFileRoute('/_app/transaction')({
  component: TransactionPage,
})

function TransactionPage() {
  const { t } = useTranslation()

  return (
      <AppLayout title={t('transaction.title')}>
        <div>
          <h1>{t('transaction.title')}</h1>
        </div>
      </AppLayout>
  )
}
