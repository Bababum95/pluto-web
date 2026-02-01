import type { AnyFieldApi } from '@tanstack/react-form'

import { Field, FieldLabel, FieldError } from '@/components/ui/field'
import { Input, type InputProps } from '@/components/ui/input'
import { cn } from '@/lib/utils'

type Props = {
  field: AnyFieldApi
  label?: string
  className?: string
  inputProps?: InputProps
}

export const FormField = ({ field, label, className, inputProps }: Props) => {
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
