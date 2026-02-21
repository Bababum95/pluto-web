/**
 * Script: converts SVG files from src/lib/icons/svg/ into React components
 * in src/lib/icons/components/. Run from web/ directory:
 *
 *   node scripts/generate-icon-components.mjs
 *
 */

import { readdirSync, readFileSync, writeFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const WEB_ROOT = join(__dirname, '..')
const SVG_DIR = join(WEB_ROOT, 'src', 'lib', 'icons', 'svg')
const COMPONENTS_DIR = join(WEB_ROOT, 'src', 'lib', 'icons', 'components')
/** Converts kebab-case SVG attribute to camelCase for JSX */
const ATTR_MAP = {
  'stroke-width': 'strokeWidth',
  'stroke-linecap': 'strokeLinecap',
  'stroke-linejoin': 'strokeLinejoin',
  'stroke-miterlimit': 'strokeMiterlimit',
  'stroke-dasharray': 'strokeDasharray',
  'stroke-dashoffset': 'strokeDashoffset',
  'fill-rule': 'fillRule',
  'clip-rule': 'clipRule',
  'fill-opacity': 'fillOpacity',
  'stroke-opacity': 'strokeOpacity',
  'stop-color': 'stopColor',
  'stop-opacity': 'stopOpacity',
  'xlink:href': 'href',
  'xmlns:xlink': 'xmlnsXlink',
}

function kebabToCamel(str) {
  return str.replace(/-([a-z])/g, (_, c) => c.toUpperCase())
}

function convertAttrName(name) {
  return ATTR_MAP[name] ?? kebabToCamel(name)
}

/** Converts SVG attribute value for React (e.g. "1.5" for strokeWidth) */
function convertAttrValue(name, value) {
  const camel = convertAttrName(name)
  if (['strokeWidth', 'strokeOpacity', 'fillOpacity', 'strokeMiterlimit'].includes(camel)) {
    const num = parseFloat(value)
    if (!Number.isNaN(num)) return num
  }
  if (['stroke', 'fill'].includes(camel) && ['black', '#000', '#000000'].includes(value?.trim().toLowerCase())) {
    return 'currentColor'
  }
  return value
}

/** Transforms a single attribute string like stroke-width="0.7" into JSX format */
function transformAttribute(attr) {
  const match = attr.match(/^([a-z0-9:-]+)(?:="([^"]*)")?$/)
  if (!match) return null
  const [, name, value = ''] = match
  const jsxName = convertAttrName(name)
  const jsxValue = convertAttrValue(name, value)
  if (jsxValue === '' || jsxValue === undefined) return null
  if (typeof jsxValue === 'number') return `${jsxName}={${jsxValue}}`
  return `${jsxName}="${jsxValue}"`
}

/** Parses opening <svg ...> and returns { viewBox, fill, stroke, innerContent } */
function parseSvg(content) {
  const openTag = content.match(/<svg([^>]*)>/s)
  if (!openTag) throw new Error('Invalid SVG: no <svg> tag found')

  const attrs = openTag[1]
  const viewBoxMatch = attrs.match(/viewBox\s*=\s*["']([^"']+)["']/i)
  const viewBox = viewBoxMatch ? viewBoxMatch[1] : '0 0 24 24'
  const fillMatch = attrs.match(/\bfill\s*=\s*["']([^"']+)["']/i)
  const strokeMatch = attrs.match(/\bstroke\s*=\s*["']([^"']+)["']/i)
  const hasStroke = /stroke=/.test(attrs) || /stroke=/.test(content)

  const innerContent = content.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>[\s\S]*$/, '').trim()

  const fill = fillMatch ? fillMatch[1] : hasStroke ? 'none' : undefined
  const stroke = strokeMatch ? (['black', '#000', '#000000'].includes(strokeMatch[1].toLowerCase()) ? 'currentColor' : strokeMatch[1]) : hasStroke ? 'currentColor' : undefined

  return { viewBox, fill, stroke, innerContent }
}

/** Transforms inner SVG elements: convert attributes to JSX, replace black with currentColor */
function transformInnerContent(inner) {
  return inner
    .replace(/\s(stroke|fill)=["'](?:black|#000|#000000)["']/gi, ' $1="currentColor"')
    .replace(/\s([a-z0-9:-]+)=["']([^"']*)["']/g, (_, name, value) => {
      const jsxName = convertAttrName(name)
      const jsxValue = convertAttrValue(name, value)
      if (typeof jsxValue === 'number') return ` ${jsxName}={${jsxValue}}`
      return ` ${jsxName}="${jsxValue}"`
    })
}

/** Converts filename to PascalCase component name */
function filenameToComponentName(filename) {
  const base = filename.replace(/\.svg$/i, '')
  const pascal = base
    .split(/[-_\s]+/)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
    .join('')
  return pascal.endsWith('Icon') ? pascal : `${pascal}Icon`
}

/** Generates the React component source */
function generateComponent(svgPath, componentName, { viewBox, fill, stroke, innerContent }) {
  const transformed = transformInnerContent(innerContent)
  const extraAttrs = []
  if (fill) extraAttrs.push(`fill="${fill}"`)
  if (stroke) extraAttrs.push(`stroke="${stroke}"`)
  const extra = extraAttrs.length ? '\n    ' + extraAttrs.join('\n    ') : ''
  return `import type { SvgIconProps } from '../types'

export const ${componentName} = ({ size = 24, className }: SvgIconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="${viewBox}"
    width={size}
    height={size}${extra}
    className={className}
  >
${transformed
  .split(/\n/)
  .map((line) => '    ' + line.trim())
  .join('\n')}
  </svg>
)
`
}

function main() {
  if (!existsSync(SVG_DIR)) {
    console.error('SVG directory not found:', SVG_DIR)
    process.exit(1)
  }

  const files = readdirSync(SVG_DIR).filter((f) => f.toLowerCase().endsWith('.svg'))
  if (files.length === 0) {
    console.log('No SVG files found in', SVG_DIR)
    return
  }

  const created = []

  for (const file of files) {
    const svgPath = join(SVG_DIR, file)
    const content = readFileSync(svgPath, 'utf-8')
    const componentName = filenameToComponentName(file)
    const outPath = join(COMPONENTS_DIR, `${componentName}.tsx`)

    const parsed = parseSvg(content)
    const src = generateComponent(svgPath, componentName, parsed)
    writeFileSync(outPath, src)
    created.push(componentName)
    console.log('Generated:', `${componentName}.tsx`)
  }

  if (created.length > 0) {
    console.log('\nNext: add new icons to src/lib/icons/registry.ts (import + ICON_REGISTRY).')
  }
}

main()
