import type { SvgIconProps } from '../types'

export function BitgetIcon({ size = 24, className }: SvgIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      className={className}
      viewBox="0 0 500 500"
      fill="currentColor"
    >
      <g>
        <path d="M224.4,179.5h124.5L476.2,306c8.3,8.2,8.3,21.6,0.1,29.9L313,500H184.8l38.8-37.7l142.3-141.4L225.4,179.4" />
        <path d="M275.6,320.5H151.1L23.8,194c-8.3-8.2-8.3-21.6-0.1-29.9c0,0,0,0,0,0L187,0h128.2l-38.8,37.7L134.1,179.1l140.5,141.4" />
      </g>
    </svg>
  )
}
