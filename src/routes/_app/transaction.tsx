import { AppLayout } from '@/components/AppLayout'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { toast } from 'sonner'

import dayjs from '@/lib/dayjs'
import { Button } from '@/components/ui/button'
import { FormField } from '@/components/forms/form-field'
import { SelectAccount } from '@/features/account'
import { CategoryPicker } from '@/features/category'
import { TagPicker } from '@/features/tag'
import { MoneyField, parseDecimal } from '@/features/money'
import { TransactionTypeTabs } from '@/features/transaction-type'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { selectAccounts } from '@/store/slices/account'
import { selectSettings } from '@/store/slices/settings'
import { createTransaction } from '@/store/slices/transaction'
import { DatePicker } from '@/components/ui/date-picker'
import { getFormFieldErrorMessage } from '@/lib/form/getFormFieldErrorMessage'

export const Route = createFileRoute('/_app/transaction')({
  component: TransactionPage,
})

function TransactionPage() {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const settings = useAppSelector(selectSettings)
  const accounts = useAppSelector(selectAccounts)

  const form = useForm({
    validators: {
      onSubmit: z.object({
        amount: z
          .string()
          .min(1, { message: t('transaction.errors.amount.required') }),
        comment: z.string(),
        account: z
          .string()
          .min(1, { message: t('transaction.errors.account.required') }),
        category: z
          .string()
          .min(1, { message: t('transaction.errors.category.required') }),
        tags: z.array(z.string()),
        date: z
          .date({ message: t('transaction.errors.date.required') })
          .max(dayjs().toDate(), {
            message: t('transaction.errors.date.inFuture'),
          }),
      }),
    },
    defaultValues: {
      amount: '',
      account: settings?.account?.id ?? '',
      comment: '',
      category: '',
      tags: [] as string[],
      date: dayjs().toDate(),
    },
    onSubmit: async ({ value }) => {
      const { balance, scale } = parseDecimal(value.amount)

      await dispatch(
        createTransaction({
          ...value,
          amount: balance,
          scale: scale,
          date: dayjs(value.date).format('YYYY-MM-DD'),
        })
      ).unwrap()
      navigate({ to: '/' })
      toast.success(t('transaction.added'))
    },
  })

  return (
    <AppLayout title={t('transaction.title')} showBackButton>
      <TransactionTypeTabs>
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
                    errorMessage={getFormFieldErrorMessage(
                      field.state.meta.errors
                    )}
                    currency={
                      accounts.find((acc) => acc.id === account)?.balance
                        .original.currency?.code
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
                isError={
                  field.state.meta.isTouched && !field.state.meta.isValid
                }
              />
            )}
          />
          <form.Field
            name="category"
            children={(field) => (
              <CategoryPicker
                value={field.state.value}
                onChange={(value) => field.handleChange(value)}
                isError={
                  field.state.meta.isTouched && !field.state.meta.isValid
                }
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
                isError={
                  field.state.meta.isTouched && !field.state.meta.isValid
                }
                errorMessage={getFormFieldErrorMessage(field.state.meta.errors)}
                label={t('transaction.date')}
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
              <FormField field={field} label={t('transaction.comment')} />
            )}
          />
          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
            children={([canSubmit, isSubmitting]) => (
              <Button
                type="submit"
                className="fixed bottom-14 left-4 right-4 mb-safe"
                disabled={!canSubmit}
                isLoading={isSubmitting}
              >
                {t('transaction.add')}
              </Button>
            )}
          />
        </form>
      </TransactionTypeTabs>
    </AppLayout>
  )
}
