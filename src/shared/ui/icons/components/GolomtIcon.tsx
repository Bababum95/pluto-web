import type { FC } from 'react'

import type { SvgIconProps } from '../types'

export const GolomtIcon: FC<SvgIconProps> = ({ size = 24, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <g clipPath="url(#golomt-clip)">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10.5054 1.57092C15.2192 0.878197 19.6407 3.42547 21.5781 7.4662C21.9425 8.26692 22.4541 9.50401 22.4541 10.4138H13.0996L9.73957 16.5284H6.30321L11.2003 7.4662H17.9967C16.681 5.57347 14.4523 4.44438 12.0043 4.44438C7.83812 4.44438 4.47703 7.79347 4.47703 11.9062C4.47703 16.0189 7.83812 19.368 12.0043 19.368C13.153 19.3656 14.286 19.1022 15.3179 18.5976C16.3498 18.093 17.2535 17.3604 17.9607 16.4553H13.0636L14.7436 13.4346H22.4541C22.3229 14.4862 22.0142 15.508 21.541 16.4564C20.0421 19.5131 17.0465 21.7691 13.501 22.2786C7.72903 23.0793 2.35739 19.1127 1.55339 13.3986C0.713389 7.68438 4.7323 2.37056 10.5054 1.56983V1.57092Z"
        fill="currentColor"
      />
    </g>
    <defs>
      <clipPath id="golomt-clip">
        <rect width="24" height="24" fill="white" />
      </clipPath>
    </defs>
  </svg>
)
