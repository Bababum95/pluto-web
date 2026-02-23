import { useTranslation } from 'react-i18next'
import type { FC } from 'react'

import { Field, FieldLabel } from '@/components/ui/field'

import { CreateTagDialog } from './CreateTagDialog'
import { selectTags } from '@/store/slices/tag'
import { useAppSelector } from '@/store'
import { Badge } from '@/components/ui/badge'

type Props = {
  values?: string[]
  onChange: (value: string[]) => void
  multiple?: boolean
  className?: string
}

export const TagPicker: FC<Props> = ({
  className,
  onChange,
  multiple,
  values = [],
}) => {
  const { t } = useTranslation()
  const tags = useAppSelector(selectTags)

  const handleChange = (id: string) => {
    const isSelected = values.includes(id)
    if (multiple) {
      onChange(isSelected ? values.filter((v) => v !== id) : [...values, id])
    } else {
      onChange(isSelected ? [] : [id])
    }
  }

  return (
    <Field className={className}>
      <FieldLabel>{t('tags.select.label')}</FieldLabel>
      <div className="flex gap-1 flex-wrap">
        {tags.map((tag) => (
          <Badge
            key={tag.id}
            variant={values.includes(tag.id) ? 'default' : 'outline'}
            onClick={() => handleChange(tag.id)}
            color={tag.color}
          >
            {tag.name}
          </Badge>
        ))}
        <CreateTagDialog onSuccess={(tag) => handleChange(tag.id)} />
      </div>
    </Field>
  )
}
