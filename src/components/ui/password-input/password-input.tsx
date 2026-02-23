'use client'

import { useState, forwardRef } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { ViewIcon, ViewOffSlashIcon } from '@hugeicons/core-free-icons'

import {
  InputGroup,
  InputGroupInput,
  InputGroupButton,
} from '@/components/ui/input-group'
import { cn } from '@/lib/utils'
import type { InputProps } from '@/components/ui/input'

type PasswordInputProps = Omit<InputProps, 'type'>

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false)

    return (
      <InputGroup className={className}>
        <InputGroupInput
          ref={ref}
          type={showPassword ? 'text' : 'password'}
          autoComplete="current-password"
          autoCapitalize="off"
          spellCheck={false}
          {...props}
        />
        <InputGroupButton
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => setShowPassword((prev) => !prev)}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          tabIndex={-1}
        >
          <HugeiconsIcon
            icon={showPassword ? ViewIcon : ViewOffSlashIcon}
            className={cn('size-4 transition-opacity')}
          />
        </InputGroupButton>
      </InputGroup>
    )
  }
)

PasswordInput.displayName = 'PasswordInput'

export { PasswordInput, type PasswordInputProps }
