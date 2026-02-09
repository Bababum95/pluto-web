import { createFileRoute, Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

import { AppLayout } from '@/components/AppLayout'
import { PlusButton } from '@/components/ui/button'
import { TransactionTypeTabs } from '@/features/transaction-type'
import { CategoryCard } from '@/features/category'
import { selectCategories } from '@/store/slices/category'
import { useAppSelector } from '@/store'

const CategoriesPage = () => {
  const { t } = useTranslation()
  const categories = useAppSelector(selectCategories)

  return (
    <AppLayout title={t('common.categories')}>
      <TransactionTypeTabs>
        <div className="grid grid-cols-4 gap-2">
          {categories.map((category) => (
            <Link
              to="/categories/$categoryId"
              key={category.id}
              params={{ categoryId: category.id }}
              viewTransition={{ types: ['slide-left'] }}
            >
              <CategoryCard category={category} />
            </Link>
          ))}
        </div>
        <Link
          to="/categories/create"
          viewTransition={{ types: ['slide-left'] }}
          className="fixed bottom-16 right-4 z-10"
        >
          <PlusButton />
        </Link>
      </TransactionTypeTabs>
    </AppLayout>
  )
}

export const Route = createFileRoute('/_app/categories/')({
  component: CategoriesPage,
})
