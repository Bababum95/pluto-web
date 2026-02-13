import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { AppLayout } from '@/components/AppLayout'
import { TransactionTypeTabs } from '@/features/transaction-type'
import { CategoryForm, DEFAULT_CATEGORY_FORM_VALUES } from '@/features/category'
import { useAppDispatch } from '@/store'
import { createCategory } from '@/store/slices/category'
import type { CategoryFormValues } from '@/features/category/types'

const CreateCategoryPage = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const handleSubmit = async (values: CategoryFormValues) => {
    await dispatch(createCategory(values))
    navigate({ to: '/categories' })
    toast.success(t('categories.created'))
  }

  return (
    <AppLayout title={t('categories.create')} showBackButton>
      <TransactionTypeTabs>
        <CategoryForm
          defaultValues={DEFAULT_CATEGORY_FORM_VALUES}
          onSubmit={handleSubmit}
          key="create-category-form"
        />
      </TransactionTypeTabs>
    </AppLayout>
  )
}
export const Route = createFileRoute('/_app/categories/create')({
  component: CreateCategoryPage,
})
