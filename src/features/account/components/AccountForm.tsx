import { useForm } from '@tanstack/react-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import type { FC } from 'react'

import { FieldGroup, FieldSet } from '@/components/ui/field'
import { FormField } from '@/components/forms/form-field'
import { ColorPicker } from '@/components/ui/color-picker'
import { IconPicker } from '@/components/ui/icon-picker'
import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import { SelectCurrency } from '@/features/currency'
import { MoneyInput, parseDecimal } from '@/features/money'

import type { CreateAccountDto, AccountFormValues } from '../types'

type Props = {
  defaultValues?: AccountFormValues
  onSubmit: (values: CreateAccountDto) => Promise<void>
  submitLabel?: string
}

export const AccountForm: FC<Props> = ({
  defaultValues,
  onSubmit,
  submitLabel,
}) => {
  const { t } = useTranslation()

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
        balance: z.string(),
      }),
    },
    defaultValues: defaultValues,
    onSubmit: async ({ value }) => {
      await onSubmit({
        ...value,
        ...parseDecimal(value.balance),
      })
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
        <FieldSet disabled={form.state.isSubmitting}>
          <ButtonGroup className="w-full">
            <form.Field
              name="balance"
              children={(field) => (
                <MoneyInput
                  value={field.state.value}
                  onChange={(value) => field.handleChange(value)}
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
          <form.Field
            name="description"
            children={(field) => (
              <FormField field={field} label={t('accounts.description')} />
            )}
          />
        </FieldSet>
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
