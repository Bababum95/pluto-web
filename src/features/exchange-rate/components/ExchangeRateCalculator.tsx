import { useState, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowDataTransferVerticalIcon } from '@hugeicons/core-free-icons'

import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAppSelector } from '@/store'
import {
  selectExchangeRates,
  selectExchangeRatesStatus,
} from '@/store/slices/exchange-rate'
import { selectCurrency } from '@/store/slices/settings'

import type { RateDto } from '../types'

function getRateValue(
  rates: RateDto[],
  baseCurrencyCode: string,
  code: string
): number {
  if (code === baseCurrencyCode) return 1
  const found = rates.find((r) => r.code === code)
  return found?.value ?? 1
}

function convert(
  amount: number,
  fromCode: string,
  toCode: string,
  rates: RateDto[],
  baseCurrencyCode: string
): number {
  if (fromCode === toCode) return amount
  const fromRate = getRateValue(rates, baseCurrencyCode, fromCode)
  const toRate = getRateValue(rates, baseCurrencyCode, toCode)
  // Convert via base currency: amount / fromRate gives base units, * toRate gives target
  return (amount / fromRate) * toRate
}

function formatAmount(value: number): string {
  if (!isFinite(value) || isNaN(value)) return ''
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: value >= 1 ? 4 : 8,
  })
}

function parseAmount(raw: string): number {
  const cleaned = raw.replace(/[^\d.,]/g, '').replace(',', '.')
  const parsed = parseFloat(cleaned)
  return isNaN(parsed) ? 0 : parsed
}

export function ExchangeRateCalculator() {
  const { t } = useTranslation()
  const rates = useAppSelector(selectExchangeRates)
  const status = useAppSelector(selectExchangeRatesStatus)
  const baseCurrency = useAppSelector(selectCurrency)

  const currencyOptions = useMemo(() => {
    const options = [
      { code: baseCurrency.code },
      ...rates.map((r) => ({ code: r.code })),
    ]
    const seen = new Set<string>()
    return options.filter((o) => {
      if (seen.has(o.code)) return false
      seen.add(o.code)
      return true
    })
  }, [rates, baseCurrency.code])

  const secondCode =
    currencyOptions.find((c) => c.code !== baseCurrency.code)?.code ??
    baseCurrency.code

  const [fromCode, setFromCode] = useState<string>(baseCurrency.code)
  const [toCode, setToCode] = useState<string>(secondCode)
  const [fromRaw, setFromRaw] = useState<string>('1')
  const [swapRotated, setSwapRotated] = useState(false)

  const toAmount = useMemo(() => {
    const amount = parseAmount(fromRaw)
    return convert(amount, fromCode, toCode, rates, baseCurrency.code)
  }, [fromRaw, fromCode, toCode, rates, baseCurrency.code])

  const handleFromChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value
      if (/^[\d.,]*$/.test(raw)) setFromRaw(raw)
    },
    []
  )

  const handleSwap = useCallback(() => {
    setSwapRotated((prev) => !prev)
    setFromCode(toCode)
    setToCode(fromCode)
    const converted = convert(
      parseAmount(fromRaw),
      fromCode,
      toCode,
      rates,
      baseCurrency.code
    )
    setFromRaw(formatAmount(converted))
  }, [fromCode, toCode, fromRaw, rates, baseCurrency.code])

  const handleFromCodeChange = useCallback((val: string) => {
    setFromCode(val)
  }, [])

  const handleToCodeChange = useCallback((val: string) => {
    setToCode(val)
  }, [])

  if (status !== 'success' || currencyOptions.length < 2) return null

  return (
    <div>
      <div className="flex flex-col gap-1 px-3">
        {/* FROM row */}
        <div className="flex items-center gap-2">
          <Input
            size="sm"
            value={fromRaw}
            onChange={handleFromChange}
            inputMode="decimal"
            className="tabular-nums text-base font-medium"
            aria-label={t('exchangeRates.calculator.fromAmount')}
          />
          <CurrencySelect
            value={fromCode}
            options={currencyOptions}
            onValueChange={handleFromCodeChange}
          />
        </div>

        {/* Swap button */}
        <div className="flex justify-center py-0.5">
          <button
            type="button"
            onClick={handleSwap}
            className={cn(
              'text-muted-foreground hover:text-foreground hover:bg-accent flex size-7 items-center justify-center rounded-full transition-all duration-200',
              swapRotated && 'rotate-180'
            )}
            aria-label={t('exchangeRates.calculator.swap')}
          >
            <HugeiconsIcon
              icon={ArrowDataTransferVerticalIcon}
              className="size-4"
            />
          </button>
        </div>

        {/* TO row */}
        <div className="flex items-center gap-2">
          <Input
            size="sm"
            value={formatAmount(toAmount)}
            readOnly
            className="tabular-nums text-base font-medium bg-muted/30 cursor-default"
            aria-label={t('exchangeRates.calculator.toAmount')}
          />
          <CurrencySelect
            value={toCode}
            options={currencyOptions}
            onValueChange={handleToCodeChange}
          />
        </div>
      </div>
    </div>
  )
}

type CurrencySelectProps = {
  value: string
  options: { code: string }[]
  onValueChange: (val: string) => void
}

function CurrencySelect({
  value,
  options,
  onValueChange,
}: CurrencySelectProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger size="sm" className="w-24 shrink-0">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {options.map((opt) => (
            <SelectItem key={opt.code} value={opt.code}>
              {opt.code}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
