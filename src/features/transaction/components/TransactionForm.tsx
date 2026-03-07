import { useForm } from '@tanstack/react-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'

import dayjs from '@/lib/dayjs'
import { Button } from '@/components/ui/button'
import { FormField } from '@/components/forms/form-field'
import { SelectAccount } from '@/features/account/components/SelectAccount'
import { CategoryPicker } from '@/features/category'
import { TagPicker } from '@/features/tag'
import { DatePicker } from '@/components/ui/date-picker'
import { MoneyField } from '@/features/money/components/MoneyField'
import { useAppSelector } from '@/store/hooks'
import { selectAccounts } from '@/store/slices/account'
import { getFormFieldErrorMessage } from '@/lib/form/getFormFieldErrorMessage'

import type { TransactionFormType } from '../types'

type TransactionFormProps = {
  defaultValues: TransactionFormType
  onSubmit: (values: TransactionFormType) => Promise<void>
  submitLabel?: string
  amountCurrency?: string
}

export function TransactionForm({
  defaultValues,
  onSubmit,
  submitLabel,
  amountCurrency,
}: TransactionFormProps) {
  const { t } = useTranslation()
  const accounts = useAppSelector(selectAccounts)

  const form = useForm({
    validators: {
      onSubmit: z.object({
        amount: z
          .string()
          .min(1, { message: t('transactions.create.errors.amount.required') }),
        comment: z.string(),
        account: z.string().min(1, {
          message: t('transactions.create.errors.account.required'),
        }),
        category: z.string().min(1, {
          message: t('transactions.create.errors.category.required'),
        }),
        tags: z.array(z.string()),
        date: z
          .date({ message: t('transactions.create.errors.date.required') })
          .refine((date) => !dayjs(date).isAfter(dayjs(), 'day'), {
            message: t('transactions.create.errors.date.inFuture'),
          }),
      }),
    },
    defaultValues,
    onSubmit: async ({ value }) => await onSubmit(value),
  })

  return (
    <form
      className="flex flex-col gap-4 pt-2 flex-1 pb-14"
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }}
    >
      <form.Subscribe
        selector={(state) => state.values.account}
        children={(account) => (
          <form.Field
            name="amount"
            children={(field) => (
              <MoneyField
                inputProps={{
                  value: field.state.value,
                  onChange: (value) => field.handleChange(value),
                }}
                isError={
                  field.state.meta.isTouched && !field.state.meta.isValid
                }
                errorMessage={getFormFieldErrorMessage(field.state.meta.errors)}
                currency={
                  accounts.find((acc) => acc.id === account)?.balance.original
                    .currency?.code ?? amountCurrency
                }
              />
            )}
          />
        )}
      />
      <form.Field
        name="account"
        children={(field) => (
          <SelectAccount
            value={field.state.value}
            onChange={(value) => field.handleChange(value)}
            errorMessage={getFormFieldErrorMessage(field.state.meta.errors)}
            isError={field.state.meta.isTouched && !field.state.meta.isValid}
          />
        )}
      />
      <form.Field
        name="category"
        children={(field) => (
          <CategoryPicker
            value={field.state.value}
            onChange={(value) => field.handleChange(value)}
            isError={field.state.meta.isTouched && !field.state.meta.isValid}
            errorMessage={getFormFieldErrorMessage(field.state.meta.errors)}
          />
        )}
      />
      <form.Field
        name="date"
        children={(field) => (
          <DatePicker
            value={field.state.value}
            onChange={(value) => {
              if (value) field.handleChange(value)
            }}
            isError={field.state.meta.isTouched && !field.state.meta.isValid}
            errorMessage={getFormFieldErrorMessage(field.state.meta.errors)}
            label={t('transactions.create.date')}
          />
        )}
      />
      <form.Field
        name="tags"
        children={(field) => (
          <TagPicker
            values={field.state.value}
            onChange={(value) => field.handleChange(value)}
            multiple
          />
        )}
      />
      <form.Field
        name="comment"
        children={(field) => (
          <FormField field={field} label={t('transactions.create.comment')} />
        )}
      />
      <form.Subscribe
        selector={(state) => [state.canSubmit, state.isSubmitting]}
        children={([canSubmit, isSubmitting]) => (
          <Button
            type="submit"
            className="fixed bottom-14 left-4 right-4 mb-safe"
            disabled={!canSubmit}
            disabledStyle="bg-muted text-muted-foreground"
            isLoading={isSubmitting}
          >
            {submitLabel ?? t('transactions.create.add')}
          </Button>
        )}
      />
    </form>
  )
}
