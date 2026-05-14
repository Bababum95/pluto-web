import type { FC } from 'react'
import type { SvgIconProps } from '../types'

export const BankBuildingIcon: FC<SvgIconProps> = ({
  size = 24,
  className,
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M3 21h18" />
    <path d="M3 10h18" />
    <path d="M5 10V21" />
    <path d="M19 10V21" />
    <path d="M3 10L12 4l9 6" />
    <path d="M9 10V21" />
    <path d="M15 10V21" />
  </svg>
)
