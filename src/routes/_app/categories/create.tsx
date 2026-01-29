import { createFileRoute } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import { useTranslation } from 'react-i18next'

import { AppLayout } from '@/components/AppLayout'
import { FieldGroup } from '@/components/ui/field'
import { FormField } from '@/components/forms/form-field'

const CreateCategoryPage = () => {
  const { t } = useTranslation()
  const form = useForm({
    onSubmit: async ({ value }) => {
      console.log(value)
    },
  })

  return (
    <AppLayout title={t('categories.create')} showBackButton>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit()
        }}
      >
        <FieldGroup>
          <form.Field
            name="name"
            children={(field) => (
              <FormField field={field} label={t('categories.name')} />
            )}
          />
        </FieldGroup>
      </form>
    </AppLayout>
  )
}
export const Route = createFileRoute('/_app/categories/create')({
  component: CreateCategoryPage,
})
