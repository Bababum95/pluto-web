import Decimal from 'decimal.js'
import { useForm } from '@tanstack/react-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import type { FC } from 'react'

import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FieldGroup, FieldSet, Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SelectAccount } from '@/features/account'
import { MoneyField, DEFAULT_CURRENCY, sanitizeDecimal } from '@/features/money'
import { getFormFieldErrorMessage } from '@/lib/form/getFormFieldErrorMessage'
import { useAppSelector } from '@/store'
import { selectAccounts } from '@/store/slices/account'
import { selectExchangeRates } from '@/store/slices/exchange-rate'
import type { Account } from '@/features/account/types'

import {
  calculateTransferRate,
  deriveFromAmount,
  deriveToAmount,
  toDtoAmount,
  normalizeFeeToFrom,
} from '../lib'
import type { CreateTransferDto, FeeType, TransferFormValues } from '../types'

import { RateField } from './RateField'

type Props = {
  defaultValues: TransferFormValues
  onSubmit: (values: CreateTransferDto) => Promise<void>
  submitLabel?: string
}

const getCurrencyCode = (accounts: Account[], account: string): string => {
  return (
    accounts.find((acc) => acc.id === account)?.balance.original.currency
      ?.code ?? DEFAULT_CURRENCY.code
  )
}

export const TransferForm: FC<Props> = ({
  defaultValues,
  onSubmit,
  submitLabel,
}) => {
  const { t } = useTranslation()
  const accounts = useAppSelector(selectAccounts)
  const rates = useAppSelector(selectExchangeRates)

  const form = useForm({
    validators: {
      onSubmit: z
        .object({
          fromAccount: z
            .string()
            .min(1, { message: t('forms.validation.required') }),
          toAccount: z
            .string()
            .min(1, { message: t('forms.validation.required') }),
          fromAmount: z.string().nullable().optional(),
          toAmount: z.string().nullable().optional(),
          rate: z.string().nullable().optional(),
          fee: z.string().nullable().optional(),
          feeType: z.enum(['percent', 'from_currency', 'to_currency']),
        })
        .refine((data) => !!data.fromAmount || !!data.toAmount, {
          message: t('forms.validation.required'),
          path: ['fromAmount'],
        }),
    },
    defaultValues,
    onSubmit: async ({ value }) => {
      const feeDecimal = value.fee ? new Decimal(value.fee) : null
      let fromDecimal = value.fromAmount ? new Decimal(value.fromAmount) : null
      let toDecimal = value.toAmount ? new Decimal(value.toAmount) : null

      const rateDecimal = value.rate
        ? new Decimal(value.rate)
        : calculateTransferRate({
            rates,
            fee: { value: feeDecimal, type: value.feeType },
            from: {
              value: fromDecimal,
              code: getCurrencyCode(accounts, value.fromAccount),
            },
            to: {
              value: toDecimal,
              code: getCurrencyCode(accounts, value.toAccount),
            },
          })

      if (!rateDecimal) throw new Error('Rate not found')

      fromDecimal = deriveFromAmount({
        from: fromDecimal,
        to: toDecimal,
        rate: rateDecimal,
        fee: feeDecimal,
        feeType: value.feeType,
      })

      toDecimal = deriveToAmount({
        from: fromDecimal,
        to: toDecimal,
        rate: rateDecimal,
        fee: feeDecimal,
        feeType: value.feeType,
      })

      if (!fromDecimal || !toDecimal) {
        throw new Error('Invalid transfer amounts')
      }

      const dto: CreateTransferDto = {
        rate: rateDecimal.toNumber(),
        from: {
          account: value.fromAccount,
          ...toDtoAmount(fromDecimal),
        },
        to: {
          account: value.toAccount,
          ...toDtoAmount(toDecimal),
        },
      }

      if (feeDecimal && feeDecimal.gt(0)) {
        const normalizedFee = normalizeFeeToFrom(
          feeDecimal,
          fromDecimal,
          rateDecimal,
          value.feeType
        )

        dto.fee = toDtoAmount(normalizedFee)
      }

      await onSubmit(dto)
    },
  })

  return (
    <form
      className="flex flex-1 flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }}
    >
      <FieldSet disabled={form.state.isSubmitting}>
        <Card size="sm">
          <CardHeader>
            <CardTitle>{t('transfers.fields.from')}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <form.Field
              name="fromAccount"
              children={(field) => (
                <SelectAccount
                  value={field.state.value}
                  onChange={(id) => field.handleChange(id)}
                  isError={
                    field.state.meta.isTouched && !field.state.meta.isValid
                  }
                  errorMessage={t('forms.validation.required')}
                />
              )}
            />
            <form.Subscribe
              selector={(state) => state.values.fromAccount}
              children={(account) => (
                <form.Field
                  name="fromAmount"
                  children={(field) => (
                    <MoneyField
                      label={t('common.fields.amount')}
                      inputProps={{
                        value: field.state.value ?? '',
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
          </CardContent>
        </Card>

        <FieldGroup className="flex-row gap-3">
          <form.Subscribe
            selector={(state) => ({
              fromAmount: state.values.fromAmount,
              toAmount: state.values.toAmount,
              fee: state.values.fee,
              feeType: state.values.feeType,
              fromAccount: state.values.fromAccount,
              toAccount: state.values.toAccount,
            })}
          >
            {(values) => (
              <form.Field name="rate">
                {(field) => (
                  <RateField
                    label={t('transfers.fields.rate')}
                    value={field.state.value ?? ''}
                    onChange={field.handleChange}
                    onBlur={field.handleBlur}
                    {...values}
                  />
                )}
              </form.Field>
            )}
          </form.Subscribe>

          <Field>
            <FieldLabel>{t('transfers.fields.fee')}</FieldLabel>
            <ButtonGroup className="w-full">
              <form.Field
                name="fee"
                children={(field) => (
                  <Input
                    type="text"
                    inputMode="decimal"
                    placeholder="0"
                    size="sm"
                    value={field.state.value ?? ''}
                    onChange={(evt) =>
                      field.handleChange(sanitizeDecimal(evt.target.value))
                    }
                    className="flex-1"
                    onBlur={field.handleBlur}
                  />
                )}
              />
              <form.Subscribe
                selector={(state) => ({
                  from: state.values.fromAccount,
                  to: state.values.toAccount,
                })}
                children={({ from, to }) => (
                  <form.Field
                    name="feeType"
                    children={(field) => {
                      const fromCode = getCurrencyCode(accounts, from)
                      const toCode = getCurrencyCode(accounts, to)

                      return (
                        <Select
                          value={field.state.value ?? ''}
                          onValueChange={(value) => {
                            field.handleChange(value as FeeType)
                          }}
                        >
                          <SelectTrigger className="w-auto min-w-16" size="sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectItem value="percent">%</SelectItem>
                              {(fromCode || toCode) && <SelectSeparator />}
                              {fromCode && (
                                <SelectItem value="from_currency">
                                  {fromCode}
                                </SelectItem>
                              )}
                              {toCode && fromCode !== toCode && (
                                <SelectItem value="to_currency">
                                  {toCode}
                                </SelectItem>
                              )}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      )
                    }}
                  />
                )}
              />
            </ButtonGroup>
          </Field>
        </FieldGroup>

        <Card size="sm">
          <CardHeader>
            <CardTitle>{t('transfers.fields.to')}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <form.Field
              name="toAccount"
              children={(field) => (
                <SelectAccount
                  value={field.state.value}
                  onChange={(id) => field.handleChange(id)}
                  isError={
                    field.state.meta.isTouched && !field.state.meta.isValid
                  }
                  errorMessage={t('forms.validation.required')}
                />
              )}
            />
            <form.Subscribe
              selector={(state) => state.values.toAccount}
              children={(account) => (
                <form.Field
                  name="toAmount"
                  children={(field) => (
                    <MoneyField
                      label={t('common.fields.amount')}
                      inputProps={{
                        value: field.state.value ?? '',
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
          </CardContent>
        </Card>
      </FieldSet>

      <form.Subscribe
        selector={(state) => [state.canSubmit, state.isSubmitting]}
        children={([canSubmit, isSubmitting]) => (
          <Button
            type="submit"
            className="mt-auto w-full"
            disabled={!canSubmit}
            isLoading={isSubmitting as boolean}
          >
            {submitLabel ?? t('transfers.actions.submit')}
          </Button>
        )}
      />
    </form>
  )
}
