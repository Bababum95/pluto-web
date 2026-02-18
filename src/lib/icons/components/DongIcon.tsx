import type { FC } from 'react'
import type { SvgIconProps } from '../types'

export const DongIcon: FC<SvgIconProps> = ({ size = 24, className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 28 28"
    width={size}
    height={size}
    className={className}
  >
    <path
      d="M18 26h-7a1 1 0 0 1 0-2h7a1 1 0 0 1 0 2Z"
      fill="currentColor"
    />
    <path
      d="M18 26h-7a1 1 0 0 1 0-2h7a1 1 0 0 1 0 2zm3-16h-7a1 1 0 0 1 0-2h7a1 1 0 0 1 0 2z"
      fill="currentColor"
    />
    <path
      fill="currentColor"
      d="M21 10h-7a1 1 0 0 1 0-2h7a1 1 0 0 1 0 2zm-6.5 12a4.51 4.51 0 0 1-4.5-4.5v-1a4.5 4.5 0 0 1 9 0v1a4.51 4.51 0 0 1-4.5 4.5zm0-8a2.5 2.5 0 0 0-2.5 2.5v1a2.5 2.5 0 0 0 5 0v-1a2.5 2.5 0 0 0-2.5-2.5z"
    />
    <path
      fill="currentColor"
      d="M18 22a1 1 0 0 1-1-1V6a1 1 0 0 1 2 0v15a1 1 0 0 1-1 1Z"
    />
  </svg>
)
