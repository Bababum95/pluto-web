import type { FC } from 'react'

import type { SvgIconProps } from '../types'

export const TonIdIcon: FC<SvgIconProps> = ({ size = 24, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <g clipPath="url(#ton-id-clip)">
      <path
        d="M19.024 2.05286H4.97496C2.39196 2.05286 0.755243 4.839 2.0551 7.09286L10.7247 22.1203C11.2904 23.1013 12.7085 23.1013 13.2742 22.1203L21.9464 7.09157C23.245 4.84286 21.607 2.05286 19.0252 2.05286H19.024ZM10.7182 17.6126L8.82953 13.9586L4.27296 5.80971C4.20373 5.688 4.16784 5.55017 4.16891 5.41015C4.16997 5.27013 4.20797 5.13288 4.27905 5.01223C4.35013 4.89159 4.45178 4.79184 4.57374 4.72305C4.6957 4.65425 4.83366 4.61886 4.97367 4.62043H10.7144V17.6151L10.717 17.6126H10.7182ZM19.7221 5.80843L15.1681 13.9599L13.2794 17.6126V4.61786H19.0227C19.6527 4.61786 20.023 5.28643 19.7221 5.80843Z"
        fill="currentColor"
      />
    </g>
    <defs>
      <clipPath id="ton-id-clip">
        <rect width="24" height="24" fill="white" />
      </clipPath>
    </defs>
  </svg>
)
