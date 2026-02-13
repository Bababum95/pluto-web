import { AppLayout } from '@/components/AppLayout'
import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'

import { TransactionTypeTabs } from '@/features/transaction-type'
import { ButtonGroup } from '@/components/ui/button-group'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import { selectAccounts } from '@/store/slices/account'
import { useAppSelector } from '@/store/hooks'
import { sanitizeDecimal } from '@/features/money'
import { selectSettings } from '@/store/slices/settings'
import { SelectAccount } from '@/features/account'
import { FormField } from '@/components/forms/form-field'
import { CategoryPicker } from '@/features/category'

export const Route = createFileRoute('/_app/transaction')({
  component: TransactionPage,
})

function TransactionPage() {
  const { t } = useTranslation()
  const form = useForm({
    validators: {
      onSubmit: z.object({
        amount: z.string().min(1),
        comment: z.string(),
        account: z
          .string()
          .min(1, { message: t('transaction.accountRequired') }),
        category: z
          .string()
          .min(1, { message: t('transaction.categoryRequired') }),
      }),
    },
    defaultValues: {
      amount: '',
      account: '',
      comment: '',
      category: '',
    },
  })
  const accounts = useAppSelector(selectAccounts)
  const settings = useAppSelector(selectSettings)

  return (
    <AppLayout title={t('transaction.title')} showBackButton>
      <TransactionTypeTabs>
        <form
          className="flex flex-col gap-4 py-4"
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
        >
          <ButtonGroup className="w-full">
            <form.Field
              name="amount"
              children={(field) => (
                <Input
                  autoFocus
                  placeholder="0"
                  type="text"
                  inputMode="decimal"
                  value={field.state.value}
                  onChange={(e) => {
                    field.handleChange(sanitizeDecimal(e.target.value))
                  }}
                />
              )}
            />
            <form.Subscribe
              selector={(state) => state.values.account}
              children={(accountId) => (
                <Button variant="outline" size="lg" type="button">
                  {accounts.find((acc) => acc.id === accountId)?.currency
                    ?.code ?? settings?.currency?.code}
                </Button>
              )}
            />
          </ButtonGroup>
          <form.Field
            name="account"
            children={(field) => (
              <SelectAccount
                value={field.state.value}
                onChange={(value) => field.handleChange(value)}
              />
            )}
          />
          <form.Field
            name="category"
            children={(field) => (
              <CategoryPicker
                value={field.state.value}
                onChange={(value) => field.handleChange(value)}
              />
            )}
          />
          <form.Field
            name="comment"
            children={(field) => (
              <FormField field={field} label={t('transaction.comment')} />
            )}
          />
        </form>
      </TransactionTypeTabs>
    </AppLayout>
  )
}
