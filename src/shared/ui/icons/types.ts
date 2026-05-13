/**
 * Props for registry SVG icon components.
 * Used by Icon component and IconPicker for consistent sizing and styling.
 */
export type SvgIconProps = {
  size?: number
  className?: string
}

/**
 * Registry icon: a React component that renders an SVG with optional size and className.
 */
export type SvgIcon = React.FC<SvgIconProps>
