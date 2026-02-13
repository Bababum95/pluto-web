import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

import { AppLayout } from '@/components/AppLayout'
import { TransactionTypeTabs } from '@/features/transaction-type'
import { CategoryForm } from '@/features/category'
import { useAppDispatch, useAppSelector } from '@/store'
import {
  selectCategories,
  selectCategoriesStatus,
  updateCategory,
} from '@/store/slices/category'
import { toast } from 'sonner'
import type { CategoryFormValues } from '@/features/category/types'

const EditCategoryPage = () => {
  const { categoryId } = Route.useParams()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const categories = useAppSelector(selectCategories)
  const status = useAppSelector(selectCategoriesStatus)
  const category = categories.find((c) => c.id === categoryId)
  const isLoading = status === 'pending'

  const handleSubmit = async (values: CategoryFormValues) => {
    await dispatch(updateCategory({ id: categoryId, data: values }))
    navigate({ to: '/categories' })
    toast.success(t('categories.updated'))
  }

  if (isLoading || !category) {
    return (
      <AppLayout title={t('categories.edit')} showBackButton>
        <TransactionTypeTabs>
          <div className="flex flex-1 items-center justify-center py-8">
            {isLoading ? t('common.loading') : t('categories.notFound')}
          </div>
        </TransactionTypeTabs>
      </AppLayout>
    )
  }

  return (
    <AppLayout title={t('categories.edit')} showBackButton>
      <TransactionTypeTabs>
        <CategoryForm
          defaultValues={category}
          submitLabel={t('categories.save')}
          onSubmit={handleSubmit}
          key="edit-category-form"
        />
      </TransactionTypeTabs>
    </AppLayout>
  )
}

export const Route = createFileRoute('/_app/categories/$categoryId')({
  component: EditCategoryPage,
})
