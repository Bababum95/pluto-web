import { createFileRoute } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'

import { AppLayout } from '@/components/AppLayout'
import { FieldGroup } from '@/components/ui/field'
import { FormField } from '@/components/forms/form-field'
import { ColorPicker } from '@/components/ui/color-picker'
import { IconPicker } from '@/components/ui/icon-picker'
import { Button } from '@/components/ui/button'
import { TransactionTypeTabs } from '@/features/transaction-type'

const CreateCategoryPage = () => {
  const { t } = useTranslation()
  const form = useForm({
    validators: {
      onSubmit: z.object({
        name: z
          .string()
          .min(1, { message: t('categories.errors.name.required') }),
        color: z
          .string()
          .min(1, { message: t('categories.errors.color.required') }),
        icon: z
          .string()
          .min(1, { message: t('categories.errors.icon.required') }),
      }),
    },
    defaultValues: {
      name: '',
      color: '#00a4e8',
      icon: '',
    },
    onSubmit: async ({ value }) => {
      console.log(value)
    },
  })

  return (
    <AppLayout title={t('categories.create')} showBackButton>
      <TransactionTypeTabs>
        <form
          className="flex flex-1 flex-col gap-2"
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
                <FormField
                  field={field}
                  label={t('categories.name')}
                  inputProps={{ autoFocus: true }}
                />
              )}
            />
            <form.Subscribe
              selector={(state) => state.values.color}
              children={(color) => (
                <form.Field
                  name="icon"
                  children={(field) => (
                    <IconPicker
                      value={field.state.value as string}
                      onChange={(value) => field.handleChange(value)}
                      label={t('categories.icon')}
                      iconColor={color}
                    />
                  )}
                />
              )}
            />
            <form.Field
              name="color"
              children={(field) => (
                <ColorPicker
                  value={field.state.value as string}
                  onChange={(value) => field.handleChange(value)}
                  label={t('categories.color')}
                />
              )}
            />
          </FieldGroup>
          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
            children={([canSubmit, isSubmitting]) => (
              <Button
                type="submit"
                className="mt-auto w-full"
                disabled={!canSubmit}
                isLoading={isSubmitting}
              >
                {t('categories.submit')}
              </Button>
            )}
          />
        </form>
      </TransactionTypeTabs>
    </AppLayout>
  )
}
export const Route = createFileRoute('/_app/categories/create')({
  component: CreateCategoryPage,
})
