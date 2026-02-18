import type { FC } from 'react'
import type { SvgIconProps } from '../types'

export const CalculatorIcon: FC<SvgIconProps> = ({
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
    <path d="M6 2h12a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" />
    <path d="M8 7h8" />
    <path d="M7.5 9.5h2v2h-2z" fill="currentColor" />
    <path d="M11 9.5h2v2h-2z" fill="currentColor" />
    <path d="M14.5 9.5h2v2h-2z" fill="currentColor" />
    <path d="M7.5 13h2v2h-2z" fill="currentColor" />
    <path d="M11 13h2v2h-2z" fill="currentColor" />
    <path d="M14.5 13h2v5.5h-2z" fill="currentColor" />
    <path d="M7.5 16.5h2v2h-2z" fill="currentColor" />
    <path d="M11 16.5h2v2h-2z" fill="currentColor" />
  </svg>
)
