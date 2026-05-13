import type { AnyFieldApi } from '@tanstack/react-form'
import type { FC } from 'react'

import { Field, FieldLabel, FieldError } from '@/shared/ui/field'
import {
  PasswordInput,
  type PasswordInputProps,
} from '@/shared/ui/password-input'
import { cn } from '@/shared/lib'

type Props = {
  field: AnyFieldApi
  label?: string
  className?: string
  inputProps?: Omit<
    PasswordInputProps,
    'id' | 'name' | 'value' | 'onChange' | 'onBlur'
  >
}

export const PasswordFormField: FC<Props> = ({
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
      <PasswordInput
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
