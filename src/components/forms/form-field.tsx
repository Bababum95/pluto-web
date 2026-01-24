import type { FC } from 'react'

import { Field, FieldLabel, FieldError } from '@/components/ui/field'
import { Input, type InputProps } from '@/components/ui/input'
import { cn } from '@/lib/utils'

type Props = InputProps & {
  label?: string
  error?: string
}

export const FormField: FC<Props> = ({
  id,
  label,
  error,
  className,
  ...props
}) => {
  return (
    <Field>
      {label && <FieldLabel htmlFor={id}>{label}</FieldLabel>}
      <Input
        id={id}
        className={cn(error ? 'border-destructive' : '', className)}
        {...props}
      />
      {error && <FieldError>{error}</FieldError>}
    </Field>
  )
}
