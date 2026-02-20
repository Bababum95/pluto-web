import { AppLayout } from '@/components/AppLayout'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { toast } from 'sonner'

import { ButtonGroup } from '@/components/ui/button-group'
import { Button } from '@/components/ui/button'
import { FormField } from '@/components/forms/form-field'
import { SelectAccount } from '@/features/account'
import { CategoryPicker } from '@/features/category'
import { MoneyInput, parseDecimal } from '@/features/money'
import { TransactionTypeTabs } from '@/features/transaction-type'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { selectAccounts } from '@/store/slices/account'
import { selectSettings } from '@/store/slices/settings'
import { FieldError } from '@/components/ui/field'
import { createTransaction } from '@/store/slices/transaction'

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
          .min(1, { message: t('transaction.errors.amountRequired') }),
        comment: z.string(),
        account: z
          .string()
          .min(1, { message: t('transaction.errors.accountRequired') }),
        category: z
          .string()
          .min(1, { message: t('transaction.errors.categoryRequired') }),
      }),
    },
    defaultValues: {
      amount: '',
      account: settings?.account?.id ?? '',
      comment: '',
      category: '',
    },
    onSubmit: async ({ value }) => {
      const { balance, scale } = parseDecimal(value.amount)

      await dispatch(
        createTransaction({
          amount: balance,
          scale: scale,
          account: value.account,
          comment: value.comment,
          category: value.category,
        })
      )
      navigate({ to: '/' })
      toast.success(t('transaction.added'))
    },
  })

  return (
    <AppLayout title={t('transaction.title')} showBackButton>
      <TransactionTypeTabs>
        <form
          className="flex flex-col gap-4 pt-2 flex-1"
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
        >
          <form.Field
            name="amount"
            children={(field) => {
              const isError =
                field.state.meta.isTouched && !field.state.meta.isValid

              return (
                <div className="flex flex-col gap-2">
                  <ButtonGroup className="w-full">
                    <MoneyInput
                      value={field.state.value}
                      onChange={(value) => field.handleChange(value)}
                      isError={isError}
                    />
                    <form.Subscribe
                      selector={(state) => state.values.account}
                      children={(accountId) => (
                        <Button variant="outline" size="lg" type="button">
                          {accounts.find((acc) => acc.id === accountId)?.balance
                            .original.currency?.code ??
                            settings?.currency?.code}
                        </Button>
                      )}
                    />
                  </ButtonGroup>
                  {isError && (
                    <FieldError>
                      {field.state.meta.errors
                        .map((error) => error?.message)
                        .filter(Boolean)
                        .join('\n')}
                    </FieldError>
                  )}
                </div>
              )
            }}
          />
          <form.Field
            name="account"
            children={(field) => (
              <SelectAccount
                value={field.state.value}
                onChange={(value) => field.handleChange(value)}
                isError={
                  field.state.meta.isTouched && !field.state.meta.isValid
                }
                errorMessage={field.state.meta.errors
                  .map((error) => error?.message)
                  .filter(Boolean)
                  .join('\n')}
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
                errorMessage={field.state.meta.errors
                  .map((error) => error?.message)
                  .filter(Boolean)
                  .join('\n')}
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
                className="mt-auto w-full"
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
