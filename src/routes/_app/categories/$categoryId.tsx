import { createFileRoute, Navigate, useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { AppLayout } from '@/components/AppLayout'
import { TransactionTypeTabs } from '@/features/transaction-type'
import { CategoryForm } from '@/features/category'
import { useAppDispatch, useAppSelector } from '@/store'
import {
  selectCategories,
  selectCategoriesStatus,
  updateCategory,
} from '@/entities/category'
import type { CategoryFormValues } from '@/entities/category'

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
    toast.success(t('categories.messages.updated'))
  }

  if (isLoading) {
    return (
      <AppLayout title={t('categories.actions.edit')} showBackButton>
        <TransactionTypeTabs>
          <div className="flex flex-1 items-center justify-center py-8">
            {t('common.loading')}
          </div>
        </TransactionTypeTabs>
      </AppLayout>
    )
  }

  if (!category) {
    if (categoryId.startsWith('temp-')) {
      return (
        <AppLayout title={t('categories.actions.edit')} showBackButton>
          <TransactionTypeTabs>
            <div className="flex flex-1 items-center justify-center py-8 text-muted-foreground">
              {t('sync.pending')}
            </div>
          </TransactionTypeTabs>
        </AppLayout>
      )
    }
    return <Navigate to="/categories" />
  }

  return (
    <AppLayout title={t('categories.actions.edit')} showBackButton>
      <TransactionTypeTabs>
        <CategoryForm
          defaultValues={category}
          submitLabel={t('categories.actions.save')}
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
