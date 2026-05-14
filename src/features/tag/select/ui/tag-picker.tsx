import { useTranslation } from 'react-i18next'

import { Field, FieldLabel } from '@/shared/ui/field'
import { Badge } from '@/shared/ui/badge'
import { useAppSelector } from '@/app/store'
import { selectTags } from '@/entities/tag'

import { CreateTagDialog } from '@/features/tag/create'

export type TagPickerProps = {
  values?: string[]
  onChange: (value: string[]) => void
  multiple?: boolean
  className?: string
}

export function TagPicker({
  className,
  onChange,
  multiple,
  values = [],
}: TagPickerProps) {
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
