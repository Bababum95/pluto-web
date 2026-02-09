import { useForm } from '@tanstack/react-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { useQuery } from '@tanstack/react-query'
import type { FC } from 'react'

import { FieldGroup } from '@/components/ui/field'
import { FormField } from '@/components/forms/form-field'
import { ColorPicker } from '@/components/ui/color-picker'
import { IconPicker } from '@/components/ui/icon-picker'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { currencyApi } from '@/features/currency'
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
  scale: 2,
}

export const AccountForm: FC<Props> = ({
  defaultValues,
  onSubmit,
  submitLabel,
}) => {
  const { t } = useTranslation()
  const initialValues = { ...DEFAULT_VALUES, ...defaultValues }
  const { data: currencies = [] } = useQuery({
    queryKey: ['currencies'],
    queryFn: currencyApi.list,
  })

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
        <form.Field
          name="name"
          children={(field) => (
            <FormField
              field={field}
              label={t('accounts.name')}
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
        <form.Field
          name="currency"
          children={(field) => (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">
                {t('accounts.currency')}
              </label>
              <Select
                value={field.state.value}
                onValueChange={(value) => {
                  field.handleChange(value)
                  // Auto-set scale from selected currency
                  const selectedCurrency = currencies.find(
                    (c) => c.id === value
                  )
                  if (selectedCurrency) {
                    form.setFieldValue('scale', selectedCurrency.decimal_digits)
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('accounts.selectCurrency')} />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((currency) => (
                    <SelectItem key={currency.id} value={currency.id}>
                      {currency.code} - {currency.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {field.state.meta.isTouched && !field.state.meta.isValid && (
                <div className="text-sm text-destructive">
                  {field.state.meta.errors
                    .map((error) => error?.message)
                    .filter(Boolean)
                    .join('\n')}
                </div>
              )}
            </div>
          )}
        />
        <form.Field
          name="balance"
          children={(field) => (
            <FormField
              field={field}
              label={t('accounts.balance')}
              inputProps={{
                type: 'number',
                step: '0.01',
                placeholder: '0',
                value: field.state.value ?? '',
                onChange: (e) => {
                  field.handleChange(parseFloat(e.target.value))
                },
              }}
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
