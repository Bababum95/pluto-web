import { createFileRoute, Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

import { AppLayout } from '@/components/AppLayout'
import { PlusButton } from '@/components/ui/button'
import { TransactionTypeTabs } from '@/features/transaction-type'

const CategoriesPage = () => {
  const { t } = useTranslation()

  return (
    <AppLayout title={t('common.categories')}>
      <TransactionTypeTabs>
        <div>
          <Link to="/categories/create">
            <PlusButton />
          </Link>
        </div>
      </TransactionTypeTabs>
    </AppLayout>
  )
}

export const Route = createFileRoute('/_app/categories/')({
  component: CategoriesPage,
})
