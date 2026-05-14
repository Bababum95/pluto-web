import type { FC } from 'react'
import type { SvgIconProps } from '../types'

export const MexcIcon: FC<SvgIconProps> = ({ size = 24, className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
  >
    <g clipPath="url(#mexc-clip)">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M2.8422 18.9803H16.2849C17.1186 18.9803 17.6427 18.0285 17.2404 17.3127L10.5082 5.44132C9.37874 3.49348 6.46387 3.56171 5.46993 5.60697L0.355596 14.6071C-0.675221 16.4656 0.651019 18.9803 2.8422 18.9803Z"
        fill="currentColor"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M13.4399 8.37888C12.6473 6.98744 13.1141 5.19844 14.4932 4.39228C15.8614 3.58613 17.6204 4.061 18.4131 5.46348L23.6143 14.6183C24.4069 16.0097 23.9401 17.7987 22.561 18.6049C21.1928 19.411 19.4338 18.9361 18.6411 17.5337L13.4399 8.37888Z"
        fill="currentColor"
      />
    </g>
    <defs>
      <clipPath id="mexc-clip">
        <rect width="24" height="24" fill="currentColor" />
      </clipPath>
    </defs>
  </svg>
)
