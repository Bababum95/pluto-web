import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { AppLayout } from '@/components/AppLayout'
import { TransactionTypeTabs } from '@/features/transaction-type'
import { CategoryForm, categoryApi } from '@/features/category'
import { useAppDispatch, useAppSelector } from '@/store'
import {
  selectCategories,
  selectCategoriesStatus,
  updateCategory,
} from '@/store/slices/category'
import { toast } from 'sonner'

const EditCategoryPage = () => {
  const { categoryId } = Route.useParams()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const categories = useAppSelector(selectCategories)
  const status = useAppSelector(selectCategoriesStatus)
  const category = categories.find((c) => c.id === categoryId)
  const isLoading = status === 'pending'

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string
      data: Parameters<typeof categoryApi.update>[1]
    }) => categoryApi.update(id, data),
    onSuccess: (updated) => {
      dispatch(updateCategory(updated))
      toast.success(t('categories.updated'))
      navigate({ to: '/categories' })
    },
  })

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
          defaultValues={{
            name: category.name,
            color: category.color,
            icon: category.icon,
          }}
          submitLabel={t('categories.save')}
          onSubmit={async (values) => {
            await updateMutation.mutateAsync({ id: categoryId, data: values })
          }}
        />
      </TransactionTypeTabs>
    </AppLayout>
  )
}

export const Route = createFileRoute('/_app/categories/$categoryId')({
  component: EditCategoryPage,
})
