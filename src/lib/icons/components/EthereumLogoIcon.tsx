import type { FC } from 'react'
import type { SvgIconProps } from '../types'

/** Filled Ethereum diamond logo (from svg/ethereum.svg). */
export const EthereumLogoIcon: FC<SvgIconProps> = ({ size = 24, className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="currentColor"
    className={className}
  >
    <path d="M15.927 23.959l-9.823-5.797 9.817 13.839 9.828-13.839-9.828 5.797zM16.073 0l-9.819 16.297 9.819 5.807 9.823-5.801z" />
  </svg>
)
