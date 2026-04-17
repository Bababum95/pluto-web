import {
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FC,
} from 'react'
import { useTranslation } from 'react-i18next'

import { useAppSelector } from '@/store/hooks'
import { selectCategories } from '@/store/slices/category'
import { selectTransactionType } from '@/store/slices/transaction-type'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'

import { CategoryDrawer } from './CategoryDrawer'
import { CategoriesList } from './CategoriesList'

const VISIBLE_CATEGORIES_COUNT = 7

export type CategoryPickerProps = {
  /** Current value: category id (controlled). */
  value?: string
  /** Default value (uncontrolled). */
  defaultValue?: string
  /** Called when category changes; receives category id. */
  onChange?: (categoryId: string) => void
  /** Optional transaction type override; defaults to store value. */
  transactionType?: string
  className?: string
  isError?: boolean
  errorMessage?: string
}

export const CategoryPicker: FC<CategoryPickerProps> = ({
  value: valueProp,
  defaultValue,
  onChange,
  transactionType: transactionTypeProp,
  className,
  isError,
  errorMessage,
}) => {
  const { t } = useTranslation()
  const storeTransactionType = useAppSelector(selectTransactionType)
  const transactionType = transactionTypeProp ?? storeTransactionType
  const allCategories = useAppSelector(selectCategories)

  const categories = useMemo(
    () => allCategories.filter((c) => c.type === transactionType),
    [allCategories, transactionType]
  )

  const [internalValue, setInternalValue] = useState<string | undefined>(
    defaultValue
  )
  const isControlled = useMemo(() => valueProp !== undefined, [valueProp])
  const value = useMemo(
    () => (isControlled ? valueProp : internalValue),
    [isControlled, valueProp, internalValue]
  )

  // When selected category is not in the visible slice, push it to the front (like IconPicker)
  const visibleCategories = useMemo(() => {
    const slice = categories.slice(0, VISIBLE_CATEGORIES_COUNT)
    if (!value) return slice

    const selectedInSlice = slice.some((c) => c.id === value)
    if (selectedInSlice) return slice

    const selected = categories.find((c) => c.id === value)
    if (!selected) return slice

    return [selected, ...slice.slice(0, VISIBLE_CATEGORIES_COUNT - 1)]
  }, [categories, value])

  const handleSelect = useCallback(
    (categoryId: string) => {
      if (!isControlled) setInternalValue(categoryId)
      onChange?.(categoryId)
    },
    [isControlled, onChange]
  )

  const [hasSurfaceMounted, setHasSurfaceMounted] = useState(false)
  useEffect(() => {
    startTransition(() => setHasSurfaceMounted(true))
  }, [])

  return (
    <Field className={className}>
      <FieldLabel>{t('common.fields.category')}</FieldLabel>
      <CategoriesList
        key={transactionType}
        skipEntranceAnimation={!hasSurfaceMounted}
        categories={visibleCategories}
        onCategryCkick={handleSelect}
        selectedCategoryId={value}
      >
        {categories.length > VISIBLE_CATEGORIES_COUNT && (
          <CategoryDrawer
            categories={categories}
            value={value}
            onChange={handleSelect}
          />
        )}
      </CategoriesList>
      {isError && <FieldError>{errorMessage}</FieldError>}
    </Field>
  )
}
