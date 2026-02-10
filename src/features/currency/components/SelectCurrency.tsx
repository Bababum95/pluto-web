import { type FC, useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Search01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useQuery } from '@tanstack/react-query'

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group'
import { cn } from '@/lib/utils'

import { currencyApi } from '../api'
import type { Currency } from '../types'

type Props = {
  value?: string
  onChange?: (value: string) => void
}

const matchCurrency = (currency: Currency, query: string): boolean => {
  if (!query.trim()) return true
  const q = query.trim().toLowerCase()
  return (
    currency.name.toLowerCase().includes(q) ||
    currency.code.toLowerCase().includes(q)
  )
}

export const SelectCurrency: FC<Props> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const { t } = useTranslation()
  const { data = [] } = useQuery<Currency[]>({
    queryKey: ['currencies'],
    queryFn: currencyApi.list,
  })

  const handleChange = useCallback(
    (id: string) => {
      onChange?.(id)
      setSearchQuery('')
      setIsOpen(false)
    },
    [onChange]
  )

  const handleOpenChange = useCallback((open: boolean) => {
    setIsOpen(open)
    if (!open) setSearchQuery('')
  }, [])

  const selectedCurrency = useMemo(
    () => data.find((currency) => currency.id === value),
    [data, value]
  )

  const filteredData = useMemo(
    () => data.filter((currency) => matchCurrency(currency, searchQuery)),
    [data, searchQuery]
  )

  return (
    <Drawer open={isOpen} onOpenChange={handleOpenChange} modal={true}>
      <DrawerTrigger asChild>
        <Button variant="outline" size="lg">
          {selectedCurrency?.code}
        </Button>
      </DrawerTrigger>
      <DrawerContent className="h-[80vh]">
        <DrawerHeader>
          <DrawerTitle className="mb-2">
            {t('currency.select.title')}
          </DrawerTitle>
          <DrawerDescription className="mb-3">
            <InputGroup>
              <InputGroupAddon align="inline-start">
                <HugeiconsIcon icon={Search01Icon} className="size-4" />
              </InputGroupAddon>
              <InputGroupInput
                type="search"
                placeholder={t('currency.select.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoComplete="off"
              />
            </InputGroup>
          </DrawerDescription>
        </DrawerHeader>
        <div className="overflow-y-auto pb-4">
          {filteredData.length === 0 ? (
            <p className="px-4 py-3 text-muted-foreground text-sm">
              {t('currency.select.noResults')}
            </p>
          ) : (
            filteredData.map((currency) => (
              <div
                key={currency.id}
                onClick={() => handleChange(currency.id)}
                className={cn('flex items-center justify-between px-4 py-3', {
                  'bg-accent/50': currency.id === value,
                })}
              >
                <span>{currency.name}</span>
                <span>{currency.code}</span>
              </div>
            ))
          )}
        </div>
      </DrawerContent>
    </Drawer>
  )
}
