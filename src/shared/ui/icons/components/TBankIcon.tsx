import type { SvgIconProps } from '../types'

const MASK_ID = 'mask0_tbank_icon'
const CLIP_ID = 'clip0_tbank_icon'

export function TBankIcon({ size = 24, className }: SvgIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      className={className}
      viewBox="0 0 24 24"
      fill="none"
    >
      <g clipPath={`url(#${CLIP_ID})`}>
        <mask
          id={MASK_ID}
          style={{ maskType: 'luminance' }}
          maskUnits="userSpaceOnUse"
          x={0}
          y={-5}
          width={86}
          height={32}
        >
          <path
            d="M85.8462 -4.61539H0V26.7692H85.8462V-4.61539Z"
            fill="white"
          />
        </mask>
        <g mask={`url(#${MASK_ID})`}>
          <path
            d="M0 0H24V12.2226C24 15.3568 22.3302 18.2464 19.6154 19.8194L12 24.3053L4.39266 19.8194C1.67783 18.2581 0.0116511 15.3568 0.0116511 12.2226V0H0Z"
            fill="currentColor"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M6.46143 6.43274V10.231C6.98575 9.64846 7.92952 9.25228 9.00146 9.25228H10.1783V13.6683C10.1783 14.845 9.8637 15.8705 9.38601 16.4414H14.6122C14.1345 15.8705 13.846 14.845 13.846 13.6683V9.25228H14.9907C16.0743 9.25228 17.0257 9.64846 17.5383 10.231V6.43274H6.46143Z"
            fill="#333333"
          />
        </g>
      </g>
      <defs>
        <clipPath id={CLIP_ID}>
          <rect width="24" height="24" fill="white" />
        </clipPath>
      </defs>
    </svg>
  )
}
