import { useForm } from '@tanstack/react-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import type { FC } from 'react'

import { FieldGroup } from '@/components/ui/field'
import { FormField } from '@/components/forms/form-field'
import { ColorPicker } from '@/components/ui/color-picker'
import { IconPicker } from '@/components/ui/icon-picker'
import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import { SelectCurrency } from '@/features/currency'
import { Input } from '@/components/ui/input'

import type { CreateAccountDto } from '../types'

export type AccountFormValues = CreateAccountDto

type Props = {
  defaultValues?: Partial<AccountFormValues>
  onSubmit: (values: AccountFormValues) => Promise<void>
  submitLabel?: string
}

const DEFAULT_VALUES: AccountFormValues = {
  name: '',
  color: '#00a4e8',
  icon: '',
  currency: '',
  balance: 0,
  scale: 0,
}

export const AccountForm: FC<Props> = ({
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
          .min(1, { message: t('accounts.errors.name.required') }),
        color: z
          .string()
          .min(1, { message: t('accounts.errors.color.required') }),
        icon: z
          .string()
          .min(1, { message: t('accounts.errors.icon.required') }),
        currency: z
          .string()
          .min(1, { message: t('accounts.errors.currency.required') }),
        balance: z.number(),
        scale: z.number().min(0).max(18),
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
        <ButtonGroup className="w-full">
          <form.Field
            name="balance"
            children={(field) => (
              <Input
                autoFocus
                placeholder="0"
                type="number"
                step="0.01"
                value={field.state.value}
                onChange={(e) => {
                  field.handleChange(parseFloat(e.target.value))
                }}
              />
            )}
          />
          <form.Field
            name="currency"
            children={(field) => (
              <SelectCurrency
                value={field.state.value}
                onChange={(value) => field.handleChange(value)}
              />
            )}
          />
        </ButtonGroup>
        <form.Field
          name="name"
          children={(field) => (
            <FormField field={field} label={t('accounts.name')} />
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
                  label={t('accounts.icon')}
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
              label={t('accounts.color')}
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
            {submitLabel ?? t('accounts.submit')}
          </Button>
        )}
      />
    </form>
  )
}
