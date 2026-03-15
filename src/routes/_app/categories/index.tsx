import { createFileRoute, Link } from '@tanstack/react-router'
import { useRouter } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { DragDropProvider } from '@dnd-kit/react'
import {
  PointerSensor,
  KeyboardSensor,
  PointerActivationConstraints,
} from '@dnd-kit/dom'
import { move } from '@dnd-kit/helpers'

import { AppLayout } from '@/components/AppLayout'
import { PlusButton } from '@/components/ui/button'
import { TransactionTypeTabs } from '@/features/transaction-type'
import { SortableCategoryItem } from '@/features/category'
import {
  selectCategories,
  selectCategoriesStatus,
  reorderCategories,
} from '@/store/slices/category'
import { useAppDispatch, useAppSelector } from '@/store'
import { Spinner } from '@/components/ui/spinner'
import { selectTransactionType } from '@/store/slices/transaction-type'

const CategoriesPage = () => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const router = useRouter()
  const categories = useAppSelector(selectCategories)
  const status = useAppSelector(selectCategoriesStatus)
  const transactionType = useAppSelector(selectTransactionType)
  const filteredCategories = categories.filter(
    (category) => category.type === transactionType
  )

  const handleCategoryClick = (id: string) => {
    router.navigate({
      to: '/categories/$categoryId',
      params: { categoryId: id },
      viewTransition: { types: ['slide-left'] },
    })
  }

  return (
    <AppLayout title={t('categories.title')} className="px-2">
      <TransactionTypeTabs>
        {status === 'pending' ? (
          <div className="flex flex-1 items-center justify-center py-8">
            <Spinner />
          </div>
        ) : (
          <DragDropProvider
            sensors={[
              PointerSensor.configure({
                activationConstraints: [
                  new PointerActivationConstraints.Delay({
                    value: 600,
                    tolerance: 5,
                  }),
                ],
              }),
              KeyboardSensor,
            ]}
            onDragEnd={(event) => {
              if (event.canceled) return

              const ids = move(filteredCategories, event).map(
                (category) => category.id
              )
              dispatch(reorderCategories(ids))
            }}
          >
            <div className="grid grid-cols-4 gap-2">
              {filteredCategories.map((category, index) => (
                <SortableCategoryItem
                  key={category.id}
                  id={category.id}
                  index={index}
                  category={category}
                  onClick={handleCategoryClick}
                />
              ))}
            </div>
          </DragDropProvider>
        )}
      </TransactionTypeTabs>
      <Link
        to="/categories/create"
        viewTransition={{ types: ['slide-left'] }}
        className="fixed right-4 z-10"
        style={{ bottom: 'calc(env(safe-area-inset-bottom) + 64px)' }}
      >
        <PlusButton />
      </Link>
    </AppLayout>
  )
}

export const Route = createFileRoute('/_app/categories/')({
  component: CategoriesPage,
})
