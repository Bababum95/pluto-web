'use client'

import { useCallback, useMemo, useState, type FC } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { MoreHorizontalCircle01Icon } from '@hugeicons/core-free-icons'
import { useTranslation } from 'react-i18next'

import { useAppSelector } from '@/store/hooks'
import { selectCategories } from '@/store/slices/category'
import { selectTransactionType } from '@/store/slices/transaction-type'
import { CategoryCard } from './CategoryCard'
import { Button } from '@/components/ui/button'
import { Field, FieldLabel } from '@/components/ui/field'
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui/drawer'

import type { Category } from '../types'

const VISIBLE_CATEGORIES_COUNT = 7

export type CategoryPickerProps = {
  /** Current value: category id (controlled). */
  value?: string
  /** Default value (uncontrolled). */
  defaultValue?: string
  /** Called when category changes; receives category id. */
  onChange?: (categoryId: string) => void
  /** Placeholder when no category is selected. */
  placeholder?: string
  /** Optional transaction type override; defaults to store value. */
  transactionType?: string
  className?: string
}

const CategoryPickerRoot: FC<CategoryPickerProps> = ({
  value: valueProp,
  defaultValue,
  onChange,
  transactionType: transactionTypeProp,
  className,
}) => {
  const { t } = useTranslation()
  const storeTransactionType = useAppSelector(selectTransactionType)
  const transactionType = transactionTypeProp ?? storeTransactionType
  const allCategories = useAppSelector(selectCategories)

  const categories = useMemo(
    () => allCategories.filter((c) => c.type === transactionType),
    [allCategories, transactionType]
  )

  const visibleCategories = useMemo(
    () => categories.slice(0, VISIBLE_CATEGORIES_COUNT),
    [categories]
  )

  const [internalValue, setInternalValue] = useState<string | undefined>(
    defaultValue
  )
  const isControlled = useMemo(() => valueProp !== undefined, [valueProp])
  const value = useMemo(
    () => (isControlled ? valueProp : internalValue),
    [isControlled, valueProp, internalValue]
  )

  const handleSelect = useCallback(
    (categoryId: string) => {
      if (!isControlled) setInternalValue(categoryId)
      onChange?.(categoryId)
    },
    [isControlled, onChange]
  )

  return (
    <Field className={className}>
      <FieldLabel>{t('categories.select')}</FieldLabel>
      <div className="grid grid-cols-4 gap-2">
        {visibleCategories.map((category) => (
          <CategoryCard
            key={category.id}
            category={category}
            className="cursor-pointer transition-opacity hover:opacity-90"
            onClick={() => handleSelect(category.id)}
            style={{
              backgroundColor:
                category.id === value ? category.color : 'transparent',
            }}
          />
        ))}
        {categories.length > VISIBLE_CATEGORIES_COUNT && (
          <CategoryDrawer
            categories={categories}
            value={value}
            onChange={handleSelect}
          />
        )}
      </div>
    </Field>
  )
}

type CategoryDrawerProps = {
  categories: Category[]
  value?: string
  onChange: (categoryId: string) => void
}

const CategoryDrawer: FC<CategoryDrawerProps> = ({
  categories,
  value,
  onChange,
}) => {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)

  const handleSelect = useCallback(
    (categoryId: string) => {
      onChange(categoryId)
      setIsOpen(false)
    },
    [onChange]
  )

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="aspect-square w-full h-full max-w-14 m-auto"
          type="button"
        >
          <HugeiconsIcon icon={MoreHorizontalCircle01Icon} size={24} />
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{t('categories.select')}</DrawerTitle>
          <DrawerDescription>
            {t('categories.selectDescription')}
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-4 overflow-y-auto py-2">
          <div className="grid grid-cols-4 gap-2">
            {categories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                className="cursor-pointer transition-opacity hover:opacity-90"
                onClick={() => handleSelect(category.id)}
                style={{
                  backgroundColor:
                    category.id === value ? category.color : 'transparent',
                }}
              />
            ))}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

export const CategoryPicker = CategoryPickerRoot
