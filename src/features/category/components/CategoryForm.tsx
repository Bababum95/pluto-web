import { useForm } from '@tanstack/react-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import type { FC } from 'react'

import { FieldGroup } from '@/components/ui/field'
import { FormField } from '@/components/forms/form-field'
import { ColorPicker } from '@/components/ui/color-picker'
import { IconPicker } from '@/components/ui/icon-picker'
import { Button } from '@/components/ui/button'
import type { CreateCategoryDto } from '../types'

export type CategoryFormValues = CreateCategoryDto

type Props = {
  defaultValues?: Partial<CategoryFormValues>
  onSubmit: (values: CategoryFormValues) => Promise<void>
  submitLabel?: string
}

const DEFAULT_VALUES: CategoryFormValues = {
  name: '',
  color: '#00a4e8',
  icon: '',
}

export const CategoryForm: FC<Props> = ({
  defaultValues,
  onSubmit,
  submitLabel,
}) => {
  const { t } = useTranslation()
  const initialValues = { ...DEFAULT_VALUES, ...defaultValues }

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
    defaultValues: initialValues,
    onSubmit: async ({ value }) => {
      await onSubmit(value)
    },
  })

  return (
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
            {submitLabel ?? t('categories.submit')}
          </Button>
        )}
      />
    </form>
  )
}
