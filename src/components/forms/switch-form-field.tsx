import type { AnyFieldApi } from '@tanstack/react-form'
import type { FC } from 'react'

import {
  Field,
  FieldLabel,
  FieldContent,
  FieldDescription,
  FieldTitle,
} from '@/components/ui/field'
import { Switch, type SwitchProps } from '@/components/ui/switch'

type Props = {
  field: AnyFieldApi
  title: string
  description?: string
  className?: string
  inputProps?: SwitchProps
}

export const SwitchFormField: FC<Props> = ({
  field,
  title,
  description,
  className,
  inputProps,
}) => {
  const { state, name, handleChange, handleBlur } = field

  return (
    <FieldLabel htmlFor={name}>
      <Field orientation="horizontal" className={className}>
        <FieldContent>
          <FieldTitle>{title}</FieldTitle>
          <FieldDescription>{description}</FieldDescription>
        </FieldContent>
        <Switch
          id={name}
          checked={state.value}
          onCheckedChange={handleChange}
          onBlur={handleBlur}
          {...inputProps}
        />
      </Field>
    </FieldLabel>
  )
}
