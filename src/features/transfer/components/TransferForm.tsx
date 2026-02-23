import { useForm } from '@tanstack/react-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import type { FC } from 'react'

import { FieldGroup, FieldSet, Field, FieldLabel } from '@/components/ui/field'
import { Button } from '@/components/ui/button'
import { SelectAccount } from '@/features/account'
import { MoneyInput, parseDecimal } from '@/features/money'
import { FormField } from '@/components/forms/form-field'

import type { CreateTransferDto, TransferFormValues } from '../types'

type Props = {
  defaultValues: TransferFormValues
  onSubmit: (values: CreateTransferDto) => Promise<void>
  submitLabel?: string
}

export const TransferForm: FC<Props> = ({
  defaultValues,
  onSubmit,
  submitLabel,
}) => {
  const { t } = useTranslation()

  const form = useForm({
    validators: {
      onSubmit: z.object({
        fromAccount: z
          .string()
          .min(1, { message: t('transfers.errors.fromAccount.required') }),
        toAccount: z
          .string()
          .min(1, { message: t('transfers.errors.toAccount.required') }),
        fromAmount: z
          .string()
          .min(1, { message: t('transfers.errors.amount.required') }),
        toAmount: z
          .string()
          .min(1, { message: t('transfers.errors.amount.required') }),
        rate: z.string().min(1),
      }),
    },
    defaultValues,
    onSubmit: async ({ value }) => {
      const fromParsed = parseDecimal(value.fromAmount)
      const toParsed = parseDecimal(value.toAmount)

      await onSubmit({
        from: {
          account: value.fromAccount,
          value: fromParsed.balance,
          scale: fromParsed.scale,
        },
        to: {
          account: value.toAccount,
          value: toParsed.balance,
          scale: toParsed.scale,
        },
        rate: Number(value.rate),
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
          <form.Field
            name="fromAccount"
            children={(field) => (
              <SelectAccount
                value={field.state.value}
                onChange={(value) => field.handleChange(value)}
                isError={
                  field.state.meta.isTouched && !field.state.meta.isValid
                }
                errorMessage={t('transfers.errors.fromAccount.required')}
              />
            )}
          />

          <Field>
            <FieldLabel>{t('transfers.fromAmount')}</FieldLabel>
            <form.Field
              name="fromAmount"
              children={(field) => (
                <MoneyInput
                  value={field.state.value}
                  onChange={(value) => field.handleChange(value)}
                  isError={
                    field.state.meta.isTouched && !field.state.meta.isValid
                  }
                />
              )}
            />
          </Field>

          <form.Field
            name="toAccount"
            children={(field) => (
              <SelectAccount
                value={field.state.value}
                onChange={(value) => field.handleChange(value)}
                isError={
                  field.state.meta.isTouched && !field.state.meta.isValid
                }
                errorMessage={t('transfers.errors.toAccount.required')}
              />
            )}
          />

          <Field>
            <FieldLabel>{t('transfers.toAmount')}</FieldLabel>
            <form.Field
              name="toAmount"
              children={(field) => (
                <MoneyInput
                  value={field.state.value}
                  onChange={(value) => field.handleChange(value)}
                  isError={
                    field.state.meta.isTouched && !field.state.meta.isValid
                  }
                />
              )}
            />
          </Field>

          <form.Field
            name="rate"
            children={(field) => (
              <FormField
                field={field}
                label={t('transfers.rate')}
                inputProps={{ type: 'text', inputMode: 'decimal' }}
              />
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
            isLoading={isSubmitting as boolean}
          >
            {submitLabel ?? t('transfers.submit')}
          </Button>
        )}
      />
    </form>
  )
}
