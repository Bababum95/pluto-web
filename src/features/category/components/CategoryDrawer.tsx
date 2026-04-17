import { useCallback, useState, type FC } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { MoreHorizontalCircle01Icon } from '@hugeicons/core-free-icons'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'

import type { Category } from '../types'
import { CategoriesList } from './CategoriesList'

type Props = {
  categories: Category[]
  value?: string
  onChange: (categoryId: string) => void
}

export const CategoryDrawer: FC<Props> = ({ categories, value, onChange }) => {
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
    <>
      <Button
        variant="outline"
        size="icon"
        className="aspect-square w-full h-full max-w-14 max-h-14 ml-auto mr-auto mt-2 rounded-lg"
        type="button"
        onClick={() => setIsOpen(true)}
      >
        <HugeiconsIcon icon={MoreHorizontalCircle01Icon} size={24} />
      </Button>
      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <DrawerContent
          onOpenAutoFocus={(e) => e.preventDefault()}
          onCloseAutoFocus={(e) => e.preventDefault()}
          aria-describedby={undefined}
        >
          <DrawerHeader>
            <DrawerTitle>{t('categories.select.title')}</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 overflow-y-auto py-2">
            <CategoriesList
              categories={categories}
              onCategryCkick={handleSelect}
              selectedCategoryId={value}
              skipEntranceAnimation={true}
            />
          </div>
        </DrawerContent>
      </Drawer>
    </>
  )
}
