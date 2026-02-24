import { useForm } from '@tanstack/react-form'
import { useTranslation } from 'react-i18next'
import { useRef, useCallback } from 'react'
import { z } from 'zod'
import type { FC } from 'react'

import { FieldGroup, FieldSet, Field, FieldLabel } from '@/components/ui/field'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ButtonGroup } from '@/components/ui/button-group'
import { SelectAccount } from '@/features/account'
import { MoneyInput, parseDecimal } from '@/features/money'
import { sanitizeDecimal } from '@/features/money/utils/sanitizeDecimal'
import { useAppSelector } from '@/store'
import { selectAccounts } from '@/store/slices/account'
import { selectExchangeRates } from '@/store/slices/exchange-rate'

import type { CreateTransferDto, FeeType, TransferFormValues } from '../types'
import {
  computeToAmount,
  computeFromAmount,
  computeRate,
} from '../lib/calculations'

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
  const accounts = useAppSelector(selectAccounts)
  const exchangeRates = useAppSelector(selectExchangeRates)

  const lastEditedRef = useRef<'from' | 'to'>('from')
  const isRateManualRef = useRef(false)

  const getAccount = useCallback(
    (id: string) => accounts.find((a) => a.id === id),
    [accounts]
  )

  const getCurrencyCode = useCallback(
    (accountId: string) =>
      getAccount(accountId)?.balance.original.currency.code,
    [getAccount]
  )

  const getCurrencyDigits = useCallback(
    (accountId: string) =>
      getAccount(accountId)?.balance.original.currency.decimal_digits,
    [getAccount]
  )

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
        fee: z.string(),
        feeType: z.enum(['percent', 'from_currency', 'to_currency']),
      }),
    },
    defaultValues,
    onSubmit: async ({ value }) => {
      const fromParsed = parseDecimal(value.fromAmount)
      const toParsed = parseDecimal(value.toAmount)
      const feeParsed = parseDecimal(value.fee || '0')

      const dto: CreateTransferDto = {
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
      }

      if (feeParsed.balance > 0) {
        dto.fee = {
          value: feeParsed.balance,
          scale: feeParsed.scale,
        }
      }

      await onSubmit(dto)
    },
  })

  const recalculate = useCallback(
    (overrides: Partial<TransferFormValues> = {}): void => {
      const values = { ...form.state.values, ...overrides }
      const { fromAmount, toAmount, rate, fee, feeType } = values

      if (lastEditedRef.current === 'from' && fromAmount) {
        const dp = getCurrencyDigits(values.toAccount)
        const newTo = computeToAmount(fromAmount, rate, fee, feeType, dp)
        form.setFieldValue('toAmount', newTo)
      } else if (lastEditedRef.current === 'to' && toAmount) {
        const dp = getCurrencyDigits(values.fromAccount)
        const newFrom = computeFromAmount(toAmount, rate, fee, feeType, dp)
        form.setFieldValue('fromAmount', newFrom)
      }
    },
    [form, getCurrencyDigits]
  )

  const handleAccountChange = useCallback(
    (
      side: 'from' | 'to',
      accountId: string,
      handleChange: (v: string) => void
    ): void => {
      handleChange(accountId)

      if (isRateManualRef.current) {
        recalculate(
          side === 'from'
            ? { fromAccount: accountId }
            : { toAccount: accountId }
        )
        return
      }

      const otherAccountId =
        side === 'from'
          ? form.getFieldValue('toAccount')
          : form.getFieldValue('fromAccount')

      const fromCode =
        side === 'from'
          ? getCurrencyCode(accountId)
          : getCurrencyCode(otherAccountId)
      const toCode =
        side === 'to'
          ? getCurrencyCode(accountId)
          : getCurrencyCode(otherAccountId)

      const newRate = computeRate(fromCode, toCode, exchangeRates)

      if (newRate) {
        form.setFieldValue('rate', newRate)
        recalculate(
          side === 'from'
            ? { fromAccount: accountId, rate: newRate }
            : { toAccount: accountId, rate: newRate }
        )
      }
    },
    [form, exchangeRates, getCurrencyCode, recalculate]
  )

  const handleFromAmountChange = useCallback(
    (value: string): void => {
      const sanitized = sanitizeDecimal(value)
      lastEditedRef.current = 'from'
      form.setFieldValue('fromAmount', sanitized)

      const rate = form.getFieldValue('rate')
      const fee = form.getFieldValue('fee')
      const feeType = form.getFieldValue('feeType')
      const dp = getCurrencyDigits(form.getFieldValue('toAccount'))
      const newTo = computeToAmount(sanitized, rate, fee, feeType, dp)
      form.setFieldValue('toAmount', newTo)
    },
    [form, getCurrencyDigits]
  )

  const handleToAmountChange = useCallback(
    (value: string): void => {
      const sanitized = sanitizeDecimal(value)
      lastEditedRef.current = 'to'
      form.setFieldValue('toAmount', sanitized)

      const rate = form.getFieldValue('rate')
      const fee = form.getFieldValue('fee')
      const feeType = form.getFieldValue('feeType')
      const dp = getCurrencyDigits(form.getFieldValue('fromAccount'))
      const newFrom = computeFromAmount(sanitized, rate, fee, feeType, dp)
      form.setFieldValue('fromAmount', newFrom)
    },
    [form, getCurrencyDigits]
  )

  const handleRateChange = useCallback(
    (value: string): void => {
      const sanitized = sanitizeDecimal(value)
      isRateManualRef.current = true
      form.setFieldValue('rate', sanitized)
      recalculate({ rate: sanitized })
    },
    [form, recalculate]
  )

  const handleFeeChange = useCallback(
    (value: string): void => {
      const sanitized = sanitizeDecimal(value)
      form.setFieldValue('fee', sanitized)
      recalculate({ fee: sanitized })
    },
    [form, recalculate]
  )

  const handleFeeTypeChange = useCallback(
    (value: string): void => {
      form.setFieldValue('feeType', value as FeeType)
      recalculate({ feeType: value as FeeType })
    },
    [form, recalculate]
  )

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
        {/* FROM Card */}
        <Card size="sm">
          <CardHeader>
            <CardTitle>{t('transfers.from')}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <form.Field
              name="fromAccount"
              children={(field) => (
                <SelectAccount
                  value={field.state.value}
                  onChange={(id) =>
                    handleAccountChange('from', id, (v) =>
                      field.handleChange(v)
                    )
                  }
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
                    onChange={handleFromAmountChange}
                    isError={
                      field.state.meta.isTouched && !field.state.meta.isValid
                    }
                  />
                )}
              />
            </Field>
          </CardContent>
        </Card>

        {/* Rate & Fee section */}
        <FieldGroup className="gap-3">
          <Field>
            <FieldLabel>{t('transfers.rate')}</FieldLabel>
            <form.Field
              name="rate"
              children={(field) => (
                <Input
                  type="text"
                  inputMode="decimal"
                  placeholder="1"
                  value={field.state.value}
                  onChange={(e) => handleRateChange(e.target.value)}
                  onBlur={field.handleBlur}
                />
              )}
            />
          </Field>

          <Field>
            <FieldLabel>{t('transfers.fee')}</FieldLabel>
            <ButtonGroup className="w-full">
              <form.Field
                name="fee"
                children={(field) => (
                  <Input
                    type="text"
                    inputMode="decimal"
                    placeholder="0"
                    value={field.state.value}
                    onChange={(e) => handleFeeChange(e.target.value)}
                    onBlur={field.handleBlur}
                    className="flex-1"
                  />
                )}
              />
              <form.Subscribe
                selector={(state) => ({
                  feeType: state.values.feeType,
                  fromAccountId: state.values.fromAccount,
                  toAccountId: state.values.toAccount,
                })}
                children={({ feeType, fromAccountId, toAccountId }) => {
                  const fromCode = getCurrencyCode(fromAccountId)
                  const toCode = getCurrencyCode(toAccountId)

                  return (
                    <Select
                      value={feeType}
                      onValueChange={handleFeeTypeChange}
                    >
                      <SelectTrigger className="w-auto min-w-16">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percent">%</SelectItem>
                        {fromCode && (
                          <SelectItem value="from_currency">
                            {fromCode}
                          </SelectItem>
                        )}
                        {toCode && (
                          <SelectItem value="to_currency">{toCode}</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  )
                }}
              />
            </ButtonGroup>
          </Field>
        </FieldGroup>

        {/* TO Card */}
        <Card size="sm">
          <CardHeader>
            <CardTitle>{t('transfers.to')}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <form.Field
              name="toAccount"
              children={(field) => (
                <SelectAccount
                  value={field.state.value}
                  onChange={(id) =>
                    handleAccountChange('to', id, (v) =>
                      field.handleChange(v)
                    )
                  }
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
                    onChange={handleToAmountChange}
                    isError={
                      field.state.meta.isTouched && !field.state.meta.isValid
                    }
                  />
                )}
              />
            </Field>
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
            {submitLabel ?? t('transfers.submit')}
          </Button>
        )}
      />
    </form>
  )
}
