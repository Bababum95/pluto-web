import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { AppLayout } from '@/components/AppLayout'
import { TransactionTypeTabs } from '@/features/transaction-type'
import { CategoryForm } from '@/features/category'
import { useAppDispatch } from '@/app/store'
import {
  createCategory,
  DEFAULT_CATEGORY_FORM_VALUES,
} from '@/entities/category'
import type { CategoryFormValues } from '@/entities/category'

export function CreateCategoryPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const handleSubmit = async (values: CategoryFormValues) => {
    await dispatch(createCategory(values))
    navigate({ to: '/categories' })
    toast.success(t('categories.messages.created'))
  }

  return (
    <AppLayout title={t('categories.actions.create')} showBackButton>
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
