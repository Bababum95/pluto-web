import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { AppLayout } from '@/components/AppLayout'
import { TransactionTypeTabs } from '@/features/transaction-type'
import { CategoryForm, categoryApi } from '@/features/category'
import { useAppDispatch } from '@/store'
import { addCategory } from '@/store/slices/category'

const CreateCategoryPage = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const createMutation = useMutation({
    mutationFn: categoryApi.create,
    onSuccess: (category) => {
      dispatch(addCategory(category))
      toast.success(t('categories.created'))
      navigate({ to: '/categories' })
    },
  })

  return (
    <AppLayout title={t('categories.create')} showBackButton>
      <TransactionTypeTabs>
        <CategoryForm
          onSubmit={async (values) => {
            await createMutation.mutateAsync(values)
          }}
        />
      </TransactionTypeTabs>
    </AppLayout>
  )
}
export const Route = createFileRoute('/_app/categories/create')({
  component: CreateCategoryPage,
})
