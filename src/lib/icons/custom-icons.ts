import type { IconSvgElement } from '@hugeicons/react'

/**
 * Custom SVG icons in Hugeicons format: array of [tagName, attributes] tuples.
 * Convert your SVG to this format to add icons to the registry.
 *
 * Example: for <path d="M3 21h18" stroke="currentColor" stroke-width="2" />
 * use ["path", { d: "M3 21h18", stroke: "currentColor", strokeWidth: 2, key: "0" }]
 */

/** Custom bank building icon (from assets/bank.svg). */
export const BankBuildingIcon: IconSvgElement = [
  [
    'path',
    {
      d: 'M3 21h18',
      stroke: 'currentColor',
      strokeWidth: 2,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      key: '0',
    },
  ],
  [
    'path',
    {
      d: 'M3 10h18',
      stroke: 'currentColor',
      strokeWidth: 2,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      key: '1',
    },
  ],
  [
    'path',
    {
      d: 'M5 10V21',
      stroke: 'currentColor',
      strokeWidth: 2,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      key: '2',
    },
  ],
  [
    'path',
    {
      d: 'M19 10V21',
      stroke: 'currentColor',
      strokeWidth: 2,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      key: '3',
    },
  ],
  [
    'path',
    {
      d: 'M3 10L12 4l9 6',
      stroke: 'currentColor',
      strokeWidth: 2,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      key: '4',
    },
  ],
  [
    'path',
    {
      d: 'M9 10V21',
      stroke: 'currentColor',
      strokeWidth: 2,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      key: '5',
    },
  ],
  [
    'path',
    {
      d: 'M15 10V21',
      stroke: 'currentColor',
      strokeWidth: 2,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      key: '6',
    },
  ],
]
