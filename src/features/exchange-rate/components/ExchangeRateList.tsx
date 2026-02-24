import { useMemo, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { HugeiconsIcon } from '@hugeicons/react'
import { Search01Icon } from '@hugeicons/core-free-icons'

import dayjs from '@/lib/dayjs'
import { Card } from '@/components/ui/card'
import {
  Item,
  ItemContent,
  ItemGroup,
  ItemSeparator,
  ItemTitle,
  ItemDescription,
  ItemActions,
} from '@/components/ui/item'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group'
import { Spinner } from '@/components/ui/spinner'
import { useAppSelector } from '@/store'
import {
  selectExchangeRates,
  selectExchangeRatesStatus,
} from '@/store/slices/exchange-rate'
import { selectCurrency } from '@/store/slices/settings'

import type { ExchangeRate } from '../types'

function formatRate(rate: number | undefined | null): string {
  if (rate == null || typeof rate !== 'number' || Number.isNaN(rate)) {
    return '—'
  }
  if (rate >= 1) {
    return rate.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    })
  }
  return rate.toLocaleString(undefined, {
    minimumFractionDigits: 4,
    maximumFractionDigits: 8,
  })
}

function matchRate(item: ExchangeRate, query: string): boolean {
  if (!query.trim()) return true
  const q = query.trim().toLowerCase()
  return item.code.toLowerCase().includes(q)
}

export function ExchangeRateList() {
  const { t } = useTranslation()
  const rates = useAppSelector(selectExchangeRates)
  const status = useAppSelector(selectExchangeRatesStatus)
  const baseCurrency = useAppSelector(selectCurrency)
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value)
    },
    []
  )

  const filteredRates = useMemo(
    () => rates.filter((rate) => matchRate(rate, searchQuery)),
    [rates, searchQuery]
  )

  if (status === 'pending') {
    return (
      <div className="flex flex-1 items-center justify-center py-8">
        <Spinner />
      </div>
    )
  }

  if (status === 'failed') {
    return (
      <div className="flex flex-1 items-center justify-center py-8">
        <p className="text-muted-foreground text-sm">
          {t('exchangeRates.error')}
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <Card size="sm" className="py-1!">
        <ItemGroup>
          <Item>
            <ItemContent>
              <ItemTitle>{t('exchangeRates.baseCurrency')}</ItemTitle>
            </ItemContent>
            <ItemActions>{baseCurrency.code}</ItemActions>
          </Item>
          <ItemSeparator />
          <Item>
            <ItemContent>
              <ItemTitle>{t('exchangeRates.updatedAt')}</ItemTitle>
            </ItemContent>
            <ItemActions>
              {dayjs(rates[0].updatedAt).format('DD.MM.YYYY HH:mm')}
            </ItemActions>
          </Item>
        </ItemGroup>
      </Card>

      <InputGroup>
        <InputGroupAddon align="inline-start">
          <HugeiconsIcon icon={Search01Icon} className="size-4" />
        </InputGroupAddon>
        <InputGroupInput
          type="search"
          placeholder={t('exchangeRates.searchPlaceholder')}
          value={searchQuery}
          onChange={handleSearchChange}
          autoComplete="off"
        />
      </InputGroup>

      {filteredRates.length === 0 ? (
        <div className="flex flex-1 items-center justify-center py-8">
          <p className="text-muted-foreground text-sm">
            {searchQuery
              ? t('exchangeRates.noResults')
              : t('exchangeRates.empty')}
          </p>
        </div>
      ) : (
        <Card size="sm" className="py-1!">
          <ItemGroup>
            {filteredRates.map((rate, index) => (
              <div key={rate.id}>
                <Item size="sm">
                  <ItemContent className="gap-0">
                    <ItemTitle>{rate.code}</ItemTitle>
                    <ItemDescription>
                      1 {baseCurrency.code} = {formatRate(rate.value)}
                      {rate.code}
                    </ItemDescription>
                  </ItemContent>
                  <ItemActions>
                    <span className="text-sm font-medium tabular-nums">
                      {formatRate(rate.value)}
                    </span>
                  </ItemActions>
                </Item>
                {index < filteredRates.length - 1 && <ItemSeparator />}
              </div>
            ))}
          </ItemGroup>
        </Card>
      )}
    </div>
  )
}
