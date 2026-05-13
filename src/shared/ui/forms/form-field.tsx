import type { AnyFieldApi } from '@tanstack/react-form'
import type { FC } from 'react'

import { Field, FieldLabel, FieldError } from '@/shared/ui/field'
import { Input, type InputProps } from '@/shared/ui/input'
import { cn } from '@/shared/lib'

type Props = {
  field: AnyFieldApi
  label?: string
  className?: string
  inputProps?: InputProps
}

export const FormField: FC<Props> = ({
  field,
  label,
  className,
  inputProps,
}) => {
  const { state, name, handleChange, handleBlur } = field
  const isError = state.meta.isTouched && !state.meta.isValid

  return (
    <Field className={className}>
      {label && <FieldLabel htmlFor={name}>{label}</FieldLabel>}
      <Input
        id={name}
        name={name}
        value={state.value ?? ''}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={handleBlur}
        className={cn(
          isError ? 'border-destructive' : '',
          inputProps?.className
        )}
        {...inputProps}
      />
      {isError && (
        <FieldError>
          {state.meta.errors
            .map((error) => error.message)
            .filter(Boolean)
            .join('\n')}
        </FieldError>
      )}
    </Field>
  )
}
